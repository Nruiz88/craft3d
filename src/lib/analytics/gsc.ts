/**
 * Capa de datos de Google Search Console (Search Analytics API) para el panel.
 *
 * Mide el rendimiento en el BUSCADOR de Google (clics, impresiones, CTR y
 * posición de las búsquedas), distinto de GA4 (visitas al sitio). Reutiliza la
 * MISMA cuenta de servicio que GA4 (GA4_CLIENT_EMAIL / GA4_PRIVATE_KEY); esa
 * cuenta debe estar agregada como usuario en Search Console con permiso de
 * lectura. La propiedad por defecto es la URL-prefix de craft3d.
 *   - GSC_SITE_URL (opcional) → p. ej. "https://craft3d.com.ar/"
 */

import crypto from "node:crypto";
import { normalizePrivateKey } from "./ga4";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const API = "https://searchconsole.googleapis.com/webmasters/v3";
const TTL_MS = 10 * 60 * 1000;
const DAY_MS = 86_400_000;
const DEFAULT_SITE = "https://craft3d.com.ar/";

export interface GscRow {
  key: string;
  clicks: number;
  impressions: number;
  ctr: number; // 0..1
  position: number;
}

export interface GscSummary {
  ok: true;
  clicks: number;
  impressions: number;
  ctr: number; // 0..1
  position: number;
  queries: GscRow[];
  pages: GscRow[];
  fetchedAt: number;
}

export interface GscError {
  ok: false;
  error: string; // `no_config` o el mensaje de la API
}

export type GscResult = GscSummary | GscError;

function getConfig(): { siteUrl: string; clientEmail: string; privateKey: string } {
  return {
    siteUrl: process.env.GSC_SITE_URL?.trim() || DEFAULT_SITE,
    clientEmail: process.env.GA4_CLIENT_EMAIL?.trim() ?? "",
    privateKey: normalizePrivateKey(process.env.GA4_PRIVATE_KEY),
  };
}

export function isGscConfigured(): boolean {
  const { clientEmail, privateKey } = getConfig();
  return Boolean(clientEmail && privateKey);
}

function base64url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

let tokenCache: { token: string; exp: number } | null = null;

async function getAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.exp - 60_000) return tokenCache.token;
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64url(
    JSON.stringify({ iss: clientEmail, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }),
  );
  const unsigned = `${header}.${claim}`;
  const signature = base64url(crypto.createSign("RSA-SHA256").update(unsigned).sign(privateKey));
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
  });
  const json = (await res.json()) as { access_token?: string; error_description?: string };
  if (!json.access_token) throw new Error(json.error_description || "No se pudo autenticar con Google");
  tokenCache = { token: json.access_token, exp: Date.now() + 55 * 60 * 1000 };
  return json.access_token;
}

/** Fecha YYYY-MM-DD en zona horaria Argentina. */
function dateAR(ms: number): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(ms));
}

interface ApiRow {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
}

let cache: { key: string; at: number; data: GscResult } | null = null;

export async function getGscDashboard(days = 28): Promise<GscResult> {
  const { siteUrl, clientEmail, privateKey } = getConfig();
  if (!clientEmail || !privateKey) return { ok: false, error: "no_config" };

  const cacheKey = `${siteUrl}:${days}`;
  if (cache && cache.key === cacheKey && Date.now() - cache.at < TTL_MS) return cache.data;

  try {
    const token = await getAccessToken(clientEmail, privateKey);
    const endDate = dateAR(Date.now());
    const startDate = dateAR(Date.now() - (days - 1) * DAY_MS);
    const endpoint = `${API}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;

    const query = async (dimensions: string[]): Promise<ApiRow[]> => {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ startDate, endDate, dimensions, rowLimit: dimensions.length ? 10 : 1 }),
      });
      const json = (await res.json()) as { rows?: ApiRow[]; error?: { message?: string } };
      if (!res.ok || json.error) throw new Error(json.error?.message || `Search Console respondió ${res.status}`);
      return json.rows ?? [];
    };

    const [totalRows, queryRows, pageRows] = await Promise.all([
      query([]),
      query(["query"]),
      query(["page"]),
    ]);

    const t = totalRows[0];
    const toRows = (rows: ApiRow[]): GscRow[] =>
      rows.map((r) => ({
        key: r.keys?.[0] ?? "",
        clicks: r.clicks ?? 0,
        impressions: r.impressions ?? 0,
        ctr: r.ctr ?? 0,
        position: r.position ?? 0,
      }));

    const data: GscSummary = {
      ok: true,
      clicks: t?.clicks ?? 0,
      impressions: t?.impressions ?? 0,
      ctr: t?.ctr ?? 0,
      position: t?.position ?? 0,
      queries: toRows(queryRows),
      pages: toRows(pageRows),
      fetchedAt: Date.now(),
    };
    cache = { key: cacheKey, at: Date.now(), data };
    return data;
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Error al leer Search Console" };
  }
}
