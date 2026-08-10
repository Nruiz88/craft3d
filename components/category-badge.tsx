import { categoryById } from "@/lib/products";
import type { CategoryId } from "@/lib/types";

const badgeByCategory: Record<string, string> = {
  anime: "border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-300",
  gaming: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
  "cine-series": "border-rose-500/40 bg-rose-500/10 text-rose-300",
  accesorios: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  drops: "border-violet-500/40 bg-violet-500/10 text-violet-300",
  "mundial-2026": "border-sky-500/40 bg-sky-500/10 text-sky-300",
};

export default function CategoryBadge({
  category,
  className = "",
}: {
  category: CategoryId;
  className?: string;
}) {
  const cat = categoryById[category];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
        badgeByCategory[category] ?? "border-zinc-700 bg-zinc-800/60 text-zinc-300"
      } ${className}`}
    >
      <span aria-hidden="true">{cat?.emoji}</span>
      {cat?.name ?? category}
    </span>
  );
}
