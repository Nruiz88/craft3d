import { requireUser } from "@/lib/auth-user";
import { logoutUserAction } from "@/app/account/actions";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import Link from "next/link";
import AuthShell from "@/components/auth/auth-shell";
import ProfileForm from "@/components/auth/profile-form";
import PlayerCard from "@/components/player-card";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

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

  const supabase = await createSupabaseServerClient();
  const { count: favoriteCount } = await supabase
    .from("wishlists")
    .select("product_slug", { count: "exact", head: true })
    .eq("user_id", user.id);

  const [{ data: playerProfile }, { data: badgeRows }] = await Promise.all([
    supabase
      .from("player_profiles")
      .select("coins, total_paid, order_count")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("player_badges")
      .select("badge_id")
      .eq("user_id", user.id),
  ]);

  return (
    <AuthShell
      title="Mi cuenta"
      subtitle="Tus datos y preferencias de contacto."
      maxWidth="max-w-lg"
    >
      {bienvenido === "1" ? (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-900/70 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-400">
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          ¡Bienvenido a Craf
          <span className="text-amber-400">3d</span>!
        </div>
      ) : null}

      <div className="space-y-6">
        <PlayerCard
          coins={Number(playerProfile?.coins ?? 0)}
          totalPaid={Number(playerProfile?.total_paid ?? 0)}
          orderCount={Number(playerProfile?.order_count ?? 0)}
          earnedBadges={(badgeRows ?? []).map((row) => String(row.badge_id))}
        />

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Tu cuenta
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-zinc-500">Nombre</dt>
              <dd className="font-medium text-zinc-100">
                {user.fullName || "—"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-zinc-500">Email</dt>
              <dd className="font-medium text-zinc-100">{user.email}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-zinc-500">Cuenta</dt>
              <dd className="font-medium text-zinc-100">{provider}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-zinc-500">Cliente desde</dt>
              <dd className="font-medium tabular-nums text-zinc-100">
                {formatDate(user.createdAt)}
              </dd>
            </div>
          </dl>

          <form action={logoutUserAction} className="mt-6 border-t border-zinc-800 pt-5">
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

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Datos de contacto
          </h2>
          <p className="mt-1 text-xs text-zinc-600">
            Usá estos datos para agilizar tus próximos pedidos.
          </p>
          <div className="mt-5">
            <ProfileForm profile={user.profile} />
          </div>
        </div>

        <div className="rounded-2xl border-2 border-zinc-800 bg-zinc-900/60 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                ♥ Favoritos
              </h2>
              <p className="mt-1 text-xs text-zinc-600">
                {favoriteCount ?? 0} producto
                {(favoriteCount ?? 0) === 1 ? "" : "s"} guardado
                {(favoriteCount ?? 0) === 1 ? "" : "s"} para más tarde.
              </p>
            </div>
            <Link
              href="/favoritos"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-700 px-4 py-2 text-sm font-medium text-rose-300 transition-colors hover:border-rose-500/70 hover:bg-rose-950/30"
            >
              Ver lista →
            </Link>
          </div>
        </div>
      </div>
    </AuthShell>
  );
}
