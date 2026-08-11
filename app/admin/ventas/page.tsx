import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getOrders } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { orderStatusLabels, type Order, type OrderStatus } from "@/lib/types";
import OrderStatusSelect from "@/components/admin/order-status-select";

export const dynamic = "force-dynamic";

const statuses: OrderStatus[] = [
  "pendiente",
  "reserva",
  "pagado",
  "enviado",
  "entregado",
  "cancelado",
];

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function filterHref(period: string, status: string): string {
  const params = new URLSearchParams();
  if (period !== "30") params.set("period", period);
  if (status !== "all") params.set("status", status);
  const qs = params.toString();
  return qs ? `/admin/ventas?${qs}` : "/admin/ventas";
}

function currentMillis(): number {
  return Date.now();
}

const pill = (active: boolean) =>
  `rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
    active
      ? "border-amber-400/50 bg-amber-400/10 text-amber-300"
      : "border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
  }`;

export default async function AdminSalesPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; status?: string }>;
}) {
  await requireAdmin();

  const [{ period: periodParam, status: statusParam }, orders] =
    await Promise.all([searchParams, getOrders()]);

  const period = periodParam === "90" || periodParam === "all" ? periodParam : "30";
  const status = statuses.includes(statusParam as OrderStatus)
    ? (statusParam as OrderStatus)
    : "all";

  const days = period === "all" ? Infinity : Number(period);
  const cutoff = currentMillis() - days * 86_400_000;

  const filtered = orders.filter((order) => {
    if (days !== Infinity && new Date(order.createdAt).getTime() < cutoff) {
      return false;
    }
    if (status !== "all" && order.status !== status) return false;
    return true;
  });

  const sellable = filtered.filter((order) => order.status !== "cancelado");
  const revenue = sellable.reduce((sum, order) => sum + order.total, 0);
  const units = sellable.reduce(
    (sum, order) =>
      sum + order.items.reduce((s, item) => s + item.quantity, 0),
    0,
  );
  const avgTicket = sellable.length ? revenue / sellable.length : 0;

  const top = new Map<
    string,
    { name: string; quantity: number; revenue: number }
  >();
  for (const order of sellable) {
    for (const item of order.items) {
      const key = item.product_slug || item.product_name;
      const entry = top.get(key) ?? {
        name: item.product_name,
        quantity: 0,
        revenue: 0,
      };
      entry.quantity += item.quantity;
      entry.revenue += item.subtotal;
      top.set(key, entry);
    }
  }
  const topProducts = [...top.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  const stats = [
    {
      label: "Ingresos",
      value: formatPrice(revenue),
      accent: "text-emerald-300",
    },
    { label: "Pedidos", value: String(filtered.length), accent: "text-zinc-50" },
    { label: "Unidades vendidas", value: String(units), accent: "text-zinc-50" },
    { label: "Ticket promedio", value: formatPrice(avgTicket), accent: "text-amber-300" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-widest text-amber-400">
          Panel de administración
        </p>
        <h1 className="mt-1 text-3xl font-bold text-zinc-50">Ventas</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Métricas y pedidos de la tienda.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {(
          [
            { value: "30", label: "Últimos 30 días" },
            { value: "90", label: "Últimos 90 días" },
            { value: "all", label: "Todo" },
          ] as const
        ).map((option) => (
          <Link
            key={option.value}
            href={filterHref(option.value, status)}
            className={pill(period === option.value)}
          >
            {option.label}
          </Link>
        ))}
        <span className="mx-1 hidden h-5 w-px bg-zinc-800 sm:block" />
        <Link href={filterHref(period, "all")} className={pill(status === "all")}>
          Todos los estados
        </Link>
        {statuses.map((value) => (
          <Link
            key={value}
            href={filterHref(period, value)}
            className={pill(status === value)}
          >
            {orderStatusLabels[value]}
          </Link>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5"
          >
            <p className={`text-2xl font-bold tabular-nums ${stat.accent}`}>
              {stat.value}
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 px-4 py-14 text-center">
          <p className="text-3xl" aria-hidden="true">
            🛍️
          </p>
          <p className="mt-3 font-medium text-zinc-300">
            Todavía no hay pedidos en este período
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Los pedidos se registran cuando un cliente confirma la compra desde
            el carrito.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Pedidos
            </h2>
            <ul className="space-y-4">
              {filtered.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Productos más vendidos
            </h2>
            <div className="overflow-hidden rounded-2xl border border-zinc-800">
              {topProducts.length === 0 ? (
                <p className="bg-zinc-950/40 px-4 py-8 text-center text-sm text-zinc-500">
                  Sin ventas para mostrar
                </p>
              ) : (
                <ul className="divide-y divide-zinc-800">
                  {topProducts.map((product, index) => (
                    <li
                      key={product.name}
                      className="flex items-center gap-3 bg-zinc-950/40 px-4 py-3"
                    >
                      <span className="w-5 shrink-0 text-sm font-bold tabular-nums text-zinc-600">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-100">
                          {product.name}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {product.quantity} unid.
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-zinc-200">
                        {formatPrice(product.revenue)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  return (
    <li className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-zinc-100">
            Pedido #{order.id}
            <span className="ml-2 text-xs font-normal text-zinc-500">
              {formatDate(order.createdAt)}
            </span>
          </p>
          <p className="truncate text-sm text-zinc-500">
            {order.customer_name} · {order.customer_email}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusSelect orderId={order.id} status={order.status} />
          <span className="text-lg font-bold tabular-nums text-zinc-50">
            {formatPrice(order.total)}
          </span>
        </div>
      </div>

      {order.isReservation ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="pixel rounded-sm border border-cyan-500/40 bg-cyan-500/10 px-2 py-1 text-[9px] tracking-widest text-cyan-300">
            🔒 RESERVA
          </span>
          <span className="text-xs text-zinc-500">
            Seña:{" "}
            <strong className="text-emerald-300 tabular-nums">
              {formatPrice(order.depositPaid)}
            </strong>
            {" · "}
            Resta:{" "}
            <strong className="text-zinc-200 tabular-nums">
              {formatPrice(order.total - order.depositPaid)}
            </strong>
          </span>
        </div>
      ) : null}

      <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3">
        {order.items.map((item, index) => (
          <p
            key={`${order.id}-${index}`}
            className="flex items-baseline justify-between gap-3 text-sm"
          >
            <span className="min-w-0 text-zinc-300">
              <span className="font-medium text-zinc-100">
                {item.quantity}×
              </span>{" "}
              <span className="line-clamp-1">{item.product_name}</span>
            </span>
            <span className="shrink-0 tabular-nums text-zinc-500">
              {formatPrice(item.subtotal)}
            </span>
          </p>
        ))}
        {order.discount > 0 ? (
          <p className="mt-1 flex items-baseline justify-between gap-3 border-t border-zinc-800/70 pt-2 text-sm">
            <span className="text-zinc-500">
              Descuento{" "}
              {order.couponCode ? (
                <span className="font-mono text-[10px] text-zinc-600">
                  {order.couponCode}
                </span>
              ) : null}
            </span>
            <span className="shrink-0 font-semibold tabular-nums text-emerald-400">
              −{formatPrice(order.discount)}
            </span>
          </p>
        ) : null}
      </div>

      <p className="mt-3 text-xs text-zinc-500">
        Envío a:{" "}
        {order.shipping_address
          ? `${order.shipping_address}, ${order.shipping_city}${order.shipping_province ? `, ${order.shipping_province}` : ""}${order.shipping_postal_code ? ` (CP ${order.shipping_postal_code})` : ""}`
          : "por coordinar"}{" "}
        · Tel: {order.shipping_phone || "—"}
      </p>
    </li>
  );
}
