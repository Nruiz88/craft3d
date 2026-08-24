import Link from "next/link";
import type { Product } from "@/lib/products/types";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import FadeIn from "@/components/ui/fade-in";
import ProductCard from "@/components/product/product-card";

export interface ThemedLandingConfig {
  id: string;
  name: string;
  emoji: string;
  description: string;
  longDescription: string;
  heroGradient: string;
  accentColor: string;
  accentBorder: string;
  accentBg: string;
  accentText: string;
  glowColor: string;
  heroGlyph?: string;
  tags?: string[];
  features?: { icon: string; title: string; desc: string }[];
}

export default function ThemedLanding({
  config,
  products,
}: {
  config: ThemedLandingConfig;
  products: Product[];
}) {
  return (
    <div className="bg-zinc-950 pb-20">
      {/* ===== HERO ===== */}
      <section
        className="relative overflow-hidden border-b-4 border-zinc-800"
        style={{
          background: config.heroGradient,
        }}
      >
        {/* Grid overlay */}
        <div className="arcade-grid absolute inset-0" />
        <div className="crt-overlay" aria-hidden="true" />

        {/* Decorative glows */}
        <div
          className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full blur-3xl opacity-30"
          style={{ backgroundColor: config.glowColor }}
        />
        <div
          className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: config.glowColor }}
        />

        {/* Floating glyph (decorative) */}
        {config.heroGlyph ? (
          <div className="pointer-events-none absolute right-[10%] top-[15%] text-[120px] opacity-[0.06] select-none sm:text-[180px] lg:text-[220px]" aria-hidden="true">
            {config.heroGlyph}
          </div>
        ) : null}

        <div className="relative z-10 mx-auto max-w-6xl px-4 pt-16 pb-14 text-center sm:px-6 sm:pt-20 sm:pb-16">
          <FadeIn>
            {/* Breadcrumb */}
            <div className="mb-6">
              <Breadcrumbs
                items={[
                  { label: "Inicio", href: "/" },
                  { label: config.name },
                ]}
              />
            </div>

            {/* Badge */}
            <span
              className={`pixel inline-flex items-center gap-2 rounded-sm border-2 px-4 py-2 text-[10px] tracking-widest ${config.accentBorder} ${config.accentBg} ${config.accentText}`}
            >
              {config.emoji} {config.name.toUpperCase()} · CRAFT3D
            </span>

            {/* Title */}
            <h1 className="pixel mt-6 text-5xl leading-snug text-zinc-100 sm:text-6xl lg:text-7xl">
              {config.name.split(" ").map((word, i) => (
                <span key={i}>
                  {i > 0 ? " " : ""}
                  {i === config.name.split(" ").length - 1 ? (
                    <span className={config.accentText}>{word}</span>
                  ) : (
                    word
                  )}
                </span>
              ))}
            </h1>

            {/* Description */}
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
              {config.longDescription}
            </p>

            {/* Stats */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <span
                className={`pixel rounded-sm border px-4 py-2 text-[10px] tracking-widest ${config.accentBorder} ${config.accentBg} ${config.accentText}`}
              >
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

      {/* ===== FEATURES ===== */}
      {config.features && config.features.length > 0 ? (
        <section className="border-b border-zinc-800/60">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <FadeIn>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {config.features.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5"
                  >
                    <span className="text-2xl" aria-hidden="true">
                      {feature.icon}
                    </span>
                    <div>
                      <h3 className="pixel text-[11px] tracking-wider text-zinc-200">
                        {feature.title.toUpperCase()}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>
      ) : null}

      {/* ===== TAGS ===== */}
      {config.tags && config.tags.length > 0 ? (
        <section className="border-b border-zinc-800/60">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
            <FadeIn>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {config.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`rounded-sm border px-3 py-1.5 text-[10px] pixel tracking-widest ${config.accentBorder} ${config.accentBg} ${config.accentText}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>
      ) : null}

      {/* ===== PRODUCTS GRID ===== */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        <FadeIn>
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="pixel text-[10px] tracking-widest text-zinc-500">
                COLECCIÓN {config.name.toUpperCase()}
              </p>
              <h2 className="pixel mt-1 text-xl text-zinc-100">
                TODOS LOS <span className={config.accentText}>{config.name.toUpperCase()}</span>
              </h2>
            </div>
            <Link
              href={`/catalogo?categorias=${config.id}`}
              className="hidden items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-200 sm:inline-flex"
            >
              Ver catálogo completo
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          </div>
        </FadeIn>

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
              PRÓXIMAMENTE HABRÁ {config.name.toUpperCase()} EN LA TIENDA
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

      {/* ===== CTA ===== */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        <FadeIn>
          <div
            className={`relative overflow-hidden rounded-2xl border-2 p-8 text-center sm:p-12 ${config.accentBorder}`}
            style={{
              background: `linear-gradient(135deg, rgba(0,0,0,0.4) 0%, ${config.glowColor}15 100%)`,
            }}
          >
            <p className="pixel text-[10px] tracking-widest text-zinc-500">
              ★ ¿NO ENCONTRÁS LO QUE BUSCÁS? ★
            </p>
            <h2 className="pixel mt-3 text-xl text-zinc-100">
              ESCRIBINOS
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-zinc-500">
              Hacemos pedidos personalizados. Contanos tu idea y te armamos
              una cotización.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://wa.me/5492994018220?text=Hola!%20Quiero%20consultar%20por%20una%20pieza%20personalizada%20de%20la%20categoría%20de%20Craft3d"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 rounded-lg border-2 px-5 py-2.5 text-sm font-bold transition-colors ${config.accentBorder} ${config.accentBg} ${config.accentText} hover:opacity-80`}
              >
                💬 CHATEÁ POR WHATSAPP
              </a>
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
              >
                Ver todo el catálogo
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
