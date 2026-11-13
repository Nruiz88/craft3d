import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getOrdersLite } from "@/lib/orders";
import {
  getMetaDashboard,
  isMetaConfigured,
  type MetaDatePreset,
  type MetaKpis,
  type MetaResult,
} from "@/lib/analytics/meta-ads";
import {
  getGa4Summary,
  getGa4Totals,
  isGa4Configured,
  type Ga4Range,
  type Ga4Result,
} from "@/lib/analytics/ga4";
import {
  getGscDashboard,
  isGscConfigured,
  type GscResult,
  type GscRow,
} from "@/lib/analytics/gsc";

export const dynamic = "force-dynamic";

export const metadata = { title: "Rendimiento · Marketing" };

type PeriodKey = "7" | "30" | "90";

const PERIODS: {
  key: PeriodKey;
  label: string;
  meta: MetaDatePreset;
  ga4: Ga4Range;
  /** Rango GA4 del período ANTERIOR (para comparar). */
  ga4Prev: [string, string];
  days: number;
}[] = [
  { key: "7", label: "7 días", meta: "last_7d", ga4: "7daysAgo", ga4Prev: ["14daysAgo", "8daysAgo"], days: 7 },
  { key: "30", label: "30 días", meta: "last_30d", ga4: "30daysAgo", ga4Prev: ["60daysAgo", "31daysAgo"], days: 30 },
  { key: "90", label: "90 días", meta: "last_90d", ga4: "90daysAgo", ga4Prev: ["180daysAgo", "91daysAgo"], days: 90 },
];

const DAY_MS = 86_400_000;

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
const fmtPct = (n: number) => `${fmtDec(n, 1)}%`;
function currentMillis(): number {
  return Date.now();
}
function fmtAgo(ts: number) {
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins <= 0) return "recién";
  if (mins < 60) return `hace ${mins} min`;
  return `hace ${Math.round(mins / 60)} h`;
}

// ── Ventas reales de la tienda (DB) en el período ──
type RealSales = { orders: number; revenue: number; paidOrders: number; pending: number };
async function getRealSales(sinceMs: number, untilMs?: number): Promise<RealSales> {
  try {
    const lite = await getOrdersLite({ sinceMs, untilMs });
    const sellable = lite.filter((o) => o.status !== "cancelado");
    const paid = sellable.filter((o) =>
      ["pagado", "enviado", "entregado"].includes(o.status),
    );
    return {
      orders: sellable.length,
      revenue: sellable.reduce((s, o) => s + o.total, 0),
      paidOrders: paid.length,
      pending: sellable.filter((o) => o.status === "pendiente").length,
    };
  } catch {
    return { orders: 0, revenue: 0, paidOrders: 0, pending: 0 };
  }
}

// ── Insights accionables ──
type Insight = { tone: "good" | "warn" | "bad" | "info"; text: string };
function buildInsights(meta: MetaResult, sales: RealSales, currency: string): Insight[] {
  const out: Insight[] = [];
  const k = meta.ok ? meta.kpis : null;
  const hasAds = !!k && k.spend > 0;

  if (!hasAds) {
    out.push({
      tone: "info",
      text: "No hay inversión publicitaria en el período. Cuando corra la campaña vas a ver acá si da ganancia.",
    });
  } else if (k) {
    if (k.purchases === 0 && k.clicks > 0) {
      out.push({
        tone: "bad",
        text: `La gente hace clic (${fmtInt(k.clicks)}) pero el Píxel no registró ni una compra. El cuello de botella no es atraer, es CONVERTIR: revisá precio, confianza y que el checkout funcione.`,
      });
    } else if (k.roas >= 2) {
      out.push({
        tone: "good",
        text: `ROAS ${fmtDec(k.roas)}x: cada $1 en ads te devuelve $${fmtDec(k.roas)}. Si se sostiene, conviene subir presupuesto.`,
      });
    } else if (k.roas >= 1) {
      out.push({
        tone: "warn",
        text: `ROAS ${fmtDec(k.roas)}x: recuperás lo invertido pero con poco margen. Afiná creatividad o público.`,
      });
    } else if (k.purchases > 0) {
      out.push({
        tone: "bad",
        text: `ROAS ${fmtDec(k.roas)}x: gastás más de lo que recuperás por ahora (${fmtMoney(k.spend, currency)} invertidos, ${fmtMoney(k.purchaseValue, currency)} en ventas atribuidas).`,
      });
    }

    if (k.ctr >= 2) {
      out.push({
        tone: "good",
        text: `CTR ${fmtPct(k.ctr)} (alto): el anuncio engancha. Si falla algo, es después del clic.`,
      });
    } else if (k.ctr > 0 && k.ctr < 1) {
      out.push({
        tone: "warn",
        text: `CTR ${fmtPct(k.ctr)} (bajo): poca gente hace clic. Probá otra creatividad o público.`,
      });
    }
  }

  // Tienda real vs atribución de Meta
  if (k && sales.orders > k.purchases) {
    out.push({
      tone: "info",
      text: `Tu tienda registró ${fmtInt(sales.orders)} pedido(s) real(es) en el período, pero Meta atribuye ${fmtInt(k.purchases)}. La diferencia suele ser ventas por WhatsApp u otros canales que el Píxel no mide.`,
    });
  }

  return out.slice(0, 4);
}

