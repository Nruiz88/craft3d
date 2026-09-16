import { formatDate } from "@/lib/utils/date";
import { requireUser } from "@/lib/auth/user";
import { logoutUserAction } from "@/app/account/actions";
import { db } from "@/lib/db/client";
import {
  coin_redemptions,
  orders,
  player_badges,
  player_profiles,
  wishlists,
} from "@/lib/db/schema";
import { count, desc, eq } from "drizzle-orm";
import Link from "next/link";
import AuthShell from "@/components/auth/auth-shell";
import ProfileForm from "@/components/auth/profile-form";
import PlayerCard from "@/components/gamification/player-card";
import CoinRedemption from "@/components/gamification/coin-redemption";
import type { RedemptionRow } from "@/lib/orders/coupons";
import SavedAddresses from "@/components/auth/saved-addresses";

const providerLabels: Record<string, string> = {
  email: "Email y contraseña",
  google: "Google",
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ bienvenido?: string }>;
}) {
  const [{ bienvenido }, user] = await Promise.all([
    searchParams,
    requireUser(),
  ]);

  const provider = providerLabels[user.provider] ?? user.provider;

  const [
    favoriteCountRows,
    orderCountRows,
    playerProfileRows,
    badgeRows,
    redemptionRows,
  ] = await Promise.all([
    db.select({ value: count() }).from(wishlists).where(eq(wishlists.user_id, user.id)),
    db.select({ value: count() }).from(orders).where(eq(orders.user_id, user.id)),
    db
      .select({
        coins: player_profiles.coins,
        total_paid: player_profiles.total_paid,
        order_count: player_profiles.order_count,
      })
      .from(player_profiles)
      .where(eq(player_profiles.user_id, user.id))
      .limit(1),
    db
      .select({ badge_id: player_badges.badge_id })
      .from(player_badges)
      .where(eq(player_badges.user_id, user.id)),
    db
      .select()
      .from(coin_redemptions)
      .where(eq(coin_redemptions.user_id, user.id))
      .orderBy(desc(coin_redemptions.created_at)),
  ]);

  const favoriteCount = favoriteCountRows[0]?.value ?? 0;
  const orderCount = orderCountRows[0]?.value ?? 0;
  const playerProfile = playerProfileRows[0];

  const coins = Number(playerProfile?.coins ?? 0);
  const totalPaid = Number(playerProfile?.total_paid ?? 0);
  const playerOrderCount = Number(playerProfile?.order_count ?? orderCount ?? 0);

  const quickLinks = [
    {
      label: "Mis pedidos",
      href: "/cuenta/pedidos",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
      count: orderCount ?? 0,
      color: "text-amber-300",
      borderColor: "border-amber-400/30 hover:border-amber-400/60",
      bgColor: "bg-amber-400/5",
    },
    {
      label: "Favoritos",
      href: "/favoritos",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      ),
      count: favoriteCount ?? 0,
      color: "text-rose-300",
      borderColor: "border-rose-500/30 hover:border-rose-500/60",
      bgColor: "bg-rose-500/5",
    },
    {
      label: "Canjear monedas",
      href: "#monedas",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v8" />
          <path d="M8 12h8" />
        </svg>
      ),
      count: coins,
      color: "text-yellow-300",
      borderColor: "border-yellow-400/30 hover:border-yellow-400/60",
      bgColor: "bg-yellow-400/5",
    },
    {
      label: "Catálogo",
      href: "/catalogo",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
          <path d="m3 8 9 5 9-5" />
          <path d="M12 13v8" />
        </svg>
      ),
      count: null,
      color: "text-cyan-300",
      borderColor: "border-cyan-400/30 hover:border-cyan-400/60",
      bgColor: "bg-cyan-400/5",
    },
  ];

  return (
    <AuthShell
      title="Mi cuenta"
      subtitle="Panel de control de tu cuenta Craft3d."
    >
      {bienvenido === "1" ? (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-900/70 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-400">
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          ¡Bienvenido a Craft<span className="text-amber-400">3d</span>!
        </div>
      ) : null}

      <div className="space-y-6">
        {/* Player Card */}
        <PlayerCard
          coins={coins}
          totalPaid={totalPaid}
          orderCount={playerOrderCount}
          earnedBadges={(badgeRows ?? []).map((row) => String(row.badge_id))}
        />

        {/* Quick Access Grid */}
        <div>
          <h2 className="pixel text-[10px] tracking-widest text-zinc-500 mb-3">
            ACCESO RÁPIDO
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {quickLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`group flex flex-col items-center gap-3 rounded-2xl border p-5 text-center transition-all ${link.borderColor} ${link.bgColor}`}
              >
                <span className={`${link.color} transition-transform group-hover:scale-110`}>
                  {link.icon}
                </span>
                <div>
                  <p className="text-sm font-medium text-zinc-200">{link.label}</p>
                  {link.count != null && (
                    <p className={`mt-0.5 pixel text-lg font-bold tabular-nums ${link.color}`}>
                      {link.count}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Coin Redemption */}
        <div id="monedas">
          <CoinRedemption
            coins={coins}
            redemptions={(redemptionRows ?? []) as unknown as RedemptionRow[]}
          />
        </div>

        {/* Account Info */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="flex items-center justify-between">
            <h2 className="pixel text-[10px] tracking-widest text-zinc-500">
              DATOS DE LA CUENTA
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800/60 px-3 py-1 text-xs text-zinc-400">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              </svg>
              {provider}
            </span>
          </div>

          <dl className="mt-5 space-y-3">
            <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3">
              <dt className="text-xs text-zinc-500">Nombre</dt>
              <dd className="font-medium text-zinc-100">
                {user.fullName || "—"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3">
              <dt className="text-xs text-zinc-500">Email</dt>
              <dd className="font-medium text-zinc-100">{user.email}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3">
              <dt className="text-xs text-zinc-500">Cliente desde</dt>
              <dd className="font-medium tabular-nums text-zinc-100">
                {formatDate(user.createdAt)}
              </dd>
            </div>
          </dl>

          <form action={logoutUserAction} className="mt-5">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-zinc-700 px-6 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-red-800/70 hover:bg-red-950/30 hover:text-red-400"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="m16 17 5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
              Cerrar sesión
            </button>
          </form>
        </div>

        {/* Saved Addresses */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="pixel text-[10px] tracking-widest text-zinc-500 mb-1">
            DIRECCIONES GUARDADAS
          </h2>
          <p className="text-xs text-zinc-600 mb-4">
            Guardá tus direcciones para no rellenar cada vez que comprás.
          </p>
          <SavedAddresses />
        </div>

        {/* Contact Profile */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="pixel text-[10px] tracking-widest text-zinc-500 mb-1">
            DATOS DE CONTACTO
          </h2>
          <p className="text-xs text-zinc-600 mb-4">
            Usá estos datos para agilizar tus próximos pedidos.
          </p>
          <ProfileForm profile={user.profile} />
        </div>
      </div>
    </AuthShell>
  );
}
