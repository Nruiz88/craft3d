import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const cspDirectives = [
  "default-src 'self'",
  // 'unsafe-inline' needed for Tailwind + Next.js inline styles
  // 'unsafe-eval' removed in production (only needed for dev HMR)
  `script-src 'self'${isProd ? "" : " 'unsafe-eval'"} 'unsafe-inline' https://www.mercadopago.com.ar https://www.mercadopago.com https://www.googletagmanager.com https://www.google-analytics.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://tagassistant.google.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https://www.mercadopago.com.ar https://api.mercadopago.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://stats.g.doubleclick.net https://tagassistant.google.com https://www.google.com",
  "frame-src https://www.mercadopago.com.ar https://www.mercadopago.com",
  "base-uri 'self'",
  "form-action 'self'",
  // Permitir que herramientas de Google (Tag Assistant / GTM preview) incrusten
  // el sitio para inspeccionarlo. El resto de orígenes queda bloqueado.
  "frame-ancestors 'self' https://tagassistant.google.com https://*.google.com",
];

const securityHeaders = [
  // No se envía X-Frame-Options: no permite listar orígenes de confianza y
  // bloquearía a Google (Tag Assistant / GTM). El control de framing se hace
  // solo con `frame-ancestors` en la CSP, que sí soporta allowlist.
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: cspDirectives.join("; "),
  },
];

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  // Fotos de productos subidas desde el panel como data-URI (base64 ≈ +33%).
  // 12mb permite archivos originales de ~10MB tras la compresión del cliente.
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // El admin puede pegar URLs de cualquier host https (Unsplash, ImgBB, hosting
    // propio...). Solo https y solo editable desde el panel, riesgo controlado.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;