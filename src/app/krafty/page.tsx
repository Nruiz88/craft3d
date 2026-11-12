import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/orders/store";
import { formatPrice } from "@/lib/utils/format";
import KraftyLanding from "@/components/catalog/krafty-landing";
import KraftyJsonLd from "@/components/catalog/krafty-jsonld";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://craft3d.com.ar";
const SLUG = "krafty";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const product = await getProductBySlug(SLUG);
  const canonical = `${siteUrl}/krafty`;
  const title =
    "KRAFTY · Juguete sin pantallas para construir con cartón | Regalo de Navidad";
  const description =
    "Kit de herramientas seguras y sin filo para que los chicos construyan castillos, cohetes y máscaras con cartón. Juego creativo, didáctico y SIN pantallas que estimula la imaginación. El regalo de Navidad ideal. Envío gratis a todo el país.";
  // La imagen OG la genera app/krafty/opengraph-image.tsx (convención de Next).
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title: "KRAFTY · El regalo sin pantallas para crear sin límites",
      description: product
        ? `${description} Precio: ${formatPrice(product.price)}.`
        : description,
    },
    twitter: {
      card: "summary_large_image",
      title: "KRAFTY · Juguete sin pantallas para construir con cartón",
      description,
    },
  };
}

export default async function KraftyPage() {
  const product = await getProductBySlug(SLUG);
  if (!product) notFound();
  return (
    <>
      <KraftyJsonLd product={product} />
      <KraftyLanding product={product} />
    </>
  );
}
