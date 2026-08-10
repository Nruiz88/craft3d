import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAllProducts } from "@/lib/store";
import { dropStatus } from "@/lib/drops";
import DropsTable from "@/components/admin/drops-table";

export const dynamic = "force-dynamic";

function getNow(): number {
  return Date.now();
}

export default async function AdminDropsPage({
  searchParams,
}: {
  searchParams: Promise<{ creado?: string; borrado?: string; guardado?: string }>;
}) {
  await requireAdmin();

  const [{ creado, borrado, guardado }, allProducts] = await Promise.all([
    searchParams,
    getAllProducts(),
  ]);

  const now = getNow();
  const drops = allProducts
    .filter((p) => p.category === "drops")
    .map((product) => ({ product, status: dropStatus(product, now) }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-violet-400">
            Drops · Ediciones numeradas
          </p>
          <h1 className="mt-1 text-3xl font-bold text-zinc-50">Drops</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Cargá y gestioná los drops. Cada uno tiene su ventana desde / hasta
            y se muestra en la página /drops.
          </p>
        </div>
        <Link
          href="/admin/drops/nuevo"
          className="inline-flex items-center gap-2 rounded-full bg-violet-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-colors hover:bg-violet-400"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nuevo drop
        </Link>
      </div>

      {creado === "1" ? (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-900/70 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-400">
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Drop creado correctamente.
        </div>
      ) : null}
      {guardado === "1" ? (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-900/70 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-400">
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Cambios guardados correctamente.
        </div>
      ) : null}
      {borrado === "1" ? (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-900/70 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-400">
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Drop eliminado.
        </div>
      ) : null}

      <DropsTable items={drops} />
    </div>
  );
}
