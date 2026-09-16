"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { cart_items } from "@/lib/db/schema";
import { getCurrentUserId } from "@/lib/auth/user";

export interface CartSyncItem {
  product_slug: string;
  quantity: number;
}

/** Devuelve el userId de la sesión NextAuth, o null si es invitado. */
export async function getMyIdAction(): Promise<string | null> {
  return getCurrentUserId();
}

/** Carrito persistido del usuario logueado. Invitado → []. */
export async function getCartAction(): Promise<CartSyncItem[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];
  const rows = await db
    .select({
      product_slug: cart_items.product_slug,
      quantity: cart_items.quantity,
    })
    .from(cart_items)
    .where(eq(cart_items.user_id, userId));
  return rows.filter((r) => r.quantity > 0);
}

/**
 * Reemplaza el carrito del usuario (delete + insert).
 * Invitado → lanza 'No autorizado' para que el cliente siga en local.
 */
export async function saveCartAction(
  items: CartSyncItem[],
): Promise<{ ok: boolean }> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("No autorizado");

  const clean = items.filter(
    (i) =>
      typeof i.product_slug === "string" &&
      i.product_slug.length > 0 &&
      Number.isInteger(i.quantity) &&
      i.quantity > 0,
  );

  await db.delete(cart_items).where(eq(cart_items.user_id, userId));
  if (clean.length > 0) {
    await db.insert(cart_items).values(
      clean.map((i) => ({
        user_id: userId,
        product_slug: i.product_slug,
        quantity: i.quantity,
      })),
    );
  }
  return { ok: true };
}
