import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { categories } from "@/lib/products";
import { getAllProducts } from "@/lib/store";
import ProductCard from "@/components/product-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Todo el catálogo de Craft3d: figuras, cuadros Hueforge, decoración y accesorios impresos en 3D.",
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
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;

  // Los drops viven en su propia página
  if (categoria === "drops") {
    redirect("/drops");
  }

  // Cada categoría tiene su vista temática en la home (?categoria=...)
  if (categoria && categories.some((c) => c.id === categoria)) {
    redirect(`/?categoria=${categoria}`);
  }

  const allProducts = await getAllProducts();
  const products = allProducts
    .filter((p) => p.category !== "drops")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const counts = new Map<string, number>();
  products.forEach((p) =>
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
              .filter((c) => c.id !== "drops")
              .map((c) => (
                <Link
                  key={c.id}
                  href={`/?categoria=${c.id}`}
                  className="pixel rounded-sm border border-zinc-700 bg-zinc-900/60 px-3 py-1.5 tracking-widest text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
                >
                  {c.emoji} {c.name.toUpperCase()} · {counts.get(c.id) ?? 0}
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* ===== GRID ===== */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-14 text-center">
            <p className="pixel text-[10px] tracking-widest text-zinc-500">
              TODAVÍA NO HAY PRODUCTOS PUBLICADOS
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
