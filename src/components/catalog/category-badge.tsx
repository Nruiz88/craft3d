import { categoryById } from "@/lib/products";
import type { CategoryId } from "@/lib/products/types";
import { badgeByCategory, defaultBadgeClass } from "@/lib/products/badges";

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
        badgeByCategory[category] ?? defaultBadgeClass
      } ${className}`}
    >
      <span aria-hidden="true">{cat?.emoji}</span>
      {cat?.name ?? category}
    </span>
  );
}
