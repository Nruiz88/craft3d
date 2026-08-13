import Link from "next/link";
import { requireUser } from "@/lib/auth-user";
import { getOrdersByUserId } from "@/lib/orders";
import { getAllProducts } from "@/lib/store";
import { formatPrice } from "@/lib/format";
import { getPlayerCoins, EARLY_OPEN_COST } from "@/lib/gamification";
import OpenBoxEarly from "@/components/open-box-early";
import {
  orderStatusLabels,
  paymentMethodLabels,
  type Order,
  type OrderStatus,
} from "@/lib/types";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

const statusAccent: Record<OrderStatus, string> = {
  pendiente: "border-amber-400/50 bg-amber-400/10 text-amber-300",
  reserva: "border-cyan-400/50 bg-cyan-400/10 text-cyan-300",
  pagado: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300",
  enviado: "border-sky-400/50 bg-sky-400/10 text-sky-300",
  entregado: "border-violet-400/50 bg-violet-400/10 text-violet-300",
  cancelado: "border-red-500/50 bg-red-500/10 text-red-300",
};

export default async function MisPedidosPage() {
  const user = await requireUser();
  const orders = await getOrdersByUserId(user.id);
  const [allProducts, coins] = await Promise.all([
    getAllProducts(),
    getPlayerCoins(user.id),
  ]);
  const boxSlugs = new Set(
    allProducts
      .filter((p) => p.category === "mystery-box")
      .map((p) => p.slug),
  );

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="pixel text-[10px] uppercase tracking-widest text-amber-300 neon-amber">
              ★ TU HISTORIAL ★
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-50">
              Mis pedidos
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {orders.length === 0
                ? "Todavía no hiciste ninguna compra."
                : `${orders.length} ${orders.length === 1 ? "pedido" : "pedidos"} en tu cuenta.`}
            </p>
          </div>
          <Link
            href="/cuenta"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-amber-400/60 hover:text-amber-300"
          >
            ← Volver a mi cuenta
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-14 text-center">
            <p className="text-4xl" aria-hidden="true">
              📦
            </p>
            <p className="mt-4 text-lg font-semibold text-zinc-200">
              Todavía no tenés pedidos
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              Cuando confirmes una compra, aparece acá con su estado y el
              detalle de la pieza sorpresa.
            </p>
            <Link
              href="/catalogo"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-400 px-7 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-300"
            >
              Ir al catálogo
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                boxSlugs={boxSlugs}
                coins={coins}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  boxSlugs,
  coins,
}: {
  order: Order;
  boxSlugs: Set<string>;
  coins: number;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-950/50 px-5 py-4">
        <div>
          <p className="font-semibold text-zinc-100">
            Pedido <span className="text-amber-300">#{order.id}</span>
          </p>
          <p className="text-xs text-zinc-500">
            {formatDate(order.createdAt)} · {paymentMethodLabels[order.paymentMethod]}
          </p>
        </div>
        <span
          className={`pixel rounded-sm border px-2.5 py-1 text-[9px] tracking-widest ${statusAccent[order.status]}`}
        >
          {orderStatusLabels[order.status].toUpperCase()}
        </span>
      </header>

      <ul className="divide-y divide-zinc-800/70">
        {order.items.map((item, index) => (
          <li
            key={index}
            className={`flex items-center justify-between gap-4 px-5 py-3 ${
              item.revealFor ? "bg-amber-950/20" : ""
            }`}
          >
            <div className="min-w-0">
              <p className="truncate text-sm text-zinc-200">
                {item.revealFor ? (
                  <span className="text-amber-300" aria-hidden="true">
                    🎁{" "}
                  </span>
                ) : null}
                {item.product_name}
                <span className="ml-1 text-zinc-500">×{item.quantity}</span>
              </p>
              {item.revealFor ? (
                <p className="mt-0.5 text-[11px] text-amber-400/80">
                  Pieza sorpresa revelada
                </p>
              ) : null}
              {boxSlugs.has(item.product_slug) &&
              item.quantity - Number(item.revealed ?? 0) > 0 ? (
                item.priority ? (
                  <p className="mt-1 text-[11px] text-orange-300">
                    🔥 En prioridad de revelación
                  </p>
                ) : (
                  <div className="mt-1.5">
                    <OpenBoxEarly
                      orderId={order.id}
                      itemIndex={index}
                      coins={coins}
                      cost={EARLY_OPEN_COST}
                    />
                  </div>
                )
              ) : null}
            </div>
            <span className="shrink-0 text-sm tabular-nums text-zinc-400">
              {item.subtotal === 0 ? "—" : formatPrice(item.subtotal)}
            </span>
          </li>
        ))}
      </ul>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 bg-zinc-950/50 px-5 py-4 text-sm">
        <div className="text-xs text-zinc-500">
          {order.discount > 0 ? (
            <p>Descuento: -{formatPrice(order.discount)}</p>
          ) : null}
          {order.shipping > 0 ? (
            <p>Envío: {formatPrice(order.shipping)}</p>
          ) : null}
        </div>
        <p className="font-bold tabular-nums text-zinc-100">
          Total: <span className="text-amber-400">{formatPrice(order.total)}</span>
        </p>
      </footer>
    </article>
  );
}
