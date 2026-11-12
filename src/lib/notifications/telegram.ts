import "server-only";
import { inArray } from "drizzle-orm";
import { formatPrice } from "@/lib/utils/format";
import { db } from "@/lib/db/client";
import { settings } from "@/lib/db/schema";
import type { Order } from "@/lib/products/types";

/**
 * Notificaciones al dueño de la tienda por Telegram. Llega como push instantáneo
 * al teléfono cuando entra o se paga un pedido en la web.
 *
 * La configuración se toma de variables de entorno o, si no están, de la tabla
 * `settings` de la base (claves `telegram_bot_token` / `telegram_chat_id`),
 * igual que el token de Mercado Pago. Así se puede configurar sin tocar el
 * entorno. Todo es server-only y a prueba de fallos: si no está configurado o
 * la API de Telegram falla, NUNCA rompe el checkout ni el webhook.
 */

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function getTelegramConfig(): Promise<{ token: string; chatId: string }> {
  const envToken = process.env.TELEGRAM_BOT_TOKEN?.trim() ?? "";
  const envChat = process.env.TELEGRAM_CHAT_ID?.trim() ?? "";
  if (envToken && envChat) return { token: envToken, chatId: envChat };
  try {
    const rows = await db
      .select()
      .from(settings)
      .where(inArray(settings.key, ["telegram_bot_token", "telegram_chat_id"]));
    const map = new Map(rows.map((r) => [r.key, (r.value ?? "").trim()]));
    return {
      token: envToken || map.get("telegram_bot_token") || "",
      chatId: envChat || map.get("telegram_chat_id") || "",
    };
  } catch {
    return { token: envToken, chatId: envChat };
  }
}

/** Envía un mensaje de texto (HTML) al chat configurado. */
export async function sendTelegram(text: string): Promise<void> {
  const { token, chatId } = await getTelegramConfig();
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
  } catch {
    // una notificación nunca debe romper el flujo de compra
  }
}

const PAYMENT_LABEL: Record<string, string> = {
  transferencia: "Transferencia",
  mercado_pago: "Mercado Pago",
};

/**
 * Aviso de un pedido de la web.
 *   - "nuevo":  alguien compró (se registró el pedido).
 *   - "pagado": Mercado Pago confirmó el pago.
 */
export async function notifyOrderTelegram(
  order: Order,
  kind: "nuevo" | "pagado",
): Promise<void> {
  const items = (order.items ?? [])
    .map((item) => `${item.quantity}× ${item.product_name}`)
    .join(", ");
  const place = [order.shipping_city, order.shipping_province].filter(Boolean).join(", ");
  const amount = order.isReservation ? order.depositPaid : order.total;

  const header =
    kind === "pagado"
      ? `💰 <b>Pago confirmado · Pedido #${order.id}</b>`
      : `🛒 <b>Nuevo ${order.isReservation ? "pedido con seña" : "pedido"} #${order.id}</b>`;

  const lines = [
    header,
    `👤 ${escapeHtml(order.customer_name || "Cliente")}`,
    `💵 ${formatPrice(amount)} · ${PAYMENT_LABEL[order.paymentMethod] ?? escapeHtml(order.paymentMethod)}`,
    items ? `📦 ${escapeHtml(items)}` : "",
    place ? `📍 ${escapeHtml(place)}` : "",
    order.shipping_phone ? `📞 ${escapeHtml(order.shipping_phone)}` : "",
  ].filter(Boolean);

  await sendTelegram(lines.join("\n"));
}
