import { categories, categoryLandingUrl } from "@/lib/products";
import SectionHeading from "@/components/ui/section-heading";
import type { Product } from "@/lib/products/types";

const categoryAccents: Record<string, { card: string; text: string; emojiGlow: string; glyph: string }> = {
  anime: { card: "hover:border-fuchsia-400/60 hover:shadow-[0_0_40px_rgba(232,121,249,0.12)]", text: "text-fuchsia-300", emojiGlow: "group-hover:border-fuchsia-400/60 group-hover:shadow-[0_0_24px_rgba(232,121,249,0.35)]", glyph: "アニメ" },
  gaming: { card: "hover:border-cyan-400/60 hover:shadow-[0_0_40px_rgba(34,211,238,0.14)]", text: "text-cyan-300", emojiGlow: "group-hover:border-cyan-400/60 group-hover:shadow-[0_0_24px_rgba(34,211,238,0.35)]", glyph: "ゲーム" },
  "cine-series": { card: "hover:border-violet-400/60 hover:shadow-[0_0_40px_rgba(167,139,250,0.12)]", text: "text-violet-300", emojiGlow: "group-hover:border-violet-400/60 group-hover:shadow-[0_0_24px_rgba(167,139,250,0.35)]", glyph: "映画" },
  accesorios: { card: "hover:border-amber-400/60 hover:shadow-[0_0_40px_rgba(251,191,36,0.14)]", text: "text-amber-300", emojiGlow: "group-hover:border-amber-400/60 group-hover:shadow-[0_0_24px_rgba(251,191,36,0.35)]", glyph: "雑貨" },
  drops: { card: "hover:border-rose-400/60 hover:shadow-[0_0_40px_rgba(251,113,133,0.14)]", text: "text-rose-300", emojiGlow: "group-hover:border-rose-400/60 group-hover:shadow-[0_0_24px_rgba(251,113,133,0.35)]", glyph: "限定" },
  "mundial-2026": { card: "hover:border-sky-400/60 hover:shadow-[0_0_40px_rgba(56,189,248,0.14)]", text: "text-sky-300", emojiGlow: "group-hover:border-sky-400/60 group-hover:shadow-[0_0_24px_rgba(56,189,248,0.35)]", glyph: "２０２６" },
  "mystery-box": { card: "hover:border-amber-400/60 hover:shadow-[0_0_40px_rgba(251,191,36,0.14)]", text: "text-amber-300", emojiGlow: "group-hover:border-amber-400/60 group-hover:shadow-[0_0_24px_rgba(251,191,36,0.35)]", glyph: "？？？" },
};

export default function CategoriesSection({ allProducts }: { allProducts: Product[] }) {
  return (
    <section id="categorias" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SectionHeading
        eyebrow="Explorá por tipo"
        title="Categorías"
        description="Elegí qué tipo de pieza estás buscando: desde arte en capas hasta figuras articuladas."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, index) => {
          const count = allProducts.filter((p) => p.category === category.id).length;
          const accent = categoryAccents[category.id] ?? categoryAccents.anime;
          return (
            <a
              key={category.id}
              href={categoryLandingUrl(category.id)}
              data-category={category.id}
              className={`group relative overflow-hidden rounded-2xl border-2 border-zinc-800 bg-zinc-900/60 transition-all duration-300 hover:-translate-y-1 ${accent.card}`}
            >
              <span className="cat-card-pattern pointer-events-none absolute inset-0" aria-hidden="true" />
              <span className="cat-card-glyph pointer-events-none absolute -bottom-2 right-1" aria-hidden="true">{accent.glyph}</span>
              <div className="cat-card-header flex items-center justify-between border-b-2 border-zinc-800 bg-zinc-950/70 px-5 py-2.5">
                <span className={`pixel text-[9px] tracking-widest ${accent.text}`}>▶ {category.name.toUpperCase()}</span>
                <span className="pixel text-[9px] tracking-widest text-zinc-600">{String(index + 1).padStart(2, "0")}/{String(categories.length).padStart(2, "0")}</span>
              </div>
              <div className="cat-card-body flex flex-col items-center px-5 py-8 text-center">
                <span className={`flex h-16 w-16 items-center justify-center rounded-xl border-2 border-zinc-800 bg-zinc-950 text-3xl shadow-[inset_0_0_24px_rgba(0,0,0,0.7)] transition-all duration-300 ${accent.emojiGlow}`} aria-hidden="true">
                  {category.emoji}
                </span>
                <h3 className={`pixel mt-5 text-sm tracking-widest ${accent.text}`}>{category.name.toUpperCase()}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-500">{category.description}</p>
                <span className={`pixel mt-5 inline-flex items-center gap-1.5 text-[10px] tracking-widest text-zinc-600 transition-colors ${accent.text}`}>
                  VER PIEZAS <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5">▸▸</span>
                  <span className="ml-2 rounded-sm border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-[9px] text-zinc-400">{count}</span>
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
