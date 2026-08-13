import { requireAdmin } from "@/lib/auth";
import { getClients } from "@/lib/clients";
import CsvExportButton from "@/components/admin/csv-export-button";
import { exportClientsCsvAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

function initials(name: string, email: string): string {
  const source = name.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const last = parts[1]?.[0] ?? "";
  return (first + last).toUpperCase();
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

const providerLabels: Record<string, string> = {
  email: "Email",
  google: "Google",
};

export default async function AdminClientsPage() {
  await requireAdmin();

  const { users, contacts, error } = await getClients();

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

      <div className="overflow-hidden rounded-2xl border border-zinc-800">
        {users.length === 0 ? (
          <div className="bg-zinc-950/40 px-4 py-14 text-center">
            <p className="text-3xl" aria-hidden="true">
              👤
            </p>
            <p className="mt-3 font-medium text-zinc-300">Todavía no hay clientes</p>
            <p className="mt-1 text-sm text-zinc-500">
              Cuando alguien se registre o ingrese con Google, va a aparecer acá.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {users.map((u) => {
              const contact = contacts.get(u.id);
              const name =
                contact?.full_name ||
                (u.user_metadata?.full_name as string | undefined) ||
                (u.user_metadata?.name as string | undefined) ||
                "";
              const provider = u.identities?.[0]?.provider ?? "email";
              const confirmedBadge = u.email_confirmed_at;
              return (
                <li
                  key={u.id}
                  className="flex flex-wrap items-center gap-x-6 gap-y-3 bg-zinc-950/40 px-4 py-3.5 transition-colors hover:bg-zinc-900/60"
                >
                  <div className="flex min-w-[220px] flex-1 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-sm font-semibold text-amber-300">
                      {initials(name, u.email ?? "")}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-zinc-100">
                        {name || "Cliente"}
                      </p>
                      <p className="truncate text-xs text-zinc-500">{u.email}</p>
                    </div>
                  </div>

                  <div className="w-44">
                    <p className="truncate text-sm text-zinc-300">
                      {contact?.phone || "—"}
                    </p>
                    <p className="truncate text-xs text-zinc-600">
                      {contact?.city || "Sin ciudad"}
                      {contact?.province ? `, ${contact.province}` : ""}
                    </p>
                    {contact?.address ? (
                      <p className="truncate text-xs text-zinc-600">
                        {contact.address}
                        {contact.postal_code ? ` · ${contact.postal_code}` : ""}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex w-28 flex-col gap-1">
                    <span
                      className={`inline-flex w-fit items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        provider === "google"
                          ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                          : "border-amber-500/40 bg-amber-500/10 text-amber-300"
                      }`}
                    >
                      {providerLabels[provider] ?? provider}
                    </span>
                    {!confirmedBadge ? (
                      <span className="w-fit rounded-full border border-red-900/60 bg-red-950/30 px-2.5 py-0.5 text-xs text-red-400">
                        Sin confirmar
                      </span>
                    ) : null}
                  </div>

                  <div className="hidden w-24 text-xs tabular-nums text-zinc-500 lg:block">
                    Alta: {formatDate(u.created_at)}
                  </div>
                  <div className="hidden w-24 text-xs tabular-nums text-zinc-500 lg:block">
                    Acceso: {formatDate(u.last_sign_in_at)}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
