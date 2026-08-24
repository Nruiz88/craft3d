import type { Metadata } from "next";
import { getAllProducts } from "@/lib/orders/store";
import { accesoriosConfig } from "@/lib/products/theme-configs";
import ThemedLanding from "@/components/catalog/themed-landing";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://craft3d.vercel.app";

export const metadata: Metadata = {
  title: "Accesorios · Impresos en 3D",
  description:
    "Accesorios funcionales y únicos impresos en 3D: soportes, organizadores, utilidades y más para tu día a día.",
  alternates: {
    canonical: `${siteUrl}/accesorios`,
  },
};

export const dynamic = "force-dynamic";

export default async function AccesoriosPage() {
  const allProducts = await getAllProducts();
  const products = allProducts.filter((p) => p.category === "accesorios");

  return <ThemedLanding config={accesoriosConfig} products={products} />;
}
