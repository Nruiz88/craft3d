import "server-only";
import { getOrders } from "./orders";
import { getAllProducts } from "./store";
import {
  mysteryBoxPoolLabel,
  parseMysteryRarity,
  type MysteryRarity,
} from "./mystery-box";

export interface MysteryRevealFeedItem {
  pieceName: string;
  emoji: string;
  rarity: MysteryRarity;
  poolLabel: string;
  customerName: string;
  createdAt: string;
}

/**
 * Últimas piezas reveladas de cajas sorpresa (prueba social).
 * Cero SQL: lee las líneas "🎁 Incluye: X" ya presentes en orders.items.
 */
export async function getLatestMysteryReveals(
  limit = 6,
): Promise<MysteryRevealFeedItem[]> {
  const [orders, allProducts] = await Promise.all([
    getOrders(),
    getAllProducts(),
  ]);
  const bySlug = new Map(allProducts.map((p) => [p.slug, p]));
  const reveals: MysteryRevealFeedItem[] = [];

  for (const order of orders) {
    if (reveals.length >= limit) break;
    for (const item of order.items) {
      if (!item.revealFor) continue;
      const piece = bySlug.get(item.product_slug);
      const box = bySlug.get(item.revealFor);
      reveals.push({
        pieceName: item.product_name.replace(/^🎁 Incluye:\s*/i, "").trim(),
        emoji: piece?.emoji ?? "🎁",
        rarity: piece ? parseMysteryRarity(piece.tags) : "comun",
        poolLabel: box ? mysteryBoxPoolLabel(box.tags) : "",
        customerName: order.customer_name.split(/\s+/)[0] || "Alguien",
        createdAt: order.createdAt,
      });
      if (reveals.length >= limit) break;
    }
  }

  return reveals;
}
