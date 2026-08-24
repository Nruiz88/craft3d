"use client";

import Link from "next/link";
import type { PaymentRedirect } from "@/app/carrito/page";
import type { PaymentSettings } from "@/lib/payments/settings";

type Transfer = PaymentSettings["transfer"];

/* ─── Exito ─── */
function PaymentSuccess({ orderId }: { orderId?: string }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 py-24 text-center sm:px-6">
      <span className="text-6xl" aria-hidden="true">✅</span>
      <h1 className="text-3xl font-bold text-zinc-50">Pago confirmado</h1>
      <p className="text-lg text-zinc-400">
        ¡Gracias por tu compra! Tu pedido{" "}
        {orderId ? <strong>#{orderId}</strong> : null} fue pagado con Mercado Pago y ya está en proceso.
      </p>
      <Link href="/cuenta/pedidos" className="rounded-full bg-amber-400 px-7 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-300">
        Ver mis pedidos
      </Link>
      <Link href="/" className="text-sm text-zinc-500 transition-colors hover:text-amber-300">
        Volver a la tienda
      </Link>
    </div>
  );
}

/* ─── Pendiente ─── */
function PaymentPending() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 py-24 text-center sm:px-6">
      <span className="text-6xl" aria-hidden="true">🕐</span>
      <h1 className="text-3xl font-bold text-zinc-50">Pago pendiente</h1>
      <p className="text-lg text-zinc-400">
        Tu pedido está registrado pero el pago quedó pendiente. Te avisamos apenas se confirme desde Mercado Pago.
      </p>
      <Link href="/" className="rounded-full bg-amber-400 px-7 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-300">
        Volver a la tienda
      </Link>
    </div>
  );
}

/* ─── Error ─── */
function PaymentError() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 py-24 text-center sm:px-6">
      <span className="text-6xl" aria-hidden="true">⚠️</span>
      <h1 className="text-3xl font-bold text-zinc-50">El pago no se completó</h1>
      <p className="text-lg text-zinc-400">
        Podés volver a intentarlo con Mercado Pago o elegir transferencia bancaria.
      </p>
      <Link href="/carrito" className="rounded-full bg-amber-400 px-7 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-300">
        Volver al carrito
      </Link>
    </div>
  );
}

/* ─── Pedido registrado (transferencia) ─── */
function OrderPlaced({
  transfer,
  onReset,
}: {
  transfer?: Transfer;
  onReset: () => void;
}) {
  const ready = Boolean(transfer && (transfer.cbu || transfer.alias) && transfer.holder);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 py-24 text-center sm:px-6">
      <span className="text-6xl" aria-hidden="true">🎉</span>
      <h1 className="text-3xl font-bold text-zinc-50">Pedido registrado</h1>
      <p className="text-lg text-zinc-400">
        Gracias por tu compra. Tu pedido quedó pendiente de pago por transferencia bancaria.
      </p>

      {ready ? (
        <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-left">
          <h2 className="mb-4 text-lg font-semibold text-zinc-100">Datos para la transferencia</h2>
          <dl className="space-y-3 text-sm">
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
        </div>
      ) : (
        <p className="text-sm text-zinc-500">En breve te contactamos para coordinar el pago y el envío.</p>
      )}

      <button type="button" onClick={onReset} className="rounded-full bg-amber-400 px-7 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-300">
        Volver a la tienda
      </button>
    </div>
  );
}

/* ─── Carrito vacío ─── */
function EmptyCart() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 py-24 text-center sm:px-6">
      <span className="text-6xl" aria-hidden="true">🛒</span>
      <h1 className="text-3xl font-bold text-zinc-50">Tu carrito está vacío</h1>
      <p className="text-lg text-zinc-400">
        Todavía no agregaste nada. Explorá el catálogo y elegí tus piezas favoritas.
      </p>
      <Link href="/" className="rounded-full bg-amber-400 px-7 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-300">
        Ir al catálogo
      </Link>
    </div>
  );
}

/* ─── Export ─── */
export default function CartStatusPages({
  paymentRedirect,
  paymentOrderId,
  transfer,
  orderPlaced,
  isEmpty,
  onResetOrder,
}: {
  paymentRedirect?: PaymentRedirect;
  paymentOrderId?: string;
  transfer?: Transfer;
  orderPlaced: boolean;
  isEmpty: boolean;
  onResetOrder: () => void;
}) {
  if (paymentRedirect === "exito") return <PaymentSuccess orderId={paymentOrderId} />;
  if (paymentRedirect === "pendiente") return <PaymentPending />;
  if (paymentRedirect === "error") return <PaymentError />;
  if (orderPlaced) return <OrderPlaced transfer={transfer} onReset={onResetOrder} />;
  if (isEmpty) return <EmptyCart />;
  return null;
}
