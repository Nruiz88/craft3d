import "server-only";
import { formatPrice } from "@/lib/utils/format";
import { getPaymentSettings } from "@/lib/payments/settings";
import type { Order } from "@/lib/products/types";
import { escapeHtml, itemsTable, totalsBlock, layout, send, validEmail, orderDate, siteUrl } from "./helpers";

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
  const hasData = Boolean(transfer.cbu || transfer.alias || transfer.bankName || transfer.holder);

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

/** Confirmación cuando se paga la seña de una reserva. */
export async function sendReservationDepositPaidEmail(order: Order): Promise<void> {
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

/** Envío del pedido con número de tracking. */
export async function sendOrderShippedEmail(
  order: Order,
  trackingNumber?: string,
): Promise<void> {
  const to = validEmail(order.customer_email);
  if (!to) return;

  const trackingBlock = trackingNumber
    ? `<div style="margin:16px 0;padding:16px;background:#18181b;border:1px solid #27272a;border-radius:12px;">
        <div style="color:#a1a1aa;font-size:12px;margin-bottom:2px;">Número de seguimiento</div>
        <div style="color:#f4f4f5;font-size:16px;font-weight:bold;letter-spacing:1px;">${escapeHtml(trackingNumber)}</div>
      </div>`
    : "";

  await send({
    to,
    subject: `Craft3d · ¡Tu pedido #${order.id} fue enviado!`,
    html: layout(
      "¡Tu pedido va en camino!",
      `
      <p>Hola, <strong style="color:#f4f4f5;">${escapeHtml(order.customer_name)}</strong>.</p>
      <p>Tu pedido <strong style="color:#f4f4f5;">#${order.id}</strong> ya fue despachado.</p>
      ${trackingBlock}
      ${itemsTable(order.items)}
      ${totalsBlock(order)}
      <p>Si tenés alguna consulta, respondenos este email o escribinos por WhatsApp.</p>`,
      { label: "Ver mis pedidos", url: `${siteUrl}/cuenta` },
    ),
  });
}

/** Confirmación de entrega del pedido. */
export async function sendOrderDeliveredEmail(order: Order): Promise<void> {
  const to = validEmail(order.customer_email);
  if (!to) return;

  await send({
    to,
    subject: `Craft3d · ¡Pedido #${order.id} entregado!`,
    html: layout(
      "¡Pedido entregado!",
      `
      <p>Hola, <strong style="color:#f4f4f5;">${escapeHtml(order.customer_name)}</strong>.</p>
      <p>Tu pedido <strong style="color:#f4f4f5;">#${order.id}</strong> fue entregado correctamente.</p>
      ${itemsTable(order.items)}
      <p>Esperamos que disfrutes tu compra. Si tenés alguna consulta o querés dejarnos una reseña, no dudes en escribirnos.</p>
      <p style="color:#71717a;font-size:12px;">Gracias por elegir Craft3d.</p>`,
      { label: "Ver mis pedidos", url: `${siteUrl}/cuenta` },
    ),
  });
}
