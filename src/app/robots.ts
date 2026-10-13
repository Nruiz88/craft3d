import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://craft3d.com.ar";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/cuenta",
        "/favoritos",
        "/carrito",
        "/ingresar",
        "/registrarse",
        "/auth",
        "/api",
        "/restock",
        "/waitlist",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
