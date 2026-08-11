import "server-only";
import { supabase } from "./supabase";
import type { Order } from "./types";

export const COINS_PER_1000 = 1;
export const PLAYER_COIN_HINT = "Ganás 1 moneda por cada $1.000 pagados";

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

  const { data: claimed, error: claimError } = await supabase
    .from("orders")
    .update({ rewards_awarded: true })
    .eq("id", order.id)
    .eq("rewards_awarded", false)
    .select("user_id, total")
    .maybeSingle();

  if (claimError || !claimed?.user_id) return;

  const userId = String(claimed.user_id);
  const coins = Math.floor(Number(claimed.total) / 1000) * COINS_PER_1000;

  const { data: profile } = await supabase
    .from("player_profiles")
    .select("coins, total_paid, order_count")
    .eq("user_id", userId)
    .maybeSingle();

  const newCoins = (profile?.coins ?? 0) + coins;
  const newTotalPaid = Number(profile?.total_paid ?? 0) + Number(claimed.total);
  const newOrderCount = (profile?.order_count ?? 0) + 1;

  const { error: upsertError } = await supabase.from("player_profiles").upsert(
    {
      user_id: userId,
      coins: newCoins,
      total_paid: newTotalPaid,
      order_count: newOrderCount,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (upsertError) return;

  const earnedBadges = badgesFor(newTotalPaid, newOrderCount);
  if (earnedBadges.length > 0) {
    await supabase.from("player_badges").upsert(
      earnedBadges.map((badgeId) => ({ user_id: userId, badge_id: badgeId })),
      { onConflict: "user_id,badge_id" },
    );
  }
}
