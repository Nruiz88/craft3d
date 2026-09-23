/**
 * FAQ Schema para rich snippets en Google.
 * Renderiza JSON-LD invisible + FAQ visible en la página.
 */

interface FaqItem {
  question: string;
  answer: string;
}

const defaultFaq: FaqItem[] = [
  {
    question: "¿Cómo hago un pedido en Craft3d?",
    answer: "Elegí tu producto, agregalo al carrito y completá el checkout. Podés pagar con transferencia bancaria o Mercado Pago. Si tenés dudas, escribinos por WhatsApp.",
  },
  {
    question: "¿Cuánto tarda en llegar mi pedido?",
    answer: "Los envíos se realizan dentro de las 48-72 horas hábiles después de confirmado el pago. El tiempo de entrega depende de tu ubicación (generalmente 3-7 días hábiles).",
  },
  {
    question: "¿Los envíos son gratis?",
    answer: "El envío es gratis en compras superiores al monto indicado en la tienda. Para montos menores, el costo se calcula automáticamente según tu dirección.",
  },
  {
    question: "¿Puedo hacer un pedido por WhatsApp?",
    answer: "¡Sí! Cada producto tiene un botón de WhatsApp que te conecta directamente con nosotros. Te asesoramos y coordinamos la compra por ahí.",
  },
  {
    question: "¿Qué es un drop en Craft3d?",
    answer: "Un drop es una edición limitada y numerada de un producto. Cuando se agota, no se vuelve a imprimir. Cada unidad tiene su número de edición impreso.",
  },
];

export default function FaqSchema({ items }: { items?: FaqItem[] }) {
  const faq = items ?? defaultFaq;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="border-t border-zinc-800 bg-zinc-900/20 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="pixel text-[10px] uppercase tracking-widest text-amber-300 neon-amber">
            ★ DUDAS ★
          </p>
          <h2 className="pixel mt-3 text-2xl leading-snug text-zinc-100 sm:text-3xl">
            Preguntas frecuentes
          </h2>
          <dl className="mt-8 grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-2">
            {faq.map((item) => (
              <div key={item.question} className="border-b border-zinc-800 pb-4">
                <dt className="font-medium text-zinc-200">{item.question}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-zinc-400">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
