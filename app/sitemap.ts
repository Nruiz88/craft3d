import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://craft3d.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/catalogo`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/drops`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/mysterybox`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/productos/${product.slug}`,
    lastModified: new Date(product.createdAt),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
