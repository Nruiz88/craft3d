import Link from "next/link";
import { redirect } from "next/navigation";
import { categories, categoryById } from "@/lib/products";
import { getAllProducts } from "@/lib/store";
import { site } from "@/lib/site";
import { dropStatus } from "@/lib/drops";
import ProductCard from "@/components/product-card";
import SectionHeading from "@/components/section-heading";
import { arcadeCharacters, PixelInvader } from "@/components/pixel-sprites";
import DropCountdown from "@/components/drop-countdown";
import DropSpotlight from "@/components/drop-spotlight";
import NextDropPanel from "@/components/next-drop-panel";
import CategoryCatalog from "@/components/category-catalog";

export const dynamic = "force-dynamic";

const marqueeItems = [
  "DROP ESPECIALES",
  "PIEZAS ÚNICAS",
  "EDICIÓN LIMITADA",
  "CUANDO SE AGOTA, NO VUELVE",
];

const categoryAccents: Record<
  string,
  { card: string; text: string; emojiGlow: string; glyph: string }
> = {
  anime: {
    card: "hover:border-fuchsia-400/60 hover:shadow-[0_0_40px_rgba(232,121,249,0.12)]",
    text: "text-fuchsia-300",
    emojiGlow:
      "group-hover:border-fuchsia-400/60 group-hover:shadow-[0_0_24px_rgba(232,121,249,0.35)]",
    glyph: "アニメ",
  },
  gaming: {
    card: "hover:border-cyan-400/60 hover:shadow-[0_0_40px_rgba(34,211,238,0.14)]",
    text: "text-cyan-300",
    emojiGlow:
      "group-hover:border-cyan-400/60 group-hover:shadow-[0_0_24px_rgba(34,211,238,0.35)]",
    glyph: "ゲーム",
  },
  "cine-series": {
    card: "hover:border-violet-400/60 hover:shadow-[0_0_40px_rgba(167,139,250,0.12)]",
    text: "text-violet-300",
    emojiGlow:
      "group-hover:border-violet-400/60 group-hover:shadow-[0_0_24px_rgba(167,139,250,0.35)]",
    glyph: "映画",
  },
  accesorios: {
    card: "hover:border-amber-400/60 hover:shadow-[0_0_40px_rgba(251,191,36,0.14)]",
    text: "text-amber-300",
    emojiGlow:
      "group-hover:border-amber-400/60 group-hover:shadow-[0_0_24px_rgba(251,191,36,0.35)]",
    glyph: "雑貨",
  },
  drops: {
    card: "hover:border-rose-400/60 hover:shadow-[0_0_40px_rgba(251,113,133,0.14)]",
    text: "text-rose-300",
    emojiGlow:
      "group-hover:border-rose-400/60 group-hover:shadow-[0_0_24px_rgba(251,113,133,0.35)]",
    glyph: "限定",
  },
  "mundial-2026": {
    card: "hover:border-sky-400/60 hover:shadow-[0_0_40px_rgba(56,189,248,0.14)]",
    text: "text-sky-300",
    emojiGlow:
      "group-hover:border-sky-400/60 group-hover:shadow-[0_0_24px_rgba(56,189,248,0.35)]",
    glyph: "２０２６",
  },
};

