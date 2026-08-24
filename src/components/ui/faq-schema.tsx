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
      <section className="mt-16 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8">
        <h2 className="mb-6 text-xl font-bold text-zinc-100">
          Preguntas frecuentes
        </h2>
        <dl className="space-y-4">
          {faq.map((item) => (
            <div key={item.question} className="border-b border-zinc-800 pb-4 last:border-0 last:pb-0">
              <dt className="font-medium text-zinc-200">{item.question}</dt>
              <dd className="mt-1 text-sm text-zinc-400">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
