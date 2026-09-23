"use client";

import Link from "next/link";
import { useState } from "react";
import { categories, categoryLandingUrl } from "@/lib/products";

const categoryAccents: Record<string, { text: string; bg: string; border: string }> = {
  anime: { text: "text-fuchsia-300", bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/20" },
  gaming: { text: "text-cyan-300", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  "cine-series": { text: "text-violet-300", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  accesorios: { text: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  drops: { text: "text-rose-300", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  "mundial-2026": { text: "text-sky-300", bg: "bg-sky-500/10", border: "border-sky-500/20" },
  "mystery-box": { text: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/20" },
};

export default function CategoryMenuItem({
  category,
  onNavigate,
}: {
  category: (typeof categories)[number];
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const accent = categoryAccents[category.id] ?? categoryAccents.anime;

  const href = categoryLandingUrl(category.id);

  return (
    <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40">
      {/* Fila entera = enlace directo (funciona incluso sin JS / pre-hidratación) */}
      <div className="flex items-stretch">
        <Link
          href={href}
          onClick={onNavigate}
          className="flex flex-1 items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-zinc-800/50"
        >
          <span className="text-lg" aria-hidden="true">
            {category.emoji}
          </span>
          <span className="flex-1 text-sm font-medium text-zinc-200">
            {category.name}
          </span>
        </Link>
        <button
          type="button"
          aria-label={`Ver descripción de ${category.name}`}
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
          className="px-3 text-zinc-500 transition-colors hover:text-amber-300"
        >
          <svg
            className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Descripción (expansión opcional) */}
      {expanded ? (
        <div className="border-t border-zinc-800/60 px-3 pb-2.5 pt-2">
          <p className="mb-2 text-xs leading-relaxed text-zinc-400">
            {category.description}
          </p>
          <Link
            href={href}
            onClick={onNavigate}
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${accent.border} ${accent.bg} ${accent.text} hover:bg-zinc-800`}
          >
            Ver en catálogo
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>
      ) : null}
    </div>
  );
}
