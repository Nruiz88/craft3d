import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import FadeIn from "@/components/ui/fade-in";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://craft3d.vercel.app";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description:
    "Resolvé tus dudas sobre pedidos, envíos, pagos, drops, cajas sorpresa y productos de Craft3d. Todo lo que necesitás saber antes de comprar.",
  alternates: {
    canonical: `${siteUrl}/faq`,
  },
};

interface FaqItem {
  q: string;
  a: string;
}

interface FaqCategory {
  id: string;
  title: string;
  emoji: string;
  items: FaqItem[];
}

const faqCategories: FaqCategory[] = [
  {
    id: "general",
    title: "General",
    emoji: "🕹️",
    items: [
      {
        q: "¿Qué es Craft3d?",
        a: "Craft3d es un taller de impresión 3D ubicado en Neuquén, Argentina. Creamos figuras, cuadros Hueforge, lámparas, decoración y accesorios únicos, todos impresos capa a capa y terminados a mano.",
      },
      {
        q: "¿Cómo hago un pedido?",
        a: "Elegí tu producto, agregalo al carrito y completá el checkout. Podés pagar con transferencia bancaria o Mercado Pago. Si tenés dudas, escribinos por WhatsApp y te asesoramos.",
      },
      {
        q: "¿Puedo hacer un pedido por WhatsApp?",
        a: "¡Sí! Cada producto tiene un botón de contacto que te conecta directamente con nosotros. Te asesoramos, coordinamos el pedido y acordamos la forma de pago más cómoda para vos.",
      },
      {
        q: "¿Hacen piezas personalizadas?",
        a: "Sí. Podemos crear figuras, lámparas, soportes y decoración a medida. Escribinos por WhatsApp o Instagram con tu idea y te armamos un presupuesto sin compromiso.",
      },
      {
        q: "¿Dónde están ubicados?",
        a: "Estamos en Neuquén Capital, Argentina. Trabajamos con envíos a todo el país.",
      },
    ],
  },
  {
    id: "productos",
    title: "Productos",
    emoji: "📦",
    items: [
      {
        q: "¿De qué material son los productos?",
        a: "Usamos filamento PLA y PLA+ de alta calidad, ecológicos y biodegradables. Algunos productos especiales pueden incluir PETG o TPU según la funcionalidad requerida.",
      },
      {
        q: "¿Los productos son resistentes?",
        a: "Sí. Cada pieza se imprime con una densidad adecuada para su uso. Los soportes y accesorios están diseñados para el uso diario. Las figuras decorativas tienen un acabado robusto.",
      },
      {
        q: "¿Qué es un cuadro Hueforge?",
        a: "Es una técnica de impresión 3D que usa capas de diferentes colores de filamento para crear imágenes con efecto de profundidad y relieve. Cada cuadro es una pieza única.",
      },
      {
        q: "¿Puedo elegir el color de mi producto?",
        a: "Algunos productos están disponibles en varios colores. Si querés un color específico que no aparece en la tienda, escribinos por WhatsApp y vemos si podemos hacerlo.",
      },
      {
        q: "¿Los productos incluyen luces o electrónica?",
        a: "Algunas lámparas incluyen luz LED. Cada producto indica en su descripción si incluye componentes electrónicos o si es solo la pieza impresa.",
      },
    ],
  },
  {
    id: "drops",
    title: "Drops",
    emoji: "💧",
    items: [
      {
        q: "¿Qué es un drop?",
        a: "Un drop es una edición limitada y numerada de un producto. Tiene una fecha de apertura y cierre, y una cantidad fija de unidades. Cuando se agota, no se vuelve a imprimir.",
      },
      {
        q: "¿Puedo pedir una pieza igual cuando el drop se agota?",
        a: "No. Cuando la ventana cierra o el stock llega a cero, el drop pasa al archivo y no se vuelve a imprimir. Cada drop es un tiraje único.",
      },
      {
        q: "¿Cómo sé cuándo abre el próximo drop?",
        a: "La fecha y hora de apertura se muestran en la página de Drops con un countdown exacto. También lo anunciamos por Instagram y WhatsApp.",
      },
      {
        q: "¿Puedo reservar un drop pagando una seña?",
        a: "Sí. Podés reservar tu unidad pagando una seña. El resto se abona antes del envío, coordinado por WhatsApp.",
      },
      {
        q: "¿Cada unidad tiene número de edición?",
        a: "Sí. Cada pieza de un drop tiene un número único impreso (por ejemplo: 001/010), que queda grabado permanentemente en la pieza.",
      },
    ],
  },
  {
    id: "mystery-box",
    title: "Cajas sorpresa",
    emoji: "🎁",
    items: [
      {
        q: "¿Cómo funcionan las cajas sorpresa?",
        a: "Elegís la categoría (o toda la tienda), pagás el precio de la caja y te enviamos una pieza al azar de esa categoría. El contenido se revela cuando preparamos tu envío.",
      },
      {
        q: "¿Puedo elegir qué me toca?",
        a: "No. La gracia de la caja sorpresa es el factor sorpresa. Elegís la categoría, pero el producto específico es una sorpresa. Es una excelente forma de descubrir piezas nuevas.",
      },
      {
        q: "¿El valor de la pieza supera el precio de la caja?",
        a: "Sí, generalmente el valor de la pieza que recibís es mayor al precio que pagaste por la caja. Es parte del beneficio de arriesgarte.",
      },
      {
        q: "¿Puedo acumular varias cajas sorpresa?",
        a: "¡Claro! Podés comprar todas las que quieras. Cada caja contiene una pieza diferente, así que mientras más compres, más chances tenés de completar tu colección.",
      },
    ],
  },
  {
    id: "envios",
    title: "Envíos y devoluciones",
    emoji: "🚚",
    items: [
      {
        q: "¿Cuánto tarda en llegar mi pedido?",
        a: "Los envíos se realizan dentro de las 48-72 horas hábiles después de confirmado el pago. El tiempo de entrega depende de tu ubicación (generalmente 3-7 días hábiles).",
      },
      {
        q: "¿Los envíos son gratis?",
        a: "El envío es gratis en compras superiores al monto que se indica en la tienda. Para montos menores, el costo se calcula automáticamente según tu dirección.",
      },
      {
        q: "¿A qué zonas envían?",
        a: "Enviamos a todo el país argentino. Para envíos a Neuquén Capital y alrededores, coordinamos la entrega directamente por WhatsApp.",
      },
      {
        q: "¿Cómo puedo rastrear mi envío?",
        a: "Una vez despachado tu pedido, te enviamos el número de tracking por WhatsApp o email para que puedas seguir el estado del envío en tiempo real.",
      },
      {
        q: "¿Puedo devolver un producto?",
        a: "Si el producto llegó con un defecto de fabricación o daño durante el envío, lo reemplazamos sin costo. Contactanos dentro de los 7 días hábiles de recibido el pedido con fotos del problema.",
      },
      {
        q: "¿Empaquetan bien los productos?",
        a: "Sí. Cada pieza se embala con materiales protectores para evitar golpes durante el transporte. Las figuras frágiles incluyen reforzado extra.",
      },
    ],
  },
  {
    id: "pagos",
    title: "Pagos y precios",
    emoji: "💰",
    items: [
      {
        q: "¿Qué formas de pago aceptan?",
        a: "Aceptamos transferencia bancaria (CVU o alias) y Mercado Pago (tarjeta de crédito, débito o dinero en cuenta). También podés abonar en efectivo si sos de Neuquén.",
      },
      {
        q: "¿Puedo pagar en cuotas?",
        a: "Con Mercado Pago podés pagar en cuotas según las opciones disponibles al momento de la compra. La transferencia bancaria es un solo pago.",
      },
      {
        q: "¿Hacen descuentos por volumen?",
        a: "Si. Si comprás varias unidades o querés armar un pedido grande (regalos corporativos, eventos, etc.), escribinos por WhatsApp y te armamos un presupuesto especial.",
      },
      {
        q: "¿Puedo reservar un producto pagando una seña?",
        a: "En algunos productos (especialmente drops) podés reservar con una seña. Coordiná los detalles por WhatsApp.",
      },
    ],
  },
  {
    id: "cuenta",
    title: "Tu cuenta",
    emoji: "👤",
    items: [
      {
        q: "¿Necesito crear cuenta para comprar?",
        a: "No es obligatorio. Podés comprar como invitado. Pero si creás una cuenta, guardás tus direcciones, seguís tus pedidos y accedés a的功能es exclusivas.",
      },
      {
        q: "¿Cómo veo el estado de mi pedido?",
        a: "Si tenés cuenta, entrá a tu perfil y revisá la sección 'Pedidos'. Ahí vas a ver el estado actualizado de tu compra.",
      },
      {
        q: "¿Puedo guardar direcciones de envío?",
        a: "Sí. Si tenés una cuenta, podés guardar múltiples direcciones de envío y elegir una como predeterminada para futuros pedidos.",
      },
      {
        q: "¿Cómo actualizo mis datos?",
        a: "Entrá a tu perfil desde el menú de usuario y editá tu nombre, email o datos de contacto.",
      },
    ],
  },
];

