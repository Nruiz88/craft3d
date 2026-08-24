"use server";

/**
 * Server actions para el carrito del usuario.
 * CRUD completo: listar, agregar, actualizar cantidad, eliminar, limpiar.
 * También soporta sync desde localStorage (para migrar items de guest a logged-in).
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface CartItemData {
  slug: string;
  quantity: number;
}

/** Obtener todos los items del carrito del usuario */
export async function getCartItems(): Promise<CartItemData[]> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("cart_items")
    .select("product_slug, quantity")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching cart:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    slug: row.product_slug,
    quantity: row.quantity,
  }));
}

/** Agregar un item al carrito (o incrementar cantidad si ya existe) */
export async function addCartItem(
  slug: string,
  quantity: number = 1,
): Promise<{ ok: boolean; items?: CartItemData[]; error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión" };

  // Upsert: si ya existe, incrementar cantidad
  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", user.id)
    .eq("product_slug", slug)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + quantity })
      .eq("id", existing.id);

    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from("cart_items").insert({
      user_id: user.id,
      product_slug: slug,
      quantity,
    });

    if (error) return { ok: false, error: error.message };
  }

  const items = await getCartItems();
  return { ok: true, items };
}

/** Actualizar la cantidad de un item */
export async function updateCartItemQuantity(
  slug: string,
  quantity: number,
): Promise<{ ok: boolean; items?: CartItemData[]; error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión" };

  if (quantity <= 0) {
    return removeCartItem(slug);
  }

  const { error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("user_id", user.id)
    .eq("product_slug", slug);

  if (error) return { ok: false, error: error.message };

  const items = await getCartItems();
  return { ok: true, items };
}

/** Eliminar un item del carrito */
export async function removeCartItem(
  slug: string,
): Promise<{ ok: boolean; items?: CartItemData[]; error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión" };

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", user.id)
    .eq("product_slug", slug);

  if (error) return { ok: false, error: error.message };

  const items = await getCartItems();
  return { ok: true, items };
}

/** Limpiar todo el carrito */
export async function clearCartItems(): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión" };

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };

  return { ok: true };
}

/**
 * Sync: merge items de localStorage (guest) → Supabase (logged-in).
 * Retorna el carrito fusionado para que el client lo use.
 */
export async function syncGuestCart(
  guestItems: CartItemData[],
): Promise<{ ok: boolean; items?: CartItemData[]; error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión" };

  if (guestItems.length === 0) {
    const items = await getCartItems();
    return { ok: true, items };
  }

  // Obtener items existentes en Supabase
  const { data: existingRows } = await supabase
    .from("cart_items")
    .select("product_slug, quantity")
    .eq("user_id", user.id);

  const existingMap = new Map<string, number>();
  (existingRows ?? []).forEach((row) =>
    existingMap.set(row.product_slug, row.quantity),
  );

  // Merge: si un slug existe en ambos, sumar cantidades
  for (const guestItem of guestItems) {
    const existingQty = existingMap.get(guestItem.slug);
    if (existingQty !== undefined) {
      // Actualizar cantidad (sumar)
      await supabase
        .from("cart_items")
        .update({ quantity: existingQty + guestItem.quantity })
        .eq("user_id", user.id)
        .eq("product_slug", guestItem.slug);
      existingMap.set(
        guestItem.slug,
        existingQty + guestItem.quantity,
      );
    } else {
      // Insertar nuevo item
      await supabase.from("cart_items").insert({
        user_id: user.id,
        product_slug: guestItem.slug,
        quantity: guestItem.quantity,
      });
      existingMap.set(guestItem.slug, guestItem.quantity);
    }
  }

  const items = await getCartItems();
  return { ok: true, items };
}
