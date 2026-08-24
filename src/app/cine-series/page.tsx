import type { Metadata } from "next";
import { getAllProducts } from "@/lib/orders/store";
import { cineSeriesConfig } from "@/lib/products/theme-configs";
import ThemedLanding from "@/components/catalog/themed-landing";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://craft3d.vercel.app";

export const metadata: Metadata = {
  title: "Cine y Series · Figuras y Decoración 3D",
  description:
    "Figuras, decoración y piezas únicas de tus películas y series favoritas, impresas en 3D y terminadas a mano.",
  alternates: {
    canonical: `${siteUrl}/cine-series`,
  },
};

export const dynamic = "force-dynamic";

export default async function CineSeriesPage() {
  const allProducts = await getAllProducts();
  const products = allProducts.filter((p) => p.category === "cine-series");

  return <ThemedLanding config={cineSeriesConfig} products={products} />;
}
