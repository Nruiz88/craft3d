import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P } from "next/font/google";
import { CartProvider } from "@/lib/contexts/cart-context";
import { WishlistProvider } from "@/lib/contexts/wishlist-context";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import WhatsAppFloat from "@/components/layout/whatsapp-float";
import CookieBanner from "@/components/layout/cookie-banner";
import ChunkRecovery from "@/components/layout/chunk-recovery";
import GoogleAnalytics from "@/components/analytics/google-analytics";
import "@/styles/globals.css";
import "@/styles/arcade.css";
import "@/styles/home-categories.css";
import "@/styles/categories/anime.css";
import "@/styles/categories/gaming.css";
import "@/styles/categories/cine-series.css";
import "@/styles/categories/accesorios.css";
import "@/styles/categories/drops.css";
import "@/styles/categories/mundial-2026.css";
import "@/styles/categories/krafty.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pressStart2P = Press_Start_2P({
  variable: "--font-arcade",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://craft3d.com.ar",
  ),
  title: {
    default: "Craft3d — Figuras de Anime, Llaveros y Regalos Gamer",
    template: "%s · Craft3d",
  },
  description:
    "Figuras de anime, llaveros personalizados, cuadros decorativos y deco gamer. Regalos originales para fans de Dragon Ball, Naruto, One Piece, Pokémon y más. Envío a todo el país.",
  openGraph: {
    siteName: "Craft3d",
    locale: "es_AR",
    type: "website",
    title: "Craft3d — Figuras de Anime, Llaveros y Regalos Gamer",
    description:
      "Figuras de anime, llaveros personalizados, cuadros decorativos y regalos gamer originales. Dragon Ball, Naruto, One Piece, Pokémon y más.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Craft3d — Figuras de Anime, Llaveros y Regalos Gamer",
    description:
      "Figuras de anime, llaveros personalizados, cuadros decorativos y regalos gamer originales. Dragon Ball, Naruto, One Piece, Pokémon y más.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    // Cargar NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION en Coolify (Search Console).
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${pressStart2P.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <CartProvider>
          <WishlistProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <WhatsAppFloat />
            <ChunkRecovery />
            <CookieBanner />
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || "G-CGKJKVLZFD"} />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
