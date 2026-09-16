import "server-only";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { orders, player_badges, player_profiles } from "@/lib/db/schema";
import { getAllProducts } from "@/lib/orders/store";
import type { Order } from "@/lib/products/types";

export const COINS_PER_1000 = 1;
export const PLAYER_COIN_HINT = "Ganás 1 moneda por cada $1.000 pagados";
export const EARLY_OPEN_COST = 100;
export const EARLY_OPEN_HINT = "Abrí tu caja sorpresa antes con 100 monedas.";

export async function getPlayerCoins(userId: string): Promise<number> {
  try {
    const [row] = await db
      .select({ coins: player_profiles.coins })
      .from(player_profiles)
      .where(eq(player_profiles.user_id, userId))
      .limit(1);
    return Number(row?.coins ?? 0);
  } catch {
    return 0;
  }
}

export interface LevelInfo {
  level: number;
  name: string;
  minPaid: number;
  nextMinPaid: number | null;
  progressPct: number;
}

export const LEVELS: { level: number; name: string; minPaid: number }[] = [
  { level: 1, name: "PLAYER 1", minPaid: 0 },
  { level: 2, name: "PLAYER 2", minPaid: 20_000 },
  { level: 3, name: "PLAYER 3", minPaid: 60_000 },
  { level: 4, name: "PLAYER 4", minPaid: 150_000 },
  { level: 5, name: "PLAYER 5", minPaid: 400_000 },
];

export function getLevelInfo(totalPaid: number): LevelInfo {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (totalPaid >= level.minPaid) current = level;
  }
  const next =
    LEVELS.find((level) => level.level === current.level + 1) ?? null;
  const progressPct = next
    ? Math.min(
        100,
        Math.max(
          0,
          ((totalPaid - current.minPaid) / (next.minPaid - current.minPaid)) *
            100,
        ),
      )
    : 100;
  return {
    level: current.level,
    name: current.name,
    minPaid: current.minPaid,
    nextMinPaid: next?.minPaid ?? null,
    progressPct,
  };
}

export interface BadgeDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export const BADGES: BadgeDef[] = [
  {
    id: "first_purchase",
    name: "Primer pedido",
    emoji: "🕹️",
    description: "Completaste tu primera compra.",
  },
  {
    id: "3_purchases",
    name: "Trío de continues",
    emoji: "👾",
    description: "Completaste 3 compras.",
  },
  {
    id: "5_purchases",
    name: "5 vidas extra",
    emoji: "❤️",
    description: "Completaste 5 compras.",
  },
  {
    id: "player2",
    name: "PLAYER 2",
    emoji: "🟡",
    description: "Llegaste a $20.000 acumulados.",
  },
  {
    id: "player3",
    name: "PLAYER 3",
    emoji: "🟠",
    description: "Llegaste a $60.000 acumulados.",
  },
  {
    id: "high_score",
    name: "High Score",
    emoji: "🏆",
    description: "Llegaste a $150.000 acumulados.",
  },
  {
    id: "arcade_legend",
    name: "Leyenda arcade",
    emoji: "⭐",
    description: "Llegaste a $400.000 acumulados.",
  },
];

export interface PlayerProfile {
  user_id: string;
  coins: number;
  total_paid: number;
  order_count: number;
}

function badgesFor(
  totalPaid: number,
  orderCount: number,
): string[] {
  const earned: string[] = [];
  if (orderCount >= 1) earned.push("first_purchase");
  if (orderCount >= 3) earned.push("3_purchases");
  if (orderCount >= 5) earned.push("5_purchases");
  const levelBadge: Record<number, string> = {
    2: "player2",
    3: "player3",
    4: "high_score",
    5: "arcade_legend",
  };
  for (const level of LEVELS) {
    if (totalPaid >= level.minPaid && levelBadge[level.level]) {
      earned.push(levelBadge[level.level]);
    }
  }
  return earned;
}

/**
 * Acredita monedas/insignias por un pedido pago. Idempotente: usa
 * orders.rewards_awarded como claim atómico para no duplicar en
 * webhooks o cambios de estado repetidos.
 */
export async function awardPurchase(order: Order): Promise<void> {
  if (!order.user_id || order.status !== "pagado") return;

  let claimed: { user_id: string; total: string | number } | null = null;
  try {
    const res = await db.execute(
      sql`update orders set rewards_awarded = true where id = ${order.id} and rewards_awarded = false returning user_id, total`,
    );
    claimed = (res.rows[0] as { user_id: string; total: string | number } | undefined) ?? null;
  } catch {
    return;
  }
  if (!claimed?.user_id) return;

  const userId = String(claimed.user_id);
  const coins = Math.floor(Number(claimed.total) / 1000) * COINS_PER_1000;

  const allProducts = await getAllProducts();
  const boxSlugs = new Set(
    allProducts
      .filter((p) => p.category === "mystery-box")
      .map((p) => p.slug),
  );
  const boxSubtotal = order.items.reduce(
    (sum, item) =>
      boxSlugs.has(item.product_slug) ? sum + Number(item.subtotal) : sum,
    0,
  );
  const boxBonus = Math.floor(boxSubtotal / 1000) * COINS_PER_1000;

  const [profile] = await db
    .select({
      coins: player_profiles.coins,
      total_paid: player_profiles.total_paid,
      order_count: player_profiles.order_count,
    })
    .from(player_profiles)
    .where(eq(player_profiles.user_id, userId))
    .limit(1);

  const newCoins = Number(profile?.coins ?? 0) + coins + boxBonus;
  const newTotalPaid = Number(profile?.total_paid ?? 0) + Number(claimed.total);
  const newOrderCount = Number(profile?.order_count ?? 0) + 1;

  try {
    await db
      .insert(player_profiles)
      .values({
        user_id: userId,
        coins: newCoins,
        total_paid: String(newTotalPaid),
        order_count: newOrderCount,
        updated_at: new Date(),
      })
      .onConflictDoUpdate({
        target: player_profiles.user_id,
        set: {
          coins: newCoins,
          total_paid: String(newTotalPaid),
          order_count: newOrderCount,
          updated_at: new Date(),
        },
      });
  } catch {
    return;
  }

  const earnedBadges = badgesFor(newTotalPaid, newOrderCount);
  if (earnedBadges.length > 0) {
    try {
      await db
        .insert(player_badges)
        .values(earnedBadges.map((badgeId) => ({ user_id: userId, badge_id: badgeId })))
        .onConflictDoNothing();
    } catch {
      // Las insignias no deben romper el flujo principal
    }
  }
}
