import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "./db";
import { Course } from "./models/Course";
import { Category } from "./models/Category";
import { Admin } from "./models/Admin";
import { Lead, LEAD_SOURCE_VALUES } from "./models/Lead";
import { Student } from "./models/Student";
import { Purchase } from "./models/Purchase";
import { Testimonial } from "./models/Testimonial";
import { Coupon } from "./models/Coupon";
import { CartActivity, CART_ACTIVITY_STATUSES } from "./models/CartActivity";
import { SiteSettings } from "./models/SiteSettings";
import {
  sendPasswordResetEmail,
  sendRegistrationOtpEmail,
  sendActivationOtpEmail,
  sendGuestPurchaseConfirmationEmail,
  sendActivationLinkEmail,
} from "./mail";
import { sendWhatsAppPurchaseNotification, sendWhatsAppActivationLink } from "./whatsapp";
import { uploadImageToCloudinary } from "./cloudinary";
import { validateCoupon } from "./coupons";
import { applyGst } from "../lib/coursePricing";
import { ALLOWED_META_EVENTS, sendMetaEvent, sendMetaPurchaseEvent } from "./metaConversions";
import {
  adminCookieHeader,
  clearAdminCookieHeader,
  getAdminSession,
  signAdminSession,
  getStudentSession,
  signStudentSession,
  studentCookieHeader,
  clearStudentCookieHeader,
  parseCookies,
  normalizePhone,
} from "./auth";

const PASSWORD_RESET_PURPOSE = "password_reset";
const REGISTER_OTP_PURPOSE = "register_otp";
const ACTIVATION_TOKEN_PURPOSE = "account_activation";
const ACTIVATION_OTP_PURPOSE = "activation_otp";

// Finds an existing student by email or (normalized) phone so a guest checkout
// never creates a duplicate account for someone who already has one — guest or
// registered. Creates a new, not-yet-activated student record when no match
// exists. The returned student's course access can be granted immediately;
// activation (setting a password) is a separate, optional step.
async function findOrCreateGuestStudent({
  name,
  email,
  phone,
}: {
  name: string;
  email: string;
  phone: string;
}): Promise<{ student: InstanceType<typeof Student>; isNew: boolean }> {
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedPhone = normalizePhone(phone);

  const existing = await Student.findOne({
    $or: [
      { email: normalizedEmail },
      ...(normalizedPhone ? [{ phoneNormalized: normalizedPhone }] : []),
    ],
  });

  if (existing) {
    let changed = false;
    if (!existing.phone && phone) {
      existing.phone = phone.trim();
      existing.phoneNormalized = normalizedPhone;
      changed = true;
    }
    if (changed) await existing.save();
    return { student: existing, isNew: false };
  }

  const student = await Student.create({
    name: name.trim(),
    email: normalizedEmail,
    phone: phone.trim(),
    phoneNormalized: normalizedPhone,
    passwordHash: "",
    isActivated: false,
  });
  return { student, isNew: true };
}

// Events a browser is allowed to report directly. Anything downstream of an
// actual payment attempt (payment_initiated / payment_failed /
// purchase_completed) is only ever written from the server-side create-order
// and verify handlers below, so a visitor can never spoof a fake purchase
// into the admin's cart-tracking table.
const CLIENT_TRACKABLE_CART_EVENTS = ["add_to_cart", "begin_checkout", "customer_details_submitted"] as const;

const CART_EVENT_STATUS: Record<string, (typeof CART_ACTIVITY_STATUSES)[number]> = {
  add_to_cart: "Added to Cart",
  begin_checkout: "Checkout Started",
  customer_details_submitted: "Checkout Started",
  payment_initiated: "Payment Pending",
  payment_failed: "Payment Failed",
  purchase_completed: "Purchase Completed",
};

// Upserts the one row that tracks this visitor's progress on this course
// through the funnel (see CartActivity.ts). Fields are only overwritten when
// the caller actually supplies them, so an earlier, more-complete snapshot
// (e.g. billing details already filled in) never gets blanked out by a
// later, less-detailed event.
async function recordCartEvent(params: {
  visitorId?: string;
  event: string;
  courseSlug?: string;
  courseTitle?: string;
  amount?: number;
  currency?: string;
  studentId?: string;
  name?: string;
  email?: string;
  phone?: string;
  state?: string;
  city?: string;
  orderId?: string;
  attribution?: {
    source?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    referrer?: string;
    landingPage?: string;
  };
}): Promise<void> {
  const { visitorId, event, courseSlug } = params;
  if (!visitorId || !courseSlug) return;

  const existing = await CartActivity.findOne({ visitorId, courseSlug }).select("status");
  // A converted row never regresses — a stray duplicate event after purchase
  // must not make a real sale look abandoned in the admin table.
  if (existing?.status === "Purchase Completed") return;

  const nextStatus = CART_EVENT_STATUS[event] ?? existing?.status ?? "Added to Cart";

  const setFields: Record<string, unknown> = { status: nextStatus, lastActivityAt: new Date() };
  if (params.courseTitle) setFields.courseTitle = params.courseTitle;
  if (typeof params.amount === "number") setFields.amount = params.amount;
  if (params.currency) setFields.currency = params.currency;
  if (params.studentId) setFields.studentId = params.studentId;
  if (params.name) setFields.name = params.name;
  if (params.email) setFields.email = params.email;
  if (params.phone) setFields.phone = params.phone;
  if (params.state) setFields.state = params.state;
  if (params.city) setFields.city = params.city;
  if (params.orderId) setFields.orderId = params.orderId;
  if (params.attribution?.source) setFields.source = params.attribution.source;
  if (params.attribution?.utmSource) setFields.utmSource = params.attribution.utmSource;
  if (params.attribution?.utmMedium) setFields.utmMedium = params.attribution.utmMedium;
  if (params.attribution?.utmCampaign) setFields.utmCampaign = params.attribution.utmCampaign;
  if (params.attribution?.referrer) setFields.referrer = params.attribution.referrer;
  if (params.attribution?.landingPage) setFields.landingPage = params.attribution.landingPage;

  await CartActivity.updateOne(
    { visitorId, courseSlug },
    {
      $set: setFields,
      $push: { events: { event, at: new Date() } },
      $setOnInsert: { visitorId, courseSlug },
    },
    { upsert: true }
  );
}

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");
  return new Response(JSON.stringify(data), { ...init, headers });
}

function jsonWithCookie(data: unknown, cookie: string, init: ResponseInit = {}): Response {
  const res = json(data, init);
  res.headers.append("set-cookie", cookie);
  return res;
}

async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    return (await request.json()) ?? {};
  } catch {
    return {};
  }
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function requireAdmin(request: Request): Response | null {
  const session = getAdminSession(request);
  if (!session) return json({ error: "Not authenticated" }, { status: 401 });
  return null;
}

