import { requireAdmin } from "@/lib/auth";
import { getAllProducts } from "@/lib/store";
import { getRestockRequests } from "@/lib/restock";
import DeleteRestockButton from "@/components/admin/delete-restock-button";
import NotifyRestockButton from "@/components/admin/notify-restock-button";

export const dynamic = "force-dynamic";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminRestockPage() {
  await requireAdmin();

  const [requests, allProducts] = await Promise.all([
    getRestockRequests(),
    getAllProducts(),
  ]);

  const nameBySlug = new Map<string, string>();
  allProducts.forEach((product) => nameBySlug.set(product.slug, product.name));

  const stockBySlug = new Map<string, number>();
  allProducts.forEach((product) => stockBySlug.set(product.slug, product.stock));

  const bySlug = new Map<string, { name: string; requests: typeof requests }>();
  requests.forEach((request) => {
    const group = bySlug.get(request.productSlug) ?? {
      name: nameBySlug.get(request.productSlug) ?? request.productSlug,
      requests: [],
    };
    group.requests.push(request);
    bySlug.set(request.productSlug, group);
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-widest text-cyan-400">
          Catálogo · Reposición
        </p>
        <h1 className="mt-1 text-3xl font-bold text-zinc-50">
          Avisos de reposición
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Personas que pidieron que les avisemos cuando un producto agotado
          vuelva a tener stock.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-2xl font-bold tabular-nums text-zinc-50">
            {requests.length}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">Anotados en total</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-2xl font-bold tabular-nums text-zinc-50">
            {bySlug.size}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">Productos con avisos</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-2xl font-bold tabular-nums text-zinc-50">
            {requests.filter((request) => request.whatsapp).length}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">Con WhatsApp</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-2xl font-bold tabular-nums text-zinc-50">
            {requests.filter((request) => !request.whatsapp).length}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">Solo email</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 px-4 py-14 text-center">
          <p className="text-3xl" aria-hidden="true">
            📦
          </p>
          <p className="mt-3 font-medium text-zinc-300">
            Todavía no hay avisos de reposición
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Los avisos se llenan desde la página de cada producto agotado.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {[...bySlug.entries()].map(([slug, group]) => (
            <section key={slug}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-zinc-100">
                  {group.name}
                </h2>
                <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-0.5 text-xs font-medium text-cyan-300">
                  {group.requests.length}{" "}
                  {group.requests.length === 1 ? "anotado" : "anotados"}
                </span>
              </div>

              <div className="mb-3 flex items-center gap-3">
                {(stockBySlug.get(slug) ?? 0) > 0 ? (
                  <NotifyRestockButton slug={slug} count={group.requests.length} />
                ) : (
                  <span className="text-xs text-zinc-600">
                    El producto sigue agotado (stock 0). Cuando repongas, avisá acá.
                  </span>
                )}
              </div>

              <div className="overflow-hidden rounded-2xl border border-zinc-800">
                <ul className="divide-y divide-zinc-800">
                  {group.requests.map((request) => (
                    <li
                      key={request.id}
                      className="flex flex-wrap items-center gap-x-6 gap-y-3 bg-zinc-950/40 px-4 py-3.5 transition-colors hover:bg-zinc-900/60"
                    >
                      <div className="flex min-w-[220px] flex-1 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-sm font-semibold text-cyan-300">
                          {(request.email[0] ?? "?").toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-zinc-100">
                            {request.email}
                          </p>
                          {request.whatsapp ? (
                            <p className="truncate text-xs text-zinc-500">
                              WhatsApp: {request.whatsapp}
                            </p>
                          ) : (
                            <p className="truncate text-xs text-zinc-600">
                              Sin WhatsApp
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="hidden w-40 text-xs tabular-nums text-zinc-500 lg:block">
                        {formatDate(request.createdAt)}
                      </div>

                      <DeleteRestockButton id={request.id} />
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
