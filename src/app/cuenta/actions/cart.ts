"use server";

/**
 * Server actions para el carrito del usuario.
 * CRUD completo: listar, agregar, actualizar cantidad, eliminar, limpiar.
 * También soporta sync desde localStorage (para migrar items de guest a logged-in).
 */

import { getServerSession } from "next-auth";
import { and, asc, eq } from "drizzle-orm";
import { authOptions } from "@/auth";
import { db } from "@/lib/db/client";
import { cart_items } from "@/lib/db/schema";

export interface CartItemData {
  slug: string;
  quantity: number;
}

async function currentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

/** Obtener todos los items del carrito del usuario */
export async function getCartItems(): Promise<CartItemData[]> {
  const userId = await currentUserId();
  if (!userId) return [];

  try {
    const rows = await db
      .select({
        product_slug: cart_items.product_slug,
        quantity: cart_items.quantity,
      })
      .from(cart_items)
      .where(eq(cart_items.user_id, userId))
      .orderBy(asc(cart_items.created_at));

    return rows.map((row) => ({
      slug: row.product_slug,
      quantity: row.quantity,
    }));
  } catch (error) {
    console.error("Error fetching cart:", error instanceof Error ? error.message : error);
    return [];
  }
}

/** Agregar un item al carrito (o incrementar cantidad si ya existe) */
export async function addCartItem(
  slug: string,
  quantity: number = 1,
): Promise<{ ok: boolean; items?: CartItemData[]; error?: string }> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Debes iniciar sesión" };

  try {
    // Upsert: si ya existe, incrementar cantidad
    const [existing] = await db
      .select({ id: cart_items.id, quantity: cart_items.quantity })
      .from(cart_items)
      .where(
        and(
          eq(cart_items.user_id, userId),
          eq(cart_items.product_slug, slug),
        ),
      )
      .limit(1);

    if (existing) {
      await db
        .update(cart_items)
        .set({
          quantity: existing.quantity + quantity,
          updated_at: new Date(),
        })
        .where(eq(cart_items.id, existing.id));
    } else {
      await db.insert(cart_items).values({
        user_id: userId,
        product_slug: slug,
        quantity,
      });
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "No se pudo agregar",
    };
  }

  const items = await getCartItems();
  return { ok: true, items };
}

/** Actualizar la cantidad de un item */
export async function updateCartItemQuantity(
  slug: string,
  quantity: number,
): Promise<{ ok: boolean; items?: CartItemData[]; error?: string }> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Debes iniciar sesión" };

  if (quantity <= 0) {
    return removeCartItem(slug);
  }

  try {
    await db
      .update(cart_items)
      .set({ quantity, updated_at: new Date() })
      .where(
        and(
          eq(cart_items.user_id, userId),
          eq(cart_items.product_slug, slug),
        ),
      );
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "No se pudo actualizar",
    };
  }

  const items = await getCartItems();
  return { ok: true, items };
}

/** Eliminar un item del carrito */
export async function removeCartItem(
  slug: string,
): Promise<{ ok: boolean; items?: CartItemData[]; error?: string }> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Debes iniciar sesión" };

  try {
    await db
      .delete(cart_items)
      .where(
        and(
          eq(cart_items.user_id, userId),
          eq(cart_items.product_slug, slug),
        ),
      );
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "No se pudo eliminar",
    };
  }

  const items = await getCartItems();
  return { ok: true, items };
}

/** Limpiar todo el carrito */
export async function clearCartItems(): Promise<{ ok: boolean; error?: string }> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Debes iniciar sesión" };

  try {
    await db.delete(cart_items).where(eq(cart_items.user_id, userId));
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "No se pudo limpiar",
    };
  }

  return { ok: true };
}

/**
 * Sync: merge items de localStorage (guest) → DB (logged-in).
 * Retorna el carrito fusionado para que el client lo use.
 */
export async function syncGuestCart(
  guestItems: CartItemData[],
): Promise<{ ok: boolean; items?: CartItemData[]; error?: string }> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Debes iniciar sesión" };

  if (guestItems.length === 0) {
    const items = await getCartItems();
    return { ok: true, items };
  }

  try {
    // Obtener items existentes en la DB
    const existingRows = await db
      .select({
        product_slug: cart_items.product_slug,
        quantity: cart_items.quantity,
      })
      .from(cart_items)
      .where(eq(cart_items.user_id, userId));

    const existingMap = new Map<string, number>();
    existingRows.forEach((row) =>
      existingMap.set(row.product_slug, row.quantity),
    );

    // Merge: si un slug existe en ambos, sumar cantidades
    for (const guestItem of guestItems) {
      const existingQty = existingMap.get(guestItem.slug);
      if (existingQty !== undefined) {
        // Actualizar cantidad (sumar)
        await db
          .update(cart_items)
          .set({
            quantity: existingQty + guestItem.quantity,
            updated_at: new Date(),
          })
          .where(
            and(
              eq(cart_items.user_id, userId),
              eq(cart_items.product_slug, guestItem.slug),
            ),
          );
        existingMap.set(
          guestItem.slug,
          existingQty + guestItem.quantity,
        );
      } else {
        // Insertar nuevo item
        await db.insert(cart_items).values({
          user_id: userId,
          product_slug: guestItem.slug,
          quantity: guestItem.quantity,
        });
        existingMap.set(guestItem.slug, guestItem.quantity);
      }
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "No se pudo sincronizar",
    };
  }

  const items = await getCartItems();
  return { ok: true, items };
}
