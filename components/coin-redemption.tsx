"use client";

import { useState } from "react";
import {
  COIN_RATE,
  MIN_COINS_TO_REDEEM,
  REDEEM_OPTIONS,
  type RedemptionRow,
} from "@/lib/coupons";
import { formatPrice } from "@/lib/format";
import { redeemCoinsAction } from "@/app/cuenta/actions";

interface CoinRedemptionProps {
  coins: number;
  redemptions: RedemptionRow[];
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

const statusLabels: Record<RedemptionRow["status"], string> = {
  activo: "Activo",
  usado: "Usado",
  vencido: "Vencido",
};

export default function CoinRedemption({
  coins,
  redemptions,
}: CoinRedemptionProps) {
  const [pendingCoins, setPendingCoins] = useState<number | null>(null);
  const [result, setResult] = useState<{ code?: string; amount?: number } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleRedeem(optionCoins: number) {
    setPendingCoins(optionCoins);
    setError(null);
    setResult(null);
    setCopied(false);
    const response = await redeemCoinsAction(optionCoins);
    if (response?.code && response.amount) {
      setResult({ code: response.code, amount: response.amount });
    } else if (response?.error) {
      setError(response.error);
    }
    setPendingCoins(null);
  }

  async function handleCopy() {
    if (!result?.code) return;
    try {
      await navigator.clipboard.writeText(result.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
        🪙 Canje de monedas
      </h2>
      <p className="mt-1 text-xs text-zinc-500">
        Cada moneda vale {formatPrice(COIN_RATE)} de descuento. Los códigos
        duran 90 días y se usan en el carrito.
      </p>

      {coins < MIN_COINS_TO_REDEEM ? (
        <p className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3 text-sm text-zinc-500">
          Necesitás al menos{" "}
          <strong className="text-amber-400">{MIN_COINS_TO_REDEEM} monedas</strong>{" "}
          para canjear. ¡Seguí comprando!
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {REDEEM_OPTIONS.map((option) => {
            const disabled = coins < option.coins;
            const pending = pendingCoins === option.coins;
            return (
              <button
                key={option.coins}
                type="button"
                disabled={disabled || pendingCoins !== null}
                onClick={() => handleRedeem(option.coins)}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  disabled
                    ? "cursor-not-allowed border-zinc-800 opacity-50"
                    : "border-amber-400/40 bg-amber-400/5 hover:border-amber-400/70"
                }`}
              >
                <p className="pixel text-lg font-black text-amber-400">
                  {option.coins}
                </p>
                <p className="mt-1 text-xs text-zinc-400">monedas</p>
                <p className="mt-2 text-sm font-semibold text-zinc-100">
                  {pending
                    ? "Canjeando…"
                    : `${formatPrice(option.amount)} de descuento`}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {result?.code ? (
        <div className="mt-4 rounded-xl border border-emerald-900/70 bg-emerald-950/30 p-4 text-center">
          <p className="text-xs text-emerald-400">¡Cupón generado!</p>
          <p className="pixel mt-2 break-all text-xl font-black tracking-wider text-emerald-300">
            {result.code}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {formatPrice(result.amount ?? 0)} de descuento · válido 90 días
          </p>
          <button
            type="button"
            onClick={handleCopy}
            className="mt-3 inline-flex rounded-full bg-emerald-500 px-5 py-1.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-emerald-400"
          >
            {copied ? "¡Copiado!" : "Copiar código"}
          </button>
          <p className="mt-2 text-xs text-zinc-500">
            Aplicá el código en el carrito al finalizar tu próxima compra.
          </p>
        </div>
      ) : null}

      {error ? (
        <p
          className="mt-4 rounded-lg border border-red-900/70 bg-red-950/30 px-3 py-2 text-center text-xs text-red-400"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {redemptions.length > 0 ? (
        <div className="mt-5 border-t border-zinc-800 pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Tus códigos
          </h3>
          <ul className="mt-2 space-y-2">
            {redemptions.map((redemption) => (
              <li
                key={redemption.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2.5 text-sm"
              >
                <span className="font-mono text-xs tracking-wider text-zinc-100">
                  {redemption.coupon_code}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-xs tabular-nums text-zinc-500">
                    {formatPrice(redemption.amount)} · vence{" "}
                    {formatDate(redemption.expires_at)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      redemption.status === "activo"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : redemption.status === "usado"
                          ? "bg-zinc-800 text-zinc-500"
                          : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {statusLabels[redemption.status]}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
