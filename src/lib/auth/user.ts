import "server-only";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { authOptions } from "@/auth";
import { db } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  province: string | null;
}

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  provider: string;
  createdAt: string;
  lastSignInAt: string | null;
  emailConfirmed: boolean;
  profile: Profile | null;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, session.user.id))
    .limit(1);
  if (!profile) return null;

  return {
    id: profile.id,
    email: profile.email ?? session.user.email ?? "",
    fullName: profile.full_name || session.user.name || "",
    provider: "email",
    createdAt: profile.created_at ? new Date(profile.created_at).toISOString() : new Date().toISOString(),
    lastSignInAt: null,
    emailConfirmed: true,
    profile: {
      id: profile.id,
      full_name: profile.full_name,
      phone: profile.phone,
      address: profile.address,
      postal_code: profile.postal_code,
      city: profile.city,
      province: profile.province,
    },
  };
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/ingresar");
  return user;
}

export async function getCurrentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

export async function getCurrentUserRole(): Promise<string | undefined> {
  const session = await getServerSession(authOptions);
  return session?.user?.role;
}
