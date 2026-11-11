import { requireAdmin } from "@/lib/auth";
import { getClients, buildClientOrderStats } from "@/lib/admin/clients";
import { getOrders } from "@/lib/orders";
import CsvExportButton from "@/components/admin/csv-export-button";
import { exportClientsCsvAction } from "@/app/admin/actions";
import ClientsList, { type ClientRow } from "@/components/admin/clients-list";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  await requireAdmin();

  const [{ users, contacts, error }, orders] = await Promise.all([
    getClients(),
    getOrders(),
  ]);

  const stats = buildClientOrderStats(users, orders);

  const rows: ClientRow[] = users.map((u) => {
    const contact = contacts.get(u.id);
    const name =
      contact?.full_name ||
      (u.user_metadata?.full_name as string | undefined) ||
      (u.user_metadata?.name as string | undefined) ||
      "";
    const s = stats.get(u.id) ?? { count: 0, total: 0, lastAt: null };
    return {
      id: u.id,
      name,
      email: u.email ?? "",
      phone: contact?.phone ?? "",
      city: contact?.city ?? "",
      province: contact?.province ?? "",
      address: contact?.address ?? "",
      postalCode: contact?.postal_code ?? "",
      provider: u.identities?.[0]?.provider ?? "email",
      confirmed: Boolean(u.email_confirmed_at),
      createdAt: u.created_at,
      ordersCount: s.count,
      totalSpent: s.total,
      lastOrderAt: s.lastAt,
    };
  });

  const providers = users.reduce<Record<string, number>>((acc, u) => {
    const p = u.identities?.[0]?.provider ?? "email";
    acc[p] = (acc[p] ?? 0) + 1;
    return acc;
  }, {});

  const confirmed = users.filter((u) => u.email_confirmed_at).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-amber-400">
              Panel de administración
            </p>
            <h1 className="mt-1 text-3xl font-bold text-zinc-50">Clientes</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Cuentas registradas en la tienda con sus datos de contacto.
            </p>
          </div>
          <CsvExportButton
            action={exportClientsCsvAction}
            filename="clientes-craft3d.csv"
            label="Exportar clientes CSV"
          />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-2xl font-bold tabular-nums text-zinc-50">{users.length}</p>
          <p className="mt-0.5 text-xs text-zinc-500">Clientes registrados</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-2xl font-bold tabular-nums text-zinc-50">{confirmed}</p>
          <p className="mt-0.5 text-xs text-zinc-500">Email confirmado</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-2xl font-bold tabular-nums text-zinc-50">
            {providers.google ?? 0}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">Cuentas Google</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-2xl font-bold tabular-nums text-zinc-50">
            {providers.email ?? 0}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">Cuentas por email</p>
        </div>
      </div>

      {error ? (
        <div
          className="mb-6 flex items-center gap-3 rounded-xl border border-red-900/70 bg-red-950/30 px-4 py-3 text-sm text-red-400"
          role="alert"
        >
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
          {error}
        </div>
      ) : null}

      {users.length === 0 ? (
        <div className="overflow-hidden rounded-2xl border border-zinc-800">
          <div className="bg-zinc-950/40 px-4 py-14 text-center">
            <p className="text-3xl" aria-hidden="true">
              👤
            </p>
            <p className="mt-3 font-medium text-zinc-300">Todavía no hay clientes</p>
            <p className="mt-1 text-sm text-zinc-500">
              Cuando alguien se registre o ingrese con Google, va a aparecer acá.
            </p>
          </div>
        </div>
      ) : (
        <ClientsList rows={rows} />
      )}
    </div>
  );
}
