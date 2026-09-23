import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { coin_redemptions, coupons } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/user";
import { getPlayerProfile } from "@/lib/gamification";
import { getOrdersByUserId } from "@/lib/orders";
import { formatPrice } from "@/lib/utils/format";
import { formatDate } from "@/lib/utils/date";
import PlayerCard from "@/components/gamification/player-card";
import CoinRedemption from "@/components/gamification/coin-redemption";
import ProfileForm from "@/components/auth/profile-form";
import SavedAddresses from "@/components/auth/saved-addresses";
import LogoutButton from "@/components/auth/logout-button";
import type { RedemptionRow } from "@/lib/orders/coupons";

export const dynamic = "force-dynamic";

export default async function CuentaPage() {
  const user = await requireUser();
  const [profile, orders] = await Promise.all([
    getPlayerProfile(user.id),
    getOrdersByUserId(user.id),
  ]);

  // Códigos de canje activos del jugador
  let redemptions: RedemptionRow[] = [];
  try {
    const rows = await db
      .select()
      .from(coin_redemptions)
      .where(eq(coin_redemptions.user_id, user.id))
      .orderBy(desc(coin_redemptions.created_at))
      .limit(10);
    redemptions = rows.map((row) => ({
      id: Number(row.id),
      user_id: row.user_id,
      coins: row.coins,
      amount: Number(row.amount),
      coupon_code: row.coupon_code,
      status: row.status as RedemptionRow["status"],
      created_at: (row.created_at instanceof Date ? row.created_at : new Date(row.created_at)).toISOString(),
      expires_at: (row.expires_at instanceof Date ? row.expires_at : new Date(row.expires_at)).toISOString(),
    }));

    // Marcar vencidos como "vencido" solo visualmente (no toca la DB)
    const now = Date.now();
    redemptions = redemptions.map((r) =>
      r.status === "activo" && new Date(r.expires_at).getTime() < now
        ? { ...r, status: "vencido" as const }
        : r,
    );
  } catch {
    redemptions = [];
  }

  // Códigos CRAFT- activos en coupons (para el hint del carrito)
  void coupons;

  return (
    <div className="bg-zinc-950 pb-20">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="pixel text-[10px] uppercase tracking-widest text-amber-300 neon-amber">
              ★ MI CUENTA ★
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-50">
              Hola{user.name ? `, ${user.name.split(" ")[0]}` : ""} 👋
            </h1>
            <p className="mt-1 text-sm text-zinc-500">{user.email}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {user.profile.role === "admin" ? (
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-300 transition-colors hover:border-amber-400/70 hover:bg-amber-400/20 hover:text-amber-200"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="9" rx="1" />
                  <rect x="14" y="3" width="7" height="5" rx="1" />
                  <rect x="14" y="12" width="7" height="9" rx="1" />
                  <rect x="3" y="16" width="7" height="5" rx="1" />
                </svg>
                Panel admin
              </Link>
            ) : null}
            <Link
              href="/cuenta/pedidos"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-amber-400/60 hover:text-amber-300"
            >
              📦 Mis pedidos
              {orders.length > 0 ? (
                <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-xs font-bold text-amber-300">
                  {orders.length}
                </span>
              ) : null}
            </Link>
            <LogoutButton />
          </div>
        </div>

        <div className="space-y-8">
          <PlayerCard
            coins={profile.coins}
            totalPaid={profile.totalPaid}
            orderCount={profile.orderCount}
            earnedBadges={profile.badges}
          />

          <CoinRedemption coins={profile.coins} redemptions={redemptions} />

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Mis datos
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Estos datos se usan para precargar el envío de tus pedidos.
            </p>
            <div className="mt-5 max-w-2xl">
              <ProfileForm profile={user.profile} />
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Direcciones guardadas
            </h2>
            <div className="mt-5">
              <SavedAddresses />
            </div>
          </section>

          {orders.length > 0 ? (
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                Últimos pedidos
              </h2>
              <ul className="mt-4 divide-y divide-zinc-800">
                {orders.slice(0, 3).map((order) => (
                  <li key={order.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                    <span className="text-zinc-300">
                      Pedido <span className="font-semibold text-amber-300">#{order.id}</span>
                      <span className="ml-2 text-xs text-zinc-500">{formatDate(order.createdAt)}</span>
                    </span>
                    <span className="font-semibold tabular-nums text-zinc-100">
                      {formatPrice(order.total)}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/cuenta/pedidos"
                className="mt-3 inline-block text-xs font-medium text-amber-300 transition-colors hover:text-amber-200"
              >
                Ver todos mis pedidos →
              </Link>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
