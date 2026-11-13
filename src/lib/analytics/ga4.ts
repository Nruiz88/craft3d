/**
 * Capa de datos de Google Analytics 4 (GA4 Data API) para el panel admin.
 *
 * El tag gtag solo ENVÍA datos; para LEERLOS hace falta la Analytics Data API
 * autenticada con una cuenta de servicio de Google Cloud. Variables de entorno:
 *   - GA4_PROPERTY_ID   → id numérico de la propiedad GA4 (p. ej. 123456789)
 *   - GA4_CLIENT_EMAIL  → email de la cuenta de servicio (…@….iam.gserviceaccount.com)
 *   - GA4_PRIVATE_KEY   → private_key del JSON de la cuenta de servicio
 *
 * La cuenta de servicio debe tener rol "Lector" en la propiedad GA4.
 * No requiere librerías externas: el JWT se firma con `node:crypto`.
 */

import crypto from "node:crypto";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
const TTL_MS = 10 * 60 * 1000;

export interface Ga4Summary {
  ok: true;
  activeUsers: number;
  newUsers: number;
  sessions: number;
  pageViews: number;
  conversions: number;
  revenue: number;
  engagementRate: number; // 0..1
  avgSessionDuration: number; // segundos
  channels: { name: string; sessions: number }[];
  pages: { name: string; views: number }[];
  fetchedAt: number;
}

export interface Ga4Error {
  ok: false;
  error: string; // `no_config` o el mensaje de la API
}

export type Ga4Result = Ga4Summary | Ga4Error;

export type Ga4Range = "7daysAgo" | "30daysAgo" | "90daysAgo";

/**
 * Normaliza la private_key sin importar cómo quedó guardada en el entorno:
 * admite PEM multilínea, "\n" escapados, comillas envolventes, PEM con los
 * saltos de línea aplastados (se rearma) y la clave en base64 (se decodifica).
 * Así un pegado mal formado en el panel no vuelve a romper GA4.
 */
export function normalizePrivateKey(raw: string | undefined): string {
  let s = (raw ?? "").trim();
  if (!s) return "";
  // comillas envolventes que algunos editores agregan
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  // "\n" escapados -> saltos reales
  s = s.replace(/\\n/g, "\n");
  // clave en base64 (sin cabecera PEM): decodificar
  if (!s.includes("BEGIN")) {
    try {
      const decoded = Buffer.from(s, "base64").toString("utf8");
      if (decoded.includes("BEGIN")) s = decoded.trim();
    } catch {
      // no era base64 válido; seguimos con lo que haya
    }
  }
  // PEM con los saltos aplastados: reconstruir el bloque en columnas de 64
  if (s.includes("BEGIN") && !s.includes("\n")) {
    const begin = s.match(/-----BEGIN[ A-Z]*-----/);
    const end = s.match(/-----END[ A-Z]*-----/);
    if (begin && end && typeof begin.index === "number") {
      const body = s
        .slice(begin.index + begin[0].length, end.index)
        .replace(/[^A-Za-z0-9+/=]/g, "");
      const wrapped = body.match(/.{1,64}/g)?.join("\n") ?? body;
      s = `-----BEGIN PRIVATE KEY-----\n${wrapped}\n-----END PRIVATE KEY-----\n`;
    }
  }
  return s.trim();
}

function getGa4Config(): { propertyId: string; clientEmail: string; privateKey: string } {
  return {
    propertyId: process.env.GA4_PROPERTY_ID?.trim() ?? "",
    clientEmail: process.env.GA4_CLIENT_EMAIL?.trim() ?? "",
    privateKey: normalizePrivateKey(process.env.GA4_PRIVATE_KEY),
  };
}

export function isGa4Configured(): boolean {
  const { propertyId, clientEmail, privateKey } = getGa4Config();
  return Boolean(propertyId && clientEmail && privateKey);
}

function base64url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

