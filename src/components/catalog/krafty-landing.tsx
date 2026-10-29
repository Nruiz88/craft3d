import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products/types";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import FadeIn from "@/components/ui/fade-in";
import ProductVisual from "@/components/product/product-visual";
import AddToCartQty from "@/components/cart/add-to-cart-qty";
import { formatPrice } from "@/lib/utils/format";
import { site } from "@/lib/utils/site";

const WHATSAPP_TEXT =
  "Hola Craft3d! Quiero info del kit KRAFTY de herramientas para cartón 🎄";

const included = [
  { icon: "🪛", label: "Destornillador sin filo" },
  { icon: "🪚", label: "Serrucho de juguete seguro" },
  { icon: "🔧", label: "Llave y accesorios" },
  { icon: "🔩", label: "Tornillos de colores reutilizables" },
];

const creationCards = [
  {
    src: "/krafty/crea-mascara.webp",
    title: "Máscaras",
    desc: "Un león, un oso o el personaje que más quieran.",
  },
  {
    src: "/krafty/crea-casita.webp",
    title: "Casitas y castillos",
    desc: "Una simple caja se convierte en un hogar de aventuras.",
  },
  {
    src: "/krafty/crea-avion.webp",
    title: "Aviones y autos",
    desc: "Vehículos de cartón para hacer volar la imaginación.",
  },
];

const manuals = [
  {
    file: "/krafty/manual-mascara-leon.pdf",
    icon: "🦁",
    title: "Máscara de león",
    desc: "Guía paso a paso para armar y decorar una máscara.",
  },
  {
    file: "/krafty/manual-casita.pdf",
    icon: "🏠",
    title: "Casita de cartón",
    desc: "Plano y armado de una casita con techo y ventanas.",
  },
  {
    file: "/krafty/manual-cohete.pdf",
    icon: "🚀",
    title: "Cohete espacial",
    desc: "Instructivo para construir un cohete listo para despegar.",
  },
];

const benefits = [
  {
    icon: "🛡️",
    title: "100% seguras, sin filo",
    desc: "Herramientas diseñadas para manos chiquitas. Perforan y serruchan el cartón sin riesgo de cortes ni heridas.",
    accent: "text-emerald-300",
    ring: "ring-emerald-400/30",
  },
  {
    icon: "🧠",
    title: "Imaginación al máximo",
    desc: "Una simple caja se convierte en un castillo, un cohete, un auto o la máscara de su personaje favorito.",
    accent: "text-amber-300",
    ring: "ring-amber-400/30",
  },
  {
    icon: "🔧",
    title: "Muy fácil de usar",
    desc: "Unen, atornillan y crean solos, logrando proyectos firmes y sin frustraciones.",
    accent: "text-sky-300",
    ring: "ring-sky-400/30",
  },
  {
    icon: "🎁",
    title: "El regalo perfecto de Navidad",
    desc: "No se arma una sola vez: es un sistema para crear, desarmar y volver a inventar todas las veces que quieran.",
    accent: "text-rose-300",
    ring: "ring-rose-400/30",
  },
];

const reasons = [
  {
    icon: "📵",
    title: "Lejos de las pantallas",
    desc: "Horas de juego real, libre y creativo sin un dispositivo de por medio.",
  },
  {
    icon: "♻️",
    title: "Juego sustentable",
    desc: "Transformá cualquier caja que tengas en casa en una aventura nueva.",
  },
  {
    icon: "🌱",
    title: "Autonomía y motricidad",
    desc: "Inspirado en el juego Montessori: construyen solos y ganan confianza.",
  },
];