export default async function RendimientoPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  await requireAdmin();
  const { period } = await searchParams;
  const current = PERIODS.find((p) => p.key === period) ?? PERIODS[1];
  const nowMs = currentMillis();
  const sinceMs = nowMs - current.days * DAY_MS;
  const prevSince = nowMs - 2 * current.days * DAY_MS;

  const [meta, ga4, sales, prevSales, prevGa4, gsc] = await Promise.all([
    isMetaConfigured()
      ? getMetaDashboard(current.meta)
      : Promise.resolve<MetaResult>({ ok: false, error: "no_config" }),
    isGa4Configured()
      ? getGa4Summary(current.ga4, true)
      : Promise.resolve<Ga4Result>({ ok: false, error: "no_config" }),
    getRealSales(sinceMs),
    getRealSales(prevSince, sinceMs),
    getGa4Totals(current.ga4Prev[0], current.ga4Prev[1], true),
    isGscConfigured()
      ? getGscDashboard(current.days)
      : Promise.resolve<GscResult>({ ok: false, error: "no_config" }),
  ]);
  const gscEmail = process.env.GA4_CLIENT_EMAIL?.trim() ?? "";

  const curVisits = ga4.ok ? ga4.sessions : 0;
  const prevVisits = prevGa4.ok ? prevGa4.sessions : 0;
  const currency = meta.ok ? meta.kpis.currency : "ARS";
  const insights = buildInsights(meta, sales, currency);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-amber-400">Marketing</p>
          <h1 className="mt-1 text-3xl font-bold text-zinc-50">Rendimiento</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Qué pasa con tu plata: ads, tienda real y tráfico — solo Argentina 🇦🇷
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

      {/* 1 · VEREDICTO */}
      <Verdict meta={meta} sales={sales} currency={currency} />

      {/* 2 · QUÉ HACER */}
      {insights.length > 0 ? (
        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Qué mirar ahora
          </h2>
          <ul className="space-y-2">
            {insights.map((ins, i) => (
              <InsightRow key={i} insight={ins} />
            ))}
          </ul>
        </section>
      ) : null}

      {/* 3 · EMBUDO */}
      {meta.ok ? (
        <section className="mt-8">
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Embudo · del anuncio a la compra
          </h2>
          <p className="mb-3 text-xs text-zinc-600">
            Dónde se cae la gente. Las etapas intermedias solo se miden desde que el Píxel quedó activo.
          </p>
          <Funnel kpis={meta.kpis} />
        </section>
      ) : null}

      <div className="my-8 h-px bg-zinc-800" />

      {/* 4 · CONVERSIÓN (vs período anterior) */}
      <Conversion
        current={{ visits: curVisits, orders: sales.orders, revenue: sales.revenue }}
        previous={{ visits: prevVisits, orders: prevSales.orders, revenue: prevSales.revenue }}
        ga4Ok={ga4.ok}
        currency={currency}
      />

      <div className="my-8 h-px bg-zinc-800" />

      {/* 5 · TIENDA + WEB (AR) */}
      <StoreWeb sales={sales} ga4={ga4} currency={currency} />

      <div className="my-8 h-px bg-zinc-800" />

      {/* 5 · DETALLE ADS */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-lg font-bold text-zinc-100">Detalle de los anuncios</h2>
          {meta.ok ? (
            <span className="ml-auto text-xs text-zinc-600">
              cuenta act_{meta.accountId} · {fmtAgo(meta.fetchedAt)}
            </span>
          ) : null}
        </div>
        {!meta.ok && meta.error === "no_config" ? (
          <ConnectCard
            title="Conectá Meta Ads"
            intro="Cargá en Coolify el token para leer el gasto, las compras y el ROAS:"
            vars={[
              ["META_ACCESS_TOKEN", "token con permiso ads_read"],
              ["META_AD_ACCOUNT_ID", "id de la cuenta (ej. 63243870)"],
            ]}
          />
        ) : !meta.ok ? (
          <ErrorCard message={meta.error} />
        ) : (
          <MetaDetail data={meta} />
        )}
      </section>

      <div className="my-8 h-px bg-zinc-800" />

      {/* 7 · BÚSQUEDAS EN GOOGLE (SEO) */}
      <GscSection data={gsc} email={gscEmail} />
    </div>
  );
}

