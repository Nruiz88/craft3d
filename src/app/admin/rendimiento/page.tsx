import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import {
  getMetaDashboard,
  isMetaConfigured,
  type MetaDatePreset,
  type MetaResult,
} from "@/lib/analytics/meta-ads";
import {
  getGa4Summary,
  isGa4Configured,
  type Ga4Range,
  type Ga4Result,
} from "@/lib/analytics/ga4";

export const dynamic = "force-dynamic";

export const metadata = { title: "Rendimiento · Marketing" };

type PeriodKey = "7" | "30" | "90";

const PERIODS: { key: PeriodKey; label: string; meta: MetaDatePreset; ga4: Ga4Range }[] = [
  { key: "7", label: "7 días", meta: "last_7d", ga4: "7daysAgo" },
  { key: "30", label: "30 días", meta: "last_30d", ga4: "30daysAgo" },
  { key: "90", label: "90 días", meta: "last_90d", ga4: "90daysAgo" },
];

// ── Formateadores (es-AR) ──
const nf = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });
const fmtInt = (n: number) => nf.format(Math.round(n));
function fmtMoney(n: number, currency = "ARS") {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}
const fmtDec = (n: number, d = 2) =>
  new Intl.NumberFormat("es-AR", { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
const fmtPct = (n: number) => `${fmtDec(n, 2)}%`;
function fmtDuration(seconds: number) {
  const s = Math.round(seconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}m ${r}s` : `${r}s`;
}
function fmtAgo(ts: number) {
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins <= 0) return "recién";
  if (mins === 1) return "hace 1 min";
  if (mins < 60) return `hace ${mins} min`;
  const h = Math.round(mins / 60);
  return `hace ${h} h`;
}

export default async function RendimientoPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  await requireAdmin();
  const { period } = await searchParams;
  const current = PERIODS.find((p) => p.key === period) ?? PERIODS[1];

  const [meta, ga4] = await Promise.all([
    isMetaConfigured() ? getMetaDashboard(current.meta) : Promise.resolve<MetaResult>({ ok: false, error: "no_config" }),
    isGa4Configured() ? getGa4Summary(current.ga4) : Promise.resolve<Ga4Result>({ ok: false, error: "no_config" }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-amber-400">
            Marketing
          </p>
          <h1 className="mt-1 text-3xl font-bold text-zinc-50">Rendimiento</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Facebook/Instagram Ads, Píxel y Google Analytics 4.
          </p>
        </div>
        <div className="flex gap-1 rounded-full border border-zinc-800 bg-zinc-900/60 p-1">
          {PERIODS.map((p) => (
            <Link
              key={p.key}
              href={`/admin/rendimiento?period=${p.key}`}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                p.key === current.key
                  ? "bg-amber-400 text-zinc-950"
                  : "text-zinc-400 hover:text-zinc-100"
              }`}
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      <MetaSection result={meta} />
      <div className="my-10 h-px bg-zinc-800" />
      <Ga4Section result={ga4} />
    </div>
  );
}

// ────────────────────────────── META ──────────────────────────────

function MetaSection({ result }: { result: MetaResult }) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#1877F2]/15 text-[#4a9bff]">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.01 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8v8.44C19.61 23.08 24 18.09 24 12.07Z" />
          </svg>
        </span>
        <h2 className="text-lg font-bold text-zinc-100">Facebook / Instagram Ads</h2>
        {result.ok ? (
          <span className="ml-auto text-xs text-zinc-600">
            cuenta act_{result.accountId} · {fmtAgo(result.fetchedAt)}
          </span>
        ) : null}
      </div>

      {!result.ok && result.error === "no_config" ? (
        <ConnectCard
          title="Conectá tu cuenta de Meta Ads"
          intro="Para traer el gasto, las compras y el ROAS en vivo, la web necesita un token propio (el MCP no corre en el servidor). Cargá estas variables en Coolify:"
          vars={[
            ["META_ACCESS_TOKEN", "token con permiso ads_read (System User o de larga duración)"],
            ["META_AD_ACCOUNT_ID", "id de la cuenta (ej. 63243870, sin el prefijo act_)"],
          ]}
          steps={[
            "Entrá a developers.facebook.com → tu app (o creá una) → Herramientas → Graph API Explorer.",
            "Pedí un token con el permiso ads_read y, si podés, extendelo a larga duración (o generá un System User en Configuración del negocio).",
            "Copiá el token en META_ACCESS_TOKEN y el id de la cuenta en META_AD_ACCOUNT_ID.",
            "Reiniciá el deploy en Coolify. El dashboard se llena solo.",
          ]}
        />
      ) : !result.ok ? (
        <ErrorCard message={result.error} />
      ) : (
        <MetaData data={result} />
      )}
    </section>
  );
}

