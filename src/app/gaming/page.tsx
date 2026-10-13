import type { Metadata } from "next";
import { getAllProducts } from "@/lib/orders/store";
import { gamingConfig } from "@/lib/products/theme-configs";
import ThemedLanding from "@/components/catalog/themed-landing";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://craft3d.com.ar";

export const metadata: Metadata = {
  title: "Decoración Gamer y Accesorios para tu Setup",
  description:
    "Decoración gamer, figuras y accesorios para tu setup: League of Legends, Valorant, CS GO, Minecraft y más. Regalos gamer originales con envío a todo el país.",
  alternates: {
    canonical: `${siteUrl}/gaming`,
  },
};

export const dynamic = "force-dynamic";

export default async function GamingPage() {
  const allProducts = await getAllProducts();
  const products = allProducts.filter((p) => p.category === "gaming");

  return <ThemedLanding config={gamingConfig} products={products} />;
}
