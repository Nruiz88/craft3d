import type { Product } from "@/lib/products/types";
import { FREE_SHIPPING_AR } from "@/components/product/product-jsonld";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://craft3d.com.ar";

/**
 * Datos estructurados para la landing de campaña /krafty.
 * Las fotos del producto son data-URI (no sirven como URL en schema),
 * así que usamos las imágenes públicas de la landing.
 */
export default function KraftyJsonLd({ product }: { product: Product }) {
  const url = `${baseUrl}/krafty`;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "KRAFTY — Kit de herramientas creativas para cartón",
    description:
      "Kit de herramientas seguras y sin filo para que los chicos transformen cualquier caja de cartón en castillos, cohetes y máscaras. El regalo perfecto de Navidad.",
    sku: product.slug,
    brand: { "@type": "Brand", name: "Craft3d" },
    category: "Juguetes de construcción",
    audience: { "@type": "PeopleAudience", suggestedMinAge: 4 },
    image: [
      `${baseUrl}/krafty/producto-og.jpg`,
      `${baseUrl}/krafty/producto.webp`,
    ],
    offers: {
      "@type": "Offer",
      priceCurrency: "ARS",
      price: product.price,
      url,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "Craft3d" },
      ...(product.freeShipping ? { shippingDetails: FREE_SHIPPING_AR } : {}),
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "KRAFTY", item: url },
    ],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [productJsonLd, breadcrumbJsonLd],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}
