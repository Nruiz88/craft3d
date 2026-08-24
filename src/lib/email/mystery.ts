import "server-only";
import { mysteryRarityLabel, type MysteryRarity } from "@/lib/mystery-box";
import type { Order } from "@/lib/products/types";
import { escapeHtml, layout, send, validEmail, siteUrl } from "./helpers";

/** Aviso de revelación de una caja sorpresa (con todas sus piezas y mensaje de regalo). */
export async function sendMysteryRevealedEmail(
  order: Order,
  pieces: { name: string; emoji: string; rarity: MysteryRarity; qty?: number }[],
  opts?: { giftMessage?: string },
): Promise<void> {
  const to = validEmail(order.customer_email);
  if (!to) return;

  const piecesHtml = pieces
    .map((piece) => {
      const rarityLabel = mysteryRarityLabel(piece.rarity);
      return `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-top:1px solid #27272a;">
          <div style="font-size:26px;">${piece.emoji}</div>
          <div style="flex:1;">
            <div style="color:#f4f4f5;font-size:15px;font-weight:700;">
              ${escapeHtml(piece.name)}
              ${piece.qty && piece.qty > 1 ? `<span style="color:#fbbf24;"> ×${piece.qty}</span>` : ""}
            </div>
          </div>
          <span style="padding:2px 8px;border:1px solid #22d3ee;border-radius:6px;color:#22d3ee;font-size:10px;letter-spacing:2px;">${escapeHtml(rarityLabel.toUpperCase())}</span>
        </div>`;
    })
    .join("");

  const giftBlock = opts?.giftMessage
    ? `
      <div style="margin:16px 0;padding:16px;background:#18181b;border:1px solid #27272a;border-radius:12px;color:#e4e4e7;font-size:13px;line-height:1.6;">
        <div style="color:#a1a1aa;font-size:12px;margin-bottom:4px;">🎁 Mensaje para el regalo</div>
        ${escapeHtml(opts.giftMessage)}
      </div>`
    : "";

  await send({
    to,
    subject: `Craft3d · ¡Tu caja sorpresa fue revelada! (Pedido #${order.id})`,
    html: layout(
      `🎁 ¡Tu caja sorpresa fue revelada!`,
      `
      <p>Hola <strong style="color:#f4f4f5;">${escapeHtml(order.customer_name)}</strong>!
      Mientras preparamos tu envío, revelamos el contenido de tu caja sorpresa:</p>
      <div style="margin:20px 0;padding:16px 24px;background:#18181b;border:2px solid #fbbf24;border-radius:16px;">
        <div style="color:#a1a1aa;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;">Contenido de la caja</div>
        ${piecesHtml}
      </div>
      ${giftBlock}
      <p>Ya podés verlo en el detalle de tu pedido. Todo viaja a tu puerta. Gracias por jugar 🕹️</p>`,
      { label: "Ver mi pedido", url: `${siteUrl}/cuenta/pedidos` },
    ),
  });
}
