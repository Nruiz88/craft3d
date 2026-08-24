import "server-only";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";

const CSRF_COOKIE = "craft3d-csrf";
const CSRF_TOKEN_LENGTH = 32;

/**
 * Generate a CSRF token tied to the current session.
 * The token is: random hex + HMAC(session_cookie_value, random)
 */
export async function generateCsrfToken(): Promise<string> {
  const random = randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
  const cookieStore = await cookies();
  const session = cookieStore.get("craft3d-admin")?.value ?? "anonymous";
  const hmac = createHash("sha256").update(`${random}:${session}`).digest("hex").slice(0, 16);
  const token = `${random}.${hmac}`;

  cookieStore.set(CSRF_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });

  return token;
}

/**
 * Validate a CSRF token from form data against the stored cookie.
 */
export async function validateCsrfToken(tokenFromForm: string): Promise<boolean> {
  if (!tokenFromForm) return false;

  const cookieStore = await cookies();
  const storedToken = cookieStore.get(CSRF_COOKIE)?.value;
  if (!storedToken) return false;

  // Compare using timing-safe comparison
  const a = Buffer.from(tokenFromForm);
  const b = Buffer.from(storedToken);
  if (a.length !== b.length) return false;

  const { timingSafeEqual } = await import("node:crypto");
  return timingSafeEqual(a, b);
}
