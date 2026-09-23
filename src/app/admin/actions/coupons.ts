"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { coupons } from "@/lib/db/schema";
import { isAdmin } from "@/lib/auth";

export interface CouponData {
  code: string;
  kind: "fixed" | "percent";
  value: number;
  minSubtotal: number;
  maxUses: number;
  timesUsed: number;
  expiresAt: string | null;
}

export async function getCoupons(): Promise<CouponData[]> {
  if (!(await isAdmin())) return [];
  const rows = await db.select().from(coupons).orderBy(desc(coupons.created_at));
  return rows.map((row) => ({
    code: row.code,
    kind: row.kind === "percent" ? "percent" : "fixed",
    value: Number(row.value),
    minSubtotal: Number(row.min_subtotal),
    maxUses: row.max_uses,
    timesUsed: row.times_used,
    expiresAt: row.expires_at ? (row.expires_at instanceof Date ? row.expires_at : new Date(row.expires_at)).toISOString() : null,
  }));
}

export async function createCoupon(data: {
  code: string;
  kind: "fixed" | "percent";
  value: number;
  minSubtotal?: number;
  maxUses?: number;
  expiresAt?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdmin())) return { ok: false, error: "No autorizado" };
  const code = String(data.code ?? "").trim().toUpperCase();
  if (!code) return { ok: false, error: "Falta el código" };
  if (!(Number(data.value) > 0)) return { ok: false, error: "Valor inválido" };
  try {
    await db.insert(coupons).values({
      code,
      kind: data.kind === "percent" ? "percent" : "fixed",
      value: String(data.value),
      min_subtotal: String(Math.max(0, data.minSubtotal ?? 0)),
      max_uses: Math.max(1, Math.round(data.maxUses ?? 1)),
      expires_at: data.expiresAt ? new Date(`${data.expiresAt}T23:59:59`) : null,
    }).execute();
    revalidatePath("/admin/cupones");
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo crear el cupón (¿código duplicado?)" };
  }
}

export async function updateCoupon(
  code: string,
  data: { kind?: "fixed" | "percent"; value?: number; minSubtotal?: number; maxUses?: number; expiresAt?: string | null },
): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdmin())) return { ok: false, error: "No autorizado" };
  try {
    await db.update(coupons).set({
      ...(data.kind ? { kind: data.kind } : {}),
      ...(data.value != null ? { value: String(data.value) } : {}),
      ...(data.minSubtotal != null ? { min_subtotal: String(data.minSubtotal) } : {}),
      ...(data.maxUses != null ? { max_uses: Math.max(1, Math.round(data.maxUses)) } : {}),
      ...(data.expiresAt !== undefined ? { expires_at: data.expiresAt ? new Date(`${data.expiresAt}T23:59:59`) : null } : {}),
    }).where(eq(coupons.code, code)).execute();
    revalidatePath("/admin/cupones");
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo actualizar el cupón" };
  }
}

export async function deleteCoupon(code: string): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdmin())) return { ok: false, error: "No autorizado" };
  try {
    await db.delete(coupons).where(eq(coupons.code, code)).execute();
    revalidatePath("/admin/cupones");
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo eliminar el cupón" };
  }
}
