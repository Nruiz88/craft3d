import type { ReactNode } from "react";
import Breadcrumbs from "@/components/ui/breadcrumbs";

export function LegalSection({
  title,
  number,
  children,
}: {
  title: string;
  number?: number;
  children: ReactNode;
}) {
  return (
    <section className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 transition-colors hover:border-cyan-400/30 hover:bg-zinc-900/60">
      <div className="flex items-start gap-4">
        {number != null && (
          <span className="pixel flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-cyan-400/40 bg-cyan-400/10 text-sm font-bold text-cyan-300">
            {String(number).padStart(2, "0")}
          </span>
        )}
        <div className="min-w-0 flex-1 space-y-4">
          <h2 className="pixel text-base tracking-wider text-cyan-300">
            {title}
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-zinc-400">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

export function LegalHighlight({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-sm text-amber-200/90">
      {children}
    </div>
  );
}

export default function LegalPage({
  eyebrow,
  title,
  updated,
  children,
  icon,
  toc,
  breadcrumbLabel,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: ReactNode;
  icon?: ReactNode;
  toc?: string[];
  breadcrumbLabel?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* Breadcrumbs */}
      {breadcrumbLabel && (
        <div className="mb-8">
          <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: breadcrumbLabel }]} />
        </div>
      )}
      {/* Hero section */}
      <div className="relative mb-12 overflow-hidden rounded-3xl border-2 border-cyan-400/30 bg-gradient-to-br from-zinc-900 via-zinc-950 to-cyan-950/20 p-6 sm:p-8 lg:p-12">
        <div className="crt-overlay" aria-hidden="true" />

        {/* Decorative grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          aria-hidden="true"
          style={{
            backgroundImage:
              "linear-gradient(rgba(34,211,238,1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
                {icon}
              </div>
            )}
            <div>
              <p className="pixel text-[10px] tracking-widest text-cyan-400 neon-cyan">
                <span className="text-zinc-600" aria-hidden="true">
                  {"// "}
                </span>
                {eyebrow}
              </p>
              <h1 className="mt-1 text-3xl font-bold text-zinc-50 sm:text-4xl">
                {title}
              </h1>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/60 px-3 py-1.5 text-xs text-zinc-400">
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              Última actualización: {updated}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 text-xs text-cyan-300">
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              </svg>
              Documento oficial
            </span>
          </div>
        </div>
      </div>

      {/* Table of contents (auto-generated from sections) */}
      <div className="mb-10 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="pixel text-[10px] tracking-widest text-zinc-500 mb-4">
          ÍNDICE
        </h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(toc ?? []).map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-zinc-300"
            >
              <span className="pixel flex h-6 w-6 shrink-0 items-center justify-center rounded border border-zinc-700 bg-zinc-800 text-[10px] text-zinc-500">
                {String(i + 1).padStart(2, "0")}
              </span>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">{children}</div>

      {/* Bottom CTA */}
      <div className="mt-12 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-center sm:p-8">
        <p className="pixel text-[10px] tracking-widest text-zinc-500 mb-2">
          ¿DUDAS?
        </p>
        <p className="text-sm text-zinc-400">
          Si tenés preguntas sobre estos términos, escribinos por{" "}
          <a
            href="https://wa.me/5492994018220"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-emerald-400 transition-colors hover:text-emerald-300"
          >
            WhatsApp
          </a>{" "}
          o al{" "}
          <a
            href="mailto:contacto@craft3d.com.ar"
            className="font-medium text-cyan-300 transition-colors hover:text-cyan-200"
          >
            contacto@craft3d.com.ar
          </a>
        </p>
      </div>
    </div>
  );
}
