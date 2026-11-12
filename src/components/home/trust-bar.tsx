/**
 * Barra de señales de confianza. Baja la fricción de compra mostrando de un
 * vistazo las garantías de la tienda. Server component (estático).
 */
const items: { icon: string; text: string }[] = [
  { icon: "🚚", text: "Envío a todo el país" },
  { icon: "🖨️", text: "Hecho a mano, capa a capa" },
  { icon: "🔒", text: "Pago seguro con MercadoPago" },
  { icon: "🎨", text: "Diseños originales" },
];

export default function TrustBar() {
  return (
    <section className="border-y border-zinc-800 bg-zinc-900/40">
      <ul className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 py-4 sm:px-6">
        {items.map((it) => (
          <li key={it.text} className="flex items-center gap-2 text-xs text-zinc-300 sm:text-sm">
            <span className="text-base" aria-hidden="true">
              {it.icon}
            </span>
            <span className="font-medium">{it.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