async function handlePublicRoute(request: Request, path: string, url: URL): Promise<Response> {
  const method = request.method;

  // Mirrors a browser Pixel event to the Conversions API using the event_id the
  // browser already sent, so Meta deduplicates the pair instead of double-counting.
  // This is what lifts CAPI coverage for ViewContent / AddToCart / InitiateCheckout
  // from ~0% (only Purchase was ever sent server-side) up to browser parity.
  if (method === "POST" && path === "/meta/track") {
    const body = await readJson(request);
    const eventName = typeof body.eventName === "string" ? body.eventName : "";
    const eventId = typeof body.eventId === "string" ? body.eventId : "";
    const eventSourceUrl = typeof body.eventSourceUrl === "string" ? body.eventSourceUrl : url.origin;

    if (!(ALLOWED_META_EVENTS as readonly string[]).includes(eventName) || !eventId) {
      return json({ error: "Unsupported event" }, { status: 400 });
    }

    // Only pass through a known-safe subset of custom_data — this endpoint is
    // public, so arbitrary caller-supplied fields must not reach the dataset.
    const raw = (body.customData ?? {}) as Record<string, unknown>;
    const customData: Record<string, unknown> = {};
    for (const key of ["content_name", "content_category", "content_type", "search_string"]) {
      if (typeof raw[key] === "string") customData[key] = (raw[key] as string).slice(0, 200);
    }
    if (Array.isArray(raw.content_ids)) {
      customData.content_ids = raw.content_ids.filter((v) => typeof v === "string").slice(0, 20);
    }
    if (typeof raw.value === "number" && Number.isFinite(raw.value) && raw.value >= 0) {
      customData.value = Number(raw.value.toFixed(2));
      customData.currency = typeof raw.currency === "string" ? raw.currency : "INR";
    }

    // Attach the logged-in identity when we have one — this is what keeps Event
    // Match Quality high on the server copy.
    let email: string | undefined;
    let phone: string | undefined;
    const session = getStudentSession(request);
    if (session) {
      const student = await Student.findById(session.id).select("email phone");
      if (student) {
        email = student.email;
        phone = student.phone || undefined;
      }
    }

    const cookies = parseCookies(request.headers.get("cookie"));
    const forwardedFor = request.headers.get("x-forwarded-for");
    sendMetaEvent({
      eventName,
      eventId,
      eventSourceUrl,
      customData,
      email,
      phone,
      clientIpAddress: forwardedFor ? forwardedFor.split(",")[0].trim() : undefined,
      clientUserAgent: request.headers.get("user-agent") || undefined,
      fbc: cookies._fbc,
      fbp: cookies._fbp,
    }).catch((err) => {
      console.error(`Error sending Meta Conversions API ${eventName} event:`, err);
    });

    return json({ ok: true });
  }

  // Records one step of a visitor's add-to-cart / checkout funnel so the
  // admin "Cart & Checkout Tracking" screen can show live progress and flag
  // abandoned carts. Only pre-payment events are accepted here — see
  // CLIENT_TRACKABLE_CART_EVENTS.
  if (method === "POST" && path === "/cart-track") {
    const body = await readJson(request);
    const { visitorId, event, courseSlug, courseTitle, amount, name, email, phone, state, city, attribution } =
      body as {
        visitorId?: string;
        event?: string;
        courseSlug?: string;
        courseTitle?: string;
        amount?: number;
        name?: string;
        email?: string;
        phone?: string;
        state?: string;
        city?: string;
        attribution?: Record<string, string>;
      };
    if (!visitorId || !event || !courseSlug) {
      return json({ error: "visitorId, event and courseSlug are required" }, { status: 400 });
    }
    if (!(CLIENT_TRACKABLE_CART_EVENTS as readonly string[]).includes(event)) {
      return json({ error: "Unsupported event" }, { status: 400 });
    }

    const session = getStudentSession(request);
    await recordCartEvent({
      visitorId,
      event,
      courseSlug,
      courseTitle,
      amount: typeof amount === "number" ? amount : undefined,
      studentId: session?.id,
      name,
      email,
      phone,
      state,
      city,
      attribution,
    });

    return json({ ok: true });
  }

  if (method === "GET" && path === "/courses") {
    const filter: Record<string, unknown> = { published: true };
    const category = url.searchParams.get("category");
    if (category) filter.category = category;
    // Listing cards never render lesson content, so exclude the link-bearing
    // fields at the query level rather than shipping them to every visitor.
    const courses = await Course.find(filter)
      .select("-videos -videoModules -quizzes -assignments -classworks")
      .sort({ createdAt: -1 });
    const formatted = courses.map(c => {
      const obj = c.toObject();
      obj.enrolledCount = Math.max(50, obj.enrolledCount || 0);
      return obj;
    });
    return json(formatted);
  }

  const courseMatch = path.match(/^\/courses\/([^/]+)$/);
  if (method === "GET" && courseMatch) {
    const course = await Course.findOne({ slug: courseMatch[1], published: true });
    if (!course) return json({ error: "Course not found" }, { status: 404 });
    const recommendedCourseDetails = course.recommendedCourses?.length
      ? await Course.find({ slug: { $in: course.recommendedCourses.map((s: string) => s.toLowerCase().trim()) }, published: true })
      : [];
    
    const courseObj = course.toObject();
    courseObj.enrolledCount = Math.max(50, courseObj.enrolledCount || 0);

    // The curriculum outline is public — visitors should see which modules and
    // lessons a course contains before buying. The `link` on each item is not:
    // it points at the actual video/quiz/assignment, so it is stripped for
    // anyone who has not purchased the course. Previously toObject() shipped
    // every link to any anonymous caller of this endpoint.
    const session = getStudentSession(request);
    let hasAccess = false;
    let ownedSlugs = new Set<string>();
    if (session) {
      const viewer = await Student.findById(session.id).select("purchasedCourses");
      ownedSlugs = new Set(viewer?.purchasedCourses ?? []);
      hasAccess = ownedSlugs.has(course.slug);
    }

    if (!hasAccess) {
      const stripItems = (items?: { title?: string; link?: string }[]) =>
        (items ?? []).map((i) => ({ title: i.title, link: "" }));
      courseObj.videos = stripItems(courseObj.videos);
      courseObj.quizzes = stripItems(courseObj.quizzes);
      courseObj.assignments = stripItems(courseObj.assignments);
      courseObj.classworks = stripItems(courseObj.classworks);
      courseObj.videoModules = (courseObj.videoModules ?? []).map(
        (m: { title?: string; lessons?: { title?: string; link?: string }[] }) => ({
          title: m.title,
          lessons: stripItems(m.lessons),
        })
      );
    }

    // Keep the order the admin picked them in (Mongo's $in returns them in
    // arbitrary order) and skip anything the viewer already owns, since the
    // checkout add-on list would otherwise offer a course they can't buy.
    const recommendedOrder = (course.recommendedCourses ?? []).map((s: string) => s.toLowerCase());
    const recommendedObj = recommendedCourseDetails
      .filter((rec) => rec.slug !== course.slug && !ownedSlugs.has(rec.slug))
      .sort((a, b) => recommendedOrder.indexOf(a.slug) - recommendedOrder.indexOf(b.slug))
      .map(rec => {
      const obj = rec.toObject();
      obj.enrolledCount = Math.max(50, obj.enrolledCount || 0);
      // Upsell cards only need the marketing fields, never the content links.
      delete obj.videos;
      delete obj.videoModules;
      delete obj.quizzes;
      delete obj.assignments;
      delete obj.classworks;
      return obj;
    });

    return json({ ...courseObj, hasAccess, recommendedCourseDetails: recommendedObj });
  }

  if (method === "GET" && path === "/testimonials") {
    const list = await Testimonial.find({ published: true }).sort({ createdAt: -1 });
    return json(list);
  }

  if (method === "GET" && path === "/site-settings") {
    const settings = await SiteSettings.findById("singleton");
    return json({
      youtubeVideoUrl: settings?.youtubeVideoUrl || "",
      youtubeChannelUrl: settings?.youtubeChannelUrl || "",
    });
  }

  if (method === "POST" && path === "/leads") {
    const body = await readJson(request);
    const { name, email, phone, company, message, source, courseTitle } = body as Record<string, string>;
    if (!email || !source) {
      return json({ error: "email and source are required" }, { status: 400 });
    }
    if (!LEAD_SOURCE_VALUES.includes(source as (typeof LEAD_SOURCE_VALUES)[number])) {
      return json({ error: `source must be one of: ${LEAD_SOURCE_VALUES.join(", ")}` }, { status: 400 });
    }
    const lead = await Lead.create({ name, email, phone, company, message, source, courseTitle });
    return json({ id: lead._id }, { status: 201 });
  }

  // --- Student Registration & Authentication ---

  if (method === "POST" && path === "/student/register") {
    const body = await readJson(request);
    const { name, email, password, phone } = body as Record<string, string>;
    if (!name || !email || !password) {
      return json({ error: "Name, email and password are required" }, { status: 400 });
    }
    const normalizedEmail = email.toLowerCase();
    const normalizedPhone = normalizePhone(phone);
    const existing = await Student.findOne({
      $or: [
        { email: normalizedEmail },
        ...(normalizedPhone ? [{ phoneNormalized: normalizedPhone }] : []),
      ],
    });
    if (existing && existing.isActivated) {
      return json({ error: "An account with this email or phone already exists" }, { status: 409 });
    }
    if (existing && !existing.isActivated) {
      // A guest checkout already created this record from a past purchase — don't
      // create a second account, direct them to activate the one they have.
      return json(
        {
          error:
            "You already have a purchase under this email or phone. Check your email/WhatsApp for an activation link, or use Forgot Password to set one.",
          guestAccountExists: true,
        },
        { status: 409 }
      );
    }

    const otp = generateOtp();
    const otpToken = jwt.sign(
      { purpose: REGISTER_OTP_PURPOSE, name, email: normalizedEmail, phone, otp },
      process.env.JWT_SECRET!,
      { expiresIn: "10m" }
    );

    if (!process.env.BREVO_API_KEY) {
      console.log(`[register] BREVO_API_KEY not set — OTP for ${normalizedEmail}: ${otp}`);
    }
    try {
      await sendRegistrationOtpEmail(normalizedEmail, name, otp);
    } catch (err) {
      console.error("[register] failed to send OTP email:", err);
      return json({ error: "Failed to send verification email. Please try again." }, { status: 500 });
    }

    return json({ token: otpToken, email: normalizedEmail });
  }

  if (method === "POST" && path === "/student/register/verify") {
    const body = await readJson(request);
    const { token, otp, password } = body as { token?: string; otp?: string; password?: string };
    if (!token || !otp || !password) {
      return json({ error: "Token, code and password are required" }, { status: 400 });
    }

    let payload: { purpose: string; name: string; email: string; phone?: string; otp: string };
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!) as typeof payload;
    } catch {
      return json({ error: "This verification code has expired. Please sign up again." }, { status: 400 });
    }
    if (payload.purpose !== REGISTER_OTP_PURPOSE) {
      return json({ error: "Invalid verification token" }, { status: 400 });
    }
    if (payload.otp !== otp.trim()) {
      return json({ error: "Incorrect verification code" }, { status: 400 });
    }

    const existing = await Student.findOne({ email: payload.email });
    if (existing && existing.isActivated) {
      return json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    let student;
    if (existing) {
      // A guest account was created (e.g. from a purchase) between register/start
      // and this verify call — claim it instead of creating a duplicate.
      existing.name = payload.name;
      existing.passwordHash = passwordHash;
      if (payload.phone) {
        existing.phone = payload.phone;
        existing.phoneNormalized = normalizePhone(payload.phone);
      }
      existing.isActivated = true;
      await existing.save();
      student = existing;
    } else {
      student = await Student.create({
        name: payload.name,
        email: payload.email,
        passwordHash,
        phone: payload.phone,
        phoneNormalized: normalizePhone(payload.phone),
        isActivated: true,
      });
    }
    const sessionToken = signStudentSession({ id: String(student._id), email: student.email, name: student.name });
    return jsonWithCookie(
      { id: student._id, email: student.email, name: student.name },
      studentCookieHeader(sessionToken)
    );
  }

  if (method === "POST" && path === "/student/login") {
    const body = await readJson(request);
    const { email, password } = body as Record<string, string>;
    if (!email || !password) {
      return json({ error: "Email and password are required" }, { status: 400 });
    }
    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student || !student.passwordHash || !(await bcrypt.compare(password, student.passwordHash))) {
      return json({ error: "Invalid email or password" }, { status: 401 });
    }
    const token = signStudentSession({ id: String(student._id), email: student.email, name: student.name });
    return jsonWithCookie(
      { id: student._id, email: student.email, name: student.name },
      studentCookieHeader(token)
    );
  }

  if (method === "POST" && path === "/student/logout") {
    return jsonWithCookie({ ok: true }, clearStudentCookieHeader());
  }

  if (method === "POST" && path === "/student/forgot-password") {
    const body = await readJson(request);
    const { email } = body as { email?: string };
    if (!email) return json({ error: "Email is required" }, { status: 400 });

    const genericResponse = json({
      message: "If an account exists with that email, a password reset link has been sent.",
    });

    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) return genericResponse;

    const token = jwt.sign(
      { id: String(student._id), purpose: PASSWORD_RESET_PURPOSE, pwv: student.passwordHash.slice(0, 12) },
      process.env.JWT_SECRET!,
      { expiresIn: "30m" }
    );
    const resetUrl = `${url.origin}/reset-password?token=${encodeURIComponent(token)}`;

    if (!process.env.BREVO_API_KEY) {
      console.log(`[forgot-password] BREVO_API_KEY not set — reset link for ${student.email}: ${resetUrl}`);
    }
    try {
      await sendPasswordResetEmail(student.email, student.name, resetUrl);
    } catch (err) {
      console.error("[forgot-password] failed to send reset email:", err);
    }

    return genericResponse;
  }

  if (method === "POST" && path === "/student/reset-password") {
    const body = await readJson(request);
    const { token, password } = body as { token?: string; password?: string };
    if (!token || !password) return json({ error: "Token and new password are required" }, { status: 400 });
    if (password.length < 6) return json({ error: "Password must be at least 6 characters" }, { status: 400 });

    let payload: { id: string; purpose: string; pwv: string };
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!) as typeof payload;
    } catch {
      return json({ error: "This reset link is invalid or has expired. Please request a new one." }, { status: 400 });
    }
    if (payload.purpose !== PASSWORD_RESET_PURPOSE) {
      return json({ error: "Invalid reset token" }, { status: 400 });
    }

    const student = await Student.findById(payload.id);
    if (!student || student.passwordHash.slice(0, 12) !== payload.pwv) {
      return json({ error: "This reset link has already been used. Please request a new one." }, { status: 400 });
    }

    student.passwordHash = await bcrypt.hash(password, 10);
    student.isActivated = true;
    await student.save();

    return json({ message: "Password reset successful. You can now log in." });
  }

  // --- Guest account activation (set a password for an account created by a guest checkout) ---

  if (method === "POST" && path === "/student/activate/verify-token") {
    const body = await readJson(request);
    const { token } = body as { token?: string };
    if (!token) return json({ error: "Token is required" }, { status: 400 });

    let payload: { id: string; purpose: string };
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!) as typeof payload;
    } catch {
      return json({ error: "This activation link is invalid or has expired." }, { status: 400 });
    }
    if (payload.purpose !== ACTIVATION_TOKEN_PURPOSE) {
      return json({ error: "Invalid activation token" }, { status: 400 });
    }

    const student = await Student.findById(payload.id).select("name email isActivated");
    if (!student) return json({ error: "Account not found" }, { status: 404 });

    return json({ name: student.name, email: student.email, alreadyActivated: student.isActivated });
  }

  if (method === "POST" && path === "/student/activate/send-otp") {
    const body = await readJson(request);
    const { token } = body as { token?: string };
    if (!token) return json({ error: "Token is required" }, { status: 400 });

    let payload: { id: string; purpose: string };
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!) as typeof payload;
    } catch {
      return json({ error: "This activation link is invalid or has expired." }, { status: 400 });
    }
    if (payload.purpose !== ACTIVATION_TOKEN_PURPOSE) {
      return json({ error: "Invalid activation token" }, { status: 400 });
    }

    const student = await Student.findById(payload.id);
    if (!student) return json({ error: "Account not found" }, { status: 404 });
    if (student.isActivated) {
      return json({ error: "This account is already activated. Please log in." }, { status: 400 });
    }

    const otp = generateOtp();
    const otpToken = jwt.sign(
      { id: String(student._id), purpose: ACTIVATION_OTP_PURPOSE, otp },
      process.env.JWT_SECRET!,
      { expiresIn: "10m" }
    );

    if (!process.env.BREVO_API_KEY) {
      console.log(`[activate] BREVO_API_KEY not set — OTP for ${student.email}: ${otp}`);
    }
    try {
      await sendActivationOtpEmail(student.email, student.name, otp);
    } catch (err) {
      console.error("[activate] failed to send OTP email:", err);
      return json({ error: "Failed to send verification email. Please try again." }, { status: 500 });
    }

    return json({ otpToken });
  }

  if (method === "POST" && path === "/student/activate/complete") {
    const body = await readJson(request);
    const { otpToken, otp, password } = body as { otpToken?: string; otp?: string; password?: string };
    if (!otpToken || !otp || !password) {
      return json({ error: "Token, code and password are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    let payload: { id: string; purpose: string; otp: string };
    try {
      payload = jwt.verify(otpToken, process.env.JWT_SECRET!) as typeof payload;
    } catch {
      return json({ error: "This verification code has expired. Please request a new one." }, { status: 400 });
    }
    if (payload.purpose !== ACTIVATION_OTP_PURPOSE) {
      return json({ error: "Invalid verification token" }, { status: 400 });
    }
    if (payload.otp !== otp.trim()) {
      return json({ error: "Incorrect verification code" }, { status: 400 });
    }

    const student = await Student.findById(payload.id);
    if (!student) return json({ error: "Account not found" }, { status: 404 });

    student.passwordHash = await bcrypt.hash(password, 10);
    student.isActivated = true;
    await student.save();

    const sessionToken = signStudentSession({ id: String(student._id), email: student.email, name: student.name });
    return jsonWithCookie(
      { id: student._id, email: student.email, name: student.name },
      studentCookieHeader(sessionToken)
    );
  }

  if (method === "POST" && path === "/student/resend-activation") {
    const body = await readJson(request);
    const { email } = body as { email?: string };
    if (!email) return json({ error: "Email is required" }, { status: 400 });

    // Same generic-response pattern as forgot-password — never reveal via timing
    // or response shape whether an account exists for this email.
    const genericResponse = json({
      message: "If a purchase exists under that email, we've sent an activation link.",
    });

    const student = await Student.findOne({ email: email.toLowerCase(), isActivated: false });
    if (!student) return genericResponse;

    const activationToken = jwt.sign(
      { id: String(student._id), purpose: ACTIVATION_TOKEN_PURPOSE },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );
    const activationUrl = `${url.origin}/activate?token=${encodeURIComponent(activationToken)}`;

    if (!process.env.BREVO_API_KEY) {
      console.log(`[resend-activation] BREVO_API_KEY not set — activation link for ${student.email}: ${activationUrl}`);
    }
    try {
      await sendActivationLinkEmail(student.email, student.name, activationUrl);
    } catch (err) {
      console.error("[resend-activation] failed to send email:", err);
    }
    if (student.phone) {
      sendWhatsAppActivationLink(student.name, student.phone, student.purchasedCourses[0] || "your course", activationUrl).catch(
        (err) => console.error("[resend-activation] WhatsApp send failed:", err)
      );
    }

    return genericResponse;
  }

  if (method === "GET" && path === "/categories") {
    const categories = await Category.find().sort({ name: 1 });
    return json(categories);
  }

  if (method === "GET" && path === "/coupons/active") {
    const now = new Date();
    const coupons = await Coupon.find({
      active: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gte: now } }],
    }).sort({ createdAt: -1 });

    const usable = coupons.filter((c) => c.maxUses == null || c.usedCount < c.maxUses);

    return json(
      usable.map((c) => ({
        code: c.code,
        discountType: c.discountType,
        discountValue: c.discountValue,
        minOrderAmount: c.minOrderAmount,
        expiresAt: c.expiresAt,
      }))
    );
  }

  if (method === "GET" && path === "/student/me") {
    const session = getStudentSession(request);
    if (!session) return json({ error: "Not authenticated" }, { status: 401 });
    const student = await Student.findById(session.id).select("-passwordHash");
    if (!student) return json({ error: "Student not found" }, { status: 404 });
    return json(student);
  }

  if (method === "GET" && path === "/student/courses") {
    const session = getStudentSession(request);
    if (!session) return json({ error: "Not authenticated" }, { status: 401 });
    const student = await Student.findById(session.id);
    if (!student) return json({ error: "Student not found" }, { status: 404 });
    const courses = await Course.find({ slug: { $in: student.purchasedCourses } });
    const formatted = courses.map(c => {
      const obj = c.toObject();
      obj.enrolledCount = Math.max(50, obj.enrolledCount || 0);
      return obj;
    });
    return json(formatted);
  }

  if (method === "POST" && path === "/purchase") {
    const session = getStudentSession(request);
    if (!session) return json({ error: "Not authenticated" }, { status: 401 });
    const body = await readJson(request);
    const { courseSlug, addonSlugs } = body as { courseSlug?: string; addonSlugs?: string[] };
    if (!courseSlug) return json({ error: "courseSlug is required" }, { status: 400 });

    const course = await Course.findOne({ slug: courseSlug });
    if (!course) return json({ error: "Course not found" }, { status: 404 });

    const student = await Student.findById(session.id);
    if (!student) return json({ error: "Student not found" }, { status: 404 });

    // Check if already purchased
    if (student.purchasedCourses.includes(courseSlug)) {
      return json({ error: "Course already purchased" }, { status: 400 });
    }

    const mockPaymentId = "pay_" + Math.random().toString(36).substring(2, 11).toUpperCase();
    const purchase = await Purchase.create({
      studentId: student._id,
      studentName: student.name,
      studentEmail: student.email,
      courseSlug: course.slug,
      courseTitle: course.title,
      amount: applyGst(course.price).totalWithGst,
      currency: course.currency,
      status: "completed",
      paymentId: mockPaymentId,
    });

    student.purchasedCourses.push(course.slug);
    course.enrolledCount = (course.enrolledCount || 0) + 1;
    await course.save();

    // Any recommended add-on courses the student chose to purchase alongside this one
    const addonPurchases = [];
    const requestedAddonSlugs = (addonSlugs ?? []).filter(
      (slug) => slug !== course.slug && !student.purchasedCourses.includes(slug)
    );
    if (requestedAddonSlugs.length) {
      const addonCourses = await Course.find({ slug: { $in: requestedAddonSlugs }, published: true });
      for (const addon of addonCourses) {
        student.purchasedCourses.push(addon.slug);
        addonPurchases.push(
          await Purchase.create({
            studentId: student._id,
            studentName: student.name,
            studentEmail: student.email,
            courseSlug: addon.slug,
            courseTitle: addon.title,
            amount: applyGst(addon.price).totalWithGst,
            currency: addon.currency,
            status: "completed",
            paymentId: `${mockPaymentId}_addon`,
          })
        );
        addon.enrolledCount = (addon.enrolledCount || 0) + 1;
        await addon.save();
      }
    }

    if (student.phone) {
      sendWhatsAppPurchaseNotification(student.name, student.phone, course.title, mockPaymentId, "PAID").catch((err) => {
        console.error("Error triggering dev WhatsApp notification:", err);
      });
    }

    await student.save();

    return json({ purchase, addonPurchases, ok: true }, { status: 201 });
  }

  if (method === "POST" && path === "/coupons/apply") {
    const session = getStudentSession(request);
    if (!session) return json({ error: "Not authenticated" }, { status: 401 });

    const body = await readJson(request);
    const { code, courseSlug, addonSlugs } = body as { code?: string; courseSlug?: string; addonSlugs?: string[] };
    if (!code || !code.trim()) return json({ error: "Coupon code is required" }, { status: 400 });
    if (!courseSlug) return json({ error: "courseSlug is required" }, { status: 400 });

    const course = await Course.findOne({ slug: courseSlug });
    if (!course) return json({ error: "Course not found" }, { status: 404 });

    const requestedAddonSlugs = (addonSlugs ?? []).filter((slug) => slug !== course.slug);
    const addonCourses = requestedAddonSlugs.length
      ? await Course.find({ slug: { $in: requestedAddonSlugs }, published: true })
      : [];
    const subtotal = course.price + addonCourses.reduce((sum, addon) => sum + addon.price, 0);

    try {
      const result = await validateCoupon(code, { courseSlug, subtotal });
      return json({
        valid: true,
        code: result.coupon.code,
        discountType: result.coupon.discountType,
        discountValue: result.coupon.discountValue,
        discountAmount: result.discountAmount,
        finalAmount: result.finalAmount,
        subtotal,
      });
    } catch (err) {
      return json({ error: err instanceof Error ? err.message : "Invalid coupon" }, { status: 400 });
    }
  }

  if (method === "POST" && path === "/payment/create-order") {
    // A logged-in session is used when present, but checkout no longer requires
    // one — an anonymous visitor can pay as a guest by supplying name/email
    // themselves. Either way we end up with a real Student document so course
    // access, receipts and admin visibility work identically afterwards.
    const session = getStudentSession(request);
    const body = await readJson(request);
    const { courseSlug, addonSlugs, name, email, phone, state, city, pincode, couponCode, attribution, visitorId } = body as {
      courseSlug?: string;
      addonSlugs?: string[];
      name?: string;
      email?: string;
      visitorId?: string;
      phone?: string;
      state?: string;
      city?: string;
      pincode?: string;
      couponCode?: string;
      attribution?: {
        source?: string;
        utmSource?: string;
        utmMedium?: string;
        utmCampaign?: string;
        referrer?: string;
        landingPage?: string;
      };
    };
    if (!courseSlug) return json({ error: "courseSlug is required" }, { status: 400 });
    if (!phone || !phone.trim() || !state || !state.trim() || !city || !city.trim() || !pincode || !pincode.trim()) {
      return json({ error: "Phone, state, city, and pincode are required" }, { status: 400 });
    }
    if (!session) {
      if (!name || !name.trim() || !email || !email.trim()) {
        return json({ error: "Name and email are required" }, { status: 400 });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return json({ error: "Please enter a valid email address" }, { status: 400 });
      }
    }

    const course = await Course.findOne({ slug: courseSlug });
    if (!course) return json({ error: "Course not found" }, { status: 404 });

    const student = session
      ? await Student.findById(session.id)
      : (await findOrCreateGuestStudent({ name: name!, email: email!, phone })).student;
    if (!student) return json({ error: "Student not found" }, { status: 404 });
    const isGuestCheckout = !session;

    // Save the billing details filled in at checkout onto the student's own
    // record too, so admin can see them on the Students page directly rather
    // than only in the Purchases log.
    let studentProfileChanged = false;
    if (phone && phone.trim() && student.phone !== phone.trim()) {
      student.phone = phone.trim();
      student.phoneNormalized = normalizePhone(phone);
      studentProfileChanged = true;
    }
    if (state && state.trim() && student.state !== state.trim()) {
      student.state = state.trim();
      studentProfileChanged = true;
    }
    if (city && city.trim() && student.city !== city.trim()) {
      student.city = city.trim();
      studentProfileChanged = true;
    }
    if (studentProfileChanged) await student.save();

    // Check if already purchased
    if (student.purchasedCourses.includes(courseSlug)) {
      return json({ error: "Course already purchased" }, { status: 400 });
    }

    // Calculate total price
    const requestedAddonSlugs = (addonSlugs ?? []).filter(
      (slug) => slug !== course.slug && !student.purchasedCourses.includes(slug)
    );
    const addonCourses = requestedAddonSlugs.length
      ? await Course.find({ slug: { $in: requestedAddonSlugs }, published: true })
      : [];

    const items = [
      { slug: course.slug, title: course.title, currency: course.currency || "INR", amount: course.price },
      ...addonCourses.map((addon) => ({ slug: addon.slug, title: addon.title, currency: addon.currency || "INR", amount: addon.price })),
    ];
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);

    let amount = subtotal;
    let appliedCouponCode = "";
    let totalDiscount = 0;

    if (couponCode && couponCode.trim()) {
      try {
        const result = await validateCoupon(couponCode, { courseSlug, subtotal });
        amount = result.finalAmount;
        totalDiscount = result.discountAmount;
        appliedCouponCode = result.coupon.code;
      } catch (err) {
        return json({ error: err instanceof Error ? err.message : "Invalid coupon" }, { status: 400 });
      }
    }

    // Distribute the discount proportionally across each item so their amounts sum to the final charged total
    let distributedSoFar = 0;
    const itemsWithDiscount = items.map((item, idx) => {
      const isLast = idx === items.length - 1;
      const itemDiscount = isLast
        ? totalDiscount - distributedSoFar
        : Math.round((totalDiscount * item.amount) / subtotal);
      distributedSoFar += itemDiscount;
      return { ...item, discountAmount: itemDiscount, finalAmount: Math.max(item.amount - itemDiscount, 0) };
    });

    // 18% GST is added on top of the discounted amount. Each purchase record
    // stores its GST-inclusive amount; the last item absorbs any rounding so
    // the records sum exactly to what the gateway charges.
    const { totalWithGst } = applyGst(amount);
    let gstAllocatedSoFar = 0;
    const itemsWithGst = itemsWithDiscount.map((item, idx) => {
      const isLast = idx === itemsWithDiscount.length - 1;
      const itemTotal = isLast
        ? Math.round((totalWithGst - gstAllocatedSoFar) * 100) / 100
        : applyGst(item.finalAmount).totalWithGst;
      gstAllocatedSoFar += itemTotal;
      return { ...item, finalAmount: itemTotal };
    });
    amount = totalWithGst;

    // Generate unique order ID
    const orderId = "order_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8).toUpperCase();

    // Call Cashfree API to create the order
    const origin = url.origin;
    const returnUrl = `${origin}/checkout-callback?order_id=${orderId}`;

    const clientId = process.env.CASHFREE_CLIENT_ID;
    const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return json({ error: "Cashfree API credentials are not configured" }, { status: 500 });
    }

    const cashfreeResponse = await fetch("https://api.cashfree.com/pg/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": clientId,
        "x-client-secret": clientSecret,
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_id: student._id.toString(),
          customer_email: student.email,
          customer_phone: phone || student.phone || "9999999999",
          customer_name: student.name,
        },
        order_meta: {
          return_url: returnUrl,
        },
      }),
    });

    const cfData = await cashfreeResponse.json() as { message?: string; payment_session_id?: string };
    if (!cashfreeResponse.ok) {
      console.error("Cashfree Order Creation Error:", cfData);
      return json({ error: cfData.message || "Failed to initiate payment with Cashfree" }, { status: 500 });
    }

    const paymentSessionId = cfData.payment_session_id;

    // Save temporary Purchase records in the database with status "pending"
    for (const item of itemsWithGst) {
      await Purchase.create({
        studentId: student._id,
        studentName: student.name,
        studentEmail: student.email,
        studentPhone: phone || student.phone || "",
        studentState: state || "",
        studentCity: city || "",
        studentPincode: pincode || "",
        courseSlug: item.slug,
        courseTitle: item.title,
        amount: item.finalAmount,
        currency: item.currency,
        status: "pending",
        paymentId: orderId,
        isGuestPurchase: isGuestCheckout,
        couponCode: appliedCouponCode,
        discountAmount: item.discountAmount,
        source: attribution?.source || "Direct / Website",
        utmSource: attribution?.utmSource || "",
        utmMedium: attribution?.utmMedium || "",
        utmCampaign: attribution?.utmCampaign || "",
        referrer: attribution?.referrer || "",
        landingPage: attribution?.landingPage || "",
      });

      recordCartEvent({
        visitorId,
        event: "payment_initiated",
        courseSlug: item.slug,
        courseTitle: item.title,
        amount: item.finalAmount,
        currency: item.currency,
        studentId: String(student._id),
        name: student.name,
        email: student.email,
        phone: phone || student.phone || "",
        state,
        city,
        orderId,
        attribution,
      }).catch((err) => console.error("Error recording payment_initiated cart event:", err));
    }

    return json({ paymentSessionId, orderId, ok: true }, { status: 201 });
  }

  if (method === "GET" && path === "/payment/verify") {
    const orderId = url.searchParams.get("order_id");
    if (!orderId) return json({ error: "order_id is required" }, { status: 400 });

    // The order the checkout flow created (logged-in or guest) already carries
    // the resolved studentId, so verification doesn't need — and, for a guest,
    // doesn't have — a pre-existing session. orderId itself acts as the bearer
    // credential, the same way the Cashfree return_url already exposes it.
    const anyPurchaseForOrder = await Purchase.findOne({ paymentId: orderId });
    if (!anyPurchaseForOrder) return json({ error: "Order not found" }, { status: 404 });

    const session = getStudentSession(request);
    if (session && session.id !== String(anyPurchaseForOrder.studentId)) {
      return json({ error: "This order does not belong to your account" }, { status: 403 });
    }

    const student = await Student.findById(anyPurchaseForOrder.studentId);
    if (!student) return json({ error: "Student not found" }, { status: 404 });

    const clientId = process.env.CASHFREE_CLIENT_ID;
    const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return json({ error: "Cashfree API credentials are not configured" }, { status: 500 });
    }

    const cashfreeResponse = await fetch(`https://api.cashfree.com/pg/orders/${orderId}`, {
      method: "GET",
      headers: {
        "x-api-version": "2023-08-01",
        "x-client-id": clientId,
        "x-client-secret": clientSecret,
      },
    });

    const cfData = await cashfreeResponse.json() as { order_status?: string; message?: string };
    if (!cashfreeResponse.ok) {
      console.error("Cashfree Order Fetch Error:", cfData);
      return json({ error: cfData.message || "Failed to fetch order status from Cashfree" }, { status: 500 });
    }

    if (cfData.order_status === "PAID") {
      const pendingPurchases = await Purchase.find({ paymentId: orderId, status: "pending" });

      let updatedSome = false;
      let courseTitle = "";
      let totalAmount = 0;
      let currency = "INR";
      const courseSlugs: string[] = [];
      let usedCouponCode = "";

      for (const purchase of pendingPurchases) {
        purchase.status = "completed";
        await purchase.save();

        if (!student.purchasedCourses.includes(purchase.courseSlug)) {
          student.purchasedCourses.push(purchase.courseSlug);
        }

        totalAmount += purchase.amount || 0;
        currency = purchase.currency || currency;
        courseSlugs.push(purchase.courseSlug);
        if (purchase.couponCode) usedCouponCode = purchase.couponCode;

        const course = await Course.findOne({ slug: purchase.courseSlug });
        if (course) {
          course.enrolledCount = (course.enrolledCount || 0) + 1;
          await course.save();
          if (!courseTitle) {
            courseTitle = course.title;
          }
        }
        updatedSome = true;
      }

      if (updatedSome) {
        await student.save();
        if (usedCouponCode) {
          await Coupon.updateOne({ code: usedCouponCode }, { $inc: { usedCount: 1 } });
        }
        if (student.phone && courseTitle) {
          sendWhatsAppPurchaseNotification(student.name, student.phone, courseTitle, orderId, "PAID").catch((err) => {
            console.error("Error triggering Cashfree WhatsApp notification:", err);
          });
        }

        // Guest checkouts create a not-yet-activated Student record — send the
        // receipt plus an activation link so they can set a password later.
        // Registered students who checked out while logged in skip this.
        if (!student.isActivated) {
          const activationToken = jwt.sign(
            { id: String(student._id), purpose: ACTIVATION_TOKEN_PURPOSE },
            process.env.JWT_SECRET!,
            { expiresIn: "7d" }
          );
          const activationUrl = `${url.origin}/activate?token=${encodeURIComponent(activationToken)}`;
          sendGuestPurchaseConfirmationEmail(
            student.email,
            student.name,
            courseTitle || "your course",
            totalAmount,
            currency,
            orderId,
            activationUrl
          ).catch((err) => console.error("Error sending guest purchase confirmation email:", err));
          if (student.phone) {
            sendWhatsAppActivationLink(student.name, student.phone, courseTitle || "your course", activationUrl).catch((err) =>
              console.error("Error sending guest WhatsApp activation link:", err)
            );
          }
        }

        const cookies = parseCookies(request.headers.get("cookie"));
        const forwardedFor = request.headers.get("x-forwarded-for");
        sendMetaPurchaseEvent({
          email: student.email,
          phone: student.phone,
          value: totalAmount,
          currency,
          eventId: orderId,
          contentIds: courseSlugs,
          contentName: courseTitle,
          numItems: courseSlugs.length,
          eventSourceUrl: `${url.origin}/thank-you`,
          clientIpAddress: forwardedFor ? forwardedFor.split(",")[0].trim() : undefined,
          clientUserAgent: request.headers.get("user-agent") || undefined,
          fbc: cookies._fbc,
          fbp: cookies._fbp,
        }).catch((err) => {
          console.error("Error sending Meta Conversions API purchase event:", err);
        });
      } else {
        const anyPurchases = await Purchase.find({ paymentId: orderId });
        if (anyPurchases.length > 0) {
          const mainCourse = await Course.findOne({ slug: anyPurchases[0].courseSlug });
          if (mainCourse) courseTitle = mainCourse.title;
          totalAmount = anyPurchases.reduce((sum, p) => sum + (p.amount || 0), 0);
          currency = anyPurchases[0].currency || currency;
          courseSlugs.push(...anyPurchases.map((p) => p.courseSlug));
        }
      }

      CartActivity.updateMany(
        { orderId },
        { $set: { status: "Purchase Completed", lastActivityAt: new Date() }, $push: { events: { event: "purchase_completed", at: new Date() } } }
      ).catch((err) => console.error("Error updating cart activity to Purchase Completed:", err));

      // No session on this request means this was a guest checkout (or a
      // session that expired mid-flow) — log them in immediately so the
      // thank-you page and dashboard work without a separate login step.
      //
      // SECURITY: only do this when the resolved student has no password yet
      // (a fresh guest account, or one still pending activation). If the
      // email/phone the guest typed matched an already-activated account,
      // the purchase still gets linked to it (per the "match existing
      // accounts" requirement) but we must NOT hand out a live session for
      // someone else's real account just because a stranger typed their
      // phone number into a checkout form with no password check at all —
      // they need to log in with the real password to see it.
      const willAutoLogin = !session && !student.isActivated;
      const responseBody = {
        ok: true,
        courseTitle: courseTitle || "Course",
        amount: totalAmount,
        currency,
        orderId,
        courseSlugs,
        isGuestPurchase: !student.isActivated,
        loggedIn: Boolean(session) || willAutoLogin,
      };

      if (willAutoLogin) {
        const loginToken = signStudentSession({ id: String(student._id), email: student.email, name: student.name });
        return jsonWithCookie(responseBody, studentCookieHeader(loginToken));
      }
      return json(responseBody);
    } else {
      // "ACTIVE" means the customer may still complete payment — the frontend keeps polling.
      // Anything else (EXPIRED, TERMINATED, TERMINATION_REQUESTED, etc.) is a terminal failure,
      // so stop leaving the pending Purchase records stuck forever.
      if (cfData.order_status && cfData.order_status !== "ACTIVE") {
        await Purchase.updateMany({ paymentId: orderId, status: "pending" }, { status: "failed" });
        CartActivity.updateMany(
          { orderId, status: { $ne: "Purchase Completed" } },
          { $set: { status: "Payment Failed", lastActivityAt: new Date() }, $push: { events: { event: "payment_failed", at: new Date() } } }
        ).catch((err) => console.error("Error updating cart activity to Payment Failed:", err));
      }
      return json({ ok: false, status: cfData.order_status, error: "Payment not completed or failed" });
    }
  }

  return json({ error: "Not found" }, { status: 404 });
}


