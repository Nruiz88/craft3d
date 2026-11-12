import { getProductBySlug } from "@/lib/orders/store";

/**
 * Sirve la imagen de un producto como archivo real en una URL pública.
 * Las imágenes se guardan como data-URI (base64) en la DB, y Google Shopping
 * (Merchant Center) exige una URL http(s) para `image_link`. Este endpoint
 * decodifica el data-URI y lo devuelve como imagen con su content-type.
 *
 * URL: /api/producto-imagen/<slug>
 */
export const dynamic = "force-dynamic";

const DATA_URI = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const src = product?.image ?? "";

  // Si ya fuera una URL (no data-URI), redirigimos a ella.
  if (/^https?:\/\//.test(src)) {
    return Response.redirect(src, 302);
  }

  const match = DATA_URI.exec(src);
  if (!match) {
    return new Response("Imagen no encontrada", { status: 404 });
  }

  const contentType = match[1];
  const bytes = Buffer.from(match[2], "base64");

  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(bytes.length),
      // Cache largo: la imagen de un producto cambia poco y Google la cachea.
      "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
