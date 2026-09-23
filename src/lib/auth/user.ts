import "server-only";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { getSessionUserId } from "./session";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  address: string | null;
  postal_code: string | null;
  province: string | null;
  role: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  profile: Profile;
}

export async function getProfileById(id: string): Promise<Profile | null> {
  if (!id) return null;
  const rows = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    full_name: row.full_name || null,
    phone: row.phone || null,
    city: row.city || null,
    address: row.address || null,
    postal_code: row.postal_code || null,
    province: row.province || null,
    role: row.role,
  };
}

/** Usuario logueado (o null). Lee la cookie de sesión y su perfil en DB. */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const userId = await getSessionUserId();
    if (!userId) return null;
    const profile = await getProfileById(userId);
    if (!profile) return null;
    return { id: profile.id, email: profile.email ?? "", name: profile.full_name, profile };
  } catch {
    // DB no disponible: tratar como no logueado en vez de tumbar la página.
    return null;
  }
}

/** Igual que getCurrentUser pero redirige a /ingresar si no hay sesión. */
export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/ingresar"); // never: corta el render lanzando NEXT_REDIRECT
  }
  return user;
}

export async function isRole(role: string): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.profile.role === role;
}