function MetaData({ data }: { data: Extract<MetaResult, { ok: true }> }) {
  const k = data.kpis;
  const sinDatos = k.spend === 0 && k.impressions === 0;

  return (
    <>
      {sinDatos ? (
        <p className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-sm text-zinc-400">
          No hay actividad publicitaria en este período. Cuando haya anuncios corriendo, los
          números aparecen acá.
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Inversión" value={fmtMoney(k.spend, k.currency)} accent="text-zinc-50" big />
        <Kpi
          label="Compras (Píxel)"
          value={fmtInt(k.purchases)}
          sub={k.purchaseValue > 0 ? `${fmtMoney(k.purchaseValue, k.currency)} en ventas` : undefined}
          accent="text-emerald-300"
          big
        />
        <Kpi
          label="ROAS"
          value={k.roas > 0 ? `${fmtDec(k.roas)}x` : "—"}
          sub="retorno por $ invertido"
          accent={k.roas >= 1 ? "text-emerald-300" : "text-amber-300"}
          big
        />
        <Kpi
          label="Costo por compra"
          value={k.purchases > 0 ? fmtMoney(k.costPerPurchase, k.currency) : "—"}
          accent="text-zinc-50"
          big
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Kpi label="Impresiones" value={fmtInt(k.impressions)} />
        <Kpi label="Alcance" value={fmtInt(k.reach)} />
        <Kpi label="Clics" value={fmtInt(k.clicks)} />
        <Kpi label="CTR" value={fmtPct(k.ctr)} />
        <Kpi label="CPC" value={fmtMoney(k.cpc, k.currency)} />
        <Kpi label="CPM" value={fmtMoney(k.cpm, k.currency)} />
      </div>

      {(k.addToCart > 0 || k.initiateCheckout > 0 || k.landingPageViews > 0) && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          <Kpi label="Vistas de landing" value={fmtInt(k.landingPageViews)} />
          <Kpi label="Agregó al carrito" value={fmtInt(k.addToCart)} />
          <Kpi label="Inició checkout" value={fmtInt(k.initiateCheckout)} />
        </div>
      )}

      {data.campaigns.length > 0 ? (
        <div className="mt-8">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Por campaña
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-zinc-800">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/60 text-left text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-4 py-3 font-semibold">Campaña</th>
                  <th className="px-4 py-3 text-right font-semibold">Gasto</th>
                  <th className="px-4 py-3 text-right font-semibold">Impres.</th>
                  <th className="px-4 py-3 text-right font-semibold">Clics</th>
                  <th className="px-4 py-3 text-right font-semibold">CTR</th>
                  <th className="px-4 py-3 text-right font-semibold">CPC</th>
                  <th className="px-4 py-3 text-right font-semibold">Compras</th>
                  <th className="px-4 py-3 text-right font-semibold">ROAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {data.campaigns.map((c) => (
                  <tr key={c.id} className="bg-zinc-900/30">
                    <td className="max-w-[220px] truncate px-4 py-3 font-medium text-zinc-200">
                      {c.name}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-100">
                      {fmtMoney(c.spend, k.currency)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-400">
                      {fmtInt(c.impressions)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-400">
                      {fmtInt(c.clicks)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-400">
                      {fmtPct(c.ctr)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-400">
                      {fmtMoney(c.cpc, k.currency)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-100">
                      {fmtInt(c.purchases)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-semibold tabular-nums ${
                        c.roas >= 1 ? "text-emerald-300" : "text-zinc-400"
                      }`}
                    >
                      {c.roas > 0 ? `${fmtDec(c.roas)}x` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </>
  );
}

// ────────────────────────────── GA4 ──────────────────────────────

function Ga4Section({ result }: { result: Ga4Result }) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#E8710A]/15 text-[#f59e2b]">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M22.84 2.9v18.23A2.86 2.86 0 0 1 17.3 22l-.03-.08V2.76a2.86 2.86 0 0 1 5.57.14ZM4.3 17.4a2.85 2.85 0 1 0 0 5.7 2.85 2.85 0 0 0 0-5.7Zm6.84-8.56a2.86 2.86 0 0 0-2.83 3.2v9.06l.03.08a2.86 2.86 0 0 0 5.54-.94V11.7a2.86 2.86 0 0 0-2.74-2.86Z" />
          </svg>
        </span>
        <h2 className="text-lg font-bold text-zinc-100">Google Analytics 4</h2>
        {result.ok ? (
          <span className="ml-auto text-xs text-zinc-600">{fmtAgo(result.fetchedAt)}</span>
        ) : null}
      </div>

      {!result.ok && result.error === "no_config" ? (
        <ConnectCard
          title="Conectá Google Analytics 4"
          intro="El tag de GA4 ya envía datos; para LEERLOS en el panel hace falta una cuenta de servicio de Google Cloud con rol Lector en la propiedad. Cargá en Coolify:"
          vars={[
            ["GA4_PROPERTY_ID", "id numérico de la propiedad (Admin → Configuración de la propiedad)"],
            ["GA4_CLIENT_EMAIL", "email de la cuenta de servicio (…@….iam.gserviceaccount.com)"],
            ["GA4_PRIVATE_KEY", "campo private_key del JSON de la cuenta de servicio"],
          ]}
          steps={[
            "En console.cloud.google.com creá un proyecto → habilitá la Google Analytics Data API.",
            "Creá una cuenta de servicio, generá una clave JSON y descargala.",
            "En GA4 → Administrar → Acceso a la propiedad, agregá el email de la cuenta de servicio con rol Lector.",
            "Pegá property id, client_email y private_key en las variables y reiniciá el deploy.",
          ]}
        />
      ) : !result.ok ? (
        <ErrorCard message={result.error} />
      ) : (
        <Ga4Data data={result} />
      )}
    </section>
  );
}

function Ga4Data({ data }: { data: Extract<Ga4Result, { ok: true }> }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Usuarios activos" value={fmtInt(data.activeUsers)} accent="text-zinc-50" big />
        <Kpi label="Sesiones" value={fmtInt(data.sessions)} accent="text-zinc-50" big />
        <Kpi label="Conversiones" value={fmtInt(data.conversions)} accent="text-emerald-300" big />
        <Kpi
          label="Ingresos"
          value={data.revenue > 0 ? fmtMoney(data.revenue) : "—"}
          accent="text-emerald-300"
          big
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Kpi label="Usuarios nuevos" value={fmtInt(data.newUsers)} />
        <Kpi label="Vistas de página" value={fmtInt(data.pageViews)} />
        <Kpi label="Engagement" value={fmtPct(data.engagementRate * 100)} />
        <Kpi label="Duración media" value={fmtDuration(data.avgSessionDuration)} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <RankList
          title="Fuentes de tráfico"
          rows={data.channels.map((c) => ({ name: c.name, value: fmtInt(c.sessions) }))}
          empty="Sin datos de canales"
        />
        <RankList
          title="Páginas más vistas"
          rows={data.pages.map((p) => ({ name: p.name, value: fmtInt(p.views) }))}
          empty="Sin datos de páginas"
        />
      </div>
    </>
  );
}

// ────────────────────────────── UI compartida ──────────────────────────────

function Kpi({
  label,
  value,
  sub,
  accent = "text-zinc-50",
  big = false,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  big?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p
        className={`mt-1 font-bold tabular-nums ${big ? "text-2xl" : "text-lg"} leading-tight ${accent}`}
      >
        {value}
      </p>
      {sub ? <p className="mt-0.5 text-xs text-zinc-500">{sub}</p> : null}
    </div>
  );
}

function RankList({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: { name: string; value: string }[];
  empty: string;
}) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">{title}</h3>
      <div className="overflow-hidden rounded-2xl border border-zinc-800">
        {rows.length === 0 ? (
          <p className="bg-zinc-950/40 px-4 py-8 text-center text-sm text-zinc-500">{empty}</p>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {rows.map((r, i) => (
              <li key={`${r.name}-${i}`} className="flex items-center gap-3 bg-zinc-950/40 px-4 py-2.5">
                <span className="w-4 shrink-0 text-xs font-bold tabular-nums text-zinc-600">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-zinc-200">{r.name}</span>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-zinc-100">
                  {r.value}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function ConnectCard({
  title,
  intro,
  vars,
  steps,
}: {
  title: string;
  intro: string;
  vars: [string, string][];
  steps: string[];
}) {
  return (
    <div className="rounded-2xl border border-dashed border-amber-400/30 bg-amber-400/5 p-6">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-400/15 text-amber-300">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10.3 13.7a4 4 0 0 1 0-5.4l3-3a4 4 0 0 1 5.4 5.4l-1.3 1.3" />
            <path d="M13.7 10.3a4 4 0 0 1 0 5.4l-3 3a4 4 0 0 1-5.4-5.4l1.3-1.3" />
          </svg>
        </span>
        <div className="min-w-0">
          <h3 className="font-semibold text-amber-200">{title}</h3>
          <p className="mt-1 text-sm text-zinc-400">{intro}</p>

          <dl className="mt-4 space-y-2">
            {vars.map(([name, desc]) => (
              <div key={name} className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
                <dt className="shrink-0">
                  <code className="rounded bg-zinc-950 px-1.5 py-0.5 text-xs font-semibold text-amber-300">
                    {name}
                  </code>
                </dt>
                <dd className="text-xs text-zinc-500">{desc}</dd>
              </div>
            ))}
          </dl>

          <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-sm text-zinc-400 marker:text-zinc-600">
            {steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
      <p className="text-sm font-semibold text-red-300">No se pudieron traer los datos</p>
      <p className="mt-1 break-words text-sm text-zinc-400">{message}</p>
      <p className="mt-2 text-xs text-zinc-600">
        Revisá que el token / las credenciales sigan vigentes y con los permisos correctos.
      </p>
    </div>
  );
}
