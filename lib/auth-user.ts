import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase-server";

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
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, phone, address, postal_code, city, province")
    .eq("id", user.id)
    .maybeSingle();

  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    email: user.email ?? "",
    fullName:
      (meta.full_name as string | undefined) ??
      (meta.name as string | undefined) ??
      "",
    provider: (user.app_metadata?.provider as string | undefined) ?? "email",
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at ?? null,
    emailConfirmed: Boolean(user.email_confirmed_at),
    profile: profile
      ? {
          id: profile.id,
          full_name: profile.full_name,
          phone: profile.phone,
          address: profile.address,
          postal_code: profile.postal_code,
          city: profile.city,
          province: profile.province,
        }
      : null,
  };
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/ingresar");
  return user;
}
