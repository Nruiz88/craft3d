"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { REDEEM_OPTIONS } from "@/lib/coupons";
import { getOrderById, updateOrderItems } from "@/lib/orders";
import { getAllProducts } from "@/lib/store";
import { EARLY_OPEN_COST } from "@/lib/gamification";

export type RedeemState =
  | { code?: string; amount?: number; error?: string }
  | undefined;

export async function redeemCoinsAction(
  coins: number,
): Promise<RedeemState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Ingresá a tu cuenta para canjear monedas" };

  const option = REDEEM_OPTIONS.find((candidate) => candidate.coins === coins);
  if (!option) return { error: "Opción de canje inválida" };

  const { data, error } = await supabase.rpc("redeem_coins", {
    p_user_id: user.id,
    p_coins: coins,
  });

  if (error) return { error: error.message };

  revalidatePath("/cuenta");
  return {
    code: String(data?.code ?? ""),
    amount: Number(data?.amount ?? 0),
  };
}

export type OpenBoxEarlyState = { ok?: boolean; error?: string } | undefined;

export async function openBoxEarlyAction(
  formData: FormData,
): Promise<OpenBoxEarlyState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Ingresá a tu cuenta para abrir antes" };

  const orderId = Number(formData.get("orderId"));
  const itemIndex = Number(formData.get("itemIndex"));
  if (
    !Number.isInteger(orderId) ||
    orderId <= 0 ||
    !Number.isInteger(itemIndex) ||
    itemIndex < 0
  ) {
    return { error: "Pedido inválido" };
  }

  try {
    const order = await getOrderById(orderId);
    if (!order) return { error: "Pedido no encontrado" };
    if (order.user_id !== user.id) {
      return { error: "Este pedido no te pertenece" };
    }

    const item = order.items[itemIndex];
    if (!item) return { error: "Ítem no encontrado" };

    const allProducts = await getAllProducts();
    const isBox = allProducts.some(
      (p) => p.slug === item.product_slug && p.category === "mystery-box",
    );
    if (!isBox) return { error: "No es una caja sorpresa" };

    const pending = item.quantity - Number(item.revealed ?? 0);
    if (pending <= 0) return { error: "Esta caja ya fue revelada" };
    if (item.priority) return { error: "Esta caja ya está en prioridad" };

    const { data: profile } = await supabase
      .from("player_profiles")
      .select("coins")
      .eq("user_id", user.id)
      .maybeSingle();
    if (Number(profile?.coins ?? 0) < EARLY_OPEN_COST) {
      return { error: "Te faltan monedas. Comprá más piezas para ganarlas." };
    }
    const newBalance = Number(profile?.coins ?? 0) - EARLY_OPEN_COST;
    const { error: spendError, data: spent } = await supabase
      .from("player_profiles")
      .update({ coins: newBalance, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .gte("coins", EARLY_OPEN_COST)
      .select("coins")
      .maybeSingle();
    if (spendError || !spent) {
      return { error: "No se pudieron descontar las monedas. Probá de nuevo." };
    }

    const items = order.items.map((orderItem, index) =>
      index === itemIndex ? { ...orderItem, priority: true } : orderItem,
    );
    await updateOrderItems(order.id, items);

    revalidatePath("/cuenta/pedidos");
    revalidatePath("/admin/mysterybox/revelaciones");
    return { ok: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "No se pudo abrir la caja",
    };
  }
}
