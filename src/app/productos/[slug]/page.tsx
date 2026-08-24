import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryById } from "@/lib/products";
import { getAllProducts, getProductBySlug } from "@/lib/orders/store";
import { formatPrice, formatModelName } from "@/lib/utils/format";
import { getMysteryPoolPreview } from "@/lib/mystery-box";
import { getPaymentSettings, getReservationSettings } from "@/lib/payments/settings";
import { site } from "@/lib/utils/site";
import ProductGallery from "@/components/product/product-gallery";
import AddToCartQty from "@/components/cart/add-to-cart-qty";
import CategoryBadge from "@/components/catalog/category-badge";
import ProductCard from "@/components/product/product-card";
import ProductTabs from "@/components/product/product-tabs-dynamic";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import ShareButtons from "@/components/product/share-buttons";
import DropProductView from "@/components/drops/drop-product-view-dynamic";
import MysteryProductView from "@/components/mystery-box/mystery-product-view";
import RestockForm from "@/components/wishlist/restock-form";
import WishlistButton from "@/components/wishlist/wishlist-button";
import ProductJsonLd from "@/components/product/product-jsonld";
import FadeIn from "@/components/ui/fade-in";

export const dynamic = "force-dynamic";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://craft3d.vercel.app";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ reserva?: string; pedido?: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };
  const canonical = `${siteUrl}/productos/${product.slug}`;
  return {
    title: `${product.name} · Craft3d`,
    description: product.description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title: `${product.name} · Craft3d`,
      description: `${product.description} Precio: ${formatPrice(product.price)}.`,
      siteName: "Craft3d",
      locale: "es_AR",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} · Craft3d`,
      description: `${product.description} Precio: ${formatPrice(product.price)}.`,
    },
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: ProductPageProps) {
  const { slug } = await params;
  const [{ reserva, pedido }, product] = await Promise.all([
    searchParams,
    getProductBySlug(slug),
  ]);

  if (!product) notFound();

  const category = categoryById[product.category];
  const allProducts = await getAllProducts();
  const related = allProducts
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 3);
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 3;
  const freeShipping = product.price >= site.freeShippingFrom;

  const boxPreview =
    product.category === "mystery-box"
      ? getMysteryPoolPreview(allProducts, product, 8)
      : null;

  const whatsappText = encodeURIComponent(
    `Hola Craft3d! Me interesa "${product.name}" (${formatPrice(product.price)}). ¿Sigue disponible?`,
  );

  // Drops redirect to specialized view
  if (product.category === "drops") {
    const drops = allProducts.filter((p) => p.category === "drops");
    const editionBySlug = new Map<string, number>();
    [...drops]
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .forEach((drop, index) => editionBySlug.set(drop.slug, index + 1));

    const [reservation, paymentSettings] = await Promise.all([
      getReservationSettings(),
      getPaymentSettings(),
    ]);

    const reservationQuery =
      reserva === "exito" || reserva === "pendiente" || reserva === "error"
        ? { status: reserva as "exito" | "pendiente" | "error", orderId: pedido }
        : null;

    return (
      <>
        <ProductJsonLd product={product} />
        <DropProductView
          product={product}
          related={related}
          freeShipping={freeShipping}
          edition={editionBySlug.get(product.slug)}
          editionBySlug={editionBySlug}
          reservation={{
            enabled: reservation.enabled,
            mode: reservation.mode,
            depositPct: reservation.depositPct,
            depositFixed: reservation.depositFixed,
            note: reservation.note,
            mercadopagoConfigured: Boolean(paymentSettings.mercadopago.accessToken),
            transfer: paymentSettings.transfer,
          }}
          reservationQuery={reservationQuery}
          next={`/productos/${product.slug}`}
        />
      </>
    );
  }

  return (
    <div className="bg-zinc-950 pb-20">
      <ProductJsonLd product={product} />

      {/* ===== HERO ===== */}
      <section className="arcade-grid relative overflow-hidden border-b-4 border-zinc-800">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-40 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="crt-overlay" aria-hidden="true" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 pt-8 pb-6 sm:px-6">
          <FadeIn>
            <Breadcrumbs
              items={[
                { label: "Inicio", href: "/" },
                { label: "Catálogo", href: "/catalogo" },
                { label: product.name },
              ]}
            />
          </FadeIn>
        </div>
      </section>

      {/* ===== PRODUCT GRID ===== */}
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Gallery */}
          <FadeIn>
            <div className="relative lg:sticky lg:top-24 lg:self-start">
              <ProductGallery product={product} />

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
          </FadeIn>

          {/* Info */}
          <FadeIn delay={100}>
            <div className="flex flex-col gap-6">
              {/* Header */}
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

              {/* Price card */}
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

              {/* Add to cart / Mystery box */}
              {product.category === "mystery-box" && boxPreview ? (
                <MysteryProductView product={product} preview={boxPreview} />
              ) : (
                <AddToCartQty product={product} />
              )}

              {/* Stock bar */}
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
                    ? "No hay unidades por ahora. Dejanos tu email y te avisamos cuando repongamos."
                    : "Despacho estimado en 2 a 5 días hábiles tras confirmar el pedido."}
                </p>
              </div>

              {outOfStock ? (
                <RestockForm
                  productName={product.name}
                  productSlug={product.slug}
                />
              ) : null}

              {/* Actions */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <WishlistButton slug={product.slug} name={product.name} withLabel />
                <a
                  href={`${site.whatsapp}?text=${whatsappText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-emerald-700 bg-emerald-950/30 px-6 py-3 text-sm font-semibold text-emerald-300 transition-colors hover:border-emerald-500 hover:bg-emerald-900/40"
                >
                  💬 Consultar por WhatsApp
                </a>
              </div>

              {/* Trust badges */}
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
          </FadeIn>
        </div>
      </div>

      {/* ===== DETAILS + TABS ===== */}
      {product.details.length > 0 || product.tags.length > 0 ? (
        <section className="mx-auto mt-14 max-w-6xl px-4 sm:px-6">
          <FadeIn>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
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
            </div>
          </FadeIn>
        </section>
      ) : null}

      {/* ===== FAQ ===== */}
      <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
        <FadeIn>
          <h2 className="pixel mb-6 text-center text-lg tracking-wider text-zinc-100">
            <span className="text-amber-300 neon-amber">★</span> PREGUNTAS FRECUENTES <span className="text-amber-300 neon-amber">★</span>
          </h2>
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
        </FadeIn>
      </section>

      {/* ===== RELATED ===== */}
      {related.length > 0 ? (
        <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6">
          <FadeIn>
            <h2 className="pixel mb-6 text-lg tracking-wider text-zinc-100">
              <span className="text-amber-300 neon-amber">★</span> TAMBIÉN TE PUEDE INTERESAR
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((relatedProduct) => (
                <ProductCard key={relatedProduct.slug} product={relatedProduct} />
              ))}
            </div>
          </FadeIn>
        </section>
      ) : null}
    </div>
  );
}
