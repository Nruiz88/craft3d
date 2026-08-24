import Link from "next/link";
import { layouts, DefaultLayout, type CatalogItem } from "./category-layouts";
import SortSelect from "@/components/catalog/sort-select";
import { categories, categoryLandingUrl } from "@/lib/products";
import { dropStatus } from "@/lib/drops";
import { sortProducts } from "@/lib/products/catalog";
import type { Category, CategoryId, Product } from "@/lib/products/types";
import FadeIn from "@/components/ui/fade-in";
import Breadcrumbs from "@/components/ui/breadcrumbs";

function getNow(): number {
  return Date.now();
}

const categoryAccents: Record<string, { heroGradient: string; accentText: string; accentBorder: string; accentBg: string; glowColor: string }> = {
  anime: { heroGradient: "linear-gradient(135deg, #0f0515 0%, #1a0a2e 30%, #2d1b4e 60%, #0f0515 100%)", accentText: "text-fuchsia-300", accentBorder: "border-fuchsia-400/40", accentBg: "bg-fuchsia-400/10", glowColor: "rgb(168,85,247)" },
  gaming: { heroGradient: "linear-gradient(135deg, #050f0f 0%, #0a1f1f 30%, #0d3030 60%, #050f0f 100%)", accentText: "text-cyan-300", accentBorder: "border-cyan-400/40", accentBg: "bg-cyan-400/10", glowColor: "rgb(34,211,238)" },
  "cine-series": { heroGradient: "linear-gradient(135deg, #0a0515 0%, #150a2e 30%, #1f1540 60%, #0a0515 100%)", accentText: "text-violet-300", accentBorder: "border-violet-400/40", accentBg: "bg-violet-400/10", glowColor: "rgb(167,139,250)" },
  accesorios: { heroGradient: "linear-gradient(135deg, #0f0a00 0%, #1a1200 30%, #2d2000 60%, #0f0a00 100%)", accentText: "text-amber-300", accentBorder: "border-amber-400/40", accentBg: "bg-amber-400/10", glowColor: "rgb(251,191,36)" },
  drops: { heroGradient: "linear-gradient(135deg, #0f0515 0%, #1a0a2e 30%, #2d1b4e 60%, #0f0515 100%)", accentText: "text-rose-300", accentBorder: "border-rose-400/40", accentBg: "bg-rose-400/10", glowColor: "rgb(251,113,133)" },
  "mundial-2026": { heroGradient: "linear-gradient(135deg, #0f0a00 0%, #1a1200 30%, #2d2000 60%, #0f0a00 100%)", accentText: "text-amber-300", accentBorder: "border-amber-400/40", accentBg: "bg-amber-400/10", glowColor: "rgb(251,191,36)" },
  "mystery-box": { heroGradient: "linear-gradient(135deg, #0f0a00 0%, #1a1200 30%, #2d2000 60%, #0f0a00 100%)", accentText: "text-amber-300", accentBorder: "border-amber-400/40", accentBg: "bg-amber-400/10", glowColor: "rgb(251,191,36)" },
};

export default function CategoryCatalog({
  category,
  products,
  order,
}: {
  category: Category;
  products: Product[];
  order?: string;
}) {
  const now = getNow();
  const editionBySlug = new Map<string, number>();
  [...products]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .forEach((product, index) => editionBySlug.set(product.slug, index + 1));

  const items: CatalogItem[] = sortProducts(products, order).map((product) => ({
    product,
    status: dropStatus(product, now),
    edition: editionBySlug.get(product.slug),
  }));

  const Layout = layouts[category.id] ?? DefaultLayout;
  const accent = categoryAccents[category.id] ?? categoryAccents.anime;

  const categoryChips = categories.filter(
    (c) => c.id !== "drops" && c.id !== "mystery-box",
  );

  return (
    <div className="bg-zinc-950 pb-20">
      {/* ===== HERO ===== */}
      <section
        className="relative overflow-hidden border-b-4 border-zinc-800"
        style={{ background: accent.heroGradient }}
      >
        <div className="arcade-grid absolute inset-0" />
        <div className="crt-overlay" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full blur-3xl opacity-30"
          style={{ backgroundColor: accent.glowColor }}
        />
        <div
          className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: accent.glowColor }}
        />

        {/* Floating emoji */}
        <div className="pointer-events-none absolute right-[10%] top-[15%] text-[120px] opacity-[0.06] select-none sm:text-[180px]" aria-hidden="true">
          {category.emoji}
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 pt-12 pb-10 text-center sm:px-6">
          <FadeIn>
            <div className="mb-4">
              <Breadcrumbs
                items={[
                  { label: "Inicio", href: "/" },
                  { label: category.name },
                ]}
              />
            </div>

            <span className={`pixel inline-flex items-center gap-2 rounded-sm border-2 px-4 py-2 text-[10px] tracking-widest ${accent.accentBorder} ${accent.accentBg} ${accent.accentText}`}>
              {category.emoji} {category.name.toUpperCase()} · CRAFT3D
            </span>

            <h1 className="pixel mt-5 text-4xl leading-snug text-zinc-100 sm:text-5xl">
              <span className={accent.accentText}>{category.name.toUpperCase()}</span>
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              {category.description}
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <span className={`pixel rounded-sm border px-4 py-2 text-[10px] tracking-widest ${accent.accentBorder} ${accent.accentBg} ${accent.accentText}`}>
                ★ {products.length} {products.length === 1 ? "PRODUCTO" : "PRODUCTOS"}
              </span>
              <Link
                href="/catalogo"
                className="pixel rounded-sm border border-zinc-700 bg-zinc-900/60 px-4 py-2 text-[10px] tracking-widest text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
              >
                ← VER TODO EL CATÁLOGO
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===== FILTERS ===== */}
      <section className="border-b border-zinc-800/60">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <FadeIn>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/catalogo"
                  className="rounded-full border border-zinc-800 px-4 py-1.5 text-sm text-zinc-400 transition-colors hover:border-zinc-600"
                >
                  Todos
                </Link>
                {categoryChips.map((c) => (
                  <Link
                    key={c.id}
                    href={categoryLandingUrl(c.id)}
                    className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                      category.id === c.id
                        ? `border-amber-400/70 bg-amber-400/10 text-amber-300`
                        : "border-zinc-800 text-zinc-400 hover:border-zinc-600"
                    }`}
                  >
                    {c.emoji} {c.name}
                  </Link>
                ))}
              </div>
              <SortSelect
                order={order}
                basePath="/"
                extra={{ categoria: category.id }}
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===== PRODUCTS GRID ===== */}
      <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
        {items.length > 0 ? (
          <Layout items={items} />
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-14 text-center">
            <p className="pixel text-[10px] tracking-widest text-zinc-500">
              TODAVÍA NO HAY {category.name.toUpperCase()} EN LA TIENDA
            </p>
            <Link
              href="/catalogo"
              className="mt-4 inline-block rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-amber-400/60 hover:text-amber-300"
            >
              Ver catálogo completo
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
