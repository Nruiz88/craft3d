import type { Product } from "@/lib/products/types";

/**
 * Las fotos de producto se guardan como data-URI (base64) en la DB. Enviadas
 * tal cual, pesan cientos de KB por producto y bloatean el HTML y el payload
 * de los client components (ej. la home con ~20 cards = varios MB).
 *
 * `toPublicProduct` reemplaza esos data-URI por la URL del endpoint
 * `/api/producto-imagen/<slug>` (que decodifica y sirve la imagen real), para
 * que en la página viaje una URL corta en vez del base64. Se usa en las
 * páginas públicas con muchas cards (home, catálogo). Las imágenes que ya son
 * URL (http) se dejan intactas.
 */
const isDataUri = (value: string): boolean => value.startsWith("data:");

export function toPublicProduct(product: Product): Product {
  const base = `/api/producto-imagen/${encodeURIComponent(product.slug)}`;
  return {
    ...product,
    image: product.image && isDataUri(product.image) ? base : product.image,
    images: product.images.map((img, i) => (isDataUri(img) ? `${base}?i=${i}` : img)),
  };
}
