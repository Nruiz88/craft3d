import "server-only";
import { Resend } from "resend";
import { site } from "@/lib/utils/site";
import { formatPrice } from "@/lib/utils/format";
import type { Order, OrderItemSnapshot } from "@/lib/products/types";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://craft3d.vercel.app";

const FROM = process.env.EMAIL_FROM ?? `Craft3d <${site.email}>`;

export function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function orderDate(value: string): string {
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

export function itemsTable(items: OrderItemSnapshot[]): string {
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

export function totalsBlock(order: Order): string {
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

export function layout(title: string, body: string, cta?: { label: string; url: string }): string {
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

export async function send({ to, subject, html }: { to: string; subject: string; html: string }): Promise<void> {
  const resend = getResend();
  if (!resend || !to) return;
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch {
    // Los emails nunca deben romper el flujo principal
  }
}

const ESCAPE_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validEmail(value: string): string {
  const email = value.trim().toLowerCase();
  return ESCAPE_REGEX.test(email) ? email : "";
}