// ────────────────────────── SEARCH CONSOLE ──────────────────────────

function GscSection({ data, email }: { data: GscResult; email: string }) {
  return (
    <section>
      <div className="mb-1 flex items-center gap-2">
        <h2 className="text-lg font-bold text-zinc-100">Búsquedas en Google · SEO</h2>
        {data.ok ? (
          <span className="ml-auto text-xs text-zinc-600">{fmtAgo(data.fetchedAt)}</span>
        ) : null}
      </div>
      <p className="mb-4 text-xs text-zinc-600">
        Cómo aparece craft3d en el buscador de Google. Es distinto de las visitas de Analytics:
        acá se mide cuánta gente te ve y te clickea desde las búsquedas.
      </p>

      {!data.ok ? (
        data.error === "no_config" ? (
          <ConnectCard
            title="Conectá Search Console"
            intro="Usa la misma cuenta de servicio que Google Analytics. Configurá GA4 primero."
            vars={[
              ["GA4_CLIENT_EMAIL", "email de la cuenta de servicio"],
              ["GA4_PRIVATE_KEY", "clave de la cuenta de servicio"],
            ]}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-amber-400/30 bg-amber-400/5 p-6">
            <h3 className="font-semibold text-amber-200">Falta darle acceso en Search Console</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Agregá esta cuenta de servicio como usuario con permiso de lectura en Search Console →
              Configuración → Usuarios y permisos:
            </p>
            {email ? (
              <code className="mt-3 block break-all rounded bg-zinc-950 px-2.5 py-1.5 text-xs font-semibold text-amber-300">
                {email}
              </code>
            ) : null}
            <p className="mt-3 break-words text-xs text-zinc-600">{data.error}</p>
          </div>
        )
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Clics", value: fmtInt(data.clicks) },
              { label: "Impresiones", value: fmtInt(data.impressions) },
              { label: "CTR", value: fmtPct(data.ctr * 100) },
              { label: "Posición media", value: fmtDec(data.position, 1) },
            ].map((k) => (
              <div key={k.label} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                <p className="text-xs text-zinc-500">{k.label}</p>
                <p className="mt-1 text-xl font-bold tabular-nums text-zinc-50">{k.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <GscList
              title="Búsquedas que te encuentran"
              rows={data.queries}
              empty="Todavía no hay búsquedas con datos en este período."
            />
            <GscList
              title="Páginas que aparecen en Google"
              rows={data.pages}
              empty="Todavía no hay páginas con datos en este período."
            />
          </div>
        </>
      )}
    </section>
  );
}

function GscList({ title, rows, empty }: { title: string; rows: GscRow[]; empty: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
      <h3 className="mb-3 text-sm font-semibold text-zinc-300">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-xs text-zinc-600">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r, i) => (
            <li key={i} className="flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0 truncate text-zinc-300">{r.key}</span>
              <span className="shrink-0 text-xs tabular-nums text-zinc-500">
                <span className="font-semibold text-zinc-200">{fmtInt(r.clicks)}</span> clics ·{" "}
                {fmtInt(r.impressions)} impr.
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ────────────────────────── VEREDICTO ──────────────────────────

// ────────────────────────── CONVERSIÓN ──────────────────────────

type Period = { visits: number; orders: number; revenue: number };

function pctChange(cur: number, prev: number): { pct: number; up: boolean; isNew: boolean } | null {
  if (prev <= 0) return cur > 0 ? { pct: 0, up: true, isNew: true } : null;
  const d = ((cur - prev) / prev) * 100;
  return { pct: Math.abs(d), up: d >= 0, isNew: false };
}

function Delta({ cur, prev }: { cur: number; prev: number }) {
  const c = pctChange(cur, prev);
  if (!c) return <span className="text-[11px] text-zinc-600">sin dato previo</span>;
  if (c.isNew) return <span className="text-[11px] font-semibold text-emerald-300">▲ nuevo</span>;
  return (
    <span className={`text-[11px] font-semibold ${c.up ? "text-emerald-300" : "text-red-300"}`}>
      {c.up ? "▲" : "▼"} {fmtDec(c.pct, 0)}%{" "}
      <span className="font-normal text-zinc-600">vs. anterior</span>
    </span>
  );
}

function CompareCard({
  label,
  cur,
  prev,
  fmt,
}: {
  label: string;
  cur: number;
  prev: number;
  fmt: (n: number) => string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums text-zinc-50">{fmt(cur)}</p>
      <p className="mt-0.5">
        <Delta cur={cur} prev={prev} />
      </p>
    </div>
  );
}

function Conversion({
  current,
  previous,
  ga4Ok,
  currency,
}: {
  current: Period;
  previous: Period;
  ga4Ok: boolean;
  currency: string;
}) {
  const curRate = current.visits > 0 ? (current.orders / current.visits) * 100 : null;
  const prevRate = previous.visits > 0 ? (previous.orders / previous.visits) * 100 : null;

  return (
    <section>
      <h2 className="mb-4 text-lg font-bold text-zinc-100">Conversión de la tienda</h2>

      {!ga4Ok ? (
        <p className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-sm text-zinc-400">
          La tasa de conversión necesita las visitas de GA4. Conectá Google Analytics (abajo) para verla.
        </p>
      ) : (
        <>
          <div className="rounded-2xl border border-emerald-500/20 bg-zinc-900/60 p-5">
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div>
                <p className="text-xs text-zinc-500">Tasa de conversión · visitas → compra</p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-emerald-300">
                  {curRate !== null ? fmtPct(curRate) : "—"}
                </p>
                {curRate !== null && prevRate !== null ? <Delta cur={curRate} prev={prevRate} /> : null}
              </div>
              <div className="flex items-center gap-3 text-center">
                <div>
                  <p className="text-2xl font-bold tabular-nums text-zinc-50">{fmtInt(current.visits)}</p>
                  <p className="text-[11px] text-zinc-500">visitas (AR)</p>
                </div>
                <span className="text-xl text-zinc-600">→</span>
                <div>
                  <p className="text-2xl font-bold tabular-nums text-emerald-300">{fmtInt(current.orders)}</p>
                  <p className="text-[11px] text-zinc-500">pedidos</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <CompareCard label="Visitas (AR)" cur={current.visits} prev={previous.visits} fmt={fmtInt} />
            <CompareCard label="Pedidos" cur={current.orders} prev={previous.orders} fmt={fmtInt} />
            <CompareCard
              label="Facturación"
              cur={current.revenue}
              prev={previous.revenue}
              fmt={(n) => fmtMoney(n, currency)}
            />
            <CompareCard
              label="Tasa de conversión"
              cur={curRate ?? 0}
              prev={prevRate ?? 0}
              fmt={(n) => fmtPct(n)}
            />
          </div>
          <p className="mt-2 text-[11px] text-zinc-600">
            Comparado con el período anterior. La conversión por canal (orgánico vs ads) necesita sumar
            eventos de e-commerce a GA4 — se puede agregar.
          </p>
        </>
      )}
    </section>
  );
}

function Verdict({
  meta,
  sales,
  currency,
}: {
  meta: MetaResult;
  sales: RealSales;
  currency: string;
}) {
  const k = meta.ok ? meta.kpis : null;
  const hasAds = !!k && k.spend > 0;

  let tone: "good" | "warn" | "bad" | "info" = "info";
  let title = "Sin inversión en ads en el período";
  let sub = "Cuando la campaña corra, acá te digo si da ganancia.";

  if (hasAds && k) {
    if (k.purchases === 0) {
      tone = "bad";
      title = `Gastaste ${fmtMoney(k.spend, currency)} en ads y 0 compras registradas`;
      sub = "El Píxel no registró ventas de esas visitas. La fuga está en convertir, no en atraer.";
    } else if (k.roas >= 1) {
      tone = "good";
      title = `Las ads dan ganancia · ROAS ${fmtDec(k.roas)}x`;
      sub = `Invertiste ${fmtMoney(k.spend, currency)} y generaste ${fmtMoney(k.purchaseValue, currency)} en ventas atribuidas.`;
    } else {
      tone = "warn";
      title = `Las ads todavía no dan ganancia · ROAS ${fmtDec(k.roas)}x`;
      sub = `Invertiste ${fmtMoney(k.spend, currency)} y recuperaste ${fmtMoney(k.purchaseValue, currency)}.`;
    }
  }

  const border = {
    good: "border-l-emerald-400",
    warn: "border-l-amber-400",
    bad: "border-l-red-400",
    info: "border-l-zinc-600",
  }[tone];
  const dot = {
    good: "bg-emerald-400",
    warn: "bg-amber-400",
    bad: "bg-red-400",
    info: "bg-zinc-500",
  }[tone];

  return (
    <div className={`rounded-2xl border border-zinc-800 border-l-4 ${border} bg-zinc-900/60 p-5`}>
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
        <h2 className="text-lg font-bold text-zinc-50 sm:text-xl">{title}</h2>
      </div>
      <p className="mt-1 text-sm text-zinc-400">{sub}</p>

      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          label="Inversión en ads"
          value={k ? fmtMoney(k.spend, currency) : fmtMoney(0, currency)}
        />
        <Stat
          label="Ventas atribuidas (Meta)"
          value={k && k.purchaseValue > 0 ? fmtMoney(k.purchaseValue, currency) : "—"}
          accent="text-emerald-300"
        />
        <Stat
          label="Pedidos reales (tienda)"
          value={fmtInt(sales.orders)}
          sub={sales.pending > 0 ? `${fmtInt(sales.pending)} pendientes de pago` : undefined}
          accent="text-zinc-50"
        />
        <Stat
          label="Facturación real (tienda)"
          value={sales.revenue > 0 ? fmtMoney(sales.revenue) : "—"}
          accent="text-emerald-300"
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  accent = "text-zinc-50",
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div>
      <p className="text-xs text-zinc-500">{label}</p>
      <p className={`mt-0.5 text-xl font-bold tabular-nums ${accent}`}>{value}</p>
      {sub ? <p className="text-[11px] text-zinc-600">{sub}</p> : null}
    </div>
  );
}

function InsightRow({ insight }: { insight: Insight }) {
  const styles = {
    good: { box: "border-emerald-500/30 bg-emerald-500/5", icon: "✅" },
    warn: { box: "border-amber-500/30 bg-amber-500/5", icon: "⚠️" },
    bad: { box: "border-red-500/30 bg-red-500/5", icon: "🚨" },
    info: { box: "border-zinc-700 bg-zinc-900/40", icon: "💡" },
  }[insight.tone];
  return (
    <li className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${styles.box}`}>
      <span className="mt-0.5 shrink-0 text-base" aria-hidden="true">
        {styles.icon}
      </span>
      <p className="text-sm text-zinc-200">{insight.text}</p>
    </li>
  );
}

// ────────────────────────── EMBUDO ──────────────────────────

function Funnel({ kpis }: { kpis: MetaKpis }) {
  const steps = [
    { label: "Impresiones", value: kpis.impressions },
    { label: "Clics", value: kpis.clicks },
    { label: "Vistas de la web", value: kpis.landingPageViews },
    { label: "Agregó al carrito", value: kpis.addToCart },
    { label: "Inició checkout", value: kpis.initiateCheckout },
    { label: "Compras", value: kpis.purchases },
  ];
  const max = Math.max(1, kpis.impressions);

  return (
    <div className="space-y-2">
      {steps.map((s, i) => {
        const prev = i > 0 ? steps[i - 1].value : 0;
        const conv = i > 0 && prev > 0 ? (s.value / prev) * 100 : null;
        const width = Math.max(2, (s.value / max) * 100);
        const isLast = i === steps.length - 1;
        return (
          <div key={s.label} className="flex items-center gap-3">
            <div className="w-36 shrink-0 text-right text-xs text-zinc-400">{s.label}</div>
            <div className="h-7 flex-1 overflow-hidden rounded-md bg-zinc-800/50">
              <div
                className={`flex h-full items-center rounded-md px-2 ${
                  isLast ? "bg-emerald-500/70" : "bg-amber-400/60"
                }`}
                style={{ width: `${width}%` }}
              >
                <span className="text-xs font-bold tabular-nums text-zinc-950">
                  {fmtInt(s.value)}
                </span>
              </div>
            </div>
            <div className="w-16 shrink-0 text-xs tabular-nums text-zinc-500">
              {conv !== null ? `${fmtDec(conv, 1)}%` : ""}
            </div>
          </div>
        );
      })}
      <p className="pl-[9.75rem] pt-1 text-[11px] text-zinc-600">
        El % es cuánta gente pasó de un paso al siguiente.
      </p>
    </div>
  );
}

// ────────────────────────── TIENDA + WEB (AR) ──────────────────────────

function StoreWeb({
  sales,
  ga4,
  currency,
}: {
  sales: RealSales;
  ga4: Ga4Result;
  currency: string;
}) {
  const sessions = ga4.ok ? ga4.sessions : 0;
  const convRate = ga4.ok && sessions > 0 ? (sales.orders / sessions) * 100 : null;

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-lg font-bold text-zinc-100">Tienda y web · Argentina</h2>
        {ga4.ok ? <span className="ml-auto text-xs text-zinc-600">{fmtAgo(ga4.fetchedAt)}</span> : null}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Pedidos reales" value={fmtInt(sales.orders)} accent="text-zinc-50" big />
        <Kpi
          label="Facturación real"
          value={sales.revenue > 0 ? fmtMoney(sales.revenue, currency) : "—"}
          accent="text-emerald-300"
          big
        />
        <Kpi
          label="Visitas (AR)"
          value={ga4.ok ? fmtInt(ga4.sessions) : "—"}
          sub={ga4.ok ? `${fmtInt(ga4.activeUsers)} usuarios` : undefined}
          big
        />
        <Kpi
          label="Conversión web"
          value={convRate !== null ? fmtPct(convRate) : "—"}
          sub="pedidos ÷ visitas"
          accent={convRate !== null && convRate >= 1 ? "text-emerald-300" : "text-amber-300"}
          big
        />
      </div>

      {!ga4.ok && ga4.error === "no_config" ? (
        <div className="mt-4">
          <ConnectCard
            title="Conectá Google Analytics 4"
            intro="Para ver las visitas (filtradas a Argentina) cargá en Coolify:"
            vars={[
              ["GA4_PROPERTY_ID", "id numérico de la propiedad"],
              ["GA4_CLIENT_EMAIL", "email de la cuenta de servicio"],
              ["GA4_PRIVATE_KEY", "private_key del JSON"],
            ]}
          />
        </div>
      ) : !ga4.ok ? (
        <div className="mt-4">
          <ErrorCard message={ga4.error} />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <RankList
            title="De dónde llegan (AR)"
            rows={ga4.channels.map((c) => ({ name: c.name, value: fmtInt(c.sessions) }))}
            empty="Sin datos de canales"
          />
          <RankList
            title="Páginas más vistas (AR)"
            rows={ga4.pages.map((p) => ({ name: p.name, value: fmtInt(p.views) }))}
            empty="Sin datos de páginas"
          />
        </div>
      )}
    </section>
  );
}

// ────────────────────────── DETALLE ADS ──────────────────────────

function MetaDetail({ data }: { data: Extract<MetaResult, { ok: true }> }) {
  const k = data.kpis;
  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Kpi label="Impresiones" value={fmtInt(k.impressions)} />
        <Kpi label="Alcance" value={fmtInt(k.reach)} />
        <Kpi label="Clics" value={fmtInt(k.clicks)} />
        <Kpi label="CTR" value={fmtPct(k.ctr)} />
        <Kpi label="CPC" value={fmtMoney(k.cpc, k.currency)} />
        <Kpi label="CPM" value={fmtMoney(k.cpm, k.currency)} />
      </div>

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
                  <th className="px-4 py-3 text-right font-semibold">Clics</th>
                  <th className="px-4 py-3 text-right font-semibold">CTR</th>
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
                      {fmtInt(c.clicks)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-400">
                      {fmtPct(c.ctr)}
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

// ────────────────────────── UI compartida ──────────────────────────

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
      <p className={`mt-1 font-bold tabular-nums ${big ? "text-2xl" : "text-lg"} leading-tight ${accent}`}>
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
}: {
  title: string;
  intro: string;
  vars: [string, string][];
}) {
  return (
    <div className="rounded-2xl border border-dashed border-amber-400/30 bg-amber-400/5 p-6">
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
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
      <p className="text-sm font-semibold text-red-300">No se pudieron traer los datos</p>
      <p className="mt-1 break-words text-sm text-zinc-400">{message}</p>
    </div>
  );
}
