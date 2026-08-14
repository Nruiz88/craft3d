import type { CategoryId, Product } from "./types";
import { categories } from "./products";

export const BOX_INCLUDE_TAG_PREFIX = "box-include:";
const LEGACY_POOL_TAG_PREFIX = "pool:";
const LEGACY_EXCLUDE_TAG_PREFIX = "box-exclude:";

export interface MysteryBoxInclude {
  slug: string;
  qty: number;
}

export interface MysteryBoxItem {
  product: Product;
  qty: number;
}

export function getMysteryBoxIncludes(tags: string[]): MysteryBoxInclude[] {
  const result: MysteryBoxInclude[] = [];
  for (const tag of tags) {
    if (!tag.startsWith(BOX_INCLUDE_TAG_PREFIX)) continue;
    const value = tag.slice(BOX_INCLUDE_TAG_PREFIX.length);
    const [slug, qtyRaw] = value.split(":");
    if (!slug) continue;
    const qty = Math.max(1, Number(qtyRaw) || 1);
    result.push({ slug, qty });
  }
  return result;
}

export function mysteryBoxIncludeTags(
  items: MysteryBoxInclude[],
): string[] {
  return items.map(
    (it) =>
      `${BOX_INCLUDE_TAG_PREFIX}${it.slug}${it.qty > 1 ? `:${it.qty}` : ""}`,
  );
}

function parseLegacyPool(tags: string[]): CategoryId | "all" {
  const tag = tags.find((t) => t.startsWith(LEGACY_POOL_TAG_PREFIX));
  if (!tag) return "all";
  const value = tag.slice(LEGACY_POOL_TAG_PREFIX.length);
  return categories.some((c) => c.id === value)
    ? (value as CategoryId)
    : "all";
}

export function mysteryBoxPoolLabel(tags: string[]): string {
  const includes = getMysteryBoxIncludes(tags);
  if (includes.length > 0) {
    const total = includes.reduce((sum, it) => sum + it.qty, 0);
    return `${total} ${total === 1 ? "pieza" : "piezas"}`;
  }
  const pool = parseLegacyPool(tags);
  if (pool === "all") return "Toda la tienda";
  const cat = categories.find((c) => c.id === pool);
  return cat ? cat.name : "Toda la tienda";
}

export function isMysteryBox(product: Product): boolean {
  return product.category === "mystery-box";
}

export function getMysteryBoxItems(
  allProducts: Product[],
  box: Product,
): MysteryBoxItem[] {
  const bySlug = new Map(allProducts.map((p) => [p.slug, p]));
  const isEligible = (p: Product) =>
    p.id !== box.id &&
    p.category !== "mystery-box" &&
    p.category !== "drops";

  const includes = getMysteryBoxIncludes(box.tags);
  if (includes.length > 0) {
    const items: MysteryBoxItem[] = [];
    for (const inc of includes) {
      const product = bySlug.get(inc.slug);
      if (!product || !isEligible(product)) continue;
      items.push({ product, qty: inc.qty });
    }
    return items;
  }

  // Legacy: pool por categoría con exclusiones
  const excluded = new Set(
    box.tags
      .filter((t) => t.startsWith(LEGACY_EXCLUDE_TAG_PREFIX))
      .map((t) => t.slice(LEGACY_EXCLUDE_TAG_PREFIX.length)),
  );
  const pool = parseLegacyPool(box.tags);
  return allProducts
    .filter(isEligible)
    .filter((p) => pool === "all" || p.category === pool)
    .filter((p) => !excluded.has(p.slug))
    .map((p) => ({ product: p, qty: 1 }));
}

export function getMysteryPoolProducts(
  allProducts: Product[],
  box: Product,
): Product[] {
  return getMysteryBoxItems(allProducts, box).flatMap((it) =>
    Array.from({ length: it.qty }, () => it.product),
  );
}

export type MysteryRarity = "comun" | "rara" | "epica";

export const RARITY_TAG_PREFIX = "rarity:";

export const mysteryRarityOptions: {
  value: MysteryRarity;
  label: string;
  weight: number;
}[] = [
  { value: "comun", label: "Común", weight: 70 },
  { value: "rara", label: "Rara", weight: 25 },
  { value: "epica", label: "Épica", weight: 5 },
];

export function mysteryRarityLabel(rarity: MysteryRarity): string {
  return (
    mysteryRarityOptions.find((o) => o.value === rarity)?.label ?? "Común"
  );
}

export function parseMysteryRarity(tags: string[]): MysteryRarity {
  const tag = tags.find((t) => t.startsWith(RARITY_TAG_PREFIX));
  if (!tag) return "comun";
  const value = tag.slice(RARITY_TAG_PREFIX.length);
  return mysteryRarityOptions.some((o) => o.value === value)
    ? (value as MysteryRarity)
    : "comun";
}

export function mysteryRarityTag(rarity: MysteryRarity): string {
  return `${RARITY_TAG_PREFIX}${rarity}`;
}

export interface MysteryPoolPreviewPiece {
  slug: string;
  name: string;
  emoji: string;
  rarity: MysteryRarity;
  qty: number;
}

export interface MysteryPoolPreview {
  pieces: MysteryPoolPreviewPiece[];
  total: number;
  minPrice: number | null;
  maxPrice: number | null;
  totalValue: number;
}

export function getMysteryPoolPreview(
  allProducts: Product[],
  box: Product,
  limit = 4,
): MysteryPoolPreview {
  const items = getMysteryBoxItems(allProducts, box);
  const units = items.flatMap((it) =>
    Array.from({ length: it.qty }, () => it.product),
  );
  const unitSorted = [...units].sort((a, b) => a.price - b.price);
  return {
    pieces: items.slice(0, limit).map((it) => ({
      slug: it.product.slug,
      name: it.product.name,
      emoji: it.product.emoji,
      rarity: parseMysteryRarity(it.product.tags),
      qty: it.qty,
    })),
    total: units.length,
    minPrice: unitSorted.length > 0 ? unitSorted[0].price : null,
    maxPrice:
      unitSorted.length > 0 ? unitSorted[unitSorted.length - 1].price : null,
    totalValue: items.reduce((sum, it) => sum + it.product.price * it.qty, 0),
  };
}
