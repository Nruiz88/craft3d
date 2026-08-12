import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAllProducts } from "@/lib/store";
import { getOrders } from "@/lib/orders";
import { getRestockRequests } from "@/lib/restock";
import { formatPrice } from "@/lib/format";
import { orderStatusLabels, type Order, type OrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<OrderStatus, string> = {
  pendiente: "bg-amber-400",
  reserva: "bg-cyan-400",
  pagado: "bg-emerald-400",
  enviado: "bg-sky-400",
  entregado: "bg-violet-400",
  cancelado: "bg-red-400",
};

const statuses: OrderStatus[] = [
  "pendiente",
  "reserva",
  "pagado",
  "enviado",
  "entregado",
  "cancelado",
];

const DAY_MS = 86_400_000;

function currentMillis(): number {
  return Date.now();
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [products, orders, restockRequests] = await Promise.all([
    getAllProducts(),
    getOrders(),
    getRestockRequests(),
  ]);

  const now = currentMillis();
  const monthAgo = now - 30 * DAY_MS;

  const monthOrders = orders.filter(
    (order) => new Date(order.createdAt).getTime() >= monthAgo,
  );
  const sellableMonth = monthOrders.filter((order) => order.status !== "cancelado");

  const revenueMonth = sellableMonth.reduce((sum, order) => sum + order.total, 0);
  const pending = orders.filter(
    (order) => order.status === "pendiente" || order.status === "reserva",
  );

  const activeDrops = products.filter(
    (p) =>
      p.category === "drops" &&
      (!p.dropEndsAt || new Date(p.dropEndsAt).getTime() > now),
  );

  const inventoryValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  const byStatus = new Map<OrderStatus, number>();
  for (const order of orders) {
    byStatus.set(order.status, (byStatus.get(order.status) ?? 0) + 1);
  }
  const maxStatus = Math.max(1, ...statuses.map((s) => byStatus.get(s) ?? 0));

  const top = new Map<string, { name: string; quantity: number; revenue: number }>();
  for (const order of sellableMonth) {
    for (const item of order.items) {
      const entry = top.get(item.product_slug) ?? {
        name: item.product_name,
        quantity: 0,
        revenue: 0,
      };
      entry.quantity += item.quantity;
      entry.revenue += item.subtotal;
      top.set(item.product_slug, entry);
    }
  }
  const topProducts = [...top.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  const recentOrders = orders.slice(0, 5);

  const kpis = [
    {
      label: "Ingresos · 30 días",
      value: formatPrice(revenueMonth),
      accent: "text-emerald-300",
      href: "/admin/ventas?period=30",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 3v18h18" />
          <path d="m7 15 4-4 3 3 5-6" />
        </svg>
      ),
    },
    {
      label: "Pedidos · 30 días",
      value: String(monthOrders.length),
      accent: "text-zinc-50",
      href: "/admin/ventas?period=30",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      label: "Pendientes de pago",
      value: String(pending.length),
      accent: "text-amber-300",
      href: "/admin/ventas?status=pendiente",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v10" />
          <path d="M16 10.5c-.5-.7-1.2-1-2-1-1.6 0-2.5.8-2.5 1.8s.9 1.5 2.5 1.9 2.5.8 2.5 1.8-1 1.8-2.5 1.8c-.8 0-1.6-.4-2-1.1" />
        </svg>
      ),
    },
    {
      label: "Avisos de reposición",
      value: String(restockRequests.length),
      accent: "text-cyan-300",
      href: "/admin/restock",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 12a9 9 0 0 1 15.36-6.36L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-15.36 6.36L3 16" />
          <path d="M3 21v-5h5" />
        </svg>
      ),
    },
    {
      label: "Drops activos",
      value: String(activeDrops.length),
      accent: "text-violet-300",
      href: "/admin/drops",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7Z" />
          <path d="M9 15a3 3 0 0 0 3 3" />
        </svg>
      ),
    },
    {
      label: "Valor del inventario",
      value: formatPrice(inventoryValue),
      accent: "text-amber-300",
      href: "/admin/productos",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
          <path d="m3 8 9 5 9-5" />
          <path d="M12 13v8" />
        </svg>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-amber-400">
            Panel de administración
          </p>
          <h1 className="mt-1 text-3xl font-bold text-zinc-50">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Resumen de la tienda en los últimos 30 días.
          </p>
        </div>
        <Link
          href="/admin/ventas"
          className="text-sm font-medium text-amber-300 transition-colors hover:text-amber-200"
        >
          Ver ventas →
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {kpis.map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className="group rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 transition-colors hover:border-amber-400/40"
          >
            <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-950/60 text-amber-300">
              {kpi.icon}
            </div>
            <p className={`text-2xl font-bold tabular-nums ${kpi.accent}`}>
              {kpi.value}
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">
              {kpi.label} <span className="text-amber-400/80">→</span>
            </p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Últimos pedidos
            </h2>
            <Link
              href="/admin/ventas"
              className="text-xs font-medium text-amber-300 transition-colors hover:text-amber-200"
            >
              Ver todos →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 px-4 py-12 text-center">
              <p className="text-3xl" aria-hidden="true">
                🛍️
              </p>
              <p className="mt-3 font-medium text-zinc-300">
                Todavía no hay pedidos
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Los pedidos aparecen acá cuando un cliente confirma su compra.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {recentOrders.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Pedidos por estado
            </h2>
            <div className="overflow-hidden rounded-2xl border border-zinc-800">
              <ul className="divide-y divide-zinc-800 bg-zinc-950/40">
                {statuses.map((status) => {
                  const count = byStatus.get(status) ?? 0;
                  const pct = Math.round((count / maxStatus) * 100);
                  return (
                    <li key={status} className="px-4 py-2.5">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="flex items-center gap-2 text-zinc-300">
                          <span
                            className={`h-2 w-2 rounded-full ${STATUS_COLORS[status]}`}
                            aria-hidden="true"
                          />
                          {orderStatusLabels[status]}
                        </span>
                        <span className="font-semibold tabular-nums text-zinc-100">
                          {count}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className={`h-full rounded-full ${STATUS_COLORS[status]}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Más vendidos · 30 días
            </h2>
            <div className="overflow-hidden rounded-2xl border border-zinc-800">
              {topProducts.length === 0 ? (
                <p className="bg-zinc-950/40 px-4 py-8 text-center text-sm text-zinc-500">
                  Sin ventas en el período
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
          </section>
        </div>
      </div>
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  const statusColor: Record<OrderStatus, string> = {
    pendiente: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    reserva: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
    pagado: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    enviado: "border-sky-500/40 bg-sky-500/10 text-sky-300",
    entregado: "border-violet-500/40 bg-violet-500/10 text-violet-300",
    cancelado: "border-red-500/40 bg-red-500/10 text-red-400",
  };

  return (
    <li className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
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
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColor[order.status]}`}
          >
            {orderStatusLabels[order.status]}
          </span>
          <span className="text-lg font-bold tabular-nums text-zinc-50">
            {formatPrice(order.total)}
          </span>
        </div>
      </div>
    </li>
  );
}
