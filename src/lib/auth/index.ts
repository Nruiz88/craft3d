import "server-only";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, timingSafeEqual } from "node:crypto";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { getCurrentUser } from "./user";

const SESSION_COOKIE = "craft3d-admin";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const ROTATION_INTERVAL = 60 * 60 * 24; // 24 hours

function hashOf(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function expectedHash(): string {
  return hashOf(process.env.ADMIN_PASSWORD ?? "");
}

/**
 * Generate a session token: SHA256(password):timestamp
 * The timestamp enables automatic rotation.
 */
function generateToken(): string {
  return `${expectedHash()}:${Math.floor(Date.now() / 1000)}`;
}

/**
 * Verify a session token and optionally rotate if stale.
 * Returns true if the session is valid.
 */
async function verifyAndRotate(token: string): Promise<boolean> {
  const parts = token.split(":");
  if (parts.length !== 2) return false;

  const [tokenHash, timestampStr] = parts;
  const timestamp = Number(timestampStr);
  if (!Number.isInteger(timestamp) || timestamp <= 0) return false;

  // Verify the hash matches
  const a = Buffer.from(tokenHash, "utf-8");
  const b = Buffer.from(expectedHash(), "utf-8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  // Rotate if older than ROTATION_INTERVAL
  const age = Math.floor(Date.now() / 1000) - timestamp;
  if (age > ROTATION_INTERVAL) {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, generateToken(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
  }

  return true;
}

export async function isAdmin(): Promise<boolean> {
  // 1) Sesión de la tienda con perfil de rol admin (profiles.role = 'admin').
  try {
    const user = await getCurrentUser();
    if (user?.profile.role === "admin") return true;
  } catch {
    // DB caída: seguir con el token de panel.
  }
  // 2) Sesión de panel por contraseña (cookie firmada contra ADMIN_PASSWORD).
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  return verifyAndRotate(token);
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }
}

export async function login(password: string): Promise<{ ok: boolean; error?: string }> {
  const rateLimit = checkRateLimit("login", 5, 15 * 60 * 1000);
  if (!rateLimit.allowed) {
    return { ok: false, error: `Demasiados intentos. Esperá ${Math.ceil(rateLimit.resetMs / 60000)} min.` };
  }

  const expected = process.env.ADMIN_PASSWORD;
  let authenticated = false;
  if (expected && password && password === expected) {
    authenticated = true;
  } else if (password) {
    // Fallback: contraseña de un perfil con rol admin (bcrypt en profiles).
    try {
      const admins = await db
        .select()
        .from(profiles)
        .where(eq(profiles.role, "admin"));
      for (const admin of admins) {
        if (
          admin.password_hash &&
          (await compare(password, admin.password_hash))
        ) {
          authenticated = true;
          break;
        }
      }
    } catch {
      // DB no disponible: solo queda la vía ADMIN_PASSWORD.
    }
  }
  if (!authenticated) {
    return { ok: false, error: "Contraseña incorrecta" };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, generateToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return { ok: true };
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
