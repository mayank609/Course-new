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
import { sendPasswordResetEmail, sendRegistrationOtpEmail } from "./mail";
import { sendWhatsAppPurchaseNotification } from "./whatsapp";
import { uploadImageToCloudinary } from "./cloudinary";
import { validateCoupon } from "./coupons";
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
} from "./auth";

const PASSWORD_RESET_PURPOSE = "password_reset";
const REGISTER_OTP_PURPOSE = "register_otp";

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
      ? await Course.find({ slug: { $in: course.recommendedCourses }, published: true })
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
    if (session) {
      const viewer = await Student.findById(session.id).select("purchasedCourses");
      hasAccess = Boolean(viewer?.purchasedCourses?.includes(course.slug));
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

    const recommendedObj = recommendedCourseDetails.map(rec => {
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
    const existing = await Student.findOne({ email: normalizedEmail });
    if (existing) {
      return json({ error: "An account with this email already exists" }, { status: 409 });
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
    if (existing) {
      return json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const student = await Student.create({
      name: payload.name,
      email: payload.email,
      passwordHash,
      phone: payload.phone,
    });
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
    if (!student || !(await bcrypt.compare(password, student.passwordHash))) {
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
    await student.save();

    return json({ message: "Password reset successful. You can now log in." });
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
      amount: course.price,
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
            amount: addon.price,
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
    const session = getStudentSession(request);
    if (!session) return json({ error: "Not authenticated" }, { status: 401 });
const body = await readJson(request);
    const { courseSlug, addonSlugs, phone, state, city, pincode, couponCode, attribution } = body as {
      courseSlug?: string;
      addonSlugs?: string[];
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

    const course = await Course.findOne({ slug: courseSlug });
    if (!course) return json({ error: "Course not found" }, { status: 404 });

    const student = await Student.findById(session.id);
    if (!student) return json({ error: "Student not found" }, { status: 404 });

    // Update phone in student profile if different
    if (phone && phone.trim() && student.phone !== phone.trim()) {
      student.phone = phone.trim();
      await student.save();
    }

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
    for (const item of itemsWithDiscount) {
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
        couponCode: appliedCouponCode,
        discountAmount: item.discountAmount,
        source: attribution?.source || "Direct / Website",
        utmSource: attribution?.utmSource || "",
        utmMedium: attribution?.utmMedium || "",
        utmCampaign: attribution?.utmCampaign || "",
        referrer: attribution?.referrer || "",
        landingPage: attribution?.landingPage || "",
      });
    }

    return json({ paymentSessionId, orderId, ok: true }, { status: 201 });
  }

  if (method === "GET" && path === "/payment/verify") {
    const session = getStudentSession(request);
    if (!session) return json({ error: "Not authenticated" }, { status: 401 });

    const orderId = url.searchParams.get("order_id");
    if (!orderId) return json({ error: "order_id is required" }, { status: 400 });

    const student = await Student.findById(session.id);
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

      return json({
        ok: true,
        courseTitle: courseTitle || "Course",
        amount: totalAmount,
        currency,
        orderId,
        courseSlugs,
      });
    } else {
      // "ACTIVE" means the customer may still complete payment — the frontend keeps polling.
      // Anything else (EXPIRED, TERMINATED, TERMINATION_REQUESTED, etc.) is a terminal failure,
      // so stop leaving the pending Purchase records stuck forever.
      if (cfData.order_status && cfData.order_status !== "ACTIVE") {
        await Purchase.updateMany({ paymentId: orderId, status: "pending" }, { status: "failed" });
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

    const [courseCount, leadCount, newLeadCount, categoryCount, purchaseCount, studentCount, revenueResult, monthlyRevenue] = await Promise.all([
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
      ])
    ]);
    const totalRevenue = revenueResult[0]?.total ?? 0;
    return json({ courseCount, leadCount, newLeadCount, categoryCount, purchaseCount, studentCount, totalRevenue, monthlyRevenue });
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
