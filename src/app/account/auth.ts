"use server";

import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { db } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { applyCouponAmount } from "@/lib/db/transactions";
import { getCurrentUserId } from "@/lib/auth/user";
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
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const postalCode = String(formData.get("postalCode") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const province = String(formData.get("province") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const next = safeNext(String(formData.get("next") ?? "/cuenta"));

  if (!fullName) return { error: "Ingresá tu nombre" };
  if (!EMAIL_RE.test(email)) return { error: "Ingresá un email válido" };
  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres" };
  }
  if (password !== confirm) return { error: "Las contraseñas no coinciden" };

  const existing = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.email, email))
    .limit(1);
  if (existing.length > 0) {
    return { error: "Ya existe una cuenta con ese email. Ingresá." };
  }

  const password_hash = await bcrypt.hash(password, 12);
  await db.insert(profiles).values({
    id: randomUUID(),
    email,
    password_hash,
    role: "customer",
    full_name: fullName,
    phone,
    address,
    postal_code: postalCode,
    city,
    province,
  });

  revalidatePath("/", "layout");
  redirect(`/ingresar?next=${encodeURIComponent(next)}&registrado=1`);
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  // El login real lo hace el cliente con next-auth (signIn credentials).
  // Esta action queda como fallback que redirige al formulario.
  const next = safeNext(String(formData.get("next") ?? "/cuenta"));
  redirect(`/ingresar?next=${encodeURIComponent(next)}`);
}

export async function updateProfileAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "No autorizado" };

  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const postalCode = String(formData.get("postalCode") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const province = String(formData.get("province") ?? "").trim();

  if (!fullName) return { error: "El nombre es obligatorio" };

  await db
    .update(profiles)
    .set({
      full_name: fullName,
      phone,
      address,
      postal_code: postalCode,
      city,
      province,
    })
    .where(eq(profiles.id, userId));

  revalidatePath("/cuenta");
  return { message: "Datos actualizados" };
}

export async function googleLoginAction(): Promise<void> {
  // El botón de Google llama a signIn("google") del lado cliente.
  // Esta action existe por compatibilidad y redirige al login.
  redirect("/ingresar");
}

export async function validateCouponAction(
  code: string,
  subtotal: number,
): Promise<CouponCheckState> {
  const rl = checkRateLimit("coupon", 10, 5 * 60 * 1000);
  if (!rl.allowed) return { error: "Demasiados intentos. Esperá unos minutos." };

  const userId = await getCurrentUserId();
  if (!userId) return { error: "Ingresá a tu cuenta para usar cupones" };

  const normalized = code.trim().toUpperCase();
  if (!normalized) return { error: "Ingresá un código de descuento" };
  if (!Number.isFinite(subtotal) || subtotal <= 0) {
    return { error: "Tu carrito está vacío" };
  }

  try {
    const { discount } = await applyCouponAmount(db, normalized, userId, subtotal);
    if (!Number.isFinite(discount) || discount <= 0) {
      return { error: "El código no aplica a este pedido" };
    }
    return { discount, code: normalized };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Cupón inválido" };
  }
}

export async function logoutUserAction(): Promise<void> {
  redirect("/api/auth/signout?callbackUrl=/");
}