function getNow(): number {
  return Date.now();
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  const allProducts = await getAllProducts();

  const activeCategory = categories.some((c) => c.id === categoria)
    ? categoria
    : undefined;

  // Vista filtrada de catálogo (modo ?categoria=...)
  if (activeCategory === "drops") {
    redirect("/drops");
  }

  if (activeCategory) {
    const filtered = allProducts.filter((p) => p.category === activeCategory);
    return (
      <CategoryCatalog
        category={categoryById[activeCategory as keyof typeof categoryById]}
        products={filtered}
      />
    );
  }

  const featured = allProducts.filter((p) => p.featured);
  const latest = [...allProducts]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);
  const drops = allProducts.filter((p) => p.category === "drops");

  const now = getNow();
  const withStatus = drops
    .map((product) => ({ product, status: dropStatus(product, now) }))
    .sort((a, b) =>
      (a.product.dropStartsAt ?? a.product.createdAt).localeCompare(
        b.product.dropStartsAt ?? b.product.createdAt,
      ),
    );

  const editionBySlug = new Map<string, number>();
  [...drops]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .forEach((product, index) => editionBySlug.set(product.slug, index + 1));

  const activeDrops = withStatus.filter((entry) => entry.status === "active");
  const upcomingDrops = withStatus.filter((entry) => entry.status === "upcoming");
  const featuredDrop = activeDrops[0] ?? upcomingDrops[0] ?? null;
  const gridDrops = featuredDrop
    ? withStatus
        .filter((entry) => entry.product.slug !== featuredDrop.product.slug)
        .map((entry) => entry.product)
    : drops;

  return (
    <>
      {/* ===== HERO ARCADE ===== */}
      <section
        id="inicio"
        className="arcade-grid relative overflow-hidden border-b-4 border-zinc-800 bg-black"
      >
        <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-fuchsia-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-24 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="crt-overlay" aria-hidden="true" />

        <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="relative text-center lg:text-left">
            <p className="pixel inline-flex items-center justify-center gap-2 text-[11px] tracking-widest text-cyan-300 neon-cyan sm:text-xs lg:justify-start">
              <span aria-hidden="true">▶</span> COLECCIÓN CRAFT3D · ARCADE
            </p>
            <h1 className="mt-7 text-4xl leading-tight sm:text-5xl lg:text-6xl">
              <span className="pixel block text-zinc-100">CRAFT</span>
              <span className="pixel block neon-amber">3D</span>
            </h1>
            <p className="mt-5 text-base leading-relaxed text-zinc-400 sm:text-lg">
              {site.tagline}. Cuadros Hueforge, figuras, dummys y objetos únicos
              que salen de la impresora para tu espacio.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Link
                href="#destacados"
                className="pixel animate-blink rounded-md bg-amber-400 px-7 py-3.5 text-xs tracking-widest text-zinc-950 shadow-[0_0_24px_rgba(251,191,36,0.5)] transition-colors hover:bg-amber-300"
              >
                ▶ INSERT COIN
              </Link>
              <Link
                href="#categorias"
                className="pixel rounded-md border-2 border-cyan-400/60 px-7 py-3.5 text-xs tracking-widest text-cyan-300 transition-colors hover:border-cyan-300 hover:bg-cyan-400/10"
              >
                VER CATÁLOGO
              </Link>
            </div>
            <dl className="mt-10 flex items-center justify-center gap-8 lg:justify-start">
              <div>
                <dt className="sr-only">Productos</dt>
                <dd className="pixel text-xl text-amber-300 neon-amber sm:text-2xl">
                  {allProducts.length}+
                </dd>
                <p className="pixel mt-1.5 text-[10px] tracking-widest text-zinc-500">
                  PRODUCTOS
                </p>
              </div>
              <div className="h-12 w-px bg-zinc-800" aria-hidden="true" />
              <div>
                <dt className="sr-only">Categorías</dt>
                <dd className="pixel text-xl text-cyan-300 neon-cyan sm:text-2xl">
                  {categories.length}
                </dd>
                <p className="pixel mt-1.5 text-[10px] tracking-widest text-zinc-500">
                  CATEGORÍAS
                </p>
              </div>
              <div className="h-12 w-px bg-zinc-800" aria-hidden="true" />
              <div>
                <dt className="sr-only">Proceso</dt>
                <dd className="pixel text-xl text-zinc-100 sm:text-2xl">100%</dd>
                <p className="pixel mt-1.5 text-[10px] tracking-widest text-zinc-500">
                  A MANO
                </p>
              </div>
            </dl>
          </div>

          <div className="relative z-10 flex items-center justify-center lg:justify-end">
            <div className="relative rounded-2xl border-4 border-zinc-700 bg-zinc-950 p-5 pb-0 shadow-[0_0_60px_rgba(34,211,238,0.12)]">
              <div className="relative overflow-hidden rounded-lg border-2 border-zinc-800 bg-black px-6 py-7">
                <div className="crt-overlay" aria-hidden="true" />
                <p className="pixel mb-6 text-center text-[10px] tracking-widest text-zinc-500">
                  SELECT YOUR PLAYER
                </p>
                <div className="grid grid-cols-3 gap-x-6 gap-y-7">
                  {arcadeCharacters.map(({ name, sprite: Sprite }, index) => (
                    <div
                      key={name}
                      className={`flex flex-col items-center gap-2.5 ${
                        index % 2 === 0
                          ? "animate-float"
                          : "animate-float-delay"
                      }`}
                    >
                      <Sprite className="h-14 w-14 drop-shadow-[0_0_14px_rgba(247,208,44,0.25)] sm:h-16 sm:w-16" />
                      <span className="pixel text-[8px] tracking-widest text-zinc-500">
                        {name}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="pixel animate-blink mt-7 text-center text-[11px] tracking-widest text-amber-300 neon-amber">
                  PRESS START
                </p>
              </div>
              <div
                className="mx-auto h-8 w-28 rounded-b-xl border-x-4 border-b-4 border-zinc-700 bg-zinc-900"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== MARQUEE · DROP ESPECIALES ===== */}
      <div className="border-b-4 border-zinc-800 bg-amber-400" aria-hidden="true">
        <div className="relative overflow-hidden py-3">
          <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap">
            {[0, 1].map((copy) => (
              <span key={copy} className="flex items-center gap-8">
                {marqueeItems.map((text) => (
                  <span
                    key={text}
                    className="pixel text-[11px] tracking-widest text-zinc-950"
                  >
                    ★ {text}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ===== DROPS ESPECIALES ÚNICOS ===== */}
      <section
        id="drops"
        className="arcade-grid relative overflow-hidden border-b-4 border-zinc-800 bg-zinc-950"
      >
        <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl" />
        <div className="crt-overlay" aria-hidden="true" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-10 text-center">
            <p className="pixel inline-flex items-center gap-2 rounded-sm border-2 border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-[10px] tracking-widest text-amber-300">
              ★ CRAFT3D · DROP SYSTEM ★
            </p>
            <h2 className="pixel mt-5 text-3xl leading-snug text-zinc-100 sm:text-4xl">
              DROPS QUE NO <span className="text-rose-400 neon-amber">VUELVEN</span>
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500 sm:text-base">
              Ediciones numeradas y limitadas de Craft3d. Un solo tiraje, pocas
              unidades y listo: cuando se agota, no se vuelve a imprimir nunca.
            </p>
          </div>

          {drops.length > 0 ? (
            <>
              {featuredDrop ? (
                <div className="mb-12">
                  {featuredDrop.status === "active" ? (
                    <DropSpotlight
                      product={featuredDrop.product}
                      edition={editionBySlug.get(featuredDrop.product.slug)}
                    />
                  ) : (
                    <NextDropPanel
                      product={featuredDrop.product}
                      edition={editionBySlug.get(featuredDrop.product.slug)}
                    />
                  )}
                </div>
              ) : null}

              {gridDrops.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {gridDrops.map((product) => (
                    <ProductCard key={product.slug} product={product} />
                  ))}
                </div>
              ) : null}

              {drops.length === 1 ? (
                <p className="mt-8 text-center text-sm text-zinc-500">
                  Solo hay un drop ahora mismo.{" "}
                  <Link
                    href="/drops"
                    className="font-medium text-amber-300 transition-colors hover:text-amber-200"
                  >
                    Ver todos los drops ▸▸
                  </Link>
                </p>
              ) : null}
            </>
          ) : (
            <div className="relative overflow-hidden rounded-3xl border-2 border-amber-400/50 bg-gradient-to-br from-zinc-900 via-zinc-950 to-rose-950/40 shadow-[0_0_80px_rgba(251,191,36,0.08)]">
              <span
                className="pixel pointer-events-none absolute -right-8 top-6 rotate-45 border-2 border-rose-500/40 bg-rose-950/60 px-6 py-1 text-[9px] tracking-widest text-rose-300"
                aria-hidden="true"
              >
                NO VUELVE
              </span>

              <div className="flex items-center justify-between gap-4 border-b-2 border-amber-400/30 bg-black/50 px-6 py-3">
                <span className="pixel text-[10px] tracking-widest text-amber-300 neon-amber">
                  ▶ DROP 001 · EDICIÓN NUMERADA
                </span>
                <span className="pixel animate-blink text-[10px] tracking-widest text-rose-300">
                  ● PRÓXIMAMENTE
                </span>
              </div>

              <div className="grid grid-cols-1 items-center gap-10 p-8 sm:p-10 lg:grid-cols-2">
                <div>
                  <p className="pixel text-[10px] tracking-widest text-zinc-500">
                    EL PRÓXIMO DROP ABRE EN
                  </p>
                  <div className="mt-3">
                    <DropCountdown target={site.dropOpensAt} />
                  </div>

                  <div className="mt-8">
                    <div className="flex items-center justify-between gap-3">
                      <p className="pixel text-[10px] tracking-widest text-zinc-500">
                        UNIDADES · NÚMERADAS
                      </p>
                      <p className="pixel text-[10px] tracking-widest text-amber-300">
                        001 / 010
                      </p>
                    </div>
                    <div className="mt-2.5 h-3 overflow-hidden rounded-full border-2 border-zinc-800 bg-black/70">
                      <div className="flex h-full w-full">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <span
                            key={i}
                            className={`h-full flex-1 border-r border-zinc-950 ${
                              i === 0 ? "bg-amber-400" : "bg-zinc-800"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="pixel mt-3 text-[9px] leading-relaxed tracking-widest text-rose-300">
                      ⚠ CUANDO SE AGOTA, NO SE VUELVE A IMPRIMIR
                    </p>
                  </div>

                  <p className="mt-6 max-w-md text-sm leading-relaxed text-zinc-400">
                    Cada unidad sale con su número grabado y certificado de
                    autenticidad Craft3d. Sumate a la lista de espera y enterate
                    primero cuando abra el drop.
                  </p>

                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    <a
                      href={`${site.whatsapp}?text=${encodeURIComponent(
                        "Hola Craft3d! Quiero reservar mi número del DROP 001.",
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pixel inline-flex items-center gap-2 rounded-md bg-amber-400 px-6 py-3 text-[11px] tracking-widest text-zinc-950 shadow-[0_0_24px_rgba(251,191,36,0.5)] transition-colors hover:bg-amber-300"
                    >
                      ▶ RESERVAR MI NÚMERO
                    </a>
                    <span className="pixel text-[9px] tracking-widest text-zinc-600">
                      10 UNID. · SIN REPOSICIÓN
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="animate-float">
                      <PixelInvader className="h-44 w-44 drop-shadow-[0_0_24px_rgba(57,255,20,0.35)] sm:h-56 sm:w-56" />
                    </div>
                    <div className="pixel mx-auto mt-7 w-fit rounded-sm border border-zinc-800 bg-black/70 px-3 py-1.5 text-[9px] tracking-widest text-zinc-400">
                      PIEZA #001 · <span className="text-amber-300">CRAFT3D</span>
                    </div>
                    <div className="mx-auto mt-4 h-3 w-28 rounded-full bg-zinc-800/80 blur-[2px]" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ===== DESTACADOS ===== */}
      {featured.length > 0 && (
        <section id="destacados" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <SectionHeading
            eyebrow="Lo más elegido"
            title="Productos destacados"
            description="Las piezas favoritas de la tienda: seleccionadas por calidad, detalle y color."
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 3).map((product) => (
              <ProductCard key={product.slug} product={product} size="large" />
            ))}
          </div>
        </section>
      )}

      {/* ===== CATEGORÍAS ===== */}
      <section id="categorias" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="Explorá por tipo"
          title="Categorías"
          description="Elegí qué tipo de pieza estás buscando: desde arte en capas hasta figuras articuladas."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => {
            const count = allProducts.filter(
              (p) => p.category === category.id,
            ).length;
            const accent = categoryAccents[category.id] ?? categoryAccents.anime;
            return (
              <a
                key={category.id}
                href={`/?categoria=${category.id}`}
                data-category={category.id}
                className={`group relative overflow-hidden rounded-2xl border-2 border-zinc-800 bg-zinc-900/60 transition-all duration-300 hover:-translate-y-1 ${accent.card}`}
              >
                <span
                  className="cat-card-pattern pointer-events-none absolute inset-0"
                  aria-hidden="true"
                />
                <span
                  className="cat-card-glyph pointer-events-none absolute -bottom-2 right-1"
                  aria-hidden="true"
                >
                  {accent.glyph}
                </span>
                <div className="cat-card-header flex items-center justify-between border-b-2 border-zinc-800 bg-zinc-950/70 px-5 py-2.5">
                  <span
                    className={`pixel text-[9px] tracking-widest ${accent.text}`}
                  >
                    ▶ {category.name.toUpperCase()}
                  </span>
                  <span className="pixel text-[9px] tracking-widest text-zinc-600">
                    {String(index + 1).padStart(2, "0")}/
                    {String(categories.length).padStart(2, "0")}
                  </span>
                </div>

                <div className="cat-card-body flex flex-col items-center px-5 py-8 text-center">
                  <span
                    className={`flex h-16 w-16 items-center justify-center rounded-xl border-2 border-zinc-800 bg-zinc-950 text-3xl shadow-[inset_0_0_24px_rgba(0,0,0,0.7)] transition-all duration-300 ${accent.emojiGlow}`}
                    aria-hidden="true"
                  >
                    {category.emoji}
                  </span>
                  <h3
                    className={`pixel mt-5 text-sm tracking-widest ${accent.text}`}
                  >
                    {category.name.toUpperCase()}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-500">
                    {category.description}
                  </p>
                  <span
                    className={`pixel mt-5 inline-flex items-center gap-1.5 text-[10px] tracking-widest text-zinc-600 transition-colors ${accent.text}`}
                  >
                    VER PIEZAS{" "}
                    <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5">
                      ▸▸
                    </span>
                    <span className="ml-2 rounded-sm border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-[9px] text-zinc-400">
                      {count}
                    </span>
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* ===== NOVEDADES ===== */}
      <section id="novedades" className="border-t border-zinc-800 bg-zinc-900/20 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Recién llegados"
            title="Novedades"
            description="Las piezas que acaban de salir del taller, recién agregadas a la tienda."
            href="/#categorias"
            linkLabel="Explorar categorías"
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== PROCESO ===== */}
      <section id="proceso" className="border-t border-zinc-800 bg-zinc-900/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <SectionHeading
            eyebrow="De la idea a tu casa"
            title="Cómo trabajamos"
            description="Cada pedido pasa por el mismo proceso, con control de calidad en cada paso."
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                icon: "🎨",
                title: "Diseño y modelado",
                text: "Cada pieza se modela o prepara para imprimir con atención al detalle y a las capas de color.",
              },
              {
                icon: "🖨️",
                title: "Impresión capa a capa",
                text: "Impresión con calibración fina para lograr superficies limpias, encastres correctos y colores vivos.",
              },
              {
                icon: "📦",
                title: "Terminado y envío",
                text: "Lijado, limpieza de soportes y control de calidad antes de embalar y despachar tu pedido.",
              },
            ].map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6"
              >
                <span className="text-3xl" aria-hidden="true">
                  {step.icon}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-zinc-100">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CONTACTO Y REDES ===== */}
      <section id="contacto" className="border-t border-zinc-800">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <SectionHeading
            eyebrow="¿Tenés dudas o querés algo a medida?"
            title="Contacto y redes"
            description="Escribinos por Instagram, WhatsApp o mail. También hacemos piezas personalizadas."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 transition-colors hover:border-amber-400/50"
            >
              <span className="text-3xl" aria-hidden="true">
                📷
              </span>
              <div>
                <h3 className="font-semibold text-zinc-100 group-hover:text-amber-300">
                  Instagram
                </h3>
                <p className="text-sm text-zinc-500">{site.instagramLabel}</p>
              </div>
            </a>
            <a
              href={site.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 transition-colors hover:border-emerald-400/50"
            >
              <span className="text-3xl" aria-hidden="true">
                💬
              </span>
              <div>
                <h3 className="font-semibold text-zinc-100 group-hover:text-emerald-300">
                  WhatsApp
                </h3>
                <p className="text-sm text-zinc-500">{site.whatsappLabel}</p>
              </div>
            </a>
            <a
              href={`mailto:${site.email}`}
              className="group flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 transition-colors hover:border-sky-400/50"
            >
              <span className="text-3xl" aria-hidden="true">
                ✉️
              </span>
              <div>
                <h3 className="font-semibold text-zinc-100 group-hover:text-sky-300">
                  Email
                </h3>
                <p className="text-sm text-zinc-500">{site.email}</p>
              </div>
            </a>
          </div>
          <p className="mt-6 text-center text-xs text-zinc-600">
            Los datos de contacto son de ejemplo. Editá `lib/site.ts` con tus
            redes reales.
          </p>
        </div>
      </section>
    </>
  );
}
