import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/orders/store";
import { formatPrice } from "@/lib/utils/format";
import KraftyLanding from "@/components/catalog/krafty-landing";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://craft3d.com.ar";
const SLUG = "krafty";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const product = await getProductBySlug(SLUG);
  const canonical = `${siteUrl}/krafty`;
  const title =
    "KRAFTY · Kit de herramientas para cartón — El regalo de Navidad para chicos";
  const description =
    "KRAFTY: kit de herramientas seguras y sin filo para que los chicos transformen cualquier caja de cartón en castillos, cohetes y máscaras. El regalo perfecto de Navidad. Envío a todo el país.";
  const ogImage = product?.image && !product.image.startsWith("data:")
    ? product.image
    : undefined;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title: "KRAFTY · El regalo de Navidad para crear sin límites",
      description: product
        ? `${description} Precio: ${formatPrice(product.price)}.`
        : description,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: "KRAFTY · Kit de herramientas para cartón",
      description,
    },
  };
}

export default async function KraftyPage() {
  const product = await getProductBySlug(SLUG);
  if (!product) notFound();
  return <KraftyLanding product={product} />;
}
