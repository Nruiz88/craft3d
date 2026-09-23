"use server";

import { randomUUID } from "node:crypto";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { saved_addresses } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/user";

export interface SavedAddress {
  id: string;
  label: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
  createdAt: string;
}

interface AddressInput {
  label: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
}

function toAddress(row: typeof saved_addresses.$inferSelect): SavedAddress {
  return {
    id: row.id,
    label: row.label,
    name: row.name,
    phone: row.phone,
    address: row.address,
    city: row.city,
    province: row.province,
    postalCode: row.postal_code,
    isDefault: Boolean(row.is_default),
    createdAt: (row.created_at instanceof Date ? row.created_at : new Date(row.created_at)).toISOString(),
  };
}

export async function getAddresses(): Promise<SavedAddress[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  try {
    const rows = await db
      .select()
      .from(saved_addresses)
      .where(eq(saved_addresses.user_id, user.id))
      .orderBy(asc(saved_addresses.created_at));
    return rows.map(toAddress);
  } catch {
    return [];
  }
}

async function requireUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id ?? null;
}

export async function createAddress(input: AddressInput): Promise<{ ok: boolean; error?: string }> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "Ingresá a tu cuenta" };
  if (!input.name || !input.address) return { ok: false, error: "Faltan datos" };
  try {
    const existing = await getAddresses();
    await db.insert(saved_addresses).values({
      id: randomUUID(),
      user_id: userId,
      label: input.label || "Mi dirección",
      name: input.name,
      phone: input.phone,
      address: input.address,
      city: input.city,
      province: input.province,
      postal_code: input.postalCode,
      is_default: existing.length === 0,
    }).execute();
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo guardar la dirección" };
  }
}

export async function updateAddress(id: string, input: AddressInput): Promise<{ ok: boolean; error?: string }> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "Ingresá a tu cuenta" };
  try {
    await db
      .update(saved_addresses)
      .set({
        label: input.label || "Mi dirección",
        name: input.name,
        phone: input.phone,
        address: input.address,
        city: input.city,
        province: input.province,
        postal_code: input.postalCode,
      })
      .where(and(eq(saved_addresses.id, id), eq(saved_addresses.user_id, userId)))
      .execute();
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo actualizar" };
  }
}

export async function deleteAddress(id: string): Promise<{ ok: boolean }> {
  const userId = await requireUserId();
  if (!userId) return { ok: false };
  await db
    .delete(saved_addresses)
    .where(and(eq(saved_addresses.id, id), eq(saved_addresses.user_id, userId)))
    .execute();
  return { ok: true };
}

export async function setDefaultAddress(id: string): Promise<{ ok: boolean }> {
  const userId = await requireUserId();
  if (!userId) return { ok: false };
  await db.update(saved_addresses).set({ is_default: false }).where(eq(saved_addresses.user_id, userId)).execute();
  await db
    .update(saved_addresses)
    .set({ is_default: true })
    .where(and(eq(saved_addresses.id, id), eq(saved_addresses.user_id, userId)))
    .execute();
  return { ok: true };
}

/** Migra direcciones guardadas en localStorage (versión vieja) a la DB. */
export async function migrateGuestAddresses(
  legacy: { label?: string; name: string; phone: string; address: string; city: string; province: string; postalCode?: string }[],
): Promise<{ ok: boolean }> {
  const userId = await requireUserId();
  if (!userId || !Array.isArray(legacy)) return { ok: false };
  for (const item of legacy.slice(0, 10)) {
    if (!item?.name || !item?.address) continue;
    await createAddress({
      label: item.label || "Mi dirección",
      name: item.name,
      phone: item.phone ?? "",
      address: item.address,
      city: item.city ?? "",
      province: item.province ?? "",
      postalCode: item.postalCode ?? "",
    });
  }
  return { ok: true };
}
