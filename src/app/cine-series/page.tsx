import type { Metadata } from "next";
import { getAllProducts } from "@/lib/orders/store";
import { cineSeriesConfig } from "@/lib/products/theme-configs";
import ThemedLanding from "@/components/catalog/themed-landing";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://craft3d.com.ar";

export const metadata: Metadata = {
  title: "Coleccionables de Cine y Series",
  description:
    "Figuras y cuadros coleccionables de Marvel, Star Wars, DC, Harry Potter y más. Regalos frikis para fans, con envío a todo el país.",
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
