import { requireAdmin } from "@/lib/auth";
import { getAllProducts } from "@/lib/store";
import { getWaitlistEntries } from "@/lib/waitlist";
import DeleteWaitlistButton from "@/components/admin/delete-waitlist-button";

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

export default async function AdminWaitlistPage() {
  await requireAdmin();

  const [entries, allProducts] = await Promise.all([
    getWaitlistEntries(),
    getAllProducts(),
  ]);

  const nameBySlug = new Map<string, string>();
  allProducts.forEach((product) => nameBySlug.set(product.slug, product.name));
  nameBySlug.set("drop-001", "DROP 001");

  const bySlug = new Map<string, { name: string; entries: typeof entries }>();
  entries.forEach((entry) => {
    const group = bySlug.get(entry.productSlug) ?? {
      name: nameBySlug.get(entry.productSlug) ?? entry.productSlug,
      entries: [],
    };
    group.entries.push(entry);
    bySlug.set(entry.productSlug, group);
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-widest text-amber-400">
          Drops · Lista de espera
        </p>
        <h1 className="mt-1 text-3xl font-bold text-zinc-50">
          Lista de espera
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Personas que se anotaron para que les avisemos cuando abra un drop.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-2xl font-bold tabular-nums text-zinc-50">
            {entries.length}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">Anotados en total</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-2xl font-bold tabular-nums text-zinc-50">
            {bySlug.size}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">Drops con anotados</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-2xl font-bold tabular-nums text-zinc-50">
            {entries.filter((entry) => entry.whatsapp).length}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">Con WhatsApp</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-2xl font-bold tabular-nums text-zinc-50">
            {entries.filter((entry) => !entry.whatsapp).length}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">Solo email</p>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 px-4 py-14 text-center">
          <p className="text-3xl" aria-hidden="true">
            🔔
          </p>
          <p className="mt-3 font-medium text-zinc-300">
            Todavía no hay nadie en la lista de espera
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            La lista se llena desde la página de drops, el panel del próximo
            drop y la home.
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
                <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-0.5 text-xs font-medium text-amber-300">
                  {group.entries.length}{" "}
                  {group.entries.length === 1 ? "anotado" : "anotados"}
                </span>
              </div>

              <div className="overflow-hidden rounded-2xl border border-zinc-800">
                <ul className="divide-y divide-zinc-800">
                  {group.entries.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex flex-wrap items-center gap-x-6 gap-y-3 bg-zinc-950/40 px-4 py-3.5 transition-colors hover:bg-zinc-900/60"
                    >
                      <div className="flex min-w-[220px] flex-1 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-sm font-semibold text-amber-300">
                          {(entry.email[0] ?? "?").toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-zinc-100">
                            {entry.email}
                          </p>
                          {entry.whatsapp ? (
                            <p className="truncate text-xs text-zinc-500">
                              WhatsApp: {entry.whatsapp}
                            </p>
                          ) : (
                            <p className="truncate text-xs text-zinc-600">
                              Sin WhatsApp
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="hidden w-40 text-xs tabular-nums text-zinc-500 lg:block">
                        {formatDate(entry.createdAt)}
                      </div>

                      <DeleteWaitlistButton id={entry.id} />
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
