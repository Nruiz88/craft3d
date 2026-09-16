"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { sql } from "drizzle-orm";
import { authOptions } from "@/auth";
import { db } from "@/lib/db/client";
import { REDEEM_OPTIONS } from "@/lib/orders/coupons";
import { redeemCoinsTx } from "@/lib/db/transactions";
import { getOrderById, updateOrderItems } from "@/lib/orders";
import { getAllProducts } from "@/lib/orders/store";
import { EARLY_OPEN_COST } from "@/lib/gamification";

export type RedeemState =
  | { code?: string; amount?: number; error?: string }
  | undefined;

export async function redeemCoinsAction(
  coins: number,
): Promise<RedeemState> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return { error: "Ingresá a tu cuenta para canjear monedas" };

  const option = REDEEM_OPTIONS.find((candidate) => candidate.coins === coins);
  if (!option) return { error: "Opción de canje inválida" };

  try {
    const { code, amount } = await redeemCoinsTx(userId, coins);
    revalidatePath("/cuenta");
    return { code, amount };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "No se pudo canjear",
    };
  }
}

export type OpenBoxEarlyState = { ok?: boolean; error?: string } | undefined;

export async function openBoxEarlyAction(
  formData: FormData,
): Promise<OpenBoxEarlyState> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return { error: "Ingresá a tu cuenta para abrir antes" };

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
    if (order.user_id !== userId) {
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

    // Descuento atómico de monedas (solo si hay saldo suficiente).
    const spent = await db.execute(
      sql`update player_profiles set coins = coins - ${EARLY_OPEN_COST}, updated_at = now() where user_id = ${userId} and coins >= ${EARLY_OPEN_COST} returning coins`,
    );
    if (spent.rows.length === 0) {
      return { error: "Te faltan monedas. Comprá más piezas para ganarlas." };
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
