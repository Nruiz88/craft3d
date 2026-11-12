/**
 * Capa de datos de Meta Ads (Facebook / Instagram) para el panel admin.
 *
 * IMPORTANTE: el MCP de Meta Ads corre dentro de Claude, NO en este servidor.
 * Para leer datos en producción la web llama a la Graph API con un token propio
 * guardado en variables de entorno:
 *   - META_ACCESS_TOKEN     → token con permiso `ads_read` (System User o de larga duración)
 *   - META_AD_ACCOUNT_ID    → id de la cuenta publicitaria (sin el prefijo `act_`)
 *
 * Sin esas variables el dashboard muestra un estado "conectá tu cuenta".
 * Todo es server-only: el token nunca llega al navegador.
 */

const API_VERSION = "v21.0";
const BASE = `https://graph.facebook.com/${API_VERSION}`;
const TTL_MS = 10 * 60 * 1000; // 10 min de caché en memoria
/** Cuenta personal desde la que se publicita craft3d, por defecto. */
const DEFAULT_ACCOUNT_ID = "63243870";

export type MetaDatePreset =
  | "today"
  | "yesterday"
  | "last_7d"
  | "last_14d"
  | "last_30d"
  | "last_90d"
  | "this_month"
  | "last_month"
  | "maximum";

export interface MetaKpis {
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number; // %
  cpc: number; // costo por clic
  cpm: number; // costo por mil impresiones
  purchases: number;
  purchaseValue: number; // valor de conversión atribuido
  roas: number; // retorno sobre la inversión publicitaria
  costPerPurchase: number;
  addToCart: number;
  initiateCheckout: number;
  landingPageViews: number;
  currency: string;
}

export interface MetaCampaignRow {
  id: string;
  name: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  purchases: number;
  roas: number;
}

export interface MetaDashboard {
  ok: true;
  datePreset: MetaDatePreset;
  accountId: string;
  kpis: MetaKpis;
  campaigns: MetaCampaignRow[];
  fetchedAt: number;
}

export interface MetaError {
  ok: false;
  /** `no_config` cuando faltan las variables; si no, el mensaje de la Graph API. */
  error: string;
}

export type MetaResult = MetaDashboard | MetaError;

export function getMetaConfig(): { token: string; accountId: string } {
  const token = process.env.META_ACCESS_TOKEN?.trim() ?? "";
  const accountId = (process.env.META_AD_ACCOUNT_ID?.trim() || DEFAULT_ACCOUNT_ID).replace(
    /^act_/,
    "",
  );
  return { token, accountId };
}

export function isMetaConfigured(): boolean {
  return Boolean(getMetaConfig().token);
}

type ActionItem = { action_type: string; value: string };

/** Devuelve el valor del primer action_type presente de la lista de prioridad. */
function pickAction(actions: ActionItem[] | undefined, types: string[]): number {
  if (!actions) return 0;
  for (const type of types) {
    const found = actions.find((a) => a.action_type === type);
    if (found) return Number(found.value) || 0;
  }
  return 0;
}

const PURCHASE_TYPES = [
  "purchase",
  "omni_purchase",
  "offsite_conversion.fct.purchase",
];

interface InsightsRow {
  campaign_id?: string;
  campaign_name?: string;
  spend?: string;
  impressions?: string;
  reach?: string;
  clicks?: string;
  ctr?: string;
  cpc?: string;
  cpm?: string;
  account_currency?: string;
  actions?: ActionItem[];
  action_values?: ActionItem[];
  purchase_roas?: ActionItem[];
}

async function graphGet(url: string): Promise<{ data?: InsightsRow[] }> {
  const res = await fetch(url, { cache: "no-store" });
  const json = (await res.json()) as {
    data?: InsightsRow[];
    error?: { message?: string };
  };
  if (!res.ok || json.error) {
    throw new Error(json.error?.message || `Graph API respondió ${res.status}`);
  }
  return json;
}

const num = (v: string | undefined): number => Number(v) || 0;

let cache: { key: string; at: number; data: MetaResult } | null = null;

export async function getMetaDashboard(
  datePreset: MetaDatePreset = "last_30d",
): Promise<MetaResult> {
  const { token, accountId } = getMetaConfig();
  if (!token) return { ok: false, error: "no_config" };

  const key = `${accountId}:${datePreset}`;
  if (cache && cache.key === key && Date.now() - cache.at < TTL_MS) {
    return cache.data;
  }

  try {
    const accFields = [
      "spend",
      "impressions",
      "reach",
      "clicks",
      "ctr",
      "cpc",
      "cpm",
      "account_currency",
      "actions",
      "action_values",
      "purchase_roas",
    ].join(",");
    const campFields = [
      "campaign_id",
      "campaign_name",
      "spend",
      "impressions",
      "clicks",
      "ctr",
      "cpc",
      "actions",
      "purchase_roas",
    ].join(",");

    const base = `${BASE}/act_${accountId}/insights`;
    const auth = `date_preset=${datePreset}&access_token=${encodeURIComponent(token)}`;
    const accUrl = `${base}?fields=${accFields}&${auth}`;
    const campUrl = `${base}?level=campaign&fields=${campFields}&limit=100&${auth}`;

    const [accJson, campJson] = await Promise.all([
      graphGet(accUrl),
      graphGet(campUrl),
    ]);

    const row = accJson.data?.[0];
    const currency = row?.account_currency || "ARS";

    const spend = num(row?.spend);
    const purchases = pickAction(row?.actions, PURCHASE_TYPES);
    const purchaseValue = pickAction(row?.action_values, PURCHASE_TYPES);
    const roas = pickAction(row?.purchase_roas, PURCHASE_TYPES);

    const kpis: MetaKpis = {
      spend,
      impressions: num(row?.impressions),
      reach: num(row?.reach),
      clicks: num(row?.clicks),
      ctr: num(row?.ctr),
      cpc: num(row?.cpc),
      cpm: num(row?.cpm),
      purchases,
      purchaseValue,
      roas,
      costPerPurchase: purchases > 0 ? spend / purchases : 0,
      addToCart: pickAction(row?.actions, ["add_to_cart", "omni_add_to_cart"]),
      initiateCheckout: pickAction(row?.actions, [
        "initiate_checkout",
        "omni_initiated_checkout",
      ]),
      landingPageViews: pickAction(row?.actions, ["landing_page_view"]),
      currency,
    };

    const campaigns: MetaCampaignRow[] = (campJson.data ?? [])
      .map((c) => ({
        id: c.campaign_id ?? "",
        name: c.campaign_name ?? "(sin nombre)",
        spend: num(c.spend),
        impressions: num(c.impressions),
        clicks: num(c.clicks),
        ctr: num(c.ctr),
        cpc: num(c.cpc),
        purchases: pickAction(c.actions, PURCHASE_TYPES),
        roas: pickAction(c.purchase_roas, PURCHASE_TYPES),
      }))
      .sort((a, b) => b.spend - a.spend);

    const data: MetaDashboard = {
      ok: true,
      datePreset,
      accountId,
      kpis,
      campaigns,
      fetchedAt: Date.now(),
    };
    cache = { key, at: Date.now(), data };
    return data;
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error desconocido al leer Meta Ads",
    };
  }
}
