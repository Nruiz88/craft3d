import Link from "next/link";
import { categories, categoryById } from "@/lib/products";
import { dropStatus, type DropStatus } from "@/lib/drops";
import { formatPrice } from "@/lib/format";
import type { Category, CategoryId, Product } from "@/lib/types";
import ProductCard from "@/components/product-card";
import DropCard from "@/components/drop-card";
import ProductVisual from "@/components/product-visual";
import AddToCart from "@/components/add-to-cart";

interface CatalogItem {
  product: Product;
  status: DropStatus;
  edition?: number;
}

function getNow(): number {
  return Date.now();
}

function CategoryTag({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={`pixel pointer-events-none absolute left-3 top-3 z-10 rounded-sm border-2 px-2.5 py-1 text-[9px] tracking-widest ${className}`}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

function AnimeLayout({ items }: { items: CatalogItem[] }) {
  return (
    <div className="category-products">
      {items.map(({ product }, index) =>
        index === 0 ? (
          <div key={product.slug} className="cat-feature relative">
            <ProductCard product={product} size="large" />
            <CategoryTag className="cat-tag">★ TOP</CategoryTag>
          </div>
        ) : (
          <ProductCard key={product.slug} product={product} />
        ),
      )}
    </div>
  );
}

function GamingLayout({ items }: { items: CatalogItem[] }) {
  const [banner, ...rest] = items;
  if (!banner) return null;
  const category = categoryById[banner.product.category];

  return (
    <div className="category-products">
      <article className="cat-banner group relative grid overflow-hidden rounded-2xl border-2 border-zinc-800 bg-zinc-900/60 transition-colors hover:border-cyan-400/50 lg:grid-cols-2">
        <ProductVisual
          product={banner.product}
          className="aspect-[4/3] w-full lg:h-full lg:aspect-auto"
        />
        <CategoryTag className="cat-tag">▶ PLAY</CategoryTag>
        <div className="flex flex-col gap-3 p-6 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="pixel inline-flex items-center gap-1.5 rounded-sm border border-zinc-800 bg-zinc-950 px-2 py-1 text-[9px] tracking-widest text-zinc-400">
              <span aria-hidden="true">{category.emoji}</span>
              {category.name}
            </span>
            <span className="pixel text-[9px] tracking-widest text-zinc-500">
              {banner.product.stock} EN STOCK
            </span>
          </div>
          <Link href={`/productos/${banner.product.slug}`}>
            <h2 className="text-xl font-semibold text-zinc-100 transition-colors group-hover:text-amber-300 sm:text-2xl">
              {banner.product.name}
            </h2>
          </Link>
          <p className="line-clamp-2 text-sm leading-relaxed text-zinc-400">
            {banner.product.description}
          </p>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-2">
            <span className="whitespace-nowrap text-xl font-bold tabular-nums text-amber-400 neon-amber sm:text-2xl">
              {formatPrice(banner.product.price)}
            </span>
            <AddToCart product={banner.product} className="px-5 py-2.5 sm:px-6 sm:py-3 sm:text-base" />
          </div>
        </div>
      </article>

      {rest.map(({ product }) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}

function CineLayout({ items }: { items: CatalogItem[] }) {
  return (
    <div className="category-products">
      {items.map(({ product }, index) => (
        <article
          key={product.slug}
          className="group flex overflow-hidden rounded-2xl border-2 border-zinc-800 bg-zinc-900/60 transition-colors hover:border-rose-400/50"
        >
          <div className="w-2/5 shrink-0 sm:w-2/5">
            <ProductVisual product={product} className="aspect-square h-full w-full" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="cat-scene-num pixel rounded-sm border-2 px-2 py-1 text-[9px] tracking-widest">
                ESC {String(index + 1).padStart(2, "0")}
              </span>
              <span className="pixel text-[9px] tracking-widest text-zinc-500">
                {product.stock} EN STOCK
              </span>
            </div>
            <Link href={`/productos/${product.slug}`}>
              <h2 className="truncate font-semibold text-zinc-100 transition-colors group-hover:text-amber-300">
                {product.name}
              </h2>
            </Link>
            <p className="line-clamp-2 text-xs leading-relaxed text-zinc-400">
              {product.description}
            </p>
            <div className="mt-auto flex items-center justify-between gap-2 pt-1">
              <span className="text-base font-bold tabular-nums text-amber-400 neon-amber">
                {formatPrice(product.price)}
              </span>
              <AddToCart product={product} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function AccesoriosLayout({ items }: { items: CatalogItem[] }) {
  return (
    <div className="category-products">
      {items.map(({ product }) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}

function DropsLayout({ items }: { items: CatalogItem[] }) {
  return (
    <>
      <Link
        href="/drops"
        className="pixel mb-5 flex flex-wrap items-center justify-center gap-2 rounded-md border-2 border-amber-400/40 bg-amber-400/10 px-5 py-3 text-[10px] tracking-widest text-amber-300 transition-colors hover:border-amber-400/70 hover:bg-amber-400/20"
      >
        <span aria-hidden="true">▶</span>
        GESTIÓN COMPLETA DE DROPS EN /DROPS
      </Link>

      <div className="category-products">
        {items.map(({ product, status, edition }) => (
          <DropCard key={product.slug} product={product} status={status} edition={edition} />
        ))}
      </div>
    </>
  );
}

function MundialLayout({ items }: { items: CatalogItem[] }) {
  return (
    <div className="category-products">
      {items.map(({ product }, index) => (
        <div
          key={product.slug}
          className={`cat-podium-item relative ${index === 0 ? "cat-podium-lead" : ""}`}
        >
          <ProductCard product={product} size={index === 0 ? "large" : "normal"} />
          {index < 3 ? <CategoryTag className="cat-rank">🏆 {index + 1}</CategoryTag> : null}
        </div>
      ))}
    </div>
  );
}

function DefaultLayout({ items }: { items: CatalogItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ product }) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}

const layouts: Partial<
  Record<CategoryId, (props: { items: CatalogItem[] }) => React.ReactNode>
> = {
  anime: AnimeLayout,
  gaming: GamingLayout,
  "cine-series": CineLayout,
  accesorios: AccesoriosLayout,
  drops: DropsLayout,
  "mundial-2026": MundialLayout,
};

export default function CategoryCatalog({
  category,
  products,
}: {
  category: Category;
  products: Product[];
}) {
  const now = getNow();
  const editionBySlug = new Map<string, number>();
  [...products]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .forEach((product, index) => editionBySlug.set(product.slug, index + 1));

  const items: CatalogItem[] = products.map((product) => ({
    product,
    status: dropStatus(product, now),
    edition: editionBySlug.get(product.slug),
  }));

  const Layout = layouts[category.id] ?? DefaultLayout;
  const chips = [
    { id: undefined, label: "Todos", href: "/#catalogo" },
    ...categories.map((c) => ({
      id: c.id,
      label: c.name,
      href: `/?categoria=${c.id}`,
    })),
  ];

  return (
    <section
      data-category={category.id}
      className="mx-auto max-w-6xl px-4 py-16 sm:px-6"
    >
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/#catalogo"
            className="mb-3 inline-block text-sm text-zinc-500 transition-colors hover:text-amber-300"
          >
            ← Volver a la home
          </Link>
          <h2 className="pixel text-lg leading-snug text-zinc-100 sm:text-xl">
            {category.name}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {products.length} {products.length === 1 ? "producto" : "productos"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <Link
              key={chip.label}
              href={chip.href}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                category.id === chip.id
                  ? "border-amber-400/70 bg-amber-400/10 text-amber-300"
                  : "border-zinc-800 text-zinc-400 hover:border-zinc-600"
              }`}
            >
              {chip.label}
            </Link>
          ))}
        </div>
      </div>

      {items.length > 0 ? (
        <Layout items={items} />
      ) : (
        <p className="rounded-2xl border border-dashed border-zinc-800 p-10 text-center text-zinc-500">
          No hay productos en esta categoría todavía.
        </p>
      )}
    </section>
  );
}
