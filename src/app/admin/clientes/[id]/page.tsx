import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getClients, orderBelongsToClient } from "@/lib/admin/clients";
import { getOrders } from "@/lib/orders";
import { formatPrice } from "@/lib/utils/format";
import { formatDate, formatDateTime } from "@/lib/utils/date";
import { orderStatusLabels, type OrderStatus } from "@/lib/products/types";

export const dynamic = "force-dynamic";

const statusStyles: Record<OrderStatus, string> = {
  pendiente: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  reserva: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
  pagado: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  enviado: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  entregado: "border-violet-500/40 bg-violet-500/10 text-violet-300",
  cancelado: "border-red-500/40 bg-red-500/10 text-red-400",
};

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const [{ users, contacts }, orders] = await Promise.all([
    getClients(),
    getOrders(),
  ]);

  const client = users.find((u) => u.id === id);
  if (!client) notFound();

  const contact = contacts.get(client.id);
  const name =
    contact?.full_name ||
    (client.user_metadata?.full_name as string | undefined) ||
    (client.user_metadata?.name as string | undefined) ||
    "Cliente";

  const clientOrders = orders.filter((o) =>
    orderBelongsToClient(o, { id: client.id, email: client.email }),
  );
  const sellable = clientOrders.filter((o) => o.status !== "cancelado");
  const totalSpent = sellable.reduce((sum, o) => sum + o.total, 0);
  const avgTicket = sellable.length ? totalSpent / sellable.length : 0;
  const lastOrderAt = clientOrders[0]?.createdAt ?? null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/admin/clientes"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-amber-300"
        >
          <span aria-hidden="true">←</span> Volver a Clientes
        </Link>
      </div>

      <div className="mb-8 flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-lg font-semibold text-amber-300">
          {initials(name, client.email ?? "")}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium uppercase tracking-widest text-amber-400">
            Cliente
          </p>
          <h1 className="truncate text-3xl font-bold text-zinc-50">{name}</h1>
          <p className="truncate text-sm text-zinc-500">{client.email}</p>
        </div>
      </div>

      {/* KPIs del cliente */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Pedidos" value={String(clientOrders.length)} />
        <Kpi
          label="Total gastado"
          value={formatPrice(totalSpent)}
          accent="text-emerald-300"
        />
        <Kpi label="Ticket promedio" value={formatPrice(avgTicket)} accent="text-amber-300" />
        <Kpi
          label="Último pedido"
          value={lastOrderAt ? formatDate(lastOrderAt) : "—"}
        />
      </div>

      {/* Contacto */}
      <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Datos de contacto
        </h2>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
          <Row
            label="Email"
            value={
              client.email ? (
                <a href={`mailto:${client.email}`} className="text-amber-300 hover:underline">
                  {client.email}
                </a>
              ) : (
                "—"
              )
            }
          />
          <Row
            label="Teléfono"
            value={
              contact?.phone ? (
                <a href={`tel:${contact.phone}`} className="text-amber-300 hover:underline">
                  {contact.phone}
                </a>
              ) : (
                "—"
              )
            }
          />
          <Row label="Dirección" value={contact?.address || "—"} />
          <Row label="Ciudad" value={contact?.city || "—"} />
          <Row label="Provincia" value={contact?.province || "—"} />
          <Row label="Código postal" value={contact?.postal_code || "—"} />
          <Row label="Alta" value={formatDate(client.created_at)} />
        </dl>
      </div>

      {/* Pedidos del cliente */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Historial de pedidos ({clientOrders.length})
        </h2>
        {clientOrders.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500">
            Este cliente todavía no hizo pedidos.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {clientOrders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/admin/ventas/${order.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 transition-colors hover:text-amber-300"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-100">
                      Pedido #{order.id}
                      <span className="ml-2 text-xs font-normal text-zinc-500">
                        {formatDateTime(order.createdAt)}
                      </span>
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {order.items.reduce((s, i) => s + i.quantity, 0)} art. ·{" "}
                      {order.items.map((i) => i.product_name).join(", ")}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[order.status]}`}
                    >
                      {orderStatusLabels[order.status]}
                    </span>
                    <span className="text-sm font-bold tabular-nums text-zinc-50">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function initials(name: string, email: string): string {
  const source = name.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const last = parts[1]?.[0] ?? "";
  return (first + last).toUpperCase();
}

function Kpi({
  label,
  value,
  accent = "text-zinc-50",
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <p className={`text-xl font-bold leading-tight tabular-nums break-words sm:text-2xl ${accent}`}>
        {value}
      </p>
      <p className="mt-0.5 text-xs text-zinc-500">{label}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
      <dt className="text-xs text-zinc-500">{label}</dt>
      <dd className="text-sm text-zinc-200 text-right break-words">{value}</dd>
    </div>
  );
}