let tokenCache: { token: string; exp: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.exp - 60_000) return tokenCache.token;

  const { clientEmail, privateKey } = getGa4Config();
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64url(
    JSON.stringify({
      iss: clientEmail,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
  );
  const unsigned = `${header}.${claim}`;
  const signature = base64url(
    crypto.createSign("RSA-SHA256").update(unsigned).sign(privateKey),
  );
  const assertion = `${unsigned}.${signature}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    cache: "no-store",
  });
  const json = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
    error_description?: string;
    error?: string;
  };
  if (!res.ok || !json.access_token) {
    throw new Error(json.error_description || json.error || "No se pudo autenticar con Google");
  }
  tokenCache = {
    token: json.access_token,
    exp: Date.now() + (json.expires_in ?? 3600) * 1000,
  };
  return json.access_token;
}

interface ReportRow {
  dimensionValues?: { value: string }[];
  metricValues?: { value: string }[];
}
interface RunReportResponse {
  rows?: ReportRow[];
  error?: { message?: string };
}

async function runReport(
  propertyId: string,
  token: string,
  body: Record<string, unknown>,
): Promise<ReportRow[]> {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );
  const json = (await res.json()) as RunReportResponse;
  if (!res.ok || json.error) {
    throw new Error(json.error?.message || `GA4 Data API respondió ${res.status}`);
  }
  return json.rows ?? [];
}

let cache: { key: string; at: number; data: Ga4Result } | null = null;

export async function getGa4Summary(
  range: Ga4Range = "30daysAgo",
  onlyArgentina = true,
): Promise<Ga4Result> {
  if (!isGa4Configured()) return { ok: false, error: "no_config" };

  const key = `${range}:${onlyArgentina ? "ar" : "all"}`;
  if (cache && cache.key === key && Date.now() - cache.at < TTL_MS) return cache.data;

  try {
    const { propertyId } = getGa4Config();
    const token = await getAccessToken();
    const dateRanges = [{ startDate: range, endDate: "today" }];
    const dimensionFilter = onlyArgentina
      ? {
          filter: {
            fieldName: "country",
            stringFilter: { matchType: "EXACT" as const, value: "Argentina" },
          },
        }
      : undefined;

    const [totals, channels, pages] = await Promise.all([
      runReport(propertyId, token, {
        dateRanges,
        dimensionFilter,
        metrics: [
          { name: "activeUsers" },
          { name: "newUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
          { name: "conversions" },
          { name: "totalRevenue" },
          { name: "engagementRate" },
          { name: "averageSessionDuration" },
        ],
      }),
      runReport(propertyId, token, {
        dateRanges,
        dimensionFilter,
        dimensions: [{ name: "sessionDefaultChannelGroup" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 6,
      }),
      runReport(propertyId, token, {
        dateRanges,
        dimensionFilter,
        dimensions: [{ name: "pageTitle" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 6,
      }),
    ]);

    const m = totals[0]?.metricValues ?? [];
    const val = (i: number) => Number(m[i]?.value) || 0;

    const data: Ga4Summary = {
      ok: true,
      activeUsers: val(0),
      newUsers: val(1),
      sessions: val(2),
      pageViews: val(3),
      conversions: val(4),
      revenue: val(5),
      engagementRate: val(6),
      avgSessionDuration: val(7),
      channels: channels.map((r) => ({
        name: r.dimensionValues?.[0]?.value ?? "(desconocido)",
        sessions: Number(r.metricValues?.[0]?.value) || 0,
      })),
      pages: pages.map((r) => ({
        name: r.dimensionValues?.[0]?.value ?? "(sin título)",
        views: Number(r.metricValues?.[0]?.value) || 0,
      })),
      fetchedAt: Date.now(),
    };
    cache = { key, at: Date.now(), data };
    return data;
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error desconocido al leer GA4",
    };
  }
}

export interface Ga4Totals {
  ok: true;
  sessions: number;
  activeUsers: number;
  pageViews: number;
  conversions: number;
  revenue: number;
}

const totalsCache = new Map<string, { at: number; data: Ga4Totals | Ga4Error }>();

/**
 * Totales de GA4 para un rango de fechas explícito (ej. el período anterior,
 * para comparar). Filtrado a Argentina. Fechas en formato GA4: "30daysAgo",
 * "today", "2026-01-01", etc.
 */
export async function getGa4Totals(
  startDate: string,
  endDate: string,
  onlyArgentina = true,
): Promise<Ga4Totals | Ga4Error> {
  if (!isGa4Configured()) return { ok: false, error: "no_config" };
  const key = `${startDate}:${endDate}:${onlyArgentina}`;
  const hit = totalsCache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.data;

  try {
    const { propertyId } = getGa4Config();
    const token = await getAccessToken();
    const dimensionFilter = onlyArgentina
      ? {
          filter: {
            fieldName: "country",
            stringFilter: { matchType: "EXACT" as const, value: "Argentina" },
          },
        }
      : undefined;
    const rows = await runReport(propertyId, token, {
      dateRanges: [{ startDate, endDate }],
      dimensionFilter,
      metrics: [
        { name: "sessions" },
        { name: "activeUsers" },
        { name: "screenPageViews" },
        { name: "conversions" },
        { name: "totalRevenue" },
      ],
    });
    const m = rows[0]?.metricValues ?? [];
    const v = (i: number) => Number(m[i]?.value) || 0;
    const data: Ga4Totals = {
      ok: true,
      sessions: v(0),
      activeUsers: v(1),
      pageViews: v(2),
      conversions: v(3),
      revenue: v(4),
    };
    totalsCache.set(key, { at: Date.now(), data });
    return data;
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error desconocido al leer GA4",
    };
  }
}
