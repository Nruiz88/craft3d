import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Sesión de cliente firmada (HMAC SHA-256) en cookie httpOnly.
 * Formato del token: base64url(userId).exp.firma
 * - No requiere tabla de sesiones (stateless) y expira solo.
 * - JWT_SECRET firma el token; si cambia, todas las sesiones se invalidan.
 */

const COOKIE = "craft3d-session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 días

function secret(): string {
  // Sin secret configurado no se firman ni se verifican sesiones (fail-closed).
  // Nunca usar un fallback conocido: permitiría falsificar cookies.
  const s = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("JWT_SECRET o NEXTAUTH_SECRET no configurado");
  return s;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(userId: string): string {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = `${b64url(userId)}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): string | null {
  if (!token) return null;
  try {
    return verifySessionTokenInner(token);
  } catch {
    // Secret ausente u otro error de config: sesión inválida.
    return null;
  }
}

function verifySessionTokenInner(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [idB64, expRaw, sig] = parts;
  const expected = sign(`${idB64}.${expRaw}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const exp = Number(expRaw);
  if (!Number.isInteger(exp) || exp * 1000 < Date.now()) return null;
  try {
    return Buffer.from(idB64, "base64url").toString("utf8");
  } catch {
    return null;
  }
}

export async function setSessionCookie(userId: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, createSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getSessionUserId(): Promise<string | null> {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE)?.value);
}

export function newUserId(): string {
  return randomUUID();
}

export const SESSION_COOKIE_NAME = COOKIE;
