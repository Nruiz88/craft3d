import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllProducts } from "@/lib/orders/store";
import { guideBySlug, guides, selectGuideProducts } from "@/lib/guides";
import ProductCard from "@/components/product/product-card";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import FadeIn from "@/components/ui/fade-in";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://craft3d.com.ar";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = guideBySlug[slug];
  if (!guide) return { title: "Guía no encontrada" };
  const canonical = `${siteUrl}/guias/${guide.slug}`;
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title: `${guide.title} · Craft3d`,
      description: guide.description,
      siteName: "Craft3d",
      locale: "es_AR",
    },
    twitter: {
      card: "summary_large_image",
      title: `${guide.title} · Craft3d`,
      description: guide.description,
    },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = guideBySlug[slug];
  if (!guide) notFound();

  const allProducts = await getAllProducts();
  const products = selectGuideProducts(allProducts, guide).slice(0, 9);
  const others = guides.filter((g) => g.slug !== guide.slug).slice(0, 3);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    inLanguage: "es-AR",
    datePublished: guide.updated,
    dateModified: guide.updated,
    mainEntityOfPage: `${siteUrl}/guias/${guide.slug}`,
    author: { "@type": "Organization", name: "Craft3d" },
    publisher: { "@type": "Organization", name: "Craft3d" },
  };

  return (
    <div className="bg-zinc-950 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b-4 border-zinc-800">
        <div className="arcade-grid absolute inset-0" />
        <div className="crt-overlay" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 pt-14 pb-12 sm:px-6 sm:pt-16">
          <FadeIn>
            <div className="mb-6">
              <Breadcrumbs
                items={[
                  { label: "Inicio", href: "/" },
                  { label: "Guías", href: "/guias" },
                  { label: guide.title },
                ]}
              />
            </div>
            <span className="pixel inline-flex items-center gap-2 rounded-sm border-2 border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-[10px] tracking-widest text-amber-300">
              📖 GUÍA · CRAFT3D
            </span>
            <h1 className="mt-5 text-3xl font-bold leading-tight text-zinc-50 sm:text-4xl">
              {guide.title}
            </h1>
            {guide.intro.map((p) => (
              <p key={p.slice(0, 24)} className="mt-4 text-base leading-relaxed text-zinc-400 sm:text-lg">
                {p}
              </p>
            ))}
          </FadeIn>
        </div>
      </section>

      {/* Contenido */}
      <article className="mx-auto max-w-3xl px-4 pt-14 sm:px-6">
        {guide.sections.map((section, i) => (
          <FadeIn key={section.heading} delay={Math.min(i * 60, 240)}>
            <section className="mb-10">
              <h2 className="pixel text-lg text-zinc-100 sm:text-xl">{section.heading}</h2>
              <div className="mt-3 space-y-3">
                {section.body.map((p) => (
                  <p key={p.slice(0, 24)} className="text-sm leading-relaxed text-zinc-400 sm:text-base">
                    {p}
                  </p>
                ))}
              </div>
              {section.links && section.links.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {section.links.map((l) => (
                    <Link
                      key={l.href + l.label}
                      href={l.href}
                      className="inline-flex items-center gap-1.5 rounded-md border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-300 transition-colors hover:bg-amber-400/20"
                    >
                      {l.label}
                      <span aria-hidden="true">▸</span>
                    </Link>
                  ))}
                </div>
              ) : null}
            </section>
          </FadeIn>
        ))}
      </article>

      {/* Productos sugeridos */}
      {products.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 pt-4 sm:px-6">
          <FadeIn>
            <div className="mb-8 text-center">
              <p className="pixel text-[10px] tracking-widest text-zinc-500">✦ SUGERIDOS PARA VOS ✦</p>
              <h2 className="pixel mt-2 text-xl text-zinc-100">{guide.ctaLabel.toUpperCase()}</h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, i) => (
              <FadeIn key={product.slug} delay={Math.min(i * 60, 300)}>
                <ProductCard product={product} />
              </FadeIn>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href={guide.ctaHref}
              className="pixel inline-flex rounded-md bg-amber-400 px-6 py-3 text-xs tracking-widest text-zinc-950 transition-colors hover:bg-amber-300"
            >
              {guide.ctaLabel.toUpperCase()} ▸▸
            </Link>
          </div>
        </section>
      ) : null}

      {/* Otras guías */}
      {others.length > 0 ? (
        <section className="mx-auto max-w-3xl px-4 pt-16 sm:px-6">
          <h2 className="pixel text-sm tracking-widest text-zinc-500">SEGUIR LEYENDO</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {others.map((g) => (
              <Link
                key={g.slug}
                href={`/guias/${g.slug}`}
                className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 transition-colors hover:border-amber-400/40"
              >
                <p className="text-sm font-medium text-zinc-200">{g.title}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
