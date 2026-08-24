"use server";

import { checkRateLimit } from "@/lib/utils/rate-limit";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrigin, safeNext } from "./helpers";

export type AuthFormState = { error?: string; message?: string } | undefined;
export type CouponCheckState =
  | { discount?: number; code?: string; error?: string }
  | undefined;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const supabase = await createSupabaseServerClient();

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const postalCode = String(formData.get("postalCode") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const province = String(formData.get("province") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!fullName) return { error: "Ingresá tu nombre" };
  if (!EMAIL_RE.test(email)) return { error: "Ingresá un email válido" };
  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres" };
  }
  if (password !== confirm) return { error: "Las contraseñas no coinciden" };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
        address,
        postal_code: postalCode,
        city,
        province,
      },
      emailRedirectTo: `${await getOrigin()}/auth/callback`,
    },
  });

  if (error) return { error: error.message };

  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/cuenta?bienvenido=1");
  }

  return {
    message: "Cuenta creada. Revisá tu correo para confirmarla y poder ingresar.",
  };
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const supabase = await createSupabaseServerClient();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(String(formData.get("next") ?? "/cuenta"));

  if (!email || !password) {
    return { error: "Completá tu email y contraseña" };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { error: "Email o contraseña incorrectos" };

  revalidatePath("/", "layout");
  redirect(next);
}

export async function updateProfileAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const postalCode = String(formData.get("postalCode") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const province = String(formData.get("province") ?? "").trim();

  if (!fullName) return { error: "El nombre es obligatorio" };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone,
      address,
      postal_code: postalCode,
      city,
      province,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/cuenta");
  return { message: "Datos actualizados" };
}

export async function googleLoginAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const origin = await getOrigin();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });

  if (error || !data.url) {
    redirect("/ingresar?error=google");
  }

  redirect(data.url);
}

export async function validateCouponAction(
  code: string,
  subtotal: number,
): Promise<CouponCheckState> {
  const rl = checkRateLimit("coupon", 10, 5 * 60 * 1000);
  if (!rl.allowed) return { error: "Demasiados intentos. Esperá unos minutos." };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Ingresá a tu cuenta para usar cupones" };

  const normalized = code.trim().toUpperCase();
  if (!normalized) return { error: "Ingresá un código de descuento" };
  if (!Number.isFinite(subtotal) || subtotal <= 0) {
    return { error: "Tu carrito está vacío" };
  }

  const { data, error } = await supabase.rpc("apply_coupon", {
    p_code: normalized,
    p_user_id: user.id,
    p_subtotal: subtotal,
  });

  if (error) return { error: error.message };
  const discount = Number(data ?? 0);
  if (!Number.isFinite(discount) || discount <= 0) {
    return { error: "El código no aplica a este pedido" };
  }
  return { discount, code: normalized };
}

export async function logoutUserAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
