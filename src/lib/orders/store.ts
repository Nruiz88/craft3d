import "server-only";
import { and, asc, desc, eq, ne, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { products } from "@/lib/db/schema";
import { categories } from "@/lib/products";
import type { CategoryId, Product } from "@/lib/products/types";

export interface ProductInput {
  slug: string;
  name: string;
  category: CategoryId;
  price: number;
  emoji: string;
  image: string | null;
  images: string[];
  description: string;
  details: string[];
  stock: number;
  featured: boolean;
  tags: string[];
  dropStartsAt?: string | null;
  dropEndsAt?: string | null;
  dropUnits?: number | null;
  weightGrams?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
  depthCm?: number | null;
}

interface ProductRow {
  id: number | string;
  slug: string;
  name: string;
  category: string;
  price: number | string;
  emoji: string;
  image: string | null;
  images: unknown;
  description: string;
  details: unknown;
  stock: number | string;
  featured: boolean;
  tags: unknown;
  drop_starts_at: string | Date | null;
  drop_ends_at: string | Date | null;
  drop_units: number | null;
  created_at: string | Date;
}

const iso = (v: string | Date | null): string | null =>
  v == null ? null : v instanceof Date ? v.toISOString() : String(v);

function toProduct(row: ProductRow): Product {
  return {
    id: Number(row.id),
    slug: row.slug,
    name: row.name,
    category: row.category as CategoryId,
    price: Number(row.price),
    emoji: row.emoji,
    image: row.image,
    images: Array.isArray(row.images)
      ? row.images.map(String).filter(Boolean)
      : [],
    description: row.description,
    details: Array.isArray(row.details) ? row.details.map(String) : [],
    stock: Number(row.stock),
    featured: Boolean(row.featured),
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    dropStartsAt: iso(row.drop_starts_at),
    dropEndsAt: iso(row.drop_ends_at),
    dropUnits: row.drop_units != null ? Number(row.drop_units) : null,
    // La tabla products no tiene columnas de medidas: se exponen como null.
    weightGrams: null,
    widthCm: null,
    heightCm: null,
    depthCm: null,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
  };
}

const categoryIds = new Set<string>(categories.map((c) => c.id));

export function validateProductInput(data: Record<string, unknown>): ProductInput {
  const name = typeof data.name === "string" ? data.name.trim() : "";
  if (!name) throw new Error("El nombre del producto es obligatorio");

  const category = data.category as string;
  if (!categoryIds.has(category)) throw new Error("Categoría inválida");

  const price = Number(data.price);
  if (!Number.isFinite(price) || price < 0) {
    throw new Error("El precio debe ser un número mayor o igual a 0");
  }

  const stock = Number(data.stock);
  if (!Number.isInteger(stock) || stock < 0) {
    throw new Error("El stock debe ser un número entero mayor o igual a 0");
  }

  const emoji =
    typeof data.emoji === "string" && data.emoji.trim() ? data.emoji.trim() : "📦";
  const image =
    typeof data.image === "string" && data.image.trim() ? data.image.trim() : null;
  const images = Array.isArray(data.images)
    ? data.images
        .map(String)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const description =
    typeof data.description === "string" ? data.description.trim() : "";
  const details = Array.isArray(data.details)
    ? data.details.map(String).map((s) => s.trim()).filter(Boolean)
    : [];
  const tags = Array.isArray(data.tags)
    ? data.tags
        .map(String)
        .map((s) => s.trim().replace(/^#/, ""))
        .filter(Boolean)
    : [];
  const featured = Boolean(data.featured);

  const dropStartsAt =
    typeof data.dropStartsAt === "string" && data.dropStartsAt.trim()
      ? data.dropStartsAt
      : null;
  const dropEndsAt =
    typeof data.dropEndsAt === "string" && data.dropEndsAt.trim()
      ? data.dropEndsAt
      : null;

  const dropUnitsRaw = data.dropUnits;
  const dropUnits =
    dropUnitsRaw === "" || dropUnitsRaw == null
      ? null
      : Number(dropUnitsRaw);
  if (
    dropUnits != null &&
    (!Number.isInteger(dropUnits) || dropUnits < 0)
  ) {
    throw new Error("Las unidades numeradas deben ser un número entero mayor o igual a 0");
  }

  const weightGrams = data.weightGrams != null && data.weightGrams !== "" ? Number(data.weightGrams) : null;
  const widthCm = data.widthCm != null && data.widthCm !== "" ? Number(data.widthCm) : null;
  const heightCm = data.heightCm != null && data.heightCm !== "" ? Number(data.heightCm) : null;
  const depthCm = data.depthCm != null && data.depthCm !== "" ? Number(data.depthCm) : null;

  return {
    slug: "",
    name,
    category: category as CategoryId,
    price,
    emoji,
    image,
    images,
    description,
    details,
    stock,
    featured,
    tags,
    dropStartsAt,
    dropEndsAt,
    dropUnits,
    weightGrams,
    widthCm,
    heightCm,
    depthCm,
  };
}

const clean = (o: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(o).filter(([, v]) => v !== undefined && v !== ""),
  );

// NOTA: la tabla products no tiene columnas weight_*/width_cm/etc.,
// por eso toRow no las persiste (se aceptan en el input por compatibilidad).
function toRow(input: ProductInput) {
  return clean({
    slug: input.slug,
    name: input.name,
    category: input.category,
    price: String(input.price),
    emoji: input.emoji,
    image: input.image,
    images: input.images ?? [],
    description: input.description,
    details: input.details,
    stock: input.stock,
    featured: input.featured,
    tags: input.tags,
    drop_starts_at: input.dropStartsAt ? new Date(input.dropStartsAt) : null,
    drop_ends_at: input.dropEndsAt ? new Date(input.dropEndsAt) : null,
    drop_units: input.dropUnits,
  });
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    const rows = await db
      .select()
      .from(products)
      .orderBy(desc(products.featured), asc(products.name));
    return rows.map((row) => toProduct(row as ProductRow));
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "No se pudieron cargar",
    );
  }
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  try {
    const [row] = await db
      .select()
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);
    return row ? toProduct(row as ProductRow) : undefined;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "No se pudo cargar",
    );
  }
}

