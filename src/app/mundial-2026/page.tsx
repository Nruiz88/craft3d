import type { Metadata } from "next";
import { getAllProducts } from "@/lib/orders/store";
import { mundialConfig } from "@/lib/products/theme-configs";
import ThemedLanding from "@/components/catalog/themed-landing";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://craft3d.vercel.app";

export const metadata: Metadata = {
  title: "Mundial 2026 · Colección Copa del Mundo",
  description:
    "Colección Copa del Mundo 2026: mates, fanáticos y piezas para vivir la pasión de la Selección. Ediciones limitadas impresas en 3D.",
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
