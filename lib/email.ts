import "server-only";
import { Resend } from "resend";
import { site } from "./site";
import { formatPrice } from "./format";
import { getPaymentSettings } from "./settings";
import { mysteryRarityLabel, type MysteryRarity } from "./mystery-box";
import {
  getRestockRequestsByProduct,
  deleteRestockRequestsForProduct,
} from "./restock";
import type { Order, OrderItemSnapshot } from "./types";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://craft3d.vercel.app";

const FROM =
  process.env.EMAIL_FROM ??
  `Craft3d <${site.email}>`;

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function orderDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function itemsTable(items: OrderItemSnapshot[]): string {
  if (items.length === 0) return "";
  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #27272a;color:#e4e4e7;font-size:14px;">
          ${escapeHtml(item.product_name)}
          <span style="color:#71717a;">&times;${item.quantity}</span>
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #27272a;color:#e4e4e7;font-size:14px;text-align:right;white-space:nowrap;">
          ${formatPrice(item.subtotal)}
        </td>
      </tr>`,
    )
    .join("");

  return `
    <table style="width:100%;border-collapse:collapse;margin:16px 0;border:1px solid #27272a;border-radius:12px;overflow:hidden;">
      <tbody>${rows}</tbody>
    </table>`;
}

function totalsBlock(order: Order): string {
  const rows: string[] = [];
  rows.push(
    `<tr><td style="padding:4px 12px;color:#a1a1aa;font-size:13px;">Subtotal</td><td style="padding:4px 12px;color:#e4e4e7;font-size:13px;text-align:right;">${formatPrice(order.subtotal)}</td></tr>`,
  );
  if (order.discount > 0) {
    rows.push(
      `<tr><td style="padding:4px 12px;color:#a1a1aa;font-size:13px;">Cupón ${order.couponCode ? escapeHtml(order.couponCode) : ""}</td><td style="padding:4px 12px;color:#34d399;font-size:13px;text-align:right;">-${formatPrice(order.discount)}</td></tr>`,
    );
  }
  if (order.shipping > 0) {
    rows.push(
      `<tr><td style="padding:4px 12px;color:#a1a1aa;font-size:13px;">Envío</td><td style="padding:4px 12px;color:#e4e4e7;font-size:13px;text-align:right;">${formatPrice(order.shipping)}</td></tr>`,
    );
  }
  rows.push(
    `<tr><td style="padding:8px 12px 12px;color:#a1a1aa;font-size:13px;font-weight:700;">Total</td><td style="padding:8px 12px 12px;color:#22d3ee;font-size:15px;font-weight:700;text-align:right;">${formatPrice(order.total)}</td></tr>`,
  );
  return `<table style="width:100%;border-collapse:collapse;">${rows.join("")}</table>`;
}

function layout(title: string, body: string, cta?: { label: string; url: string }): string {
  const ctaBlock = cta
    ? `
      <div style="text-align:center;margin:24px 0;">
        <a href="${cta.url}" style="display:inline-block;background:#22d3ee;color:#09090b;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:10px;">
          ${escapeHtml(cta.label)}
        </a>
      </div>`
    : "";

  return `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:24px 12px;background:#09090b;font-family:ui-monospace,Menlo,Consolas,monospace;">
    <div style="max-width:560px;margin:0 auto;background:#111113;border:1px solid #27272a;border-radius:16px;overflow:hidden;">
      <div style="padding:24px;background:#18181b;border-bottom:1px solid #27272a;text-align:center;">
        <div style="color:#22d3ee;font-size:20px;font-weight:800;letter-spacing:2px;">CRAFT3D</div>
        <div style="color:#71717a;font-size:11px;letter-spacing:3px;margin-top:4px;">ARTE EN FILAMENTO</div>
      </div>
      <div style="padding:28px 24px;">
        <div style="color:#f4f4f5;font-size:18px;font-weight:800;margin-bottom:16px;">${escapeHtml(title)}</div>
        <div style="color:#a1a1aa;font-size:14px;line-height:1.6;">${body}</div>
        ${ctaBlock}
      </div>
      <div style="padding:20px 24px;background:#09090b;border-top:1px solid #27272a;text-align:center;">
        <div style="color:#71717a;font-size:12px;line-height:1.7;">
          Craft3d &mdash; ${escapeHtml(site.tagline)}<br/>
          <a href="${site.instagram}" style="color:#22d3ee;text-decoration:none;">${escapeHtml(site.instagramLabel)}</a>
          &nbsp;&middot;&nbsp;
          <a href="${site.whatsapp}" style="color:#22d3ee;text-decoration:none;">${escapeHtml(site.whatsappLabel)}</a>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

async function send({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const resend = getResend();
  if (!resend || !to) return;

  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch {
    // Los emails nunca deben romper el flujo principal
  }
}

const ESCAPE_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validEmail(value: string): string {
  const email = value.trim().toLowerCase();
  return ESCAPE_REGEX.test(email) ? email : "";
}

/** Confirmación cuando se registra un pedido (transferencia o MP). */
export async function sendOrderCreatedEmail(
  order: Order,
  opts?: { paymentUrl?: string },
): Promise<void> {
  const to = validEmail(order.customer_email);
  if (!to) return;

  const isReservation = order.isReservation;
  const amountDue = isReservation ? order.depositPaid : order.total;
  const verb = isReservation ? "reserva" : "pedido";
  const confirmText = isReservation
    ? `Solo falta abonar la seña de <strong style="color:#f4f4f5;">${formatPrice(amountDue)}</strong> para asegurar tu drop.`
    : "Ahora solo falta completar el pago para confirmarlo.";

  const body =
    order.paymentMethod === "transferencia"
      ? await transferBody(order)
      : `
      <p>Recibimos tu ${verb} <strong style="color:#f4f4f5;">#${order.id}</strong>. ${confirmText}</p>
      ${itemsTable(order.items)}
      ${totalsBlock(order)}
      ${isReservation ? `<p>Te queda por abonar <strong style="color:#f4f4f5;">${formatPrice(Math.max(0, order.total - order.depositPaid))}</strong> cuando completes la reserva.</p>` : ""}
      <p>Te mandamos la confirmación apenas el pago se acredite. Si preferís pagar con
      transferencia, contestanos este email y te pasamos los datos.</p>`;

  await send({
    to,
    subject: `Craft3d · ${verb === "reserva" ? "Reserva" : "Pedido"} #${order.id} recibido`,
    html: layout(
      isReservation ? "¡Reserva recibida!" : "¡Pedido recibido!",
      body,
      opts?.paymentUrl
        ? { label: "Completar pago", url: opts.paymentUrl }
        : { label: "Ver mis pedidos", url: `${siteUrl}/cuenta` },
    ),
  });
}

async function transferBody(order: Order): Promise<string> {
  const settings = await getPaymentSettings();
  const transfer = settings.transfer;
  const hasData = Boolean(
    transfer.cbu || transfer.alias || transfer.bankName || transfer.holder,
  );

  const isReservation = order.isReservation;
  const amountDue = isReservation ? order.depositPaid : order.total;

  const instructions = hasData
    ? `
      <p>Mientras, podés pagar con transferencia a:</p>
      <div style="margin:16px 0;padding:16px;background:#18181b;border:1px solid #27272a;border-radius:12px;">
        ${transfer.bankName ? `<div style="color:#a1a1aa;font-size:12px;margin-bottom:2px;">Banco</div><div style="color:#f4f4f5;font-size:14px;margin-bottom:10px;">${escapeHtml(transfer.bankName)}</div>` : ""}
        ${transfer.holder ? `<div style="color:#a1a1aa;font-size:12px;margin-bottom:2px;">Titular</div><div style="color:#f4f4f5;font-size:14px;margin-bottom:10px;">${escapeHtml(transfer.holder)}</div>` : ""}
        ${transfer.cbu ? `<div style="color:#a1a1aa;font-size:12px;margin-bottom:2px;">CBU</div><div style="color:#f4f4f5;font-size:14px;margin-bottom:10px;">${escapeHtml(transfer.cbu)}</div>` : ""}
        ${transfer.alias ? `<div style="color:#a1a1aa;font-size:12px;margin-bottom:2px;">Alias</div><div style="color:#f4f4f5;font-size:14px;">${escapeHtml(transfer.alias)}</div>` : ""}
      </div>
      <p>El monto a transferir es <strong style="color:#f4f4f5;">${formatPrice(amountDue)}</strong>.
      Envianos el comprobante por WhatsApp para acreditarlo más rápido.</p>
      ${transfer.note ? `<p style="color:#71717a;font-size:12px;">${escapeHtml(transfer.note)}</p>` : ""}`
    : `<p>Te escribimos por WhatsApp para coordinar el pago por transferencia.</p>`;

  const verb = isReservation ? "reserva" : "pedido";

  return `
    <p>Recibimos tu ${verb} <strong style="color:#f4f4f5;">#${order.id}</strong>.
    Todavía no está pago: coordinamos la transferencia y después lo confirmamos.</p>
    ${itemsTable(order.items)}
    ${totalsBlock(order)}
    ${instructions}`;
}

/** Confirmación de pago (webhook MP o admin marca "pagado"). */
export async function sendOrderPaidEmail(order: Order): Promise<void> {
  const to = validEmail(order.customer_email);
  if (!to) return;

  await send({
    to,
    subject: `Craft3d · ¡Pago confirmado! (Pedido #${order.id})`,
    html: layout(
      "¡Pago confirmado!",
      `
      <p>Gracias, <strong style="color:#f4f4f5;">${escapeHtml(order.customer_name)}</strong>.
      Tu pago por <strong style="color:#f4f4f5;">${formatPrice(order.total)}</strong> se acreditó correctamente.</p>
      ${itemsTable(order.items)}
      ${totalsBlock(order)}
      <p>Nos ponemos a imprimir tu pedido. Te avisamos apenas esté listo para el envío.
      Mientras tanto ganaste monedas arcade por tu compra: canjealas por descuentos en tu cuenta.</p>
      <p style="color:#71717a;font-size:12px;">Pedido realizado el ${orderDate(order.createdAt)}.</p>`,
      { label: "Ver mis pedidos", url: `${siteUrl}/cuenta` },
    ),
  });
}

/** Confirmación cuando se paga la seña de una reserva. */export async function sendReservationDepositPaidEmail(order: Order): Promise<void> {
  const to = validEmail(order.customer_email);
  if (!to) return;
  if (!order.isReservation) return;

  const remaining = Math.max(0, order.total - order.depositPaid);

  await send({
    to,
    subject: `Craft3d · ¡Seña confirmada! (Pedido #${order.id})`,
    html: layout(
      "¡Seña confirmada!",
      `
      <p>Gracias, <strong style="color:#f4f4f5;">${escapeHtml(order.customer_name)}</strong>.
      Recibimos la seña de <strong style="color:#f4f4f5;">${formatPrice(order.depositPaid)}</strong> por tu reserva.</p>
      ${itemsTable(order.items)}
      ${remaining > 0 ? `<p style="color:#a1a1aa;">Te queda por abonar <strong style="color:#f4f4f5;">${formatPrice(remaining)}</strong> para completar tu reserva.</p>` : ""}
      <p>Tu drop queda asegurado. Te avisamos cuando se imprima y esté listo para el envío.</p>`,
      { label: "Ver mis pedidos", url: `${siteUrl}/cuenta` },
    ),
  });
}

/** Aviso de revelación de una caja sorpresa (con rareza y mensaje de regalo). */
export async function sendMysteryRevealedEmail(
  order: Order,
  piece: { name: string; emoji: string; rarity: MysteryRarity },
  opts?: { giftMessage?: string },
): Promise<void> {
  const to = validEmail(order.customer_email);
  if (!to) return;

  const rarityLabel = mysteryRarityLabel(piece.rarity);
  const giftBlock = opts?.giftMessage
    ? `
      <div style="margin:16px 0;padding:16px;background:#18181b;border:1px solid #27272a;border-radius:12px;color:#e4e4e7;font-size:13px;line-height:1.6;">
        <div style="color:#a1a1aa;font-size:12px;margin-bottom:4px;">🎁 Mensaje para el regalo</div>
        ${escapeHtml(opts.giftMessage)}
      </div>`
    : "";

  await send({
    to,
    subject: `Craft3d · ¡Tu sorpresa fue revelada! (Pedido #${order.id})`,
    html: layout(
      "🎁 ¡Tu sorpresa fue revelada!",
      `
      <p>Hola <strong style="color:#f4f4f5;">${escapeHtml(order.customer_name)}</strong>!
      Mientras preparamos tu envío, revelamos la pieza de tu caja sorpresa:</p>
      <div style="margin:20px 0;padding:24px;background:#18181b;border:2px solid #fbbf24;border-radius:16px;text-align:center;">
        <div style="font-size:40px;">${piece.emoji}</div>
        <div style="color:#f4f4f5;font-size:20px;font-weight:800;margin-top:8px;">${escapeHtml(piece.name)}</div>
        <div style="display:inline-block;margin-top:12px;padding:4px 12px;border:1px solid #22d3ee;border-radius:6px;color:#22d3ee;font-size:11px;letter-spacing:2px;">${escapeHtml(rarityLabel.toUpperCase())}</div>
      </div>
      ${giftBlock}
      <p>Ya podés verla en el detalle de tu pedido. La imprimimos y viaja a tu puerta. Gracias por jugar 🕹️</p>`,
      { label: "Ver mi pedido", url: `${siteUrl}/cuenta/pedidos` },
    ),
  });
}

/**
 * Avisa a todos los anotados de reposición de un producto y limpia la lista.
 * Devuelve cuántos emails se intentaron enviar.
 */
export async function sendRestockNotifications(  slug: string,
  productName: string,
): Promise<number> {
  const requests = await getRestockRequestsByProduct(slug);
  if (requests.length === 0) return 0;

  const url = `${siteUrl}/productos/${encodeURIComponent(slug)}`;
  const subject = `Craft3d · ¡Volvió el stock! ${productName}`;
  const html = layout(
    "¡Volvió el stock!",
    `
    <p>Buenas noticias: <strong style="color:#f4f4f5;">${escapeHtml(productName)}</strong>
    ya tiene stock disponible de nuevo.</p>
    <p>No te lo pierdas. Andá a buscarlo antes de que se agote:</p>`,
    { label: "Ver producto", url },
  );

  await Promise.allSettled(
    requests.map((request) =>
      send({ to: validEmail(request.email), subject, html }),
    ),
  );

  await deleteRestockRequestsForProduct(slug);
  return requests.length;
}
