"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { getOrderById, updateOrderItems } from "@/lib/orders";
import { getAllProducts, getProductBySlug, decrementProductStock } from "@/lib/orders/store";
import { logAdminAction } from "@/lib/admin/admin-log";
import { getMysteryBoxItems, mysteryBoxPoolLabel, parseMysteryRarity } from "@/lib/mystery-box";
import { sendMysteryRevealedEmail } from "@/lib/email";
import type { RevealResult } from "./orders";

export async function confirmMysteryRevealAction(formData: FormData): Promise<RevealResult> {
  if (!(await isAdmin())) return { error: "No autorizado" };
  const orderId = Number(formData.get("orderId"));
  const itemIndex = Number(formData.get("itemIndex"));
  if (!Number.isInteger(orderId) || orderId <= 0 || !Number.isInteger(itemIndex) || itemIndex < 0) {
    return { error: "Pedido inválido" };
  }

  const order = await getOrderById(orderId);
  if (!order || !Array.isArray(order.items)) return { error: "Pedido no encontrado" };
  const item = order.items[itemIndex];
  if (!item) return { error: "Ítem no encontrado" };

  const box = await getProductBySlug(item.product_slug);
  if (!box || box.category !== "mystery-box") return { error: "No es una caja sorpresa" };

  try {
    const allProducts = await getAllProducts();
    const itemsInBox = getMysteryBoxItems(allProducts, box);
    if (itemsInBox.length === 0) {
      return { error: "La caja no tiene piezas seleccionadas. Editala y tildá su contenido." };
    }
    const outOfStock = itemsInBox.filter((it) => it.product.stock < it.qty);
    if (outOfStock.length > 0) {
      const names = outOfStock.map((it) => `${it.product.name} (faltan ${Math.max(0, it.qty - it.product.stock)} de ${it.qty})`).join(", ");
      return { error: `Sin stock para revelar: ${names}. Reponé o ajustá la caja.` };
    }

    for (const it of itemsInBox) {
      await decrementProductStock(it.product.id, it.qty);
    }

    const revealed = Number(item.revealed ?? 0);
    const updatedItems = order.items.map((i, index) =>
      index === itemIndex ? { ...i, revealed: revealed + 1 } : i,
    );
    for (const it of itemsInBox) {
      updatedItems.push({
        product_id: it.product.id,
        product_slug: it.product.slug,
        product_name: `🎁 Incluye: ${it.product.name}`,
        price: 0,
        quantity: it.qty,
        subtotal: 0,
        revealFor: item.product_slug,
      });
    }

    await updateOrderItems(order.id, updatedItems);
    await logAdminAction("revelar caja", `Pedido #${order.id}: ${itemsInBox.map((it) => `${it.qty}× ${it.product.name}`).join(", ")} (selección ${mysteryBoxPoolLabel(box.tags)})`);
    const giftMessage = order.items.find((i) => i.product_slug === "regalo")?.giftMessage;
    await sendMysteryRevealedEmail(
      order,
      itemsInBox.map((it) => ({
        name: it.product.name,
        emoji: it.product.emoji,
        rarity: parseMysteryRarity(it.product.tags),
        qty: it.qty,
      })),
      { giftMessage },
    );
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo revelar la caja" };
  }

  revalidatePath("/admin/mysterybox/revelaciones");
  revalidatePath("/cuenta/pedidos");
  return {};
}
