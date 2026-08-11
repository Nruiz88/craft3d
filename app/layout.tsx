import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P } from "next/font/google";
import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import Header from "@/components/header";
import Footer from "@/components/footer";
import WhatsAppFloat from "@/components/whatsapp-float";
import "./globals.css";
import "./styles/arcade.css";
import "./styles/home-categories.css";
import "./styles/categories/anime.css";
import "./styles/categories/gaming.css";
import "./styles/categories/cine-series.css";
import "./styles/categories/accesorios.css";
import "./styles/categories/drops.css";
import "./styles/categories/mundial-2026.css";

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
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Craft3d — Impresión 3D y Arte en Filamento",
    template: "%s · Craft3d",
  },
  description:
    "Tienda de Craft3d: cuadros Hueforge, figuras, dummys, decoración y accesorios impresos en 3D, hechos a mano.",
  openGraph: {
    siteName: "Craft3d",
    locale: "es_AR",
    type: "website",
    title: "Craft3d — Impresión 3D y Arte en Filamento",
    description:
      "Cuadros Hueforge, figuras articuladas, dummys y objetos únicos impresos en 3D, hechos a mano capa a capa.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Craft3d — Impresión 3D y Arte en Filamento",
    description:
      "Cuadros Hueforge, figuras articuladas, dummys y objetos únicos impresos en 3D, hechos a mano capa a capa.",
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
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