export default function KraftyLanding({ product }: { product: Product }) {
  const whatsappHref = `${site.whatsapp}?text=${encodeURIComponent(WHATSAPP_TEXT)}`;
  const gallery = product.images?.length
    ? product.images
    : product.image
      ? [product.image]
      : [];
  const secondary = gallery.slice(1, 4);

  return (
    <div className="bg-zinc-950 pb-24" data-krafty>
      {/* ===== HERO ===== */}
      <section className="krafty-hero-bg relative overflow-hidden border-b-4 border-zinc-800">
        <div className="arcade-grid absolute inset-0" />
        <div className="krafty-snow pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
        <div className="crt-overlay" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-rose-500/15 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 pt-10 pb-14 sm:px-6 sm:pt-12 sm:pb-16">
          <Breadcrumbs
            items={[{ label: "Inicio", href: "/" }, { label: "Krafty" }]}
          />

          <div className="mt-8 flex flex-col items-center gap-10 lg:grid lg:grid-cols-2 lg:items-center lg:gap-14">
            {/* Texto */}
            <FadeIn>
              <div className="text-center lg:text-left">
                <span className="pixel inline-flex items-center gap-2 rounded-sm border-2 border-rose-400/40 bg-rose-400/10 px-4 py-2 text-[10px] tracking-widest text-rose-300">
                  🎄 EDICIÓN NAVIDAD · CRAFT3D
                </span>

                <h1 className="pixel mt-6 text-5xl leading-[1.15] text-zinc-100 sm:text-6xl lg:text-7xl">
                  <span className="text-amber-300">KRAFTY</span>
                </h1>
                <p className="pixel mt-3 text-[11px] leading-relaxed tracking-widest text-zinc-400 sm:text-xs">
                  KIT DE HERRAMIENTAS CREATIVAS PARA CARTÓN
                </p>

                <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-zinc-300 sm:text-lg lg:mx-0">
                  ¡Transformá cualquier caja en un mundo de aventuras! El kit de
                  construcción pensado para que los chicos exploren su
                  imaginación <span className="text-amber-300">sin límites</span> y
                  con <span className="text-emerald-300">total seguridad</span>.
                  Decile chau a las pantallas.
                </p>

                {/* Precio + stock */}
                <div className="mt-7 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                  <div className="text-left">
                    <p className="pixel text-[9px] tracking-widest text-zinc-500">
                      PRECIO · AR$
                    </p>
                    <p className="text-4xl font-black text-amber-300 sm:text-5xl">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                  {product.stock > 0 ? (
                    <span className="pixel rounded-sm border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-[10px] tracking-widest text-emerald-300">
                      ★ {product.stock} EN STOCK
                    </span>
                  ) : (
                    <span className="pixel rounded-sm border border-zinc-700 bg-zinc-900 px-3 py-2 text-[10px] tracking-widest text-zinc-400">
                      SIN STOCK
                    </span>
                  )}
                </div>

                <p className="mt-3 text-sm text-zinc-400">
                  🚚 Envío gratis superando los {formatPrice(120000)}
                </p>

                {/* CTA carrito */}
                <div className="mx-auto mt-6 max-w-md lg:mx-0">
                  <AddToCartQty product={product} />
                </div>

                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 transition-colors hover:text-emerald-200"
                >
                  💬 ¿Dudas? Consultanos por WhatsApp
                </a>

                {/* Trust chips */}
                <div className="mt-7 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                  {["🛡️ SIN FILO", "📦 ENVÍO A TODO EL PAÍS", "📵 SIN PANTALLAS", "🎁 LISTO PARA REGALAR"].map(
                    (chip) => (
                      <span
                        key={chip}
                        className="pixel rounded-sm border border-zinc-700 bg-zinc-900/60 px-3 py-1.5 text-[9px] tracking-widest text-zinc-400"
                      >
                        {chip}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </FadeIn>

            {/* Imagen */}
            <FadeIn delay={120}>
              <div className="relative">
                <span className="pixel absolute -top-3 right-3 z-20 rotate-3 rounded-sm border-2 border-rose-400/50 bg-rose-500 px-3 py-1.5 text-[10px] tracking-widest text-zinc-950 shadow-lg">
                  ★ DESTACADO
                </span>
                <ProductVisual
                  product={product}
                  priority
                  className="krafty-frame aspect-square w-full rounded-2xl"
                />
                {secondary.length > 0 ? (
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {secondary.map((src, i) =>
                      src.startsWith("data:") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={i}
                          src={src}
                          alt={`${product.name} — vista ${i + 2}`}
                          className="aspect-square w-full rounded-xl border-2 border-zinc-800 object-cover"
                        />
                      ) : null,
                    )}
                  </div>
                ) : null}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ===== STRIP NAVIDAD ===== */}
      <section className="border-b border-zinc-800/60 bg-gradient-to-r from-rose-950/40 via-amber-950/30 to-emerald-950/40">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-4 text-center sm:px-6">
          <p className="pixel text-[10px] tracking-widest text-amber-300">
            🎄 PEDILO ANTES DE NAVIDAD
          </p>
          <p className="text-sm text-zinc-400">
            El regalo que se arma, se desarma y se vuelve a inventar mil veces.
          </p>
        </div>
      </section>

      {/* ===== BENEFICIOS ===== */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        <FadeIn>
          <div className="text-center">
            <p className="pixel text-[10px] tracking-widest text-zinc-500">
              POR QUÉ LO VAN A AMAR
            </p>
            <h2 className="pixel mt-2 text-2xl text-zinc-100 sm:text-3xl">
              CREÁ TUS <span className="text-amber-300">PROPIOS PERSONAJES</span>
            </h2>
          </div>
        </FadeIn>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {benefits.map((b, i) => (
            <FadeIn key={b.title} delay={Math.min(i * 80, 320)}>
              <div
                className={`krafty-corrugated relative h-full rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 ring-1 ${b.ring}`}
              >
                <span className="krafty-tape" aria-hidden="true" />
                <div className="flex items-start gap-4">
                  <span className="text-3xl" aria-hidden="true">
                    {b.icon}
                  </span>
                  <div>
                    <h3 className={`pixel text-xs tracking-wider ${b.accent}`}>
                      {b.title.toUpperCase()}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                      {b.desc}
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ===== QUÉ INCLUYE ===== */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        <FadeIn>
          <div className="grid grid-cols-1 items-center gap-8 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 lg:grid-cols-2">
            <div className="relative aspect-[3/2] overflow-hidden rounded-xl border-2 border-zinc-800">
              <Image
                src="/krafty/incluye.webp"
                alt="Herramientas sin filo y tornillos de colores del kit KRAFTY"
                fill
                sizes="(min-width:1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
            <div>
              <p className="pixel text-[10px] tracking-widest text-zinc-500">
                EL KIT TRAE TODO
              </p>
              <h2 className="pixel mt-2 text-2xl text-zinc-100 sm:text-3xl">
                ¿QUÉ <span className="text-amber-300">INCLUYE?</span>
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                Herramientas de juguete sin filo y tornillos de colores
                reutilizables, pensados para manos chiquitas. Todo lo necesario
                para unir, atornillar y crear con cartón.
              </p>
              <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {included.map((it) => (
                  <li
                    key={it.label}
                    className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3"
                  >
                    <span className="text-2xl" aria-hidden="true">
                      {it.icon}
                    </span>
                    <span className="text-sm text-zinc-300">{it.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ===== QUÉ PUEDEN CREAR ===== */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        <FadeIn>
          <div className="text-center">
            <p className="pixel text-[10px] tracking-widest text-zinc-500">
              ¿DE QUÉ SE VAN A DISFRAZAR HOY?
            </p>
            <h2 className="pixel mt-2 text-2xl text-zinc-100 sm:text-3xl">
              UNA CAJA, <span className="text-amber-300">MIL AVENTURAS</span>
            </h2>
          </div>
        </FadeIn>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {creationCards.map((c, i) => (
            <FadeIn key={c.title} delay={Math.min(i * 90, 280)}>
              <div className="group h-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={c.src}
                    alt={c.title}
                    fill
                    sizes="(min-width:640px) 33vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="pixel text-xs tracking-wider text-amber-300">
                    {c.title.toUpperCase()}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {c.desc}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ===== RAZONES ===== */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {reasons.map((r, i) => (
            <FadeIn key={r.title} delay={Math.min(i * 90, 280)}>
              <div className="flex h-full flex-col items-center rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-6 text-center">
                <span className="text-3xl" aria-hidden="true">
                  {r.icon}
                </span>
                <h3 className="pixel mt-3 text-[11px] tracking-wider text-zinc-200">
                  {r.title.toUpperCase()}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                  {r.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ===== DESCARGAS GRATIS ===== */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        <FadeIn>
          <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-400/30 bg-gradient-to-br from-emerald-950/30 to-zinc-950 p-8 sm:p-10">
            <div className="text-center">
              <p className="pixel text-[10px] tracking-widest text-emerald-300">
                ★ REGALO EXTRA · GRATIS ★
              </p>
              <h2 className="pixel mt-3 text-2xl text-zinc-100 sm:text-3xl">
                PLANOS PARA <span className="text-emerald-300">DESCARGAR</span>
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">
                Descargá gratis nuestros manuales paso a paso e imprimílos para
                armar los primeros proyectos de cartón con KRAFTY.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {manuals.map((m, i) => (
                <FadeIn key={m.file} delay={Math.min(i * 90, 280)}>
                  <a
                    href={m.file}
                    download
                    className="flex h-full flex-col rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 transition-colors hover:border-emerald-400/50 hover:bg-zinc-900/60"
                  >
                    <span className="text-3xl" aria-hidden="true">
                      {m.icon}
                    </span>
                    <h3 className="pixel mt-3 text-[11px] tracking-wider text-zinc-200">
                      {m.title.toUpperCase()}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-500">
                      {m.desc}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300">
                      ⬇ Descargar PDF
                    </span>
                  </a>
                </FadeIn>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        <FadeIn>
          <div className="relative overflow-hidden rounded-2xl border-2 border-rose-400/40 bg-gradient-to-br from-rose-950/40 via-zinc-950 to-emerald-950/30 p-8 text-center sm:p-12">
            <div className="krafty-snow pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
            <div className="relative z-10">
              <p className="pixel text-[10px] tracking-widest text-amber-300">
                🎄 ¿CREAMOS JUNTOS ESTAS NAVIDADES? 🎄
              </p>
              <h2 className="pixel mt-3 text-2xl text-zinc-100 sm:text-3xl">
                TRANSFORMÁ EL CARTÓN EN <span className="text-amber-300">GRANDES AVENTURAS</span>
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-sm text-zinc-400">
                El regalo perfecto para crear, jugar y volver a inventar. Llevalo
                hoy por {formatPrice(product.price)} con envío a todo el país.
              </p>

              <div className="mx-auto mt-7 flex max-w-md flex-col gap-3">
                <AddToCartQty product={product} />
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-emerald-400/50 bg-emerald-400/10 px-5 py-2.5 text-sm font-bold text-emerald-300 transition-colors hover:bg-emerald-400/20"
                >
                  💬 Consultar por WhatsApp
                </a>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-500">
                <span>🖨️ Hecho a mano, capa a capa</span>
                <span>📦 Despacho en 2 a 5 días hábiles</span>
                <span>💳 Pago coordinado al confirmar</span>
              </div>

              <Link
                href={`/productos/${product.slug}`}
                className="mt-6 inline-block text-xs text-zinc-500 underline underline-offset-4 transition-colors hover:text-zinc-300"
              >
                Ver ficha técnica completa →
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
