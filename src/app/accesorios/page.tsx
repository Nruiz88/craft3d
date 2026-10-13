import type { Metadata } from "next";
import { getAllProducts } from "@/lib/orders/store";
import { accesoriosConfig } from "@/lib/products/theme-configs";
import ThemedLanding from "@/components/catalog/themed-landing";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://craft3d.com.ar";

export const metadata: Metadata = {
  title: "Llaveros Personalizados, Clickers y Accesorios",
  description:
    "Llaveros personalizados, llaveros 3D, clickers, separadores, soportes y Dummy 13 con diseños de anime y gaming. Accesorios para regalar o coleccionar, con envío a todo el país.",
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
