import type { Metadata } from "next";
import { getAllProducts } from "@/lib/orders/store";
import { mundialConfig } from "@/lib/products/theme-configs";
import ThemedLanding from "@/components/catalog/themed-landing";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://craft3d.com.ar";

export const metadata: Metadata = {
  title: "Mates y Figuras del Mundial 2026",
  description:
    "Mates personalizados, cajas de figuritas, cuadros y figuras del Mundial 2026 y la Selección Argentina. Regalos para fanáticos del fútbol, con envío a todo el país.",
  alternates: {
    canonical: `${siteUrl}/mundial-2026`,
  },
};

export const dynamic = "force-dynamic";

export default async function MundialPage() {
  const allProducts = await getAllProducts();
  const products = allProducts.filter((p) => p.category === "mundial-2026");

  return <ThemedLanding config={mundialConfig} products={products} />;
}
