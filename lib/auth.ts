import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE = "craft3d-admin";

function hashOf(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function expectedHash(): string {
  return hashOf(process.env.ADMIN_PASSWORD ?? "");
}

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  const a = Buffer.from(token, "utf-8");
  const b = Buffer.from(expectedHash(), "utf-8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }
}

export async function login(password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !password || password !== expected) return false;
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, hashOf(expected), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return true;
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
