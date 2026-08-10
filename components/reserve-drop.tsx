"use client";

import { useState, type FormEvent } from "react";
import { formatPrice } from "@/lib/format";
import { reserveAction } from "@/app/account/actions";
import { site } from "@/lib/site";

type PaymentMethod = "transferencia" | "mercado_pago";

interface ReserveDropProps {
  product: { name: string; slug: string; price: number };
  depositPct: number;
  deposit: number;
  next: string;
  mercadopagoConfigured?: boolean;
  transfer?: {
    bankName: string;
    holder: string;
    cbu: string;
    alias: string;
    note: string;
  };
  pre?: boolean;
}

const optionClass = (active: boolean, disabled: boolean) =>
  `flex flex-1 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 transition-colors ${
    disabled
      ? "cursor-not-allowed border-zinc-800 bg-zinc-950/40 opacity-60"
      : active
        ? "border-amber-400/60 bg-amber-400/5"
        : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700"
  }`;

export default function ReserveDrop({
  product,
  depositPct,
  deposit,
  next,
  mercadopagoConfigured = false,
  transfer,
  pre = false,
}: ReserveDropProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("transferencia");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<string | null>(null);

  const remaining = product.price - deposit;
  const transferReady = Boolean(
    transfer && (transfer.cbu || transfer.alias) && transfer.holder,
  );

  async function handleReserve(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const result = await reserveAction(undefined, formData);
    if (result?.initPoint) {
      window.location.href = result.initPoint;
      return;
    }
    if (result?.orderId) {
      setPlacedOrder(result.orderId);
    } else if (result?.error) {
      setError(result.error);
    }
    setPending(false);
  }

  if (placedOrder) {
    const voucherText = encodeURIComponent(
      `Hola Craft3d! Hice la reserva del drop "${product.name}" (pedido #${placedOrder}) y transferí la seña de ${formatPrice(deposit)}. Te adjunto el comprobante. 💰`,
    );
    return (
      <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-950/20 p-5">
        <p className="pixel text-[10px] tracking-widest text-emerald-300">
          ✓ RESERVA REGISTRADA · PEDIDO #{placedOrder}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-300">
          Tu unidad está reservada a tu nombre. Ahora transferí la{" "}
          <strong className="text-emerald-300">seña de {formatPrice(deposit)}</strong>{" "}
          para confirmarla:
        </p>

        {transferReady ? (
          <dl className="mt-3 space-y-2 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm">
            {transfer!.bankName ? (
              <div>
                <dt className="text-xs text-zinc-500">Banco</dt>
                <dd className="font-medium text-zinc-100">{transfer!.bankName}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-xs text-zinc-500">Titular</dt>
              <dd className="font-medium text-zinc-100">{transfer!.holder}</dd>
            </div>
            {transfer!.cbu ? (
              <div>
                <dt className="text-xs text-zinc-500">CBU</dt>
                <dd className="font-mono text-sm text-zinc-100">{transfer!.cbu}</dd>
              </div>
            ) : null}
            {transfer!.alias ? (
              <div>
                <dt className="text-xs text-zinc-500">Alias</dt>
                <dd className="font-mono text-sm text-zinc-100">{transfer!.alias}</dd>
              </div>
            ) : null}
            {transfer!.note ? (
              <div>
                <dt className="text-xs text-zinc-500">Nota</dt>
                <dd className="text-zinc-300">{transfer!.note}</dd>
              </div>
            ) : null}
          </dl>
        ) : (
          <p className="mt-3 text-xs text-zinc-500">
            Te pasamos los datos de la cuenta por WhatsApp.
          </p>
        )}

        <a
          href={`${site.whatsapp}?text=${voucherText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-400"
        >
          💬 Enviar comprobante por WhatsApp
        </a>
        <p className="mt-2 text-center text-xs text-zinc-500">
          En cuanto confirmemos la seña, tu reserva queda firme y el{" "}
          <span className="text-zinc-300">{formatPrice(remaining)}</span> restante
          se abona antes del envío.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-amber-400/40 bg-amber-400/5 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="pixel text-[10px] tracking-widest text-amber-300">
          🔒 {pre ? "PRE-RESERVA" : "RESERVA CON SEÑA"}
        </p>
        <span className="pixel rounded-sm border border-amber-400/40 bg-amber-950/40 px-2 py-0.5 text-[9px] tracking-widest text-amber-300">
          {depositPct}% AHORA
        </span>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-zinc-400">
        Asegurá tu edición pagando una seña del{" "}
        <strong className="text-amber-300">{depositPct}%</strong> ({" "}
        {formatPrice(deposit)} ). El{" "}
        <strong className="text-zinc-200">{formatPrice(remaining)}</strong>{" "}
        restante se abona antes del envío, coordinado por WhatsApp.
      </p>

      <form onSubmit={handleReserve} className="mt-4 space-y-3">
        <input type="hidden" name="slug" value={product.slug} />
        <input type="hidden" name="next" value={next} />

        <fieldset>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className={optionClass(paymentMethod === "transferencia", false)}>
              <input
                type="radio"
                name="paymentMethod"
                value="transferencia"
                checked={paymentMethod === "transferencia"}
                onChange={() => setPaymentMethod("transferencia")}
                className="h-4 w-4 accent-amber-400"
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-zinc-100">
                  🏦 Transferencia
                </span>
                <span className="block text-[11px] text-zinc-500">
                  Transferís la seña y coordinamos por WhatsApp
                </span>
              </span>
            </label>
            <label className={optionClass(paymentMethod === "mercado_pago", !mercadopagoConfigured)}>
              <input
                type="radio"
                name="paymentMethod"
                value="mercado_pago"
                checked={paymentMethod === "mercado_pago"}
                disabled={!mercadopagoConfigured}
                onChange={() => setPaymentMethod("mercado_pago")}
                className="h-4 w-4 accent-amber-400"
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-zinc-100">
                  💳 Mercado Pago
                </span>
                <span className="block text-[11px] text-zinc-500">
                  {mercadopagoConfigured
                    ? "Pagás la seña con tarjeta, débito o cuenta"
                    : "Próximamente"}
                </span>
              </span>
            </label>
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-amber-400 px-5 py-3 text-sm font-semibold text-zinc-950 transition-all active:scale-[0.98] hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Procesando…" : `🔒 Reservar con seña de ${formatPrice(deposit)}`}
        </button>
      </form>

      {error ? (
        <p
          className="mt-3 rounded-lg border border-red-900/70 bg-red-950/30 px-3 py-2 text-center text-xs text-red-400"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <p className="mt-3 text-center text-xs text-zinc-500">
        La reserva descuenta 1 unidad del tiraje. Sin compromiso hasta confirmar
        la seña.
      </p>
    </div>
  );
}