export async function getProductById(id: number): Promise<Product | undefined> {
  try {
    const [row] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    return row ? toProduct(row as ProductRow) : undefined;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "No se pudo cargar",
    );
  }
}

export async function slugExists(slug: string, excludeId?: number): Promise<boolean> {
  try {
    const conds = [eq(products.slug, slug)];
    if (excludeId) conds.push(ne(products.id, excludeId));
    const [row] = await db
      .select({ id: products.id })
      .from(products)
      .where(and(...conds))
      .limit(1);
    return !!row;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "No se pudo verificar",
    );
  }
}

export async function createProduct(input: ProductInput): Promise<Product> {
  try {
    const [row] = await db
      .insert(products)
      .values(toRow(input) as typeof products.$inferInsert)
      .returning();
    if (!row) throw new Error("No se pudo crear el producto");
    return toProduct(row as ProductRow);
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "No se pudo crear",
    );
  }
}

export async function updateProduct(
  id: number,
  input: ProductInput,
): Promise<Product> {
  try {
    const [row] = await db
      .update(products)
      .set(toRow(input) as Partial<typeof products.$inferInsert>)
      .where(eq(products.id, id))
      .returning();
    if (!row) throw new Error("No se pudo actualizar el producto");
    return toProduct(row as ProductRow);
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "No se pudo actualizar",
    );
  }
}

export async function deleteProduct(id: number): Promise<void> {
  try {
    await db.delete(products).where(eq(products.id, id));
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "No se pudo eliminar",
    );
  }
}

export async function setProductFeatured(id: number, featured: boolean): Promise<void> {
  try {
    await db.update(products).set({ featured }).where(eq(products.id, id));
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "No se pudo actualizar",
    );
  }
}

export async function setProductStock(id: number, stock: number): Promise<void> {
  try {
    await db.update(products).set({ stock }).where(eq(products.id, id));
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "No se pudo actualizar",
    );
  }
}

export async function decrementProductStock(id: number, quantity: number): Promise<void> {
  const qty = Math.floor(Number(quantity));
  if (!Number.isFinite(qty) || qty <= 0) throw new Error("Cantidad inválida");
  try {
    // Decremento atómico: solo actualiza si hay stock suficiente.
    const res = await db.execute(
      sql`update products set stock = stock - ${qty} where id = ${id} and stock >= ${qty} returning stock`,
    );
    if (res.rows.length === 0) throw new Error("Stock insuficiente");
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "No se pudo actualizar el stock",
    );
  }
}
