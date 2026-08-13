import { requireAdmin } from "@/lib/auth";
import { getAdminLogs } from "@/lib/admin-log";

export const dynamic = "force-dynamic";

const actionStyles: Record<string, string> = {
  "crear producto": "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  "editar producto": "border-sky-500/40 bg-sky-500/10 text-sky-300",
  "borrar producto": "border-red-500/40 bg-red-500/10 text-red-400",
  destacar: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  "quitar destacado": "border-zinc-600 bg-zinc-800/60 text-zinc-300",
  stock: "border-violet-500/40 bg-violet-500/10 text-violet-300",
  "estado pedido": "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
  configuracion: "border-zinc-600 bg-zinc-800/60 text-zinc-300",
};

function actionColor(action: string): string {
  for (const [prefix, classes] of Object.entries(actionStyles)) {
    if (action.startsWith(prefix)) return classes;
  }
  return "border-zinc-600 bg-zinc-800/60 text-zinc-300";
}

function formatDate(value: string) {
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

export default async function AdminActivityPage() {
  await requireAdmin();

  const logs = await getAdminLogs(200);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-widest text-amber-400">
          Panel de administración
        </p>
        <h1 className="mt-1 text-3xl font-bold text-zinc-50">Actividad</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Registro de cambios realizados desde el panel (últimas 200).
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 px-4 py-14 text-center">
          <p className="text-3xl" aria-hidden="true">
            📋
          </p>
          <p className="mt-3 font-medium text-zinc-300">
            Todavía no hay actividad registrada
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Los cambios en productos, pedidos y configuración se van a registrar
            acá.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-zinc-800 overflow-hidden rounded-2xl border border-zinc-800">
          {logs.map((log) => (
            <li
              key={log.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-zinc-950/40 px-4 py-3"
            >
              <span
                className={`inline-flex w-fit rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${actionColor(log.action)}`}
              >
                {log.action}
              </span>
              <span className="min-w-0 flex-1 text-sm text-zinc-300">
                {log.detail}
              </span>
              <span className="shrink-0 text-xs tabular-nums text-zinc-600">
                {formatDate(log.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}