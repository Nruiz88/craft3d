import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getOrderById } from "@/lib/orders";
import { formatPrice } from "@/lib/utils/format";
import { formatDateTime } from "@/lib/utils/date";
import {
  orderStatusLabels,
  paymentMethodLabels,
  type OrderStatus,
} from "@/lib/products/types";
import OrderStatusSelect from "@/components/admin/order-status-select";

export const dynamic = "force-dynamic";

const statusStyles: Record<OrderStatus, string> = {
  pendiente: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  reserva: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
  pagado: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  enviado: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  entregado: "border-violet-500/40 bg-violet-500/10 text-violet-300",
  cancelado: "border-red-500/40 bg-red-500/10 text-red-400",
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const unitsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/admin/ventas"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-amber-300"
        >
          <span aria-hidden="true">←</span> Volver a Ventas
        </Link>
      </div>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-amber-400">
            Detalle del pedido
          </p>
          <h1 className="mt-1 flex flex-wrap items-center gap-3 text-3xl font-bold text-zinc-50">
            Pedido #{order.id}
            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${statusStyles[order.status]}`}
            >
              {orderStatusLabels[order.status]}
            </span>
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 px-5 py-3 text-right">
          <p className="text-xs text-zinc-500">Total</p>
          <p className="text-2xl font-bold tabular-nums text-zinc-50">
            {formatPrice(order.total)}
          </p>
        </div>
      </div>

      {order.isReservation ? (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 px-5 py-4">
          <span className="pixel rounded-sm border border-cyan-500/40 bg-cyan-500/10 px-2 py-1 text-[9px] tracking-widest text-cyan-300">
            🔒 RESERVA
          </span>
          <span className="text-sm text-zinc-300">
            Seña pagada:{" "}
            <strong className="tabular-nums text-emerald-300">
              {formatPrice(order.depositPaid)}
            </strong>
          </span>
          <span className="text-sm text-zinc-300">
            Resta abonar:{" "}
            <strong className="tabular-nums text-zinc-100">
              {formatPrice(order.total - order.depositPaid)}
            </strong>
          </span>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Cliente */}
        <Section title="Cliente">
          <Row label="Nombre" value={order.customer_name || "—"} />
          <Row
            label="Email"
            value={
              order.customer_email ? (
                <a
                  href={`mailto:${order.customer_email}`}
                  className="text-amber-300 hover:underline"
                >
                  {order.customer_email}
                </a>
              ) : (
                "—"
              )
            }
          />
          <Row
            label="Teléfono"
            value={
              order.shipping_phone ? (
                <a
                  href={`tel:${order.shipping_phone}`}
                  className="text-amber-300 hover:underline"
                >
                  {order.shipping_phone}
                </a>
              ) : (
                "—"
              )
            }
          />
          <Row
            label="Cuenta"
            value={order.user_id ? "Registrado" : "Invitado"}
          />
        </Section>

        {/* Pago */}
        <Section title="Pago">
          <Row
            label="Método"
            value={paymentMethodLabels[order.paymentMethod] ?? order.paymentMethod}
          />
          <Row label="Estado" value={orderStatusLabels[order.status]} />
          {order.paymentId ? (
            <Row
              label="ID de pago"
              value={<span className="font-mono text-xs">{order.paymentId}</span>}
            />
          ) : null}
          {order.mpPreferenceId ? (
            <Row
              label="Preferencia MP"
              value={
                <span className="font-mono text-xs">{order.mpPreferenceId}</span>
              }
            />
          ) : null}
        </Section>

        {/* Envío */}
        <Section title="Envío" className="lg:col-span-2">
          <Row
            label="Dirección"
            value={order.shipping_address || "Por coordinar"}
          />
          <Row label="Ciudad" value={order.shipping_city || "—"} />
          <Row label="Provincia" value={order.shipping_province || "—"} />
          <Row
            label="Código postal"
            value={order.shipping_postal_code || "—"}
          />
          <Row
            label="Costo de envío"
            value={
              order.shipping > 0 ? (
                <span className="tabular-nums">{formatPrice(order.shipping)}</span>
              ) : order.shipping_postal_code ? (
                <span className="text-emerald-400">Gratis</span>
              ) : (
                <span className="text-zinc-500">A coordinar</span>
              )
            }
          />
        </Section>
      </div>

      {/* Items */}
      <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Productos ({unitsCount} {unitsCount === 1 ? "unidad" : "unidades"})
        </h2>
        <ul className="divide-y divide-zinc-800">
          {order.items.map((item, index) => (
            <li
              key={`${order.id}-${index}`}
              className="flex items-start justify-between gap-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-100">
                  {item.product_name}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500 tabular-nums">
                  {item.quantity} × {formatPrice(item.price)}
                </p>
                {item.giftMessage ? (
                  <p className="mt-1 text-xs italic text-zinc-400">
                    🎁 “{item.giftMessage}”
                  </p>
                ) : null}
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-zinc-200">
                {formatPrice(item.subtotal)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4 space-y-1.5 border-t border-zinc-800 pt-4 text-sm">
          <TotalRow label="Subtotal" value={formatPrice(order.subtotal)} />
          {order.discount > 0 ? (
            <TotalRow
              label={`Descuento${order.couponCode ? ` (${order.couponCode})` : ""}`}
              value={`−${formatPrice(order.discount)}`}
              accent="text-emerald-400"
            />
          ) : null}
          <TotalRow
            label="Envío"
            value={
              order.shipping > 0
                ? formatPrice(order.shipping)
                : order.shipping_postal_code
                  ? "Gratis"
                  : "A coordinar"
            }
          />
          <div className="flex items-baseline justify-between border-t border-zinc-800 pt-2 text-base font-bold">
            <span className="text-zinc-300">Total</span>
            <span className="tabular-nums text-zinc-50">
              {formatPrice(order.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
        <span className="text-sm font-medium text-zinc-300">
          Cambiar estado:
        </span>
        <OrderStatusSelect orderId={order.id} status={order.status} />
      </div>
    </div>
  );
}

function Section({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 ${className}`}
    >
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
        {title}
      </h2>
      <dl className="space-y-2.5">{children}</dl>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
      <dt className="text-xs text-zinc-500">{label}</dt>
      <dd className="text-sm text-zinc-200 text-right break-words">{value}</dd>
    </div>
  );
}

function TotalRow({
  label,
  value,
  accent = "text-zinc-200",
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-zinc-500">{label}</span>
      <span className={`tabular-nums ${accent}`}>{value}</span>
    </div>
  );
}
