import type { Metadata } from "next";
import { getAllProducts } from "@/lib/orders/store";
import { regalosConfig } from "@/lib/products/theme-configs";
import ThemedLanding from "@/components/catalog/themed-landing";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://craft3d.com.ar";

export const metadata: Metadata = {
  title: "Regalos Originales para Fans de Anime y Gamer",
  description:
    "Regalos originales para fans de anime, gaming y coleccionables: figuras, cuadros decorativos, llaveros y mates. Ideales para cumpleaños, Navidad y Día del Amigo. Envío a todo el país.",
  alternates: {
    canonical: `${siteUrl}/regalos`,
  },
};

export const dynamic = "force-dynamic";

export default async function RegalosPage() {
  const allProducts = await getAllProducts();
  // Selección para regalar: destacados primero y luego el resto por precio.
  const ranked = [...allProducts]
    .sort(
      (a, b) =>
        Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
        b.price - a.price,
    )
    .slice(0, 24);

  return <ThemedLanding config={regalosConfig} products={ranked} />;
}
