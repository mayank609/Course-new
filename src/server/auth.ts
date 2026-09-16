import jwt from "jsonwebtoken";

const COOKIE_NAME = "admin_token";
const STUDENT_COOKIE_NAME = "student_token";
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export type AdminSession = { id: string; email: string };
export type StudentSession = { id: string; email: string; name: string };

export function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return out;
}

export function getAdminSession(request: Request): AdminSession | null {
  const token = parseCookies(request.headers.get("cookie")).admin_token;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as AdminSession;
  } catch {
    return null;
  }
}

export function signAdminSession(session: AdminSession): string {
  return jwt.sign(session, process.env.JWT_SECRET!, { expiresIn: "7d" });
}

export function adminCookieHeader(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_SECONDS}; Path=/${secure}`;
}

export function clearAdminCookieHeader(): string {
  return `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/`;
}

export function getStudentSession(request: Request): StudentSession | null {
  const token = parseCookies(request.headers.get("cookie"))[STUDENT_COOKIE_NAME];
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as StudentSession;
  } catch {
    return null;
  }
}

export function signStudentSession(session: StudentSession): string {
  return jwt.sign(session, process.env.JWT_SECRET!, { expiresIn: "7d" });
}

export function studentCookieHeader(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${STUDENT_COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_SECONDS}; Path=/${secure}`;
}

export function clearStudentCookieHeader(): string {
  return `${STUDENT_COOKIE_NAME}=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/`;
}

// Reduces any phone number formatting (+91, spaces, dashes, leading 0) down to
// its last 10 digits so a guest checkout and a later registration can be
// matched to the same person regardless of how they typed their number.
export function normalizePhone(phone: string | null | undefined): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  return digits.slice(-10);
}

