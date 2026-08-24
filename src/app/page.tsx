import { redirect } from "next/navigation";
import { categories, categoryById } from "@/lib/products";
import { getAllProducts } from "@/lib/orders/store";
import { dropStatus } from "@/lib/drops";
import { getMysteryPoolPreview } from "@/lib/mystery-box";
import ProductCard from "@/components/product/product-card";
import DropCardHome from "@/components/drops/drop-card-home";
import MysteryBoxCard from "@/components/mystery-box/mystery-box-card";
import SectionHeading from "@/components/ui/section-heading";
import DropSpotlight from "@/components/drops/drop-spotlight";
import NextDropPanel from "@/components/drops/next-drop-panel";
import CategoryCatalog from "@/components/catalog/category-catalog";
import FadeIn from "@/components/ui/fade-in";
import HeroSection from "./home/hero";
import CategoriesSection from "./home/categories";
import ProcessSection from "./home/process";
import ContactSection from "./home/contact";
import FaqSchema from "@/components/ui/faq-schema";

export const dynamic = "force-dynamic";

function getNow(): number {
  return Date.now();
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; orden?: string }>;
}) {
  const { categoria, orden } = await searchParams;
  const allProducts = await getAllProducts();

  const activeCategory = categories.some((c) => c.id === categoria) ? categoria : undefined;

  if (activeCategory === "drops") redirect("/drops");
  if (activeCategory === "mystery-box") redirect("/mysterybox");

  if (activeCategory) {
    const filtered = allProducts.filter((p) => p.category === activeCategory);
    return (
      <CategoryCatalog
        category={categoryById[activeCategory as keyof typeof categoryById]}
        products={filtered}
        order={orden}
      />
    );
  }

  const featured = allProducts.filter((p) => p.featured);
  const latest = [...allProducts].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);
  const drops = allProducts.filter((p) => p.category === "drops");
  const mysteryBoxes = allProducts.filter((p) => p.category === "mystery-box");
  const boxPreviews = new Map(mysteryBoxes.map((box) => [box.slug, getMysteryPoolPreview(allProducts, box)]));

  const now = getNow();
  const withStatus = drops
    .map((product) => ({ product, status: dropStatus(product, now) }))
    .sort((a, b) => (a.product.dropStartsAt ?? a.product.createdAt).localeCompare(b.product.dropStartsAt ?? b.product.createdAt));

  const editionBySlug = new Map<string, number>();
  [...drops].sort((a, b) => a.createdAt.localeCompare(b.createdAt)).forEach((product, index) => editionBySlug.set(product.slug, index + 1));

  const activeDrops = withStatus.filter((entry) => entry.status === "active");
  const upcomingDrops = withStatus.filter((entry) => entry.status === "upcoming");
  const featuredDrop = activeDrops[0] ?? upcomingDrops[0] ?? null;
  const gridDrops = featuredDrop
    ? withStatus.filter((entry) => entry.product.slug !== featuredDrop.product.slug).map((entry) => entry.product)
    : drops;

  return (
    <>
      <HeroSection productCount={allProducts.length} categoryCount={categories.length} featuredProducts={featured} />

      {/* DROPS */}
      <section id="drops" className="arcade-grid relative overflow-hidden border-b-4 border-zinc-800 bg-zinc-950">
        <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl" />
        <div className="crt-overlay" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <FadeIn>
            <div className="mb-10 text-center">
              <div className="mb-4 flex items-center justify-center gap-3">
                <span className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-amber-400/40" />
                <p className="pixel text-[10px] tracking-widest text-amber-300">★ CRAFT3D · DROP SYSTEM ★</p>
                <span className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-amber-400/40" />
              </div>
              <h2 className="pixel mt-3 text-3xl leading-snug text-zinc-100 sm:text-4xl">DROPS QUE NO <span className="text-rose-400 neon-amber">VUELVEN</span></h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500 sm:text-base">
                Ediciones numeradas y limitadas de Craft3d. Un solo tiraje, pocas unidades y listo: cuando se agota, no se vuelve a imprimir nunca.
              </p>
              {/* Stats */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[10px]">
                <span className="pixel rounded-sm border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 tracking-widest text-amber-300">
                  ● {drops.length} {drops.length === 1 ? "DROP" : "DROPS"}
                </span>
                {activeDrops.length > 0 ? (
                  <span className="pixel rounded-sm border border-emerald-400/40 bg-emerald-400/10 px-3 py-1.5 tracking-widest text-emerald-300">
                    ▶ {activeDrops.length} ACTIVO{activeDrops.length > 1 ? "S" : ""}
                  </span>
                ) : null}
                {upcomingDrops.length > 0 ? (
                  <span className="pixel rounded-sm border border-cyan-400/40 bg-cyan-400/10 px-3 py-1.5 tracking-widest text-cyan-300">
                    ◇ {upcomingDrops.length} PRÓXIMO{upcomingDrops.length > 1 ? "S" : ""}
                  </span>
                ) : null}
              </div>
            </div>
          </FadeIn>
          {drops.length > 0 ? (
            <>
              {featuredDrop ? (
                <FadeIn delay={150}>
                  <div className="mb-12">
                    {featuredDrop.status === "active" ? (
                      <DropSpotlight product={featuredDrop.product} edition={editionBySlug.get(featuredDrop.product.slug)} />
                    ) : (
                      <NextDropPanel product={featuredDrop.product} edition={editionBySlug.get(featuredDrop.product.slug)} />
                    )}
                  </div>
                </FadeIn>
              ) : null}
              {gridDrops.length > 0 ? (
                <>
                  {/* Separator */}
                  <FadeIn delay={180}>
                    <div className="mb-8 flex items-center gap-4">
                      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
                      <span className="pixel text-[9px] tracking-widest text-zinc-600">OTROS DROPS</span>
                      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
                    </div>
                  </FadeIn>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {gridDrops.map((product, i) => (
                      <FadeIn key={product.slug} delay={200 + i * 100}>
                        <DropCardHome
                          product={product}
                          edition={editionBySlug.get(product.slug) ?? i + 1}
                          isActive={withStatus.find((e) => e.product.slug === product.slug)?.status === "active"}
                        />
                      </FadeIn>
                    ))}
                  </div>
                </>
              ) : null}
            </>
          ) : null}
        </div>
      </section>

      {/* MYSTERY BOXES */}
      {mysteryBoxes.length > 0 ? (
        <section id="mysterybox" className="arcade-grid relative overflow-hidden border-b-4 border-zinc-800 bg-zinc-950">
          <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="crt-overlay" aria-hidden="true" />
          <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <FadeIn>
              <div className="mb-10 text-center">
                <p className="pixel inline-flex items-center gap-2 rounded-sm border-2 border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-[10px] tracking-widest text-amber-300">★ CRAFT3D · MYSTERY BOX ★</p>
                <h2 className="pixel mt-5 text-3xl leading-snug text-zinc-100 sm:text-4xl">CAJAS <span className="text-amber-400 neon-amber">SORPRESA</span></h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500 sm:text-base">
                  Pagás la caja y te llega una pieza al azar de la categoría que elijas. La revelamos al preparar tu envío. ¿Qué te tocará? 🎁
                </p>
              </div>
            </FadeIn>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {mysteryBoxes.map((product, i) => (
                <FadeIn key={product.slug} delay={100 + i * 100}>
                  <MysteryBoxCard product={product} preview={boxPreviews.get(product.slug)} />
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* DESTACADOS */}
      {featured.length > 0 && (
        <section id="destacados" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <FadeIn>
            <SectionHeading eyebrow="Lo más elegido" title="Productos destacados" description="Las piezas favoritas de la tienda: seleccionadas por calidad, detalle y color." />
          </FadeIn>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 3).map((product, i) => (
              <FadeIn key={product.slug} delay={100 + i * 120}>
                <ProductCard product={product} size="large" />
              </FadeIn>
            ))}
          </div>
        </section>
      )}

      <FadeIn>
        <CategoriesSection allProducts={allProducts} />
      </FadeIn>

      {/* NOVEDADES */}
      <section id="novedades" className="border-t border-zinc-800 bg-zinc-900/20 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <FadeIn>
            <SectionHeading eyebrow="Recién llegados" title="Novedades" description="Las piezas que acaban de salir del taller." href="/catalogo" linkLabel="Ver todo el catálogo" />
          </FadeIn>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((product, i) => (
              <FadeIn key={product.slug} delay={100 + i * 100}>
                <ProductCard product={product} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <FadeIn>
        <ProcessSection />
      </FadeIn>
      <FadeIn>
        <FaqSchema />
      </FadeIn>
      <FadeIn>
        <ContactSection />
      </FadeIn>
    </>
  );
}