export default function FaqPage() {
  // Flat list for JSON-LD
  const allItems = faqCategories.flatMap((cat) =>
    cat.items.map((item) => ({
      question: item.q,
      answer: item.a,
    })),
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <div className="bg-zinc-950 pb-20">
      {/* ===== HERO ===== */}
      <section className="arcade-grid relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-40 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="crt-overlay" aria-hidden="true" />

        <div className="relative z-10 mx-auto max-w-3xl px-4 pt-14 pb-12 text-center sm:px-6">
          <FadeIn>
            <span className="pixel inline-flex items-center gap-2 rounded-sm border-2 border-zinc-800 bg-zinc-950/70 px-3 py-1.5 text-[10px] tracking-widest text-zinc-400">
              ← VOLVER A LA HOME
            </span>
            <h1 className="pixel mt-6 text-4xl leading-snug text-zinc-100 sm:text-5xl">
              PREGUNTAS <span className="text-amber-300 neon-amber">FRECUENTES</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-500 sm:text-base">
              Resolvé tus dudas sobre pedidos, envíos, pagos, drops y productos.
              ¿No encontrás lo que buscás? Escribinos por WhatsApp.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[10px]">
              {faqCategories.map((cat) => (
                <a
                  key={cat.id}
                  href={`#${cat.id}`}
                  className="pixel rounded-sm border border-zinc-700 bg-zinc-900/60 px-3 py-1.5 tracking-widest text-zinc-400 transition-colors hover:border-amber-400/50 hover:text-amber-300"
                >
                  {cat.emoji} {cat.title.toUpperCase()}
                </a>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===== JSON-LD ===== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ===== BREADCRUMBS ===== */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Breadcrumbs
          items={[{ label: "Inicio", href: "/" }, { label: "Preguntas frecuentes" }]}
        />
      </div>

      {/* ===== FAQ CATEGORIES ===== */}
      <div className="mx-auto max-w-3xl px-4 pt-4 sm:px-6">
        {faqCategories.map((cat, catIdx) => (
          <FadeIn key={cat.id} delay={catIdx * 100}>
            <section id={cat.id} className="mb-10 scroll-mt-24">
              <div className="mb-4 flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">
                  {cat.emoji}
                </span>
                <h2 className="pixel text-lg tracking-wider text-zinc-100">
                  {cat.title.toUpperCase()}
                </h2>
                <span className="rounded-sm border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[9px] pixel tracking-widest text-zinc-500">
                  {cat.items.length} {cat.items.length === 1 ? "PREGUNTA" : "PREGUNTAS"}
                </span>
              </div>

              <div className="space-y-3">
                {cat.items.map((item, idx) => (
                  <details
                    key={idx}
                    className="group overflow-hidden rounded-2xl border-2 border-zinc-800 bg-zinc-900/60 transition-colors open:border-amber-400/40 open:bg-zinc-900/80"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 font-medium text-zinc-100 transition-colors hover:text-amber-300 [&::-webkit-details-marker]:hidden">
                      <span className="flex items-center gap-3">
                        <span
                          className="pixel shrink-0 rounded-sm border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-[9px] tracking-widest text-amber-300"
                          aria-hidden="true"
                        >
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span>{item.q}</span>
                      </span>
                      <svg
                        className="h-4 w-4 shrink-0 text-zinc-500 transition-transform group-open:rotate-180"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </summary>
                    <p className="border-t border-zinc-800 px-6 py-4 text-sm leading-relaxed text-zinc-400">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          </FadeIn>
        ))}

        {/* ===== CTA ===== */}
        <FadeIn>
          <section className="rounded-2xl border-2 border-zinc-800 bg-zinc-900/40 p-8 text-center">
            <p className="pixel text-[10px] tracking-widest text-amber-300">
              ★ ¿TENÉS OTRA DUDA? ★
            </p>
            <h2 className="pixel mt-3 text-xl text-zinc-100">
              ESCRIBINOS
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-zinc-500">
              Si no encontrás tu respuesta acá, contactanos por WhatsApp y te
              respondemos a la brevedad.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="https://wa.me/5492994018220?text=Hola%2C%20tengo%20una%20duda%20sobre%20Craft3d"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border-2 border-green-400/60 bg-green-400/10 px-5 py-2.5 text-sm font-bold text-green-300 transition-colors hover:bg-green-400/20"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                CHATEÁ POR WHATSAPP
              </Link>
              <Link
                href="https://instagram.com/craft3d.ar"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border-2 border-pink-400/60 bg-pink-400/10 px-5 py-2.5 text-sm font-bold text-pink-300 transition-colors hover:bg-pink-400/20"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
                SEGUINOS EN INSTAGRAM
              </Link>
            </div>
          </section>
        </FadeIn>
      </div>
    </div>
  );
}
