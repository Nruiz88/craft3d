import Link from "next/link";
import type { Metadata } from "next";
import { getAllProducts } from "@/lib/store";
import { dropStatus, formatDropDateTime } from "@/lib/drops";
import { site } from "@/lib/site";
import DropCard from "@/components/drop-card";
import DropSpotlight from "@/components/drop-spotlight";
import DropCountdown from "@/components/drop-countdown";
import ProductVisual from "@/components/product-visual";
import DropHowItWorks from "@/components/drop-how-it-works";
import DropTimeline from "@/components/drop-timeline";
import DropFaq from "@/components/drop-faq";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Drops",
  description:
    "Ediciones limitadas de Craft3d: drops activos, próximos y el archivo de piezas que no vuelven.",
};

const marqueeItems = [
  "EDICIONES NUMERADAS",
  "UN SOLO TIRAJE",
  "CUANDO SE AGOTA, NO VUELVE",
  "PIEZAS ÚNICAS",
  "HECHAS CAPA A CAPA",
];

function getNow(): number {
  return Date.now();
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8">
      <p className="pixel text-[10px] uppercase tracking-widest text-amber-300 neon-amber">
        ★ {eyebrow} ★
      </p>
      <h2 className="pixel mt-3 text-2xl leading-snug text-zinc-100 sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export default async function DropsPage() {
  const allProducts = await getAllProducts();
  const drops = allProducts.filter((p) => p.category === "ediciones-limitadas");
  const now = getNow();

  const withStatus = drops
    .map((product) => ({
      product,
      status: dropStatus(product, now),
    }))
    .sort((a, b) => {
      const aStart = a.product.dropStartsAt ?? a.product.createdAt;
      const bStart = b.product.dropStartsAt ?? b.product.createdAt;
      return aStart.localeCompare(bStart);
    });

  const active = withStatus.filter((entry) => entry.status === "active");
  const upcoming = withStatus.filter((entry) => entry.status === "upcoming");
  const past = withStatus.filter((entry) => entry.status === "past");

  const editionBySlug = new Map<string, number>();
  [...drops]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .forEach((product, index) => editionBySlug.set(product.slug, index + 1));

  const nextDrop = upcoming.length > 0 ? upcoming[0] : null;

  const grid = "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="bg-zinc-950 pb-20">
      {/* ===== MARQUEE · DROP SYSTEM ===== */}
      <div className="border-b-4 border-zinc-800 bg-amber-400" aria-hidden="true">
        <div className="relative overflow-hidden py-2.5">
          <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap">
            {[0, 1].map((copy) => (
              <span key={copy} className="flex items-center gap-8">
                {marqueeItems.map((text) => (
                  <span
                    key={text}
                    className="pixel text-[11px] tracking-widest text-zinc-950"
                  >
                    ★ {text}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ===== HERO ===== */}
      <section className="arcade-grid relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-40 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl" />
        <div className="crt-overlay" aria-hidden="true" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 pt-14 pb-12 text-center sm:px-6">
          <p className="pixel inline-flex items-center gap-2 rounded-sm border-2 border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-[10px] tracking-widest text-amber-300">
            ★ CRAFT3D · DROP SYSTEM ★
          </p>
          <h1 className="pixel mt-6 text-4xl leading-snug text-zinc-100 sm:text-5xl">
            DROPS QUE NO <span className="text-rose-400 neon-amber">VUELVEN</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-500 sm:text-base">
            Ediciones numeradas y limitadas. Cada drop abre con fecha y hora, se
            vende durante su ventana y, cuando se agota, no se vuelve a imprimir
            nunca.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[10px]">
            <span className="pixel rounded-sm border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 tracking-widest text-emerald-300">
              ● {active.length} {active.length === 1 ? "ACTIVO" : "ACTIVOS"}
            </span>
            <span className="pixel rounded-sm border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 tracking-widest text-amber-300">
              ▶ {upcoming.length} {upcoming.length === 1 ? "PRÓXIMO" : "PRÓXIMOS"}
            </span>
            <span className="pixel rounded-sm border border-zinc-700 bg-zinc-900/60 px-3 py-1.5 tracking-widest text-zinc-500">
              ■ {past.length} EN ARCHIVO
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* ===== DROP ACTIVO · SPOTLIGHT ===== */}
        {active.length > 0 ? (
          <section className="mb-16">
            <DropSpotlight
              product={active[0].product}
              edition={editionBySlug.get(active[0].product.slug)}
            />
          </section>
        ) : null}

        {/* ===== OTROS ACTIVOS ===== */}
        {active.length > 1 ? (
          <section className="mb-16">
            <SectionHeading
              eyebrow="También activos"
              title="Otros drops abiertos"
              description="También dentro de su ventana de venta, aunque el protagonista es el de arriba."
            />
            <div className={grid}>
              {active.slice(1).map(({ product, status }) => (
                <DropCard
                  key={product.slug}
                  product={product}
                  status={status}
                  edition={editionBySlug.get(product.slug)}
                />
              ))}
            </div>
          </section>
        ) : null}

        {/* ===== PRÓXIMO DROP · PANEL ===== */}
        {nextDrop ? (
          <section className="mb-16">
            <div className="relative overflow-hidden rounded-3xl border-2 border-amber-400/50 bg-gradient-to-br from-zinc-900 via-zinc-950 to-amber-950/40 shadow-[0_0_80px_rgba(251,191,36,0.08)]">
              <span className="pixel absolute right-5 top-5 z-10 rotate-6 border-2 border-amber-400/50 bg-zinc-950/90 px-3 py-1 text-[9px] tracking-widest text-amber-300">
                ▶ PRÓXIMO DROP
              </span>

              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative min-h-[240px]">
                  <ProductVisual
                    product={nextDrop.product}
                    className="absolute inset-0 h-full w-full"
                  />
                </div>

                <div className="flex flex-col gap-5 p-7 sm:p-10">
                  <p className="pixel text-[10px] tracking-widest text-zinc-500">
                    {nextDrop.product.name
                      ? `DROP ${String(
                          editionBySlug.get(nextDrop.product.slug) ?? "",
                        ).padStart(3, "0")} · EDICIÓN NUMERADA`
                      : "EDICIÓN NUMERADA"}
                  </p>
                  <h2 className="pixel text-2xl leading-snug text-zinc-100 sm:text-3xl">
                    {nextDrop.product.name}
                  </h2>
                  <p className="text-sm text-zinc-500">
                    Abre el {formatDropDateTime(nextDrop.product.dropStartsAt)}
                    {nextDrop.product.dropUnits
                      ? ` · ${nextDrop.product.dropUnits} unidades numeradas`
                      : ""}
                  </p>

                  <div>
                    <p className="pixel mb-2 text-[10px] tracking-widest text-amber-300 neon-amber">
                      ABRE EN
                    </p>
                    <DropCountdown target={nextDrop.product.dropStartsAt ?? ""} />
                  </div>

                  <div className="mt-auto flex flex-wrap gap-3 pt-2">
                    <a
                      href={`${site.whatsapp}?text=${encodeURIComponent(
                        `Hola! Quiero avisarme cuando abra el drop "${nextDrop.product.name}". 🎮`,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-md bg-amber-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-300"
                    >
                      🔔 AVISAME POR WHATSAPP
                    </a>
                    <Link
                      href={`/productos/${nextDrop.product.slug}`}
                      className="pixel inline-flex items-center justify-center gap-2 rounded-md border border-zinc-700 px-5 py-2.5 text-[10px] tracking-widest text-zinc-300 transition-colors hover:border-amber-400/60 hover:bg-amber-400/10 hover:text-amber-300"
                    >
                      VER DROP ▸▸
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* ===== PRÓXIMOS ===== */}
        {upcoming.length > 0 ? (
          <section className="mb-16">
            <SectionHeading
              eyebrow="Próximos drops"
              title="En camino"
              description="Anotate el día y la hora. Cuando el contador llegue a cero, se abre la ventana."
            />
            <div className={grid}>
              {upcoming.map(({ product, status }) => (
                <DropCard
                  key={product.slug}
                  product={product}
                  status={status}
                  edition={editionBySlug.get(product.slug)}
                />
              ))}
            </div>
          </section>
        ) : null}

        {/* ===== PASADOS ===== */}
        {past.length > 0 ? (
          <section className="mb-16">
            <SectionHeading
              eyebrow="Archivo"
              title="Drops pasados"
              description="Tirajes que ya se agotaron y no se vuelven a imprimir. Solo quedan para la galería."
            />
            <div className={grid}>
              {past.map(({ product, status }) => (
                <DropCard
                  key={product.slug}
                  product={product}
                  status={status}
                  edition={editionBySlug.get(product.slug)}
                />
              ))}
            </div>
          </section>
        ) : null}

        {drops.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-14 text-center">
            <p className="text-4xl" aria-hidden="true">
              📦
            </p>
            <p className="mt-4 text-lg font-semibold text-zinc-200">
              Todavía no hay drops publicados
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              Los drops se cargan desde el panel de administración, en la
              sección Drops.
            </p>
          </div>
        ) : null}
      </div>

      {/* ===== CÓMO FUNCIONA ===== */}
      <DropHowItWorks />

      {/* ===== CRONOLOGÍA ===== */}
      {drops.length > 0 ? <DropTimeline items={withStatus} /> : null}

      {/* ===== FAQ ===== */}
      <DropFaq />

      {/* ===== CTA FINAL ===== */}
      <section className="border-t border-zinc-800">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <p className="pixel text-[10px] uppercase tracking-widest text-amber-300 neon-amber">
            {"// no te lo pierdas"}
          </p>
          <h2 className="pixel mt-3 text-2xl leading-snug text-zinc-100 sm:text-3xl">
            EL PRÓXIMO DROP NO VUELVE
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-500">
            Los drops se anuncian por redes antes de abrir. Seguinos para no
            quedarte afuera cuando el contador llegue a cero.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/40 bg-fuchsia-500/10 px-6 py-2.5 text-sm font-semibold text-fuchsia-300 transition-colors hover:bg-fuchsia-500/20"
            >
              📷 Seguir en Instagram
            </a>
            <a
              href={site.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-6 py-2.5 text-sm font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20"
            >
              💬 Escribir por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
