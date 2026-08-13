import type { CategoryId, Product } from "./types";
import { categories } from "./products";

export type MysteryPool = CategoryId | "all";

export const POOL_TAG_PREFIX = "pool:";
export const BOX_EXCLUDE_TAG_PREFIX = "box-exclude:";

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
  const excluded = new Set(
    box.tags
      .filter((t) => t.startsWith(BOX_EXCLUDE_TAG_PREFIX))
      .map((t) => t.slice(BOX_EXCLUDE_TAG_PREFIX.length)),
  );
  return allProducts.filter((p) => {
    if (p.id === box.id) return false;
    if (p.category === "mystery-box" || p.category === "drops") return false;
    if (pool !== "all" && p.category !== pool) return false;
    if (excluded.has(p.slug)) return false;
    return true;
  });
}

export function mysteryBoxExcludeTags(excludedSlugs: string[]): string[] {
  return excludedSlugs.map((slug) => `${BOX_EXCLUDE_TAG_PREFIX}${slug}`);
}

export function drawMysteryPiece(poolProducts: Product[]): Product | undefined {
  if (poolProducts.length === 0) return undefined;

  const byRarity: Record<MysteryRarity, Product[]> = {
    comun: [],
    rara: [],
    epica: [],
  };
  for (const p of poolProducts) {
    byRarity[parseMysteryRarity(p.tags)].push(p);
  }

  const active = mysteryRarityOptions.filter((o) => byRarity[o.value].length > 0);
  if (active.length === 0) {
    return poolProducts[Math.floor(Math.random() * poolProducts.length)];
  }

  const totalWeight = active.reduce((sum, o) => sum + o.weight, 0);
  let roll = Math.random() * totalWeight;
  let chosen = active[0];
  for (const option of active) {
    roll -= option.weight;
    if (roll <= 0) {
      chosen = option;
      break;
    }
  }
  const tier = byRarity[chosen.value];
  return tier[Math.floor(Math.random() * tier.length)];
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

export interface MysteryRarityOdds {
  rarity: MysteryRarity;
  label: string;
  count: number;
  pct: number;
}

export function getMysteryRarityOdds(
  poolProducts: Product[],
): MysteryRarityOdds[] {
  const byRarity: Record<MysteryRarity, number> = { comun: 0, rara: 0, epica: 0 };
  for (const p of poolProducts) {
    byRarity[parseMysteryRarity(p.tags)] += 1;
  }
  const active = mysteryRarityOptions.filter((o) => byRarity[o.value] > 0);
  const totalWeight = active.reduce((sum, o) => sum + o.weight, 0) || 1;
  return active.map((o) => ({
    rarity: o.value,
    label: o.label,
    count: byRarity[o.value],
    pct: Math.round((o.weight / totalWeight) * 100),
  }));
}

export interface MysteryPoolPreview {
  pieces: { slug: string; name: string; emoji: string; rarity: MysteryRarity }[];
  total: number;
  minPrice: number | null;
  maxPrice: number | null;
  rarities: MysteryRarityOdds[];
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
      rarity: parseMysteryRarity(p.tags),
    })),
    total: sorted.length,
    minPrice: sorted.length > 0 ? sorted[0].price : null,
    maxPrice: sorted.length > 0 ? sorted[sorted.length - 1].price : null,
    rarities: getMysteryRarityOdds(sorted),
  };
}
