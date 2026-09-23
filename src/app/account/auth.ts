"use server";

import bcrypt from "bcryptjs";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import {
  coin_redemptions,
  coupons,
  orders,
  player_profiles,
  profiles,
} from "@/lib/db/schema";
import { COIN_RATE, MIN_COINS_TO_REDEEM } from "@/lib/orders/coupons";
import {
  clearSessionCookie,
  newUserId,
  setSessionCookie,
} from "@/lib/auth/session";
import { getCurrentUser } from "@/lib/auth/user";
import { checkRateLimit } from "@/lib/utils/rate-limit";

export type AuthFormState = { error?: string; message?: string } | undefined;
export type CouponCheckState = {
  error?: string;
  discount?: number;
  code?: string;
} | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ─────────────────────────── Registro ─────────────────────────── */

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const rl = checkRateLimit("register", 5, 15 * 60 * 1000);
  if (!rl.allowed) {
    return { error: `Demasiados intentos. Esperá ${Math.ceil(rl.resetMs / 60000)} min.` };
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const phone = String(formData.get("phone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const postalCode = String(formData.get("postalCode") ?? "").trim();
  const province = String(formData.get("province") ?? "").trim();

  if (!fullName) return { error: "Ingresá tu nombre" };
  if (!EMAIL_RE.test(email)) return { error: "Email inválido" };
  if (password.length < 6) return { error: "La contraseña debe tener al menos 6 caracteres" };
  if (password !== confirm) return { error: "Las contraseñas no coinciden" };

  try {
    const existing = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.email, email))
      .limit(1);
    if (existing.length > 0) {
      return { error: "Ya existe una cuenta con ese email. Ingresá con tu contraseña." };
    }

    const id = newUserId();
    const passwordHash = await bcrypt.hash(password, 10);
    await db.insert(profiles).values({
      id,
      email,
      password_hash: passwordHash,
      role: "customer",
      full_name: fullName,
      phone,
      city,
      address,
      postal_code: postalCode,
      province,
    });
    await setSessionCookie(id);
  } catch (error) {
    console.error("[register]", error);
    return { error: "No se pudo crear la cuenta. Probá de nuevo en un rato." };
  }

  return { message: `¡Bienvenido/a, ${fullName}! Tu cuenta fue creada y ya iniciaste sesión.` };
}

/* ──────────────────────────── Login ──────────────────────────── */

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const rl = checkRateLimit("login", 8, 15 * 60 * 1000);
  if (!rl.allowed) {
    return { error: `Demasiados intentos. Esperá ${Math.ceil(rl.resetMs / 60000)} min.` };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "").trim();
  if (!email || !password) return { error: "Completá email y contraseña" };

  try {
    const rows = await db
      .select({ id: profiles.id, password_hash: profiles.password_hash })
      .from(profiles)
      .where(eq(profiles.email, email))
      .limit(1);
    const row = rows[0];

    // bcrypt.compare siempre corre (aunque no exista el usuario) para no
    // filtrar por tiempo qué emails están registrados.
    const hash = row?.password_hash ?? "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin";
    const ok = await bcrypt.compare(password, hash);
    if (!row || !ok) {
      return { error: "Email o contraseña incorrectos" };
    }

    await setSessionCookie(row.id);
    const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/cuenta";
    redirect(safeNext);
  } catch (error) {
    // redirect() lanza una excepción especial: dejarla pasar.
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("[login]", error);
    return { error: "No se pudo iniciar sesión. Probá de nuevo en un rato." };
  }
}

/* ──────────────────── Perfil / logout / google ──────────────────── */

export async function updateProfileAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Ingresá para editar tu perfil" };

  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const postalCode = String(formData.get("postalCode") ?? "").trim();
  const province = String(formData.get("province") ?? "").trim();

  if (!fullName) return { error: "El nombre no puede quedar vacío" };

  try {
    await db
      .update(profiles)
      .set({ full_name: fullName, phone, city, address, postal_code: postalCode, province })
      .where(eq(profiles.id, user.id));
  } catch {
    return { error: "No se pudo guardar el perfil" };
  }

  revalidatePath("/cuenta");
  return { message: "Perfil actualizado" };
}

export async function logoutUserAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/");
}

// Google OAuth queda pendiente post-migración; el botón muestra el aviso.
export async function googleLoginAction(): Promise<{ error: string }> {
  return { error: "google" };
}

/* ─────────────────── Cupones (canje de monedas) ─────────────────── */

function randomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return `CRAFT-${out}`;
}

