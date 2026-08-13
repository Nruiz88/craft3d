import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAllProducts } from "@/lib/store";
import MysteryBoxTable from "@/components/admin/mystery-box-table";

export const dynamic = "force-dynamic";

export default async function AdminMysteryBoxPage({
  searchParams,
}: {
  searchParams: Promise<{ creado?: string; borrado?: string; guardado?: string }>;
}) {
  await requireAdmin();

  const [{ creado, borrado, guardado }, allProducts] = await Promise.all([
    searchParams,
    getAllProducts(),
  ]);

  const boxes = allProducts.filter((p) => p.category === "mystery-box");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-amber-400">
            Mystery box · Cajas sorpresa
          </p>
          <h1 className="mt-1 text-3xl font-bold text-zinc-50">Cajas sorpresa</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Gestioná las cajas con su pool, precio y stock. Cada caja es un
            producto con su propia sección en /mysterybox.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/mysterybox/revelaciones"
            className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 px-6 py-2.5 text-sm font-semibold text-amber-300 transition-colors hover:bg-amber-400/10"
          >
            🎲 Revelaciones
          </Link>
          <Link
            href="/admin/mysterybox/nuevo"
            className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-400/25 transition-colors hover:bg-amber-300"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nueva caja
          </Link>
        </div>
      </div>

      {creado === "1" ? (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-900/70 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-400">
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Caja creada correctamente.
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
          Caja eliminada.
        </div>
      ) : null}

      <MysteryBoxTable items={boxes} />
    </div>
  );
}