async function handleAdminRoute(request: Request, path: string, url: URL): Promise<Response> {
  const method = request.method;

  if (method === "POST" && path === "/login") {
    const body = await readJson(request);
    const { email, password } = body as { email?: string; password?: string };
    const admin = email ? await Admin.findOne({ email: email.toLowerCase() }) : null;
    if (!admin || !(await bcrypt.compare(password ?? "", admin.passwordHash))) {
      return json({ error: "Invalid email or password" }, { status: 401 });
    }
    const token = signAdminSession({ id: String(admin._id), email: admin.email });
    return jsonWithCookie({ email: admin.email }, adminCookieHeader(token));
  }

  if (method === "POST" && path === "/logout") {
    return jsonWithCookie({ ok: true }, clearAdminCookieHeader());
  }

  // Everything below requires an authenticated admin session.
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  const session = getAdminSession(request)!;

  if (method === "GET" && path === "/me") {
    return json({ email: session.email });
  }

  if (method === "GET" && path === "/site-settings") {
    const settings = await SiteSettings.findById("singleton");
    return json({
      youtubeVideoUrl: settings?.youtubeVideoUrl || "",
      youtubeChannelUrl: settings?.youtubeChannelUrl || "",
    });
  }

  if (method === "PUT" && path === "/site-settings") {
    const body = (await readJson(request)) as { youtubeVideoUrl?: string; youtubeChannelUrl?: string };
    const settings = await SiteSettings.findByIdAndUpdate(
      "singleton",
      {
        youtubeVideoUrl: (body.youtubeVideoUrl ?? "").trim(),
        youtubeChannelUrl: (body.youtubeChannelUrl ?? "").trim(),
      },
      { new: true, upsert: true }
    );
    return json({ youtubeVideoUrl: settings.youtubeVideoUrl, youtubeChannelUrl: settings.youtubeChannelUrl });
  }

  if (method === "POST" && path === "/upload-image") {
    try {
      const formData = await request.formData();
      const file = formData.get("file");
      if (!(file instanceof Blob)) {
        return json({ error: "No file provided" }, { status: 400 });
      }
      const folderField = formData.get("folder");
      const folder = typeof folderField === "string" && folderField.trim() ? folderField.trim() : "skillup-hub";
      const url = await uploadImageToCloudinary(file, folder);
      return json({ url });
    } catch (err) {
      return json({ error: err instanceof Error ? err.message : "Upload failed" }, { status: 500 });
    }
  }

  if (method === "GET" && path === "/stats") {
    const startDateStr = url.searchParams.get("startDate");
    const endDateStr = url.searchParams.get("endDate");
    const courseSlug = url.searchParams.get("courseSlug");

    const matchQuery: Record<string, any> = { status: "completed" };
    const leadMatchQuery: Record<string, any> = {};
    const newLeadMatchQuery: Record<string, any> = { status: "new" };

    if (startDateStr || endDateStr) {
      matchQuery.createdAt = {};
      leadMatchQuery.createdAt = {};
      newLeadMatchQuery.createdAt = {};

      if (startDateStr) {
        matchQuery.createdAt.$gte = new Date(startDateStr);
        leadMatchQuery.createdAt.$gte = new Date(startDateStr);
        newLeadMatchQuery.createdAt.$gte = new Date(startDateStr);
      }
      if (endDateStr) {
        const endDate = new Date(endDateStr);
        endDate.setHours(23, 59, 59, 999);
        matchQuery.createdAt.$lte = endDate;
        leadMatchQuery.createdAt.$lte = endDate;
        newLeadMatchQuery.createdAt.$lte = endDate;
      }
    }
    if (courseSlug) matchQuery.courseSlug = courseSlug;

    const [
      courseCount,
      leadCount,
      newLeadCount,
      categoryCount,
      purchaseCount,
      studentCount,
      revenueResult,
      monthlyRevenue,
      stateBreakdown,
      cityBreakdown,
    ] = await Promise.all([
      Course.countDocuments(),
      Lead.countDocuments(leadMatchQuery),
      Lead.countDocuments(newLeadMatchQuery),
      Category.countDocuments(),
      Purchase.countDocuments(matchQuery),
      Student.countDocuments(),
      Purchase.aggregate([
        { $match: matchQuery },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Purchase.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            revenue: { $sum: "$amount" },
            sales: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } }
      ]),
      // Location-wise sales analytics — which states are driving the most
      // orders/revenue in the selected date range (and course, if filtered).
      Purchase.aggregate([
        { $match: { ...matchQuery, studentState: { $nin: [null, ""] } } },
        { $group: { _id: "$studentState", orders: { $sum: 1 }, revenue: { $sum: "$amount" } } },
        { $sort: { revenue: -1 } },
      ]),
      Purchase.aggregate([
        { $match: { ...matchQuery, studentCity: { $nin: [null, ""] } } },
        { $group: { _id: "$studentCity", state: { $first: "$studentState" }, orders: { $sum: 1 }, revenue: { $sum: "$amount" } } },
        { $sort: { revenue: -1 } },
      ]),
    ]);
    const totalRevenue = revenueResult[0]?.total ?? 0;
    return json({
      courseCount,
      leadCount,
      newLeadCount,
      categoryCount,
      purchaseCount,
      studentCount,
      totalRevenue,
      monthlyRevenue,
      stateBreakdown: stateBreakdown.map((s: any) => ({ state: s._id, orders: s.orders, revenue: s.revenue })),
      cityBreakdown: cityBreakdown.map((c: any) => ({ city: c._id, state: c.state || "", orders: c.orders, revenue: c.revenue })),
    });
  }

  // --- Courses CRUD ---

  if (method === "GET" && path === "/courses") {
    const courses = await Course.find().sort({ createdAt: -1 });
    return json(courses);
  }

  if (method === "POST" && path === "/courses") {
    const body = (await readJson(request)) as Record<string, unknown>;
    if (!body.title || !body.category) {
      return json({ error: "title and category are required" }, { status: 400 });
    }
    const slug = body.slug ? slugify(String(body.slug)) : slugify(String(body.title));
    try {
      const course = await Course.create({ ...body, slug });
      return json(course, { status: 201 });
    } catch (err) {
      if ((err as { code?: number }).code === 11000) {
        return json({ error: "A course with that slug already exists" }, { status: 409 });
      }
      throw err;
    }
  }

  const courseIdMatch = path.match(/^\/courses\/([^/]+)$/);
  if (method === "PUT" && courseIdMatch) {
    const body = (await readJson(request)) as Record<string, unknown>;
    if (body.slug) body.slug = slugify(String(body.slug));
    const course = await Course.findByIdAndUpdate(courseIdMatch[1], body, {
      new: true,
      runValidators: true,
    });
    if (!course) return json({ error: "Course not found" }, { status: 404 });
    return json(course);
  }

  if (method === "DELETE" && courseIdMatch) {
    const course = await Course.findByIdAndDelete(courseIdMatch[1]);
    if (!course) return json({ error: "Course not found" }, { status: 404 });
    return json({ ok: true });
  }

  // --- Categories ---

  if (method === "GET" && path === "/categories") {
    const categories = await Category.find().sort({ name: 1 });
    return json(categories);
  }

  if (method === "POST" && path === "/categories") {
    const body = (await readJson(request)) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) return json({ error: "name is required" }, { status: 400 });
    try {
      const category = await Category.create({ name });
      return json(category, { status: 201 });
    } catch (err) {
      if ((err as { code?: number }).code === 11000) {
        return json({ error: "A category with that name already exists" }, { status: 409 });
      }
      throw err;
    }
  }

  const categoryIdMatch = path.match(/^\/categories\/([^/]+)$/);
  if (method === "PUT" && categoryIdMatch) {
    const body = (await readJson(request)) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) return json({ error: "name is required" }, { status: 400 });
    try {
      const category = await Category.findByIdAndUpdate(
        categoryIdMatch[1],
        { name },
        { new: true, runValidators: true },
      );
      if (!category) return json({ error: "Category not found" }, { status: 404 });
      return json(category);
    } catch (err) {
      if ((err as { code?: number }).code === 11000) {
        return json({ error: "A category with that name already exists" }, { status: 409 });
      }
      throw err;
    }
  }

  if (method === "DELETE" && categoryIdMatch) {
    const category = await Category.findByIdAndDelete(categoryIdMatch[1]);
    if (!category) return json({ error: "Category not found" }, { status: 404 });
    return json({ ok: true });
  }

  // --- Leads ---

  if (method === "GET" && path === "/leads") {
    const filter: Record<string, unknown> = {};
    const source = url.searchParams.get("source");
    const status = url.searchParams.get("status");
    if (source) filter.source = source;
    if (status) filter.status = status;
    const leads = await Lead.find(filter).sort({ createdAt: -1 });
    return json(leads);
  }

  const leadIdMatch = path.match(/^\/leads\/([^/]+)$/);
  if (method === "PATCH" && leadIdMatch) {
    const body = (await readJson(request)) as { status?: string };
    if (!["new", "contacted", "closed"].includes(body.status ?? "")) {
      return json({ error: "status must be one of: new, contacted, closed" }, { status: 400 });
    }
    const lead = await Lead.findByIdAndUpdate(leadIdMatch[1], { status: body.status }, { new: true });
    if (!lead) return json({ error: "Lead not found" }, { status: 404 });
    return json(lead);
  }

  if (method === "DELETE" && leadIdMatch) {
    const lead = await Lead.findByIdAndDelete(leadIdMatch[1]);
    if (!lead) return json({ error: "Lead not found" }, { status: 404 });
    return json({ ok: true });
  }

  // --- Purchases CRUD ---

  if (method === "GET" && path === "/purchases") {
    const purchases = await Purchase.find().sort({ createdAt: -1 });
    return json(purchases);
  }

  const purchaseIdMatch = path.match(/^\/purchases\/([^/]+)$/);
  if (method === "DELETE" && purchaseIdMatch) {
    const purchase = await Purchase.findByIdAndDelete(purchaseIdMatch[1]);
    if (!purchase) return json({ error: "Purchase not found" }, { status: 404 });
    return json({ ok: true });
  }

  // --- Cart & Checkout Activity (Add to Cart / Abandoned Checkout tracking) ---

  if (method === "GET" && path === "/cart-activity") {
    const filter: Record<string, unknown> = {};
    const status = url.searchParams.get("status");
    const source = url.searchParams.get("source");
    const courseSlug = url.searchParams.get("courseSlug");
    const startDateStr = url.searchParams.get("startDate");
    const endDateStr = url.searchParams.get("endDate");
    if (status) filter.status = status;
    if (source) filter.source = source;
    if (courseSlug) filter.courseSlug = courseSlug;
    if (startDateStr || endDateStr) {
      filter.lastActivityAt = {};
      if (startDateStr) (filter.lastActivityAt as Record<string, Date>).$gte = new Date(startDateStr);
      if (endDateStr) {
        const endDate = new Date(endDateStr);
        endDate.setHours(23, 59, 59, 999);
        (filter.lastActivityAt as Record<string, Date>).$lte = endDate;
      }
    }
    const list = await CartActivity.find(filter).sort({ lastActivityAt: -1 }).limit(2000);
    return json(list);
  }

  const cartActivityIdMatch = path.match(/^\/cart-activity\/([^/]+)$/);
  if (method === "PATCH" && cartActivityIdMatch) {
    const body = (await readJson(request)) as { followUpStatus?: string; followUpNote?: string };
    const update: Record<string, string> = {};
    if (typeof body.followUpStatus === "string") update.followUpStatus = body.followUpStatus;
    if (typeof body.followUpNote === "string") update.followUpNote = body.followUpNote;
    const item = await CartActivity.findByIdAndUpdate(cartActivityIdMatch[1], update, { new: true });
    if (!item) return json({ error: "Cart activity not found" }, { status: 404 });
    return json(item);
  }

  if (method === "DELETE" && cartActivityIdMatch) {
    const item = await CartActivity.findByIdAndDelete(cartActivityIdMatch[1]);
    if (!item) return json({ error: "Cart activity not found" }, { status: 404 });
    return json({ ok: true });
  }

  // --- Students CRUD ---

  if (method === "GET" && path === "/students") {
    const list = await Student.find().select("-passwordHash").sort({ createdAt: -1 });
    return json(list);
  }

  const studentIdMatch = path.match(/^\/students\/([^/]+)$/);
  if (method === "DELETE" && studentIdMatch) {
    const student = await Student.findByIdAndDelete(studentIdMatch[1]);
    if (!student) return json({ error: "Student not found" }, { status: 404 });
    return json({ ok: true });
  }

  const grantAccessMatch = path.match(/^\/students\/([^/]+)\/grant-access$/);
  if (method === "POST" && grantAccessMatch) {
    const student = await Student.findById(grantAccessMatch[1]);
    if (!student) return json({ error: "Student not found" }, { status: 404 });

    const body = (await readJson(request)) as { courseSlug?: string };
    if (!body.courseSlug) return json({ error: "courseSlug is required" }, { status: 400 });

    const course = await Course.findOne({ slug: body.courseSlug });
    if (!course) return json({ error: "Course not found" }, { status: 404 });

    if (student.purchasedCourses.includes(course.slug)) {
      return json({ error: "Student already has access to this course" }, { status: 400 });
    }

    student.purchasedCourses.push(course.slug);
    await student.save();

    await Purchase.create({
      studentId: student._id,
      studentName: student.name,
      studentEmail: student.email,
      studentPhone: student.phone || "",
      courseSlug: course.slug,
      courseTitle: course.title,
      amount: 0,
      currency: course.currency || "INR",
      status: "completed",
      paymentId: "admin_grant_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      source: "Admin Granted",
    });

    course.enrolledCount = (course.enrolledCount || 0) + 1;
    await course.save();

    return json({ ok: true });
  }

  const revokeAccessMatch = path.match(/^\/students\/([^/]+)\/revoke-access$/);
  if (method === "POST" && revokeAccessMatch) {
    const student = await Student.findById(revokeAccessMatch[1]);
    if (!student) return json({ error: "Student not found" }, { status: 404 });

    const body = (await readJson(request)) as { courseSlug?: string };
    if (!body.courseSlug) return json({ error: "courseSlug is required" }, { status: 400 });

    if (!student.purchasedCourses.includes(body.courseSlug)) {
      return json({ error: "Student does not have access to this course" }, { status: 400 });
    }

    student.purchasedCourses = student.purchasedCourses.filter((slug: string) => slug !== body.courseSlug);
    await student.save();

    return json({ ok: true });
  }

  // --- Testimonials CRUD ---

  if (method === "GET" && path === "/testimonials") {
    const list = await Testimonial.find().sort({ createdAt: -1 });
    return json(list);
  }

  if (method === "POST" && path === "/testimonials") {
    const body = (await readJson(request)) as Record<string, unknown>;
    if (!body.name || !body.role || !body.text) {
      return json({ error: "name, role and text are required" }, { status: 400 });
    }
    const item = await Testimonial.create(body);
    return json(item, { status: 201 });
  }

  const testimonialIdMatch = path.match(/^\/testimonials\/([^/]+)$/);
  if (method === "PUT" && testimonialIdMatch) {
    const body = (await readJson(request)) as Record<string, unknown>;
    const item = await Testimonial.findByIdAndUpdate(testimonialIdMatch[1], body, {
      new: true,
      runValidators: true,
    });
    if (!item) return json({ error: "Testimonial not found" }, { status: 404 });
    return json(item);
  }

  if (method === "DELETE" && testimonialIdMatch) {
    const item = await Testimonial.findByIdAndDelete(testimonialIdMatch[1]);
    if (!item) return json({ error: "Testimonial not found" }, { status: 404 });
    return json({ ok: true });
  }

  // --- Coupons CRUD ---

  if (method === "GET" && path === "/coupons") {
    const list = await Coupon.find().sort({ createdAt: -1 });
    return json(list);
  }

  if (method === "POST" && path === "/coupons") {
    const body = (await readJson(request)) as Record<string, unknown>;
    if (!body.code || !body.discountType || body.discountValue == null) {
      return json({ error: "code, discountType and discountValue are required" }, { status: 400 });
    }
    try {
      const item = await Coupon.create({ ...body, code: String(body.code).trim().toUpperCase() });
      return json(item, { status: 201 });
    } catch (err: any) {
      if (err?.code === 11000) {
        return json({ error: "A coupon with this code already exists" }, { status: 409 });
      }
      throw err;
    }
  }

  const couponIdMatch = path.match(/^\/coupons\/([^/]+)$/);
  if (method === "PUT" && couponIdMatch) {
    const body = (await readJson(request)) as Record<string, unknown>;
    if (body.code) body.code = String(body.code).trim().toUpperCase();
    try {
      const item = await Coupon.findByIdAndUpdate(couponIdMatch[1], body, {
        new: true,
        runValidators: true,
      });
      if (!item) return json({ error: "Coupon not found" }, { status: 404 });
      return json(item);
    } catch (err: any) {
      if (err?.code === 11000) {
        return json({ error: "A coupon with this code already exists" }, { status: 409 });
      }
      throw err;
    }
  }

  if (method === "DELETE" && couponIdMatch) {
    const item = await Coupon.findByIdAndDelete(couponIdMatch[1]);
    if (!item) return json({ error: "Coupon not found" }, { status: 404 });
    return json({ ok: true });
  }

  return json({ error: "Not found" }, { status: 404 });
}

export async function handleApiRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";

  try {
    await connectDB();
    if (path.startsWith("/api/admin")) {
      return await handleAdminRoute(request, path.slice("/api/admin".length) || "/", url);
    }
    return await handlePublicRoute(request, path.slice("/api".length) || "/", url);
  } catch (err) {
    console.error(err);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}
