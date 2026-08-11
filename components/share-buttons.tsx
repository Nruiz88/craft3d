"use client";

import { useState } from "react";
import { site } from "@/lib/site";

export default function ShareButtons({
  name,
  slug,
  price,
}: {
  name: string;
  slug: string;
  price: string;
}) {
  const [copied, setCopied] = useState(false);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  function absoluteUrl(): string {
    const origin =
      typeof window !== "undefined" ? window.location.origin : siteUrl;
    return `${origin}/productos/${slug}`;
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(absoluteUrl());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // portapapeles no disponible
    }
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `Mirá esta pieza de Craft3d: "${name}" (${price}). ${absoluteUrl()}`,
  )}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={copyLink}
        className={`pixel inline-flex items-center gap-2 rounded-md border-2 px-3.5 py-2 text-[10px] tracking-widest transition-colors ${
          copied
            ? "border-emerald-500/60 text-emerald-300"
            : "border-zinc-700 text-zinc-400 hover:border-cyan-400/60 hover:text-cyan-300"
        }`}
      >
        {copied ? (
          <span aria-hidden="true">✓</span>
        ) : (
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
        {copied ? "¡COPIADO!" : "COPIAR ENLACE"}
      </button>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="pixel inline-flex items-center gap-2 rounded-md border-2 border-emerald-800/70 px-3.5 py-2 text-[10px] tracking-widest text-emerald-300 transition-colors hover:border-emerald-500 hover:bg-emerald-950/40"
      >
        <span aria-hidden="true">💬</span> COMPARTIR
      </a>
      <a
        href={site.instagram}
        target="_blank"
        rel="noopener noreferrer"
        className="pixel inline-flex items-center gap-2 rounded-md border-2 border-fuchsia-800/70 px-3.5 py-2 text-[10px] tracking-widest text-fuchsia-300 transition-colors hover:border-fuchsia-500 hover:bg-fuchsia-950/40"
      >
        <span aria-hidden="true">📷</span> INSTAGRAM
      </a>
    </div>
  );
}
