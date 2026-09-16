"use server";

/**
 * Server actions para gestión de cupones en el admin.
 * CRUD completo: listar, crear, editar, eliminar.
 */

import { revalidatePath } from "next/cache";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { coupons } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth";
import { checkAdminRateLimit } from "@/lib/utils/admin-rate-limit";
import { sanitizeString, sanitizeNumber } from "@/lib/utils/sanitize";

export interface CouponData {
  code: string;
  kind: "fixed" | "percent";
  value: number;
  minSubtotal: number;
  maxUses: number;
  timesUsed: number;
  expiresAt: string | null;
  userId: string | null;
  createdAt: string;
}

interface CouponRow {
  code: string;
  kind: string;
  value: number;
  min_subtotal: number;
  max_uses: number;
  times_used: number;
  expires_at: string | null;
  user_id: string | null;
  created_at: string;
}

function rowToCoupon(row: {
  code: string; kind: string; value: string | number;
  min_subtotal: string | number; max_uses: number; times_used: number;
  expires_at: Date | string | null; user_id: string | null; created_at: Date | string;
}): CouponData {
  const iso = (v: Date | string | null) => (v == null ? null : new Date(v).toISOString());
  return {
    code: row.code,
    kind: row.kind as "fixed" | "percent",
    value: Number(row.value),
    minSubtotal: Number(row.min_subtotal),
    maxUses: row.max_uses,
    timesUsed: row.times_used,
    expiresAt: iso(row.expires_at),
    userId: row.user_id,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

/** Listar todos los cupones */
export async function getCoupons(): Promise<CouponData[]> {
  await requireAdmin();
  checkAdminRateLimit("coupons-list", 30, 60_000);

  try {
    const rows = await db.select().from(coupons).orderBy(desc(coupons.created_at));
    return rows.map(rowToCoupon);
  } catch (e) {
    console.error("Error fetching coupons:", e instanceof Error ? e.message : e);
    return [];
  }
}

/** Crear un cupón */
export async function createCoupon(input: {
  code: string;
  kind: "fixed" | "percent";
  value: number;
  minSubtotal?: number;
  maxUses?: number;
  expiresAt?: string | null;
  userId?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  checkAdminRateLimit("coupons-create", 5, 60_000);

  const code = sanitizeString(input.code).toUpperCase().trim();
  if (!code || code.length < 3) {
    return { ok: false, error: "El código debe tener al menos 3 caracteres" };
  }

  const value = sanitizeNumber(input.value, 0, 999999) ?? 0;
  if (value <= 0) return { ok: false, error: "El valor debe ser mayor a 0" };
  if (input.kind === "percent" && value > 100) {
    return { ok: false, error: "El porcentaje no puede superar 100" };
  }

  try {
    await db.insert(coupons).values({
      code,
      kind: input.kind,
      value: String(value),
      min_subtotal: String(sanitizeNumber(input.minSubtotal ?? 0, 0, 999999) ?? 0),
      max_uses: sanitizeNumber(input.maxUses ?? 1, 1, 99999) ?? 1,
      expires_at: input.expiresAt ? new Date(input.expiresAt) : null,
      user_id: input.userId || null,
    });
  } catch (e: any) {
    if (e?.code === "23505") {
      return { ok: false, error: "Ya existe un cupón con ese código" };
    }
    return { ok: false, error: e instanceof Error ? e.message : "Error al crear" };
  }

  revalidatePath("/admin/cupones");
  return { ok: true };
}

/** Editar un cupón */
export async function updateCoupon(
  originalCode: string,
  input: {
    kind: "fixed" | "percent";
    value: number;
    minSubtotal?: number;
    maxUses?: number;
    expiresAt?: string | null;
    userId?: string | null;
  },
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  checkAdminRateLimit("coupons-update", 10, 60_000);

  const value = sanitizeNumber(input.value, 0, 999999) ?? 0;
  if (value <= 0) return { ok: false, error: "El valor debe ser mayor a 0" };
  if (input.kind === "percent" && value > 100) {
    return { ok: false, error: "El porcentaje no puede superar 100" };
  }

  try {
    await db
      .update(coupons)
      .set({
        kind: input.kind,
        value: String(value),
        min_subtotal: String(sanitizeNumber(input.minSubtotal ?? 0, 0, 999999) ?? 0),
        max_uses: sanitizeNumber(input.maxUses ?? 1, 1, 99999) ?? 1,
        expires_at: input.expiresAt ? new Date(input.expiresAt) : null,
        user_id: input.userId || null,
      })
      .where(eq(coupons.code, originalCode));
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al actualizar" };
  }

  revalidatePath("/admin/cupones");
  return { ok: true };
}

/** Eliminar un cupón */
export async function deleteCoupon(
  code: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  checkAdminRateLimit("coupons-delete", 5, 60_000);

  try {
    await db.delete(coupons).where(eq(coupons.code, code));
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al eliminar" };
  }

  revalidatePath("/admin/cupones");
  return { ok: true };
}
