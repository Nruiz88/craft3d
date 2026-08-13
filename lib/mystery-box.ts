import type { CategoryId, Product } from "./types";
import { categories } from "./products";

export type MysteryPool = CategoryId | "all";

export const POOL_TAG_PREFIX = "pool:";

export const mysteryPoolOptions: {
  value: MysteryPool;
  label: string;
}[] = [
  { value: "all", label: "Toda la tienda" },
  ...categories
    .filter((c) => c.id !== "drops" && c.id !== "mystery-box")
    .map((c) => ({ value: c.id as CategoryId, label: c.name })),
];

export function mysteryPoolLabel(pool: MysteryPool): string {
  const option = mysteryPoolOptions.find((o) => o.value === pool);
  return option?.label ?? "Toda la tienda";
}

export function parseMysteryPool(tags: string[]): MysteryPool {
  const tag = tags.find((t) => t.startsWith(POOL_TAG_PREFIX));
  if (!tag) return "all";
  const value = tag.slice(POOL_TAG_PREFIX.length);
  return mysteryPoolOptions.some((o) => o.value === value)
    ? (value as MysteryPool)
    : "all";
}

export function mysteryPoolTag(pool: MysteryPool): string {
  return `${POOL_TAG_PREFIX}${pool}`;
}

export function isMysteryBox(product: Product): boolean {
  return product.category === "mystery-box";
}

export function getMysteryPoolProducts(
  allProducts: Product[],
  box: Product,
): Product[] {
  const pool = parseMysteryPool(box.tags);
  return allProducts.filter((p) => {
    if (p.id === box.id) return false;
    if (p.category === "mystery-box" || p.category === "drops") return false;
    if (pool !== "all" && p.category !== pool) return false;
    return true;
  });
}

export function drawMysteryPiece(poolProducts: Product[]): Product | undefined {
  if (poolProducts.length === 0) return undefined;
  return poolProducts[Math.floor(Math.random() * poolProducts.length)];
}

export interface MysteryPoolPreview {
  pieces: { slug: string; name: string; emoji: string }[];
  total: number;
  minPrice: number | null;
  maxPrice: number | null;
}

export function getMysteryPoolPreview(
  allProducts: Product[],
  box: Product,
  limit = 4,
): MysteryPoolPreview {
  const sorted = [...getMysteryPoolProducts(allProducts, box)].sort(
    (a, b) => a.price - b.price,
  );
  return {
    pieces: sorted.slice(0, limit).map((p) => ({
      slug: p.slug,
      name: p.name,
      emoji: p.emoji,
    })),
    total: sorted.length,
    minPrice: sorted.length > 0 ? sorted[0].price : null,
    maxPrice: sorted.length > 0 ? sorted[sorted.length - 1].price : null,
  };
}
