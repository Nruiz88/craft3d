"use server";

/**
 * Server actions para gestión de cupones en el admin.
 * CRUD completo: listar, crear, editar, eliminar.
 */

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase/client";
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

function rowToCoupon(row: CouponRow): CouponData {
  return {
    code: row.code,
    kind: row.kind as "fixed" | "percent",
    value: row.value,
    minSubtotal: row.min_subtotal,
    maxUses: row.max_uses,
    timesUsed: row.times_used,
    expiresAt: row.expires_at,
    userId: row.user_id,
    createdAt: row.created_at,
  };
}

/** Listar todos los cupones */
export async function getCoupons(): Promise<CouponData[]> {
  await requireAdmin();
  checkAdminRateLimit("coupons-list", 30, 60_000);

  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching coupons:", error.message);
    return [];
  }

  return (data as CouponRow[]).map(rowToCoupon);
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

  const { error } = await supabase.from("coupons").insert({
    code,
    kind: input.kind,
    value,
    min_subtotal: sanitizeNumber(input.minSubtotal ?? 0, 0, 999999) ?? 0,
    max_uses: sanitizeNumber(input.maxUses ?? 1, 1, 99999) ?? 1,
    expires_at: input.expiresAt || null,
    user_id: input.userId || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Ya existe un cupón con ese código" };
    }
    return { ok: false, error: error.message };
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

  const { error } = await supabase
    .from("coupons")
    .update({
      kind: input.kind,
      value,
      min_subtotal: sanitizeNumber(input.minSubtotal ?? 0, 0, 999999) ?? 0,
      max_uses: sanitizeNumber(input.maxUses ?? 1, 1, 99999) ?? 1,
      expires_at: input.expiresAt || null,
      user_id: input.userId || null,
    })
    .eq("code", originalCode);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/cupones");
  return { ok: true };
}

/** Eliminar un cupón */
export async function deleteCoupon(
  code: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  checkAdminRateLimit("coupons-delete", 5, 60_000);

  const { error } = await supabase.from("coupons").delete().eq("code", code);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/cupones");
  return { ok: true };
}
