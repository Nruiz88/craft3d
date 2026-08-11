"use client";

import { useWishlist } from "@/lib/wishlist-context";

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className="h-4.5 w-4.5"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

export default function WishlistButton({
  slug,
  name,
  withLabel = false,
  className = "",
}: {
  slug: string;
  name: string;
  withLabel?: boolean;
  className?: string;
}) {
  const { isSaved, toggle } = useWishlist();
  const saved = isSaved(slug);

  if (withLabel) {
    return (
      <button
        type="button"
        onClick={() => toggle(slug)}
        aria-pressed={saved}
        aria-label={saved ? `Quitar ${name} de favoritos` : `Guardar ${name} en favoritos`}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition-colors ${
          saved
            ? "border-rose-500/70 bg-rose-950/30 text-rose-300 hover:bg-rose-900/40"
            : "border-zinc-700 bg-zinc-950 text-zinc-200 hover:border-rose-500/70 hover:text-rose-300"
        } ${className}`}
      >
        <HeartIcon filled={saved} />
        {saved ? "Guardado en favoritos" : "Guardar en favoritos"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle(slug);
      }}
      aria-pressed={saved}
      aria-label={saved ? `Quitar ${name} de favoritos` : `Guardar ${name} en favoritos`}
      title={saved ? "Quitar de favoritos" : "Guardar en favoritos"}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border bg-zinc-950/80 backdrop-blur transition-all ${
        saved
          ? "border-rose-500/80 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.4)]"
          : "border-zinc-700/80 text-zinc-400 hover:border-rose-500/70 hover:text-rose-300"
      } ${className}`}
    >
      <HeartIcon filled={saved} />
    </button>
  );
}
