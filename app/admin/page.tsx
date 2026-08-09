import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAllProducts } from "@/lib/store";
import { getClients } from "@/lib/clients";
import { getOrders } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import ProductTable from "@/components/admin/product-table";

export const dynamic = "force-dynamic";

const stats = [
  {
    key: "total",
    label: "Productos",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
        <path d="m3 8 9 5 9-5" />
        <path d="M12 13v8" />
      </svg>
    ),
    classes: "border-amber-400/25 text-amber-300",
  },
  {
    key: "featured",
    label: "Destacados",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" />
      </svg>
    ),
    classes: "border-violet-500/30 text-violet-300",
  },
  {
    key: "agotados",
    label: "Agotados",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    ),
    classes: "border-red-500/30 text-red-400",
  },
  {
    key: "valor",
    label: "Valor del inventario",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M16 8.5c-.7-.7-1.8-1-3-1-2 0-3.5 1-3.5 2.5S11 12 14 12.5s3.5 1 3.5 2.5-1.5 2.5-3.5 2.5c-1.2 0-2.3-.3-3-1" />
        <path d="M12 6v12" />
      </svg>
    ),
    classes: "border-emerald-500/30 text-emerald-400",
  },
  {
    key: "clientes",
    label: "Clientes",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    classes: "border-sky-500/30 text-sky-300",
  },
  {
    key: "ingresos",
    label: "Ingresos",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 3v18h18" />
        <path d="m7 15 4-4 3 3 5-6" />
      </svg>
    ),
    classes: "border-emerald-500/30 text-emerald-400",
  },
];

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ creado?: string; borrado?: string }>;
}) {
  await requireAdmin();

  const [{ creado, borrado }, products, clients, orders] = await Promise.all([
    searchParams,
    getAllProducts(),
    getClients(),
    getOrders(),
  ]);

  const ingresos = orders
    .filter((order) => order.status !== "cancelado")
    .reduce((sum, order) => sum + order.total, 0);

  const values = {
    total: products.length,
    featured: products.filter((p) => p.featured).length,
    agotados: products.filter((p) => p.stock <= 0).length,
    valor: products.reduce((sum, p) => sum + p.price * p.stock, 0),
    clientes: clients.users.length,
    ingresos,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-amber-400">
            Panel de administración
          </p>
          <h1 className="mt-1 text-3xl font-bold text-zinc-50">Productos</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Gestioná el catálogo de la tienda Craft3d.
          </p>
        </div>
        <Link
          href="/admin/nuevo"
          className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-400/20 transition-colors hover:bg-amber-300"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nuevo producto
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => {
          const value =
            stat.key === "valor" || stat.key === "ingresos"
              ? formatPrice(values[stat.key as keyof typeof values])
              : String(values[stat.key as keyof typeof values]);
          const card = (
            <div
              className="h-full rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 transition-colors"
            >
              <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-zinc-950/60 ${stat.classes}`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold tabular-nums text-zinc-50">{value}</p>
              <p className="mt-0.5 text-xs text-zinc-500">{stat.label}</p>
            </div>
          );
          return stat.key === "ingresos" ? (
            <Link key={stat.key} href="/admin/ventas" className="group">
              <div className="h-full rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 transition-colors group-hover:border-amber-400/40">
                <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-zinc-950/60 ${stat.classes}`}>
                  {stat.icon}
                </div>
                <p className="text-2xl font-bold tabular-nums text-zinc-50">{value}</p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {stat.label} <span className="text-amber-400/80">→</span>
                </p>
              </div>
            </Link>
          ) : (
            <div key={stat.key}>{card}</div>
          );
        })}
      </div>

      {creado === "1" ? (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-900/70 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-400">
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Producto creado correctamente.
        </div>
      ) : null}
      {borrado === "1" ? (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-900/70 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-400">
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Producto eliminado.
        </div>
      ) : null}

      <ProductTable products={products} />
    </div>
  );
}
