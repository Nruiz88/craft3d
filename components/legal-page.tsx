import type { ReactNode } from "react";

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="pixel text-sm tracking-wider text-cyan-300">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-zinc-300">
        {children}
      </div>
    </section>
  );
}

export default function LegalPage({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="pixel text-[10px] tracking-widest text-cyan-400 neon-cyan">
        <span className="text-zinc-600" aria-hidden="true">
          {"// "}
        </span>
        {eyebrow}
      </p>
      <h1 className="mt-3 text-3xl font-bold text-zinc-50 sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 text-xs text-zinc-500">
        Última actualización: {updated}
      </p>
      <div className="mt-10 space-y-10">{children}</div>
    </div>
  );
}
