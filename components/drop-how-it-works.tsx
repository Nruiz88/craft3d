const steps = [
  {
    emoji: "📡",
    title: "Se anuncia",
    text: "Cada drop se anuncia con fecha, hora y cuántas unidades numeradas salen. Cuando se agotan, no se reponen.",
  },
  {
    emoji: "⏰",
    title: "Abre la ventana",
    text: "Durante la ventana podés comprar como cualquier producto. Antes de abrir, se ve el countdown exacto.",
  },
  {
    emoji: "🖨️",
    title: "Se imprime tu unidad",
    text: "Tu unidad se imprime con su número: N.º X de Y. Cada pieza es una edición única, capa a capa.",
  },
  {
    emoji: "🔒",
    title: "Agotado, no vuelve",
    text: "Cuando la ventana cierra o el stock llega a cero, el drop pasa al archivo. No se vuelve a imprimir nunca.",
  },
];

export default function DropHowItWorks() {
  return (
    <section className="border-y-4 border-zinc-800 bg-zinc-900/40">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <p className="pixel text-[10px] uppercase tracking-widest text-cyan-300 neon-cyan">
            {"// sistema de drops"}
          </p>
          <h2 className="pixel mt-3 text-2xl leading-snug text-zinc-100 sm:text-3xl">
            ¿CÓMO FUNCIONA UN DROP?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500">
            Un drop es una edición limitada con fecha de vencimiento. Cuatro
            pasos, cero re-stock.
          </p>
        </div>

        <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="relative rounded-2xl border-2 border-zinc-800 bg-zinc-950/60 p-6 transition-colors hover:border-amber-400/40"
            >
              <span
                className="pixel absolute right-4 top-4 text-[10px] tracking-widest text-zinc-700"
                aria-hidden="true"
              >
                0{index + 1}
              </span>
              <span className="text-4xl drop-shadow" aria-hidden="true">
                {step.emoji}
              </span>
              <h3 className="mt-4 font-semibold text-zinc-100">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                {step.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
