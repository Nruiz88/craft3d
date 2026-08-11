import type { Product } from "@/lib/types";
import { categoryById } from "@/lib/products";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://craft3d.vercel.app";

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export default function ProductJsonLd({ product }: { product: Product }) {
  const images = [product.image, ...product.images].filter(
    (img): img is string => typeof img === "string" && isHttpUrl(img),
  );
  const category = categoryById[product.category];

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.slug,
    brand: { "@type": "Brand", name: "Craft3d" },
    ...(images.length > 0 ? { image: images } : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: "ARS",
      price: product.price,
      url: `${baseUrl}/productos/${product.slug}`,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: category.name,
        item: `${baseUrl}/?categoria=${category.id}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `${baseUrl}/productos/${product.slug}`,
      },
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
