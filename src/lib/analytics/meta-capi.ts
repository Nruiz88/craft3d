/**
 * Conversions API de Meta (server-side). Envía el evento "Purchase" de la web
 * desde el servidor cuando un pedido pasa a "pagado", así Meta recibe la
 * compra aunque el cliente cierre la pestaña antes de volver a la tienda, use
 * un bloqueador de anuncios o pague por transferencia (lo marca el admin).
 *
 * Se deduplica con el Purchase del navegador usando el mismo event_id
 * (`purchaseEventId`), así Meta cuenta una sola compra.
 *
 * Requiere NEXT_PUBLIC_FB_PIXEL_ID y META_CAPI_TOKEN (token generado en
 * Events Manager → Configuración del píxel → Conversions API). Sin ellos no
 * hace nada.
 */

import { createHash } from "node:crypto";
import type { Order } from "@/lib/products/types";
import { META_CURRENCY, purchaseEventId } from "@/lib/analytics/meta";

const API_VERSION = "v21.0";

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function hashed(value: string | null | undefined): string[] | undefined {
  const v = (value ?? "").trim().toLowerCase();
  return v ? [sha256(v)] : undefined;
}

/** Normaliza un teléfono argentino a solo dígitos con código de país 54. */
export function normalizePhone(phone: string | null | undefined): string {
  let digits = (phone ?? "").replace(/\D/g, "").replace(/^0+/, "");
  if (!digits) return "";
  if (!digits.startsWith("54")) digits = `54${digits}`;
  return digits;
}

export function buildPurchaseEvent(order: Order, siteUrl: string, now = Date.now()) {
  const phone = normalizePhone(order.shipping_phone);
  const city = (order.shipping_city ?? "").toLowerCase().replace(/[^a-z]/g, "");
  const zip = (order.shipping_postal_code ?? "").toLowerCase().replace(/\s/g, "");

  const user_data: Record<string, string[]> = {};
  const add = (key: string, v: string[] | undefined) => {
    if (v) user_data[key] = v;
  };
  add("em", hashed(order.customer_email));
  add("ph", phone ? [sha256(phone)] : undefined);
  add("ct", hashed(city));
  add("zp", hashed(zip));
  add("country", hashed("ar"));
  add("external_id", hashed(order.user_id));

  return {
    event_name: "Purchase",
    event_time: Math.floor(now / 1000),
    event_id: purchaseEventId(order.id),
    action_source: "website",
    event_source_url: `${siteUrl}/carrito`,
    user_data,
    custom_data: {
      currency: META_CURRENCY,
      value: order.total,
      order_id: String(order.id),
      content_type: "product",
      content_ids: order.items.map((item) => item.product_slug),
      contents: order.items.map((item) => ({
        id: item.product_slug,
        quantity: item.quantity,
        item_price: item.price,
      })),
      num_items: order.items.reduce((sum, item) => sum + item.quantity, 0),
    },
  };
}

/**
 * Envía el Purchase del pedido a Meta. Nunca lanza: un fallo de tracking no
 * debe romper el webhook de pago ni el panel de admin.
 */
export async function sendMetaPurchase(order: Order): Promise<void> {
  const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID?.trim();
  const token = process.env.META_CAPI_TOKEN?.trim();
  if (!pixelId || !token) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://craft3d.com.ar";
  const body: Record<string, unknown> = {
    data: [buildPurchaseEvent(order, siteUrl)],
  };
  const testCode = process.env.META_CAPI_TEST_EVENT_CODE?.trim();
  if (testCode) body.test_event_code = testCode;

  try {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!res.ok) {
      console.error("[META CAPI] Purchase rechazado", res.status, await res.text());
    }
  } catch (err) {
    console.error("[META CAPI] error enviando Purchase", err);
  }
}
