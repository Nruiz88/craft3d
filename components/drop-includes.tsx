function padEdition(n: number): string {
  return String(n).padStart(3, "0");
}

export default function DropIncludes({
  details,
  edition,
  totalUnits,
}: {
  details: string[];
  edition?: number;
  totalUnits?: number | null;
}) {
  const dropItems = [
    "N.º de edición grabado en la base",
    "Certificado de autenticidad Craft3d",
  ];
  const items = [...details, ...dropItems].filter(
    (item, index, arr) => arr.indexOf(item) === index,
  );

  return (
    <section>
      <div className="relative overflow-hidden rounded-3xl border-2 border-amber-400/60 bg-gradient-to-br from-zinc-900 via-zinc-950 to-amber-950/40 shadow-[0_0_80px_rgba(251,191,36,0.1)]">
        <div className="crt-overlay" aria-hidden="true" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b-2 border-amber-400/30 bg-black/50 px-6 py-3">
          <span className="pixel text-[10px] tracking-widest text-amber-300 neon-amber">
            ● QUÉ INCLUYE · TU UNIDAD
          </span>
          <span className="pixel text-[10px] tracking-widest text-rose-300">
            N.º {edition != null ? padEdition(edition) : "?"}
          </span>
        </div>

        <ul className="relative z-10 grid grid-cols-1 gap-px bg-amber-400/15 sm:grid-cols-2">
          {items.map((item, index) => (
            <li
              key={item}
              className="flex items-start gap-3 bg-zinc-950/95 p-5"
            >
              <span className="pixel shrink-0 rounded-sm border border-amber-400/40 bg-amber-950/40 px-2 py-1 text-[9px] tracking-widest text-amber-300">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="pt-1 text-sm leading-relaxed text-zinc-300">
                {item}
              </span>
            </li>
          ))}
        </ul>

        <div className="relative z-10 border-t-2 border-amber-400/20 bg-black/40 px-6 py-3.5">
          <p className="pixel text-center text-[9px] tracking-widest text-zinc-500">
            {totalUnits != null
              ? `◈ TIRAJE DE ${totalUnits} UNIDADES`
              : "◈ TIRAJE ÚNICO"}{" "}
            · NO SE VUELVE A IMPRIMIR
          </p>
        </div>
      </div>
    </section>
  );
}
