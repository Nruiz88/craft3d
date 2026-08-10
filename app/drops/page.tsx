import type { Metadata } from "next";
import { getAllProducts } from "@/lib/store";
import DropCard, { type DropStatus } from "@/components/drop-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Drops",
  description:
    "Ediciones limitadas de Craft3d: drops activos, próximos y el archivo de piezas que no vuelven.",
};

function dropStatus(
  product: {
    dropStartsAt: string | null;
    dropEndsAt: string | null;
  },
  now: number,
): DropStatus {
  const start = product.dropStartsAt ? new Date(product.dropStartsAt).getTime() : null;
  const end = product.dropEndsAt ? new Date(product.dropEndsAt).getTime() : null;

  if (start != null && start > now) return "upcoming";
  if (end != null && end < now) return "past";
  return "active";
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

function getNow(): number {
  return Date.now();
}

export default async function DropsPage() {
  const allProducts = await getAllProducts();
  const drops = allProducts.filter((p) => p.category === "ediciones-limitadas");
  const now = getNow();

  const withStatus = drops.map((product) => ({
    product,
    status: dropStatus(product, now),
  }));

  const active = withStatus.filter((entry) => entry.status === "active");
  const upcoming = withStatus.filter((entry) => entry.status === "upcoming");
  const past = withStatus.filter((entry) => entry.status === "past");

  const grid = "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="arcade-grid relative min-h-screen overflow-hidden bg-zinc-950 pb-20">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-40 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-14 sm:px-6">
        <div className="mb-12 text-center">
          <p className="pixel inline-flex items-center gap-2 rounded-sm border-2 border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-[10px] tracking-widest text-amber-300">
            ★ CRAFT3D · DROP SYSTEM ★
          </p>
          <h1 className="pixel mt-6 text-4xl leading-snug text-zinc-100 sm:text-5xl">
            DROPS QUE NO <span className="text-rose-400 neon-amber">VUELVEN</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-500 sm:text-base">
            Ediciones numeradas y limitadas. Cada drop tiene una ventana de
            tiempo: cuando se agota, no se vuelve a imprimir nunca.
          </p>
        </div>

        {active.length > 0 ? (
          <section className="mb-16">
            <SectionHeading
              eyebrow="Drop activo"
              title="Abiertos ahora"
              description="Dentro de su ventana de venta. Aprovechá antes de que cierre."
            />
            <div className={grid}>
              {active.map(({ product }) => (
                <DropCard key={product.slug} product={product} status="active" />
              ))}
            </div>
          </section>
        ) : null}

        {upcoming.length > 0 ? (
          <section className="mb-16">
            <SectionHeading
              eyebrow="Próximos drops"
              title="En camino"
              description="Anotate el día y la hora: estos drops abren pronto."
            />
            <div className={grid}>
              {upcoming.map(({ product }) => (
                <DropCard key={product.slug} product={product} status="upcoming" />
              ))}
            </div>
          </section>
        ) : null}

        {past.length > 0 ? (
          <section>
            <SectionHeading
              eyebrow="Archivo"
              title="Drops pasados"
              description="Ediciones que ya no se imprimen. Solo para la galería y el recuerdo."
            />
            <div className={grid}>
              {past.map(({ product }) => (
                <DropCard key={product.slug} product={product} status="past" />
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
              categoría Ediciones Limitadas.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
