import type { Metadata } from "next";
import { getAllProducts } from "@/lib/orders/store";
import { animeConfig } from "@/lib/products/theme-configs";
import ThemedLanding from "@/components/catalog/themed-landing";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://craft3d.vercel.app";

export const metadata: Metadata = {
  title: "Anime · Figuras y Lámparas 3D",
  description:
    "Dragon Ball, Naruto, One Piece y más. Figuras, lámparas y piezas únicas de tus series favoritas, impresas en 3D y terminadas a mano.",
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
