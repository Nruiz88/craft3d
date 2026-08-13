import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getOrders } from "@/lib/orders";
import { getAllProducts } from "@/lib/store";
import { mysteryPoolLabel, parseMysteryPool } from "@/lib/mystery-box";
import RevealPanel from "@/components/admin/reveal-panel";

export const dynamic = "force-dynamic";

export interface RevealEntry {
  orderId: number;
  customerName: string;
  createdAt: string;
  boxName: string;
  boxSlug: string;
  boxEmoji: string;
  poolLabel: string;
  itemIndex: number;
  pending: number;
  revealed: number;
  priority: boolean;
}

export default async function AdminRevelacionesPage() {
  await requireAdmin();

  const [orders, allProducts] = await Promise.all([getOrders(), getAllProducts()]);
  const boxes = allProducts.filter((p) => p.category === "mystery-box");
  const boxBySlug = new Map(boxes.map((b) => [b.slug, b]));

  const entries: RevealEntry[] = [];
  for (const order of orders) {
    order.items.forEach((item, itemIndex) => {
      const box = boxBySlug.get(item.product_slug);
      if (!box) return;
      const revealed = Number(item.revealed ?? 0);
      const pending = item.quantity - revealed;
      if (pending <= 0) return;
      entries.push({
        orderId: order.id,
        customerName: order.customer_name,
        createdAt: order.createdAt,
        boxName: box.name,
        boxSlug: box.slug,
        boxEmoji: box.emoji,
        poolLabel: mysteryPoolLabel(parseMysteryPool(box.tags)),
        itemIndex,
        pending,
        revealed,
        priority: Boolean(item.priority),
      });
    });
  }

  entries.sort(
    (a, b) =>
      Number(b.priority) - Number(a.priority) ||
      b.createdAt.localeCompare(a.createdAt),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-widest text-amber-400">
          Mystery box · Cajas sorpresa
        </p>
        <h1 className="mt-1 text-3xl font-bold text-zinc-50">Revelaciones</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Pedidos con cajas sorpresa pendientes de revelar. Al revelar, se
          descuenta el stock de la pieza sorteada y el cliente la ve en su
          cuenta.
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-14 text-center">
          <p className="text-4xl" aria-hidden="true">
            🎁
          </p>
          <p className="mt-4 text-lg font-semibold text-zinc-200">
            No hay revelaciones pendientes
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Cuando un cliente compre una caja sorpresa, aparece acá para que
            reveles la pieza.
          </p>
        </div>
      ) : (
        <RevealPanel entries={entries} />
      )}

      <div className="mt-10">
        <Link
          href="/admin/mysterybox"
          className="text-sm font-medium text-amber-300 transition-colors hover:text-amber-200"
        >
          ← Volver a cajas sorpresa
        </Link>
      </div>
    </div>
  );
}