export async function redeemCoinsAction(
  coinsToRedeem: number,
): Promise<{ code?: string; amount?: number; error?: string } | undefined> {
  const user = await getCurrentUser();
  if (!user) return { error: "Ingresá a tu cuenta para canjear monedas" };

  const validOptions = [100, 250, 500, 1000];
  if (!validOptions.includes(coinsToRedeem)) {
    return { error: "Opción de canje inválida" };
  }
  const amount = coinsToRedeem * COIN_RATE;

  try {
    const rows = await db
      .select({ coins: player_profiles.coins })
      .from(player_profiles)
      .where(eq(player_profiles.user_id, user.id))
      .limit(1);
    const balance = rows[0]?.coins ?? 0;
    if (balance < MIN_COINS_TO_REDEEM) {
      return { error: `Necesitás al menos ${MIN_COINS_TO_REDEEM} monedas para canjear` };
    }
    if (balance < coinsToRedeem) {
      return { error: `No tenés suficientes monedas (tenés ${balance})` };
    }

    const code = randomCode();
    const expires = new Date(Date.now() + 90 * 86_400_000);
    await db.transaction(async (tx) => {
      const updated = await tx
        .update(player_profiles)
        .set({ coins: sql`${player_profiles.coins} - ${coinsToRedeem}` })
        .where(and(eq(player_profiles.user_id, user.id), sql`${player_profiles.coins} >= ${coinsToRedeem}`));
      if (!updated || (updated as unknown as { rowsAffected?: number }).rowsAffected === 0) {
        throw new Error("Sin saldo suficiente");
      }
      await tx.insert(coupons).values({
        code,
        kind: "fixed",
        value: String(amount),
        min_subtotal: "0",
        max_uses: 1,
        user_id: user.id,
        expires_at: expires,
      });
      await tx.insert(coin_redemptions).values({
        user_id: user.id,
        coins: coinsToRedeem,
        amount: String(amount),
        coupon_code: code,
        status: "activo",
        expires_at: expires,
      });
    });

    revalidatePath("/cuenta");
    return { code, amount };
  } catch (error) {
    if (error instanceof Error && error.message === "Sin saldo suficiente") {
      return { error: "No tenés suficientes monedas" };
    }
    console.error("[redeemCoins]", error);
    return { error: "No se pudo generar el cupón. Probá de nuevo." };
  }
}

/* ──────────────── Validación de cupón (carrito) ──────────────── */

export async function validateCouponAction(
  code: string,
  subtotal: number,
): Promise<CouponCheckState> {
  const clean = String(code ?? "").trim().toUpperCase();
  if (!clean) return { error: "Ingresá un código" };

  try {
    const rows = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, clean))
      .limit(1);
    const coupon = rows[0];
    if (!coupon) return { error: "El cupón no existe" };
    if (coupon.times_used >= coupon.max_uses) return { error: "El cupón ya fue usado" };
    if (coupon.expires_at && coupon.expires_at.getTime() < Date.now()) {
      return { error: "El cupón está vencido" };
    }
    if (subtotal < Number(coupon.min_subtotal)) {
      return {
        error: `Este cupón requiere una compra mínima de $${Number(coupon.min_subtotal).toLocaleString("es-AR")}`,
      };
    }
    let discount = Number(coupon.value);
    if (coupon.kind === "percent") {
      discount = Math.round((subtotal * discount) / 100);
    }
    discount = Math.min(discount, Math.max(0, subtotal - 1));
    if (discount <= 0) return { error: "El cupón no aplica a este carrito" };
    return { discount, code: coupon.code };
  } catch {
    return { error: "No se pudo validar el cupón. Probá de nuevo." };
  }
}

/* ──────────────── Abrir caja sorpresa con monedas ──────────────── */
export async function openBoxEarlyAction(
  formData: FormData,
): Promise<{ error?: string } | undefined> {
  const user = await getCurrentUser();
  if (!user) return { error: "Ingresá a tu cuenta" };

  const EARLY_OPEN_COST = 100;
  const orderId = Number(formData.get("orderId"));
  const itemIndex = Number(formData.get("itemIndex"));
  if (!Number.isInteger(orderId) || orderId <= 0 || !Number.isInteger(itemIndex) || itemIndex < 0) {
    return { error: "Pedido inválido" };
  }

  try {
    const rows = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    const order = rows[0];
    if (!order || order.user_id !== user.id) return { error: "Pedido no encontrado" };

    const items = Array.isArray(order.items) ? [...order.items] : [];
    const item = items[itemIndex];
    if (!item) return { error: "Ítem no encontrado" };
    if (item.priority) return { error: "La caja ya tiene prioridad" };

    await db.transaction(async (tx) => {
      const updated = await tx
        .update(player_profiles)
        .set({ coins: sql`${player_profiles.coins} - ${EARLY_OPEN_COST}` })
        .where(
          and(
            eq(player_profiles.user_id, user.id),
            sql`${player_profiles.coins} >= ${EARLY_OPEN_COST}`,
          ),
        );
      const affected = (updated as unknown as { rowsAffected?: number }).rowsAffected ?? 0;
      if (affected === 0) throw new Error("Sin saldo suficiente");

      items[itemIndex] = { ...item, priority: true };
      await tx.update(orders).set({ items }).where(eq(orders.id, orderId));
    });

    revalidatePath("/cuenta/pedidos");
    return {};
  } catch (error) {
    if (error instanceof Error && error.message === "Sin saldo suficiente") {
      return { error: "No tenés monedas suficientes" };
    }
    console.error("[openBoxEarly]", error);
    return { error: "No se pudo asignar prioridad. Probá de nuevo." };
  }
}
