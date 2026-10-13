import type { Metadata } from "next";
import Link from "next/link";
import { guides } from "@/lib/guides";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import FadeIn from "@/components/ui/fade-in";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://craft3d.com.ar";

export const metadata: Metadata = {
  title: "Guías de regalos y decoración",
  description:
    "Guías de Craft3d: ideas de regalos para fans del anime y gamers, cómo decorar tu cuarto con temática anime y más. Consejos y productos recomendados.",
  alternates: { canonical: `${siteUrl}/guias` },
};

export const dynamic = "force-dynamic";

export default function GuiasPage() {
  return (
    <div className="bg-zinc-950 pb-20">
      <section className="relative overflow-hidden border-b-4 border-zinc-800">
        <div className="arcade-grid absolute inset-0" />
        <div className="crt-overlay" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 pt-14 pb-12 text-center sm:px-6 sm:pt-16">
          <FadeIn>
            <div className="mb-6 flex justify-center">
              <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Guías" }]} />
            </div>
            <span className="pixel inline-flex items-center gap-2 rounded-sm border-2 border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-[10px] tracking-widest text-amber-300">
              📖 GUÍAS · CRAFT3D
            </span>
            <h1 className="pixel mt-6 text-3xl leading-snug text-zinc-100 sm:text-5xl">
              GUÍAS DE <span className="text-amber-300">REGALOS</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              Ideas y consejos para regalar y decorar: figuras, cuadros, llaveros
              y todo lo que un fan del anime o gamer va a amar.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pt-14 sm:px-6">
        <div className="grid grid-cols-1 gap-4">
          {guides.map((g, i) => (
            <FadeIn key={g.slug} delay={Math.min(i * 60, 300)}>
              <Link
                href={`/guias/${g.slug}`}
                className="group block rounded-2xl border-2 border-zinc-800 bg-zinc-900/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/50"
              >
                <h2 className="text-lg font-semibold text-zinc-100 group-hover:text-amber-300">
                  {g.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{g.description}</p>
                <span className="pixel mt-4 inline-flex items-center gap-1.5 text-[10px] tracking-widest text-amber-300">
                  LEER GUÍA <span aria-hidden="true">▸▸</span>
                </span>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  );
}
