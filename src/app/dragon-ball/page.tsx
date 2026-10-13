import type { Metadata } from "next";
import { getAllProducts } from "@/lib/orders/store";
import {
  franchiseById,
  franchiseConfig,
  filterFranchise,
} from "@/lib/products/franchises";
import ThemedLanding from "@/components/catalog/themed-landing";

const f = franchiseById["dragon-ball"];
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://craft3d.com.ar";

export const metadata: Metadata = {
  title: `Figuras y Cuadros de ${f.name}`,
  description: f.longDescription,
  alternates: {
    canonical: `${siteUrl}/${f.id}`,
  },
};

export const dynamic = "force-dynamic";

export default async function DragonBallPage() {
  const all = await getAllProducts();
  return (
    <ThemedLanding config={franchiseConfig(f)} products={filterFranchise(all, f)} />
  );
}
