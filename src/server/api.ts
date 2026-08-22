import bcrypt from "bcryptjs";
import { connectDB } from "./db";
import { Course } from "./models/Course";
import { Category } from "./models/Category";
import { Admin } from "./models/Admin";
import { Lead, LEAD_SOURCE_VALUES } from "./models/Lead";
import { Student } from "./models/Student";
import { Purchase } from "./models/Purchase";
import { Testimonial } from "./models/Testimonial";
import {
  adminCookieHeader,
  clearAdminCookieHeader,
  getAdminSession,
  signAdminSession,
  getStudentSession,
  signStudentSession,
  studentCookieHeader,
  clearStudentCookieHeader,
} from "./auth";

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

  if (method === "GET" && path === "/courses") {
    const filter: Record<string, unknown> = { published: true };
    const category = url.searchParams.get("category");
    if (category) filter.category = category;
    const courses = await Course.find(filter).sort({ createdAt: -1 });
    return json(courses);
  }

  const courseMatch = path.match(/^\/courses\/([^/]+)$/);
  if (method === "GET" && courseMatch) {
    const course = await Course.findOne({ slug: courseMatch[1], published: true });
    if (!course) return json({ error: "Course not found" }, { status: 404 });
    return json(course);
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
    const passwordHash = await bcrypt.hash(password, 10);
    const student = await Student.create({ name, email: normalizedEmail, passwordHash, phone });
    const token = signStudentSession({ id: String(student._id), email: student.email, name: student.name });
    return jsonWithCookie(
      { id: student._id, email: student.email, name: student.name },
      studentCookieHeader(token)
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

  if (method === "GET" && path === "/categories") {
    const categories = await Category.find().sort({ name: 1 });
    return json(categories);
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
    return json(courses);
  }

  if (method === "POST" && path === "/purchase") {
    const session = getStudentSession(request);
    if (!session) return json({ error: "Not authenticated" }, { status: 401 });
    const body = await readJson(request);
    const { courseSlug } = body as { courseSlug?: string };
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
    await student.save();

    // Increment enrolled count
    course.enrolledCount = (course.enrolledCount || 0) + 1;
    await course.save();

    return json({ purchase, ok: true }, { status: 201 });
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

  if (method === "GET" && path === "/stats") {
    const [courseCount, leadCount, newLeadCount, categoryCount, purchaseCount, studentCount, revenueResult, monthlyRevenue] = await Promise.all([
      Course.countDocuments(),
      Lead.countDocuments(),
      Lead.countDocuments({ status: "new" }),
      Category.countDocuments(),
      Purchase.countDocuments({ status: "completed" }),
      Student.countDocuments(),
      Purchase.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Purchase.aggregate([
        { $match: { status: "completed" } },
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
