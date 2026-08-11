import { BADGES, getLevelInfo, PLAYER_COIN_HINT } from "@/lib/gamification";
import { formatPrice } from "@/lib/format";

interface PlayerCardProps {
  coins: number;
  totalPaid: number;
  orderCount: number;
  earnedBadges: string[];
}

export default function PlayerCard({
  coins,
  totalPaid,
  orderCount,
  earnedBadges,
}: PlayerCardProps) {
  const level = getLevelInfo(totalPaid);
  const earned = new Set(earnedBadges);

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-amber-400/40 bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
            Perfil arcade
          </p>
          <h2 className="mt-1 pixel text-3xl font-black tracking-tight text-zinc-50">
            {level.name}
          </h2>
          {level.nextMinPaid !== null ? (
            <p className="mt-1 text-xs text-zinc-500">
              Faltan {formatPrice(level.nextMinPaid - totalPaid)} para{" "}
              <span className="text-amber-400">
                PLAYER {level.level + 1}
              </span>
            </p>
          ) : (
            <p className="mt-1 text-xs text-zinc-500">Nivel máximo alcanzado</p>
          )}
        </div>

        <div className="flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-5 py-2">
          <span className="text-2xl" aria-hidden="true">
            🪙
          </span>
          <span className="pixel text-2xl font-black tabular-nums text-amber-400">
            {coins}
          </span>
          <span className="text-xs font-medium text-amber-200/80">monedas</span>
        </div>
      </div>

      <div className="mt-5">
        <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all"
            style={{ width: `${level.progressPct}%` }}
          />
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <dt className="text-xs text-zinc-500">Pedidos completados</dt>
          <dd className="mt-1 pixel text-xl font-bold tabular-nums text-zinc-50">
            {orderCount}
          </dd>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <dt className="text-xs text-zinc-500">Total invertido</dt>
          <dd className="mt-1 pixel text-xl font-bold tabular-nums text-zinc-50">
            {formatPrice(totalPaid)}
          </dd>
        </div>
      </dl>

      <div className="mt-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Insignias
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {BADGES.map((badge) => {
            const unlocked = earned.has(badge.id);
            return (
              <div
                key={badge.id}
                className={`rounded-xl border p-3 text-center transition-colors ${
                  unlocked
                    ? "border-amber-400/40 bg-amber-400/5"
                    : "border-zinc-800 bg-zinc-900/40 opacity-50"
                }`}
              >
                <span className="text-2xl" aria-hidden="true">
                  {unlocked ? badge.emoji : "🔒"}
                </span>
                <p
                  className={`mt-1 text-xs font-semibold ${
                    unlocked ? "text-zinc-100" : "text-zinc-600"
                  }`}
                >
                  {unlocked ? badge.name : "?????"}
                </p>
                <p className="mt-0.5 text-[10px] leading-tight text-zinc-500">
                  {unlocked ? badge.description : "Bloqueada"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-5 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-500">
        {PLAYER_COIN_HINT} y canjealos por descuentos abajo. ¡Seguí jugando!
      </p>
    </div>
  );
}
