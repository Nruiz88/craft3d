import type { Metadata } from "next";
import { getAllProducts } from "@/lib/orders/store";
import { animeConfig } from "@/lib/products/theme-configs";
import ThemedLanding from "@/components/catalog/themed-landing";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://craft3d.com.ar";

export const metadata: Metadata = {
  title: "Figuras de Anime y Cosas de Anime",
  description:
    "Figuras de anime, cuadros decorativos y lámparas de tus series favoritas: Dragon Ball, Naruto, One Piece, Demon Slayer, Jujutsu Kaisen y más. Comprá online con envío a todo el país.",
  alternates: {
    canonical: `${siteUrl}/anime`,
  },
};

export const dynamic = "force-dynamic";

export default async function AnimePage() {
  const allProducts = await getAllProducts();
  const products = allProducts.filter((p) => p.category === "anime");

  return <ThemedLanding config={animeConfig} products={products} />;
}
