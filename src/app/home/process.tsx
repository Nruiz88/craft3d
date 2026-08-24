import SectionHeading from "@/components/ui/section-heading";

const steps = [
  {
    icon: "🎨",
    title: "Diseño y modelado",
    text: "Cada pieza se modela o prepara para imprimir con atención al detalle y a las capas de color.",
  },
  {
    icon: "🖨️",
    title: "Impresión capa a capa",
    text: "Impresión con calibración fina para lograr superficies limpias, encastres correctos y colores vivos.",
  },
  {
    icon: "📦",
    title: "Terminado y envío",
    text: "Lijado, limpieza de soportes y control de calidad antes de embalar y despachar tu pedido.",
  },
];

export default function ProcessSection() {
  return (
    <section id="proceso" className="border-t border-zinc-800 bg-zinc-900/40">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="De la idea a tu casa"
          title="Cómo trabajamos"
          description="Cada pedido pasa por el mismo proceso, con control de calidad en cada paso."
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.title} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
              <span className="text-3xl" aria-hidden="true">{step.icon}</span>
              <h3 className="mt-3 text-lg font-semibold text-zinc-100">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
