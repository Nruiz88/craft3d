import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryById } from "@/lib/products";
import { getAllProducts, getProductBySlug } from "@/lib/store";
import { formatPrice, formatModelName } from "@/lib/format";
import { site } from "@/lib/site";
import ProductVisual from "@/components/product-visual";
import AddToCartQty from "@/components/add-to-cart-qty";
import CategoryBadge from "@/components/category-badge";
import ProductCard from "@/components/product-card";
import SectionHeading from "@/components/section-heading";
import ProductTabs from "@/components/product-tabs";
import ShareButtons from "@/components/share-buttons";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: `${product.name} · Craft3d`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const category = categoryById[product.category];
  const allProducts = await getAllProducts();
  const related = allProducts
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 3);
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 3;
  const freeShipping = product.price >= site.freeShippingFrom;

  const whatsappText = encodeURIComponent(
    `Hola Craft3d! Me interesa "${product.name}" (${formatPrice(product.price)}). ¿Sigue disponible?`,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <nav aria-label="Migajas" className="mb-8 flex flex-wrap items-center gap-1.5 text-sm text-zinc-500">
        <Link href="/" className="transition-colors hover:text-cyan-300">
          Inicio
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          href={`/?categoria=${category.id}`}
          className="transition-colors hover:text-cyan-300"
        >
          {category.name}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="line-clamp-1 text-zinc-300">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Imagen / visual dentro de un monitor CRT */}
        <div className="relative lg:sticky lg:top-24 lg:self-start">
          <div className="relative rounded-2xl border-4 border-zinc-700 bg-zinc-950 p-3 pb-0 shadow-[0_0_50px_rgba(34,211,238,0.08)]">
            <div className="relative overflow-hidden rounded-xl border-2 border-zinc-800 bg-black">
              <ProductVisual
                product={product}
                className="aspect-square w-full"
              />
              <div className="crt-overlay" aria-hidden="true" />
              <div className="absolute left-3 top-3 flex flex-col items-start gap-2">
                {product.featured ? (
                  <span className="pixel rounded-sm bg-amber-400 px-2 py-1 text-[9px] tracking-widest text-zinc-950 shadow-[0_0_16px_rgba(251,191,36,0.6)]">
                    ★ DESTACADO
                  </span>
                ) : null}
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-zinc-800 bg-zinc-950/80 px-3 py-2">
                <span className="pixel text-[9px] tracking-widest text-cyan-300 neon-cyan">
                  ▶ {category.name.toUpperCase()}
                </span>
                <span className="pixel text-[9px] tracking-widest text-zinc-500">
                  CRAFT3D.COM
                </span>
              </div>
            </div>
            <div
              className="mx-auto h-6 w-24 rounded-b-xl border-x-4 border-b-4 border-zinc-700 bg-zinc-900"
              aria-hidden="true"
            />
          </div>

          {outOfStock ? (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-zinc-950/70 backdrop-blur-sm">
              <span className="pixel rounded-sm border-2 border-red-500/50 bg-red-950/70 px-4 py-2 text-[11px] tracking-widest text-red-300">
                GAME OVER · AGOTADO
              </span>
            </div>
          ) : null}

          <div className="mt-5">
            <ShareButtons
              name={product.name}
              slug={product.slug}
              price={formatPrice(product.price)}
            />
          </div>
        </div>

        {/* Información */}
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <CategoryBadge category={product.category} />
              <span className="pixel inline-flex items-center gap-2 rounded-sm border border-zinc-800 bg-zinc-900/80 px-2.5 py-1.5 text-[9px] tracking-widest">
                <span className="text-zinc-600">SKU</span>
                <span className="text-cyan-300 neon-cyan">
                  {formatModelName(product.slug)}
                </span>
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-bold leading-tight text-zinc-50 sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-zinc-400 sm:text-lg">
              {product.description}
            </p>
          </div>

          <div className="rounded-2xl border-2 border-zinc-800 bg-zinc-900/60 p-5">
            <p className="pixel text-[9px] tracking-widest text-zinc-500">
              PRECIO · AR$
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="pixel text-2xl tracking-widest text-amber-400 neon-amber sm:text-3xl">
                {formatPrice(product.price)}
              </span>
              <span
                className={`pixel text-[10px] tracking-widest ${
                  outOfStock
                    ? "text-red-400"
                    : lowStock
                      ? "text-amber-400"
                      : "text-emerald-400"
                }`}
              >
                {outOfStock
                  ? "AGOTADO"
                  : lowStock
                    ? `¡QUEDAN ${product.stock}!`
                    : `${product.stock} EN STOCK`}
              </span>
            </div>
            {freeShipping ? (
              <span className="mt-3 inline-flex w-full items-center gap-1.5 text-xs text-zinc-400 sm:w-auto">
                🚚 Este producto incluye{" "}
                <span className="font-semibold text-emerald-400">envío gratis</span>
              </span>
            ) : (
              <span className="mt-3 inline-flex w-full items-center gap-1.5 text-xs text-zinc-400 sm:w-auto">
                🚚 Envío gratis superando los {formatPrice(site.freeShippingFrom)}
              </span>
            )}
          </div>

          <AddToCartQty product={product} />

          <div className="rounded-2xl border-2 border-zinc-800 bg-zinc-900/60 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="pixel text-[10px] tracking-widest text-zinc-100">
                DISPONIBILIDAD
              </p>
              <span
                className={`pixel text-[10px] tracking-widest ${
                  outOfStock ? "text-red-400" : "text-emerald-400"
                }`}
              >
                {outOfStock ? "AGOTADO" : `${product.stock} UNID.`}
              </span>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full border border-zinc-800 bg-zinc-950">
              <div
                className={`h-full rounded-full ${
                  outOfStock
                    ? "bg-red-500/70"
                    : "bg-gradient-to-r from-amber-400 to-cyan-400"
                }`}
                style={{
                  width: `${outOfStock ? 0 : Math.min(100, product.stock * 10)}%`,
                }}
              />
            </div>
            <p className="mt-2.5 text-xs text-zinc-500">
              {outOfStock
                ? "No hay unidades por ahora. Consultanos por WhatsApp."
                : "Despacho estimado en 2 a 5 días hábiles tras confirmar el pedido."}
            </p>
          </div>

          <a
            href={`${site.whatsapp}?text=${whatsappText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md border-2 border-emerald-700 bg-emerald-950/30 px-6 py-3 text-sm font-semibold text-emerald-300 transition-colors hover:border-emerald-500 hover:bg-emerald-900/40"
          >
            💬 Consultar disponibilidad por WhatsApp
          </a>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { icon: "🖨️", text: "Hecho a mano, capa a capa" },
              { icon: "📦", text: "Envío a todo el país" },
              { icon: "💳", text: "Pago coordinado al confirmar" },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-3 rounded-xl border-2 border-zinc-800 bg-zinc-900/40 px-4 py-3"
              >
                <span className="text-xl" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="text-xs leading-snug text-zinc-400">
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== DETALLES + TABS (a ancho completo) ===== */}
      {product.details.length > 0 || product.tags.length > 0 ? (
        <section className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
          <div className="rounded-2xl border-2 border-zinc-800 bg-zinc-900/60 p-6">
            {product.details.length > 0 ? (
              <>
                <h2 className="pixel mb-4 flex items-center gap-2 text-xs tracking-widest text-zinc-100">
                  <span className="text-cyan-300 neon-cyan" aria-hidden="true">
                    ▸
                  </span>
                  ¿QUÉ INCLUYE?
                </h2>
                <ul className="grid grid-cols-1 gap-2.5 text-sm text-zinc-400 sm:grid-cols-2">
                  {product.details.map((detail) => (
                    <li key={detail} className="flex items-start gap-2">
                      <span className="mt-0.5 text-amber-400" aria-hidden="true">
                        ✓
                      </span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {product.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-6">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="pixel rounded-sm border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-[9px] tracking-widest text-zinc-500"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <ProductTabs
            product={product}
            freeShipping={freeShipping}
            freeShippingFrom={site.freeShippingFrom}
          />
        </section>
      ) : null}

      {/* ===== PREGUNTAS FRECUENTES ===== */}
      <section className="mt-16">
        <SectionHeading
          eyebrow="Dudas frecuentes"
          title="Preguntas frecuentes"
          description="Respuestas rápidas antes de comprar. ¿Algo más? Escríbenos por WhatsApp."
        />
        <div className="space-y-3">
          {[
            {
              q: "¿Cuánto tarda en estar lista mi pieza?",
              a: "Las piezas se imprimen a pedido. El despacho estimado es de 2 a 5 días hábiles desde la confirmación del pedido, y te avisamos en cuanto esté lista.",
            },
            {
              q: "¿Hacen envíos a todo el país?",
              a: "Sí. El envío se coordina por WhatsApp después de confirmar el pedido y se paga por separado, salvo en pedidos que incluyen envío gratis.",
            },
            {
              q: "¿Cómo es el pago?",
              a: "El pago se coordina al confirmar el pedido: transferencia o Mercado Pago. La pieza queda reservada a tu nombre.",
            },
            {
              q: "¿Puedo pedir una pieza personalizada?",
              a: "Sí, hacemos trabajos a medida. Escribinos por Instagram o WhatsApp con tu idea y te cotizamos sin compromiso.",
            },
            {
              q: "¿Qué material usan?",
              a: "Filamento PLA, impreso capa a capa con acabado revisado a mano antes de enviarlo.",
            },
          ].map((faq) => (
            <details
              key={faq.q}
              className="group rounded-2xl border-2 border-zinc-800 bg-zinc-900/60 transition-colors open:border-zinc-700"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 font-medium text-zinc-100">
                {faq.q}
                <span
                  className="pixel shrink-0 text-sm text-amber-400 transition-transform group-open:rotate-45"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <p className="px-5 pb-4 text-sm leading-relaxed text-zinc-400">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {related.length > 0 ? (
        <section className="mt-20">
          <SectionHeading
            eyebrow={`${category.emoji} ${category.name}`}
            title="También te puede interesar"
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((relatedProduct) => (
              <ProductCard key={relatedProduct.slug} product={relatedProduct} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
