import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const API_BASE = "https://api.mercadopago.com";

export interface MercadoPagoItem {
  title: string;
  quantity: number;
  unitPrice: number;
}

export interface MercadoPagoPreference {
  id: string;
  initPoint: string;
}

function mpFetch(path: string, accessToken: string, init?: RequestInit) {
  return fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
}

export async function createPreference({
  accessToken,
  items,
  externalReference,
  notificationUrl,
  backUrls,
}: {
  accessToken: string;
  items: MercadoPagoItem[];
  externalReference: string;
  notificationUrl: string;
  backUrls: { success: string; pending: string; failure: string };
}): Promise<MercadoPagoPreference> {
  const body = {
    items: items.map((item) => ({
      title: item.title,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      currency_id: "ARS",
    })),
    external_reference: externalReference,
    notification_url: notificationUrl,
    auto_return: "approved",
    back_urls: {
      success: backUrls.success,
      pending: backUrls.pending,
      failure: backUrls.failure,
    },
  };

  const res = await mpFetch("/checkout/preferences", accessToken, {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Mercado Pago no pudo crear la preferencia (${res.status})${detail ? `: ${detail}` : ""}`,
    );
  }

  const data = (await res.json()) as {
    id: string;
    init_point?: string;
  };

  if (!data.init_point) {
    throw new Error("Mercado Pago no devolvió una URL de pago");
  }

  return { id: data.id, initPoint: data.init_point };
}

export async function getMercadoPagoPayment({
  accessToken,
  paymentId,
}: {
  accessToken: string;
  paymentId: string;
}): Promise<{
  status: string;
  externalReference: string | null;
  transactionAmount: number | null;
}> {
  const res = await mpFetch(`/v1/payments/${paymentId}`, accessToken);
  if (!res.ok) {
    throw new Error(`Mercado Pago no pudo verificar el pago (${res.status})`);
  }

  const data = (await res.json()) as {
    status?: string;
    external_reference?: string | null;
    transaction_amount?: number | null;
  };

  return {
    status: String(data.status ?? ""),
    externalReference: data.external_reference ?? null,
    transactionAmount:
      typeof data.transaction_amount === "number" ? data.transaction_amount : null,
  };
}

const WEBHOOK_MAX_AGE_SECONDS = 300;

/**
 * Verifica la firma del webhook de Mercado Pago (RFC 5424-style HMAC).
 * El header `x-signature` viene como `ts=...,v1=...`. El manifest se arma con
 * el id del pago, el `x-request-id` y el `ts`. Requiere el secret del panel
 * de Mercado Pago (Developers → Webhooks). Devuelve false si falta algo.
 */
export function verifyWebhookSignature({
  signatureHeader,
  requestId,
  bodyId,
  secret,
}: {
  signatureHeader: string | null;
  requestId: string | null;
  bodyId: string;
  secret: string;
}): boolean {
  if (!signatureHeader || !requestId || !secret || !bodyId) return false;

  const parts = new Map<string, string>();
  for (const part of signatureHeader.split(",")) {
    const eq = part.indexOf("=");
    if (eq <= 0) continue;
    parts.set(part.slice(0, eq).trim(), part.slice(eq + 1).trim());
  }

  const ts = parts.get("ts");
  const v1 = parts.get("v1");
  if (!ts || !v1) return false;

  const tsNumber = Number(ts);
  if (!Number.isFinite(tsNumber)) return false;
  if (Math.abs(Date.now() / 1000 - tsNumber) > WEBHOOK_MAX_AGE_SECONDS) {
    return false;
  }

  const manifest = `id:${bodyId};request-id:${requestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(v1, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
