import "server-only";
import { escapeHtml, layout, send, validEmail, siteUrl } from "./helpers";
import {
  getRestockRequestsByProduct,
  deleteRestockRequestsForProduct,
} from "@/lib/notifications/restock";

/**
 * Avisa a todos los anotados de reposición de un producto y limpia la lista.
 * Devuelve cuántos emails se intentaron enviar.
 */
export async function sendRestockNotifications(
  slug: string,
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
