import "server-only";
import { and, asc, desc, eq, ne, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { products, type OrderItemSnapshotDB } from "@/lib/db/schema";
import { sanitizeNumber } from "@/lib/utils/sanitize";
import type { CategoryId, Product } from "@/lib/products/types";

function toISO(value: Date | string | null): string {
  if (!value) return new Date(0).toISOString();
  return (value instanceof Date ? value : new Date(value)).toISOString();
}

function toProduct(row: typeof products.$inferSelect): Product {
  return {
    id: Number(row.id),
    slug: row.slug,
    name: row.name,
    category: row.category as CategoryId,
    price: Number(row.price),
    emoji: row.emoji,
    image: row.image ?? null,
    images: Array.isArray(row.images) ? row.images : [],
    description: row.description ?? "",
    details: Array.isArray(row.details) ? row.details : [],
    stock: Number(row.stock),
    featured: Boolean(row.featured),
    tags: Array.isArray(row.tags) ? row.tags : [],
    dropStartsAt: row.drop_starts_at ? toISO(row.drop_starts_at) : null,
    dropEndsAt: row.drop_ends_at ? toISO(row.drop_ends_at) : null,
    dropUnits: row.drop_units != null ? Number(row.drop_units) : null,
    weightGrams: null,
    widthCm: null,
    heightCm: null,
    depthCm: null,
    createdAt: toISO(row.created_at),
  };
}

export interface ProductInput {
  name: string;
  slug: string;
  category: string;
  price: number;
  emoji: string;
  image: string;
  images: string[];
  description: string;
  details: string[];
  stock: number;
  featured: boolean;
  tags: string[];
  dropStartsAt: string;
  dropEndsAt: string;
  dropUnits: string | number;
  weightGrams?: string | number;
  widthCm?: string | number;
  heightCm?: string | number;
  depthCm?: string | number;
}

function parseDate(value: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function validateProductInput(raw: Record<string, unknown>): Promise<ProductInput> {
  const name = String(raw.name ?? "").trim();
  if (!name) throw new Error("El nombre es obligatorio");

  const price = sanitizeNumber(raw.price, 0);
  if (price == null) throw new Error("El precio es inválido");

  const stock = sanitizeNumber(raw.stock, 0);
  if (stock == null) throw new Error("El stock es inválido");

  const category = String(raw.category ?? "figuras").trim() || "figuras";
  const emoji = String(raw.emoji ?? "🎁").trim().slice(0, 8) || "🎁";
  const details = Array.isArray(raw.details)
    ? (raw.details as unknown[]).map((d) => String(d).trim()).filter(Boolean)
    : [];
  const images = Array.isArray(raw.images)
    ? (raw.images as unknown[]).map((i) => String(i).trim()).filter(Boolean)
    : [];

  return {
    name,
    slug: String(raw.slug ?? "").trim(),
    category,
    price,
    emoji,
    image: String(raw.image ?? "").trim(),
    images,
    description: String(raw.description ?? "").trim(),
    details,
    stock: Math.round(stock),
    featured: Boolean(raw.featured),
    tags: Array.isArray(raw.tags) ? (raw.tags as unknown[]).map(String) : [],
    dropStartsAt: String(raw.dropStartsAt ?? ""),
    dropEndsAt: String(raw.dropEndsAt ?? ""),
    dropUnits: String(raw.dropUnits ?? ""),
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const rows = await db.select().from(products).orderBy(desc(products.created_at));
  return rows.map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const rows = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return rows[0] ? toProduct(rows[0]) : null;
}

export async function getProductById(id: number | string): Promise<Product | null> {
  const rows = await db.select().from(products).where(eq(products.id, Number(id))).limit(1);
  return rows[0] ? toProduct(rows[0]) : null;
}

export async function slugExists(slug: string, excludeId?: number): Promise<boolean> {
  const condition = excludeId
    ? and(eq(products.slug, slug), ne(products.id, excludeId))
    : eq(products.slug, slug);
  const rows = await db.select({ id: products.id }).from(products).where(condition).limit(1);
  return rows.length > 0;
}

export async function createProduct(input: ProductInput): Promise<{ data: Product | null; error: string | null }> {
  try {
    const inserted = await db
      .insert(products)
      .values({
        slug: input.slug,
        name: input.name,
        category: input.category,
        price: String(input.price),
        emoji: input.emoji,
        image: input.image || null,
        images: input.images,
        description: input.description,
        details: input.details,
        stock: input.stock,
        featured: input.featured,
        tags: input.tags,
        drop_starts_at: parseDate(input.dropStartsAt),
        drop_ends_at: parseDate(input.dropEndsAt),
        drop_units: input.dropUnits ? Number(input.dropUnits) || null : null,
      })
      .execute();
    void inserted;
    const created = await getProductBySlug(input.slug);
    return { data: created, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Error al crear" };
  }
}

export async function updateProduct(id: number | string, input: ProductInput): Promise<{ data: Product | null; error: string | null }> {
  try {
    await db
      .update(products)
      .set({
        slug: input.slug,
        name: input.name,
        category: input.category,
        price: String(input.price),
        emoji: input.emoji,
        image: input.image || null,
        images: input.images,
        description: input.description,
        details: input.details,
        stock: input.stock,
        featured: input.featured,
        tags: input.tags,
        drop_starts_at: parseDate(input.dropStartsAt),
        drop_ends_at: parseDate(input.dropEndsAt),
        drop_units: input.dropUnits ? Number(input.dropUnits) || null : null,
      })
      .where(eq(products.id, Number(id)))
      .execute();
    const updated = await getProductById(id);
    return { data: updated, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Error al actualizar" };
  }
}

export async function deleteProduct(id: number | string): Promise<{ error: string | null }> {
  try {
    await db.delete(products).where(eq(products.id, Number(id))).execute();
    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error al borrar" };
  }
}

export async function setProductFeatured(id: number | string, featured: boolean): Promise<{ ok: boolean }> {
  await db.update(products).set({ featured }).where(eq(products.id, Number(id))).execute();
  return { ok: true };
}

export async function setProductStock(id: number | string, stock: number): Promise<{ ok: boolean }> {
  await db.update(products).set({ stock: Math.max(0, Math.round(stock)) }).where(eq(products.id, Number(id))).execute();
  return { ok: true };
}

export async function decrementProductStock(idOrSlug: number | string, qty = 1): Promise<{ ok: boolean }> {
  const condition =
    typeof idOrSlug === "number"
      ? eq(products.id, idOrSlug)
      : eq(products.slug, idOrSlug);
  await db
    .update(products)
    .set({ stock: sql`GREATEST(${products.stock} - ${qty}, 0)` })
    .where(condition)
    .execute();
  return { ok: true };
}

// Reexport para tipos del admin
export type { OrderItemSnapshotDB };
