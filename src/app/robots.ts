import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://craft3d.com.ar";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      // /api/producto-imagen/ sirve las fotos del feed de Google Shopping:
      // se permite explícitamente (regla más específica que /api), mientras el
      // resto de /api queda bloqueado.
      allow: ["/", "/api/producto-imagen/"],
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
