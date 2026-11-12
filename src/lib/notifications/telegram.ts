import "server-only";
import { formatPrice } from "@/lib/utils/format";
import type { Order } from "@/lib/products/types";

/**
 * Notificaciones al dueño de la tienda por Telegram. Llega como push instantáneo
 * al teléfono cuando entra o se paga un pedido en la web. Variables de entorno:
 *   - TELEGRAM_BOT_TOKEN → token del bot (lo da @BotFather)
 *   - TELEGRAM_CHAT_ID   → id del chat/persona que recibe los avisos
 *
 * Todo es server-only y a prueba de fallos: si no está configurado o la API de
 * Telegram falla, NUNCA rompe el checkout ni el webhook.
 */

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function isTelegramConfigured(): boolean {
  return Boolean(
    process.env.TELEGRAM_BOT_TOKEN?.trim() && process.env.TELEGRAM_CHAT_ID?.trim(),
  );
}

/** Envía un mensaje de texto (HTML) al chat configurado. */
export async function sendTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
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
  if (!isTelegramConfigured()) return;

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
