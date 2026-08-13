import "server-only";
import { supabase } from "./supabase";
import { categories } from "./products";
import type { CategoryId, Product } from "./types";

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
  drop_starts_at: string | null;
  drop_ends_at: string | null;
  drop_units: number | null;
  created_at: string;
}

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
    dropStartsAt: row.drop_starts_at ?? null,
    dropEndsAt: row.drop_ends_at ?? null,
    dropUnits: row.drop_units != null ? Number(row.drop_units) : null,
    createdAt: row.created_at,
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
  };
}

function toRow(input: ProductInput) {
  return {
    slug: input.slug,
    name: input.name,
    category: input.category,
    price: input.price,
    emoji: input.emoji,
    image: input.image,
    images: input.images ?? [],
    description: input.description,
    details: input.details,
    stock: input.stock,
    featured: input.featured,
    tags: input.tags,
    drop_starts_at: input.dropStartsAt ?? null,
    drop_ends_at: input.dropEndsAt ?? null,
    drop_units: input.dropUnits ?? null,
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("featured", { ascending: false })
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => toProduct(row as ProductRow));
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toProduct(data as ProductRow) : undefined;
}

export async function getProductById(id: number): Promise<Product | undefined> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toProduct(data as ProductRow) : undefined;
}

export async function slugExists(slug: string, excludeId?: number): Promise<boolean> {
  let query = supabase.from("products").select("id").eq("slug", slug);
  if (excludeId) query = query.neq("id", excludeId);
  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(error.message);
  return !!data;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert(toRow(input))
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return toProduct(data as ProductRow);
}

export async function updateProduct(
  id: number,
  input: ProductInput,
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .update(toRow(input))
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return toProduct(data as ProductRow);
}

export async function deleteProduct(id: number): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function setProductFeatured(id: number, featured: boolean): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({ featured })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function setProductStock(id: number, stock: number): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({ stock })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
