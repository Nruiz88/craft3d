import type { Metadata } from "next";
import { getAllProducts } from "@/lib/orders/store";
import { gamingConfig } from "@/lib/products/theme-configs";
import ThemedLanding from "@/components/catalog/themed-landing";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://craft3d.vercel.app";

export const metadata: Metadata = {
  title: "Gaming · Figuras y Decoración 3D para tu Setup",
  description:
    "League of Legends, Valorant, CS GO y todo lo que le falta a tu setup gamer para ser único. Figuras, lámparas y decoración impresa en 3D.",
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
