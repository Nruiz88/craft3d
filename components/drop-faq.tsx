const faqs = [
  {
    q: "¿Qué es un drop?",
    a: "Una edición limitada con una ventana de tiempo. Cada drop sale con una fecha de apertura y cierre, y una cantidad fija de unidades numeradas.",
  },
  {
    q: "¿Puedo pedir una pieza igual cuando el drop se agota?",
    a: "No. Cuando la ventana cierra o el stock llega a cero, el drop pasa al archivo y no se vuelve a imprimir. Cada drop es un tiraje único.",
  },
  {
    q: "¿Cómo sé cuándo abre el próximo drop?",
    a: "La fecha y hora de apertura se muestran en esta página con un countdown exacto. También lo anunciamos por Instagram y WhatsApp.",
  },
  {
    q: "¿La compra y el envío funcionan igual que el resto de la tienda?",
    a: "Sí. Durante la ventana se compra con transferencia o Mercado Pago como cualquier producto, y el envío se coordina por WhatsApp.",
  },
  {
    q: "¿Puedo reservar un drop pagando una seña?",
    a: "Sí. Podés reservar (o pre-reservar antes de que abra) tu unidad pagando una seña del porcentaje configurado, por defecto 30%. El resto se abona antes del envío, coordinado por WhatsApp.",
  },
];

export default function DropFaq() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="mb-8 text-center">
        <p className="pixel text-[10px] uppercase tracking-widest text-violet-300 neon-amber">
          ★ preguntas frecuentes ★
        </p>
        <h2 className="pixel mt-3 text-2xl leading-snug text-zinc-100 sm:text-3xl">
          DUDAS DE DROP
        </h2>
      </div>

      <div className="space-y-3">
        {faqs.map((faq) => (
          <details
            key={faq.q}
            className="group overflow-hidden rounded-2xl border-2 border-zinc-800 bg-zinc-900/60 open:border-amber-400/40"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 font-medium text-zinc-100 transition-colors hover:text-amber-300 [&::-webkit-details-marker]:hidden">
              <span>{faq.q}</span>
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
            <p className="border-t border-zinc-800 px-6 py-4 text-sm leading-relaxed text-zinc-500">
              {faq.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
