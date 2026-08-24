import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { categories, categoryLandingUrl } from "@/lib/products";
import { getAllProducts } from "@/lib/orders/store";
import {
  filterProductsByQuery,
  isValidCatalogOrder,
  sortProducts,
  applyFilters,
} from "@/lib/products/catalog";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import FadeIn from "@/components/ui/fade-in";
import ProductCard from "@/components/product/product-card";
import CatalogToolbar from "@/components/catalog/catalog-toolbar";

export const dynamic = "force-dynamic";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://craft3d.vercel.app";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Todo el catálogo de Craft3d: figuras, cuadros Hueforge, decoración y accesorios impresos en 3D.",
  alternates: {
    canonical: `${siteUrl}/catalogo`,
  },
};

const marqueeItems = [
  "FIGURAS Y PERSONAJES",
  "CUADROS HUEFORGE",
  "DECORACIÓN EN 3D",
  "ACCESORIOS ÚNICOS",
  "HECHOS CAPA A CAPA",
];

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{
    categoria?: string;
    busqueda?: string;
    orden?: string;
    categorias?: string;
    priceMin?: string;
    priceMax?: string;
    stock?: string;
  }>;
}) {
  const {
    categoria,
    busqueda,
    orden,
    categorias,
    priceMin,
    priceMax,
    stock,
  } = await searchParams;

  // Redirect any single category to its landing page
  if (
    categoria &&
    categories.some((c) => c.id === categoria) &&
    !categorias
  ) {
    redirect(categoryLandingUrl(categoria));
  }

  const order = isValidCatalogOrder(orden) ? orden : undefined;

  // Parse filter params
  const selectedCategories = categorias
    ? categorias.split(",").filter((c) => c.trim())
    : [];
  const parsedPriceMin = priceMin ? parseInt(priceMin, 10) : undefined;
  const parsedPriceMax = priceMax ? parseInt(priceMax, 10) : undefined;
  const availability =
    stock === "in-stock" || stock === "out-of-stock" ? stock : "all";

  const allProducts = await getAllProducts();

  // Filter out drops and mystery-box (they have their own pages)
  const baseProducts = allProducts.filter(
    (p) => p.category !== "drops" && p.category !== "mystery-box",
  );

  // Apply search
  const searchedProducts = filterProductsByQuery(
    baseProducts,
    busqueda ?? "",
  );

  // Apply advanced filters
  const filteredProducts = applyFilters(searchedProducts, {
    categories: selectedCategories,
    priceMin: parsedPriceMin,
    priceMax: parsedPriceMax,
    availability,
  });

  // Apply sort
  const products = sortProducts(filteredProducts, order);

  // Count products per category (after search, before category filter)
  const counts = new Map<string, number>();
  searchedProducts.forEach((p) =>
    counts.set(p.category, (counts.get(p.category) ?? 0) + 1),
  );

  return (
    <div className="bg-zinc-950 pb-20">
      {/* ===== MARQUEE · CATÁLOGO ===== */}
      <div className="border-b-4 border-zinc-800 bg-cyan-400" aria-hidden="true">
        <div className="relative overflow-hidden py-2.5">
          <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap">
            {[0, 1].map((copy) => (
              <span key={copy} className="flex items-center gap-8">
                {marqueeItems.map((text) => (
                  <span
                    key={text}
                    className="pixel text-[11px] tracking-widest text-zinc-950"
                  >
                    ✦ {text}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ===== HERO ===== */}
      <section className="arcade-grid relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-40 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="crt-overlay" aria-hidden="true" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 pt-14 pb-12 text-center sm:px-6">
          <FadeIn>
            <Link
              href="/#novedades"
              className="pixel inline-flex items-center gap-2 rounded-sm border-2 border-zinc-800 bg-zinc-950/70 px-3 py-1.5 text-[10px] tracking-widest text-zinc-400 transition-colors hover:border-amber-400/50 hover:text-amber-300"
            >
              ← VOLVER A LA HOME
            </Link>
            <h1 className="pixel mt-6 text-4xl leading-snug text-zinc-100 sm:text-5xl">
              CATÁLOGO <span className="text-cyan-300 neon-cyan">COMPLETO</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-500 sm:text-base">
              Todas las piezas de la tienda en un solo lugar: figuras, cuadros,
              decoración y accesorios impresos en 3D. Cada categoría tiene su
              propia colección temática.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[10px]">
              <span className="pixel rounded-sm border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 tracking-widest text-amber-300">
                ★ {products.length}{" "}
                {products.length === 1 ? "PRODUCTO" : "PRODUCTOS"}
              </span>
              {categories
                .filter((c) => c.id !== "drops" && c.id !== "mystery-box")
                .map((c) => (
                  <Link
                    key={c.id}
                    href={categoryLandingUrl(c.id)}
                    className="pixel rounded-sm border border-zinc-700 bg-zinc-900/60 px-3 py-1.5 tracking-widest text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
                  >
                    {c.emoji} {c.name.toUpperCase()} · {counts.get(c.id) ?? 0}
                  </Link>
                ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===== BREADCRUMBS ===== */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Breadcrumbs
          items={[{ label: "Inicio", href: "/" }, { label: "Catálogo" }]}
        />
      </div>

      {/* ===== BUSCAR + FILTROS + ORDENAR ===== */}
      <div className="sticky top-16 z-20">
        <CatalogToolbar
          query={busqueda}
          order={order}
          filters={{
            categories: selectedCategories,
            priceMin: parsedPriceMin,
            priceMax: parsedPriceMax,
            availability,
          }}
          counts={counts}
          totalProducts={searchedProducts.length}
        />
      </div>

      {/* ===== ACTIVE FILTER PILLS ===== */}
      {selectedCategories.length > 0 ||
      parsedPriceMin ||
      parsedPriceMax ||
      availability !== "all" ? (
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 pt-4 sm:px-6">
          <span className="pixel text-[9px] tracking-widest text-zinc-600">
            FILTROS:
          </span>
          {selectedCategories.map((catId) => {
            const cat = categories.find((c) => c.id === catId);
            return cat ? (
              <span
                key={catId}
                className="inline-flex items-center gap-1 rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-[11px] text-amber-300"
              >
                {cat.emoji} {cat.name}
              </span>
            ) : null;
          })}
          {(parsedPriceMin || parsedPriceMax) ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-cyan-400/30 bg-cyan-400/10 px-2 py-1 text-[11px] text-cyan-300">
              ${parsedPriceMin?.toLocaleString("es-AR") ?? "0"} – $
              {parsedPriceMax?.toLocaleString("es-AR") ?? "∞"}
            </span>
          ) : null}
          {availability !== "all" ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-fuchsia-400/30 bg-fuchsia-400/10 px-2 py-1 text-[11px] text-fuchsia-300">
              {availability === "in-stock" ? "● En stock" : "○ Agotados"}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* ===== GRID ===== */}
      <section className="mx-auto max-w-6xl px-4 pt-4 sm:px-6">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, i) => (
              <FadeIn key={product.slug} delay={Math.min(i * 80, 400)}>
                <ProductCard product={product} />
              </FadeIn>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-14 text-center">
            <p className="pixel text-[10px] tracking-widest text-zinc-500">
              {busqueda
                ? `SIN RESULTADOS PARA «${busqueda.toUpperCase()}»`
                : "TODAVÍA NO HAY PRODUCTOS PUBLICADOS"}
            </p>
            {(busqueda || selectedCategories.length > 0 || availability !== "all") ? (
              <Link
                href="/catalogo"
                className="mt-4 inline-block rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-amber-400/60 hover:text-amber-300"
              >
                Limpiar todos los filtros
              </Link>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
