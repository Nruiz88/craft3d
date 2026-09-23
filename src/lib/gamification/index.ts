import "server-only";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { orders, player_badges, player_profiles } from "@/lib/db/schema";
import type { Order } from "@/lib/products/types";

export const EARLY_OPEN_COST = 100;
export const EARLY_OPEN_HINT = "Abrí tu caja antes con 100 monedas";
export const PLAYER_COIN_HINT = "Ganás 1 moneda por cada $1.000 de compra";

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  minOrders?: number;
  minPaid?: number;
}

export const BADGES: Badge[] = [
  { id: "primer-pedido", name: "Primer pedido", emoji: "🎉", description: "Hiciste tu primer pedido", minOrders: 1 },
  { id: "coleccionista", name: "Coleccionista", emoji: "📦", description: "5 pedidos completados", minOrders: 5 },
  { id: "leyenda", name: "Leyenda", emoji: "👑", description: "10 pedidos completados", minOrders: 10 },
  { id: "gran-inversor", name: "Gran inversor", emoji: "💰", description: "$100.000 invertidos", minPaid: 100_000 },
];

export interface LevelInfo {
  level: number;
  name: string;
  progressPct: number;
  nextMinPaid: number | null;
}

const LEVELS: { min: number; name: string }[] = [
  { min: 0, name: "PLAYER 1" },
  { min: 50_000, name: "PLAYER 2" },
  { min: 150_000, name: "PLAYER 3" },
  { min: 350_000, name: "PLAYER 4" },
  { min: 700_000, name: "PLAYER 5" },
];

export function getLevelInfo(totalPaid: number): LevelInfo {
  let index = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (totalPaid >= LEVELS[i].min) index = i;
  }
  const current = LEVELS[index];
  const next = LEVELS[index + 1] ?? null;
  const progressPct = next
    ? Math.min(100, Math.round(((totalPaid - current.min) / (next.min - current.min)) * 100))
    : 100;
  return {
    level: index + 1,
    name: current.name,
    progressPct,
    nextMinPaid: next ? next.min : null,
  };
}

export async function getPlayerProfile(userId: string): Promise<{
  coins: number;
  totalPaid: number;
  orderCount: number;
  badges: string[];
}> {
  const rows = await db.select().from(player_profiles).where(eq(player_profiles.user_id, userId)).limit(1);
  const badgeRows = await db.select().from(player_badges).where(eq(player_badges.user_id, userId));
  const row = rows[0];
  return {
    coins: row?.coins ?? 0,
    totalPaid: Number(row?.total_paid ?? 0),
    orderCount: row?.order_count ?? 0,
    badges: badgeRows.map((b) => b.badge_id),
  };
}

export async function getPlayerCoins(userId: string): Promise<number> {
  const rows = await db
    .select({ coins: player_profiles.coins })
    .from(player_profiles)
    .where(eq(player_profiles.user_id, userId))
    .limit(1);
  return rows[0]?.coins ?? 0;
}

/**
 * Suma monedas (1 por cada $1.000 pagado + bono por cajas), actualiza el
 * perfil del jugador y otorga insignias nuevas. Idempotente: el webhook y el
 * admin solo lo llaman cuando el pedido pasa a "pagado".
 */
export async function awardPurchase(order: Order): Promise<{ ok: boolean }> {
  if (!order.user_id) return { ok: false };
  const paid = order.isReservation ? order.depositPaid : order.total;
  if (paid <= 0) return { ok: false };

  const boxSubtotal = order.items
    .filter((item) => !item.revealFor && item.subtotal > 0 && item.product_slug.includes("caja"))
    .reduce((sum, item) => sum + item.subtotal, 0);

  const coins = Math.floor(paid / 1000) + Math.floor(boxSubtotal / 1000);
  const totalPaid = paid;
  const orderCount = 1;

  await db
    .insert(player_profiles)
    .values({
      user_id: order.user_id,
      coins,
      total_paid: String(totalPaid),
      order_count: orderCount,
    })
    .onDuplicateKeyUpdate({
      set: {
        coins: sql`${player_profiles.coins} + ${coins}`,
        total_paid: sql`${player_profiles.total_paid} + ${totalPaid}`,
        order_count: sql`${player_profiles.order_count} + ${orderCount}`,
      },
    })
    .execute();

  // Insignias nuevas
  const profile = await getPlayerProfile(order.user_id);
  const earned = new Set(profile.badges);
  for (const badge of BADGES) {
    if (earned.has(badge.id)) continue;
    const okOrders = badge.minOrders != null && profile.orderCount >= badge.minOrders;
    const okPaid = badge.minPaid != null && profile.totalPaid >= badge.minPaid;
    if (okOrders || okPaid) {
      await db
        .insert(player_badges)
        .values({ user_id: order.user_id, badge_id: badge.id })
        .onDuplicateKeyUpdate({ set: { badge_id: badge.id } })
        .execute();
    }
  }

  // Evita doble premio: el pedido ya marcó rewards_awarded en markOrderPaid
  void orders;
  return { ok: true };
}
