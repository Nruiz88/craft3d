import { getAllProducts } from "@/lib/orders/store";

/**
 * Feed de productos para Google Merchant Center (Google Shopping).
 * Formato RSS 2.0 con el namespace de Google (g:). Se da de alta en
 * Merchant Center como "feed por URL": https://craft3d.com.ar/google-shopping.xml
 *
 * Las imágenes se sirven vía /api/producto-imagen/<slug> (las fotos están
 * como data-URI en la DB y Google necesita una URL http).
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://craft3d.com.ar";

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function clean(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, 4900);
}

export async function GET() {
  let products: Awaited<ReturnType<typeof getAllProducts>> = [];
  try {
    products = await getAllProducts();
  } catch {
    products = [];
  }

  const items = products
    .filter((p) => p.image && p.price > 0)
    .map((p) => {
      const link = `${SITE}/productos/${p.slug}`;
      const imageLink = `${SITE}/api/producto-imagen/${encodeURIComponent(p.slug)}`;
      const availability = p.stock > 0 ? "in_stock" : "out_of_stock";
      const description = clean(p.description || p.name);
      const shipping = p.freeShipping
        ? "\n    <g:shipping><g:country>AR</g:country><g:service>Estándar</g:service><g:price>0 ARS</g:price></g:shipping>"
        : "";
      return `  <item>
    <g:id>${esc(p.slug)}</g:id>
    <g:title>${esc(clean(p.name))}</g:title>
    <g:description>${esc(description)}</g:description>
    <g:link>${esc(link)}</g:link>
    <g:image_link>${esc(imageLink)}</g:image_link>
    <g:availability>${availability}</g:availability>
    <g:price>${p.price.toFixed(2)} ARS</g:price>
    <g:condition>new</g:condition>
    <g:brand>Craft3d</g:brand>
    <g:identifier_exists>no</g:identifier_exists>${shipping}
  </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>Craft3d</title>
  <link>${SITE}</link>
  <description>Figuras de anime, deco, regalos 3D y KRAFTY — Craft3d</description>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
