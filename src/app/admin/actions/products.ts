"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import {
  createProduct,
  deleteProduct,
  setProductFeatured,
  setProductStock,
  slugExists,
  updateProduct,
  validateProductInput,
  type ProductInput,
} from "@/lib/orders/store";
import { logAdminAction } from "@/lib/admin/admin-log";
import { checkAdminRateLimit } from "@/lib/utils/admin-rate-limit";
import { sanitizeString, sanitizeMultiline, sanitizeArray, sanitizeNumber, sanitizeSlug } from "@/lib/utils/sanitize";
import { validateCsrfToken } from "@/lib/utils/csrf";
import {
  mysteryBoxIncludeTags,
  type MysteryBoxInclude,
} from "@/lib/mystery-box";
import { slugify } from "@/lib/utils/slug";
import type { AdminFormState } from "./helpers";

function normalizeDropDate(value: FormDataEntryValue | null): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function parseProductForm(formData: FormData): ProductInput {
  const firstImage = String(formData.get("imageData") || formData.get("image") || "");
  const extraImages = [2, 3]
    .map((n) => String(formData.get(`imageData${n}`) || formData.get(`image${n}`) || ""))
    .filter((value) => value.trim() !== "");

  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim().replace(/^#/, ""))
    .filter(Boolean);

  const category = String(formData.get("category") ?? "").trim();
  const cleanTags = tags.filter(
    (t) => !t.startsWith("rarity:") && !t.startsWith("box-include:") && !t.startsWith("box-exclude:") && !t.startsWith("pool:"),
  );

  if (category === "mystery-box") {
    const includes: MysteryBoxInclude[] = String(formData.get("boxIncludes") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((entry) => {
        const [slug, qtyRaw] = entry.split(":");
        return { slug, qty: Math.max(1, Number(qtyRaw) || 1) };
      })
      .filter((e) => Boolean(e.slug));
    cleanTags.push(...mysteryBoxIncludeTags(includes));
  } else {
    const rarity = String(formData.get("rarity") ?? "comun").trim();
    cleanTags.push(`rarity:${rarity}`);
  }

  const raw: Record<string, unknown> = {
    name: sanitizeString(formData.get("name")),
    category,
    price: formData.get("price"),
    emoji: formData.get("emoji"),
    image: firstImage,
    images: extraImages,
    description: sanitizeMultiline(formData.get("description")),
    details: String(formData.get("details") ?? "").split(/\r?\n/),
    stock: formData.get("stock"),
    featured: formData.get("featured") === "on",
    tags: cleanTags.map(sanitizeString),
    dropStartsAt: normalizeDropDate(formData.get("dropStartsAt")),
    dropEndsAt: normalizeDropDate(formData.get("dropEndsAt")),
    dropUnits: String(formData.get("dropUnits") ?? ""),
    weightGrams: String(formData.get("weight_grams") ?? ""),
    widthCm: String(formData.get("width_cm") ?? ""),
    heightCm: String(formData.get("height_cm") ?? ""),
    depthCm: String(formData.get("depth_cm") ?? ""),
  };
  return validateProductInput(raw) as unknown as ProductInput;
}

async function resolveSlug(slugInput: string, name: string, excludeId?: number): Promise<string> {
  const base = slugify(slugInput.trim() ? slugInput : name) || "producto";
  let candidate = base;
  let i = 2;
  while (await slugExists(candidate, excludeId)) {
    candidate = `${base}-${i++}`;
  }
  return candidate;
}

function targetOrigin(formData: FormData): string {
  const origen = String(formData.get("origen") ?? "");
  return origen.startsWith("/admin") ? origen : "/admin/productos";
}

export async function updateStockAction(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = Number(formData.get("id"));
  const stock = Number(formData.get("stock"));
  if (!Number.isInteger(id) || id <= 0) return;
  if (!Number.isInteger(stock) || stock < 0) return;
  try {
    await setProductStock(id, stock);
    await logAdminAction("stock", `Producto #${id} → ${stock} u.`);
  } catch {
    return;
  }
  revalidatePath("/");
  revalidatePath("/admin/productos");
  revalidatePath("/admin");
}

export async function createProductAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  if (!(await isAdmin())) return { error: "No autorizado" };
  const rl = checkAdminRateLimit("create-product", 5, 60 * 1000);
  if (!rl.allowed) return { error: rl.error };
  if (!(await validateCsrfToken(String(formData.get("csrf_token") ?? "")))) return { error: "Token CSRF inválido" };
  try {
    const input = await parseProductForm(formData);
    input.slug = await resolveSlug(String(formData.get("slug") ?? ""), input.name);
    await createProduct(input);
    await logAdminAction("crear producto", input.slug);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo guardar el producto" };
  }
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/productos");
  revalidatePath("/drops");
  revalidatePath("/mysterybox");
  redirect(`${targetOrigin(formData)}?creado=1`);
}

export async function updateProductAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  if (!(await isAdmin())) return { error: "No autorizado" };
  const rl = checkAdminRateLimit("update-product", 10, 60 * 1000);
  if (!rl.allowed) return { error: rl.error };
  if (!(await validateCsrfToken(String(formData.get("csrf_token") ?? "")))) return { error: "Token CSRF inválido" };
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return { error: "ID de producto inválido" };
  try {
    const input = await parseProductForm(formData);
    input.slug = await resolveSlug(String(formData.get("slug") ?? ""), input.name, id);
    await updateProduct(id, input);
    await logAdminAction("editar producto", input.slug);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo actualizar el producto" };
  }
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/productos");
  revalidatePath("/drops");
  revalidatePath("/mysterybox");
  revalidatePath(`/productos/${formData.get("slug")}`);
  redirect(`${targetOrigin(formData)}?guardado=1`);
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const rl = checkAdminRateLimit("delete-product", 5, 60 * 1000);
  if (!rl.allowed) return;
  if (!(await validateCsrfToken(String(formData.get("csrf_token") ?? "")))) return;
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;
  try {
    await deleteProduct(id);
    await logAdminAction("borrar producto", `#${id}`);
  } catch {
    redirect(`${targetOrigin(formData)}?error=borrar`);
  }
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/productos");
  revalidatePath("/drops");
  revalidatePath("/mysterybox");
  redirect(`${targetOrigin(formData)}?borrado=1`);
}

export async function toggleFeaturedAction(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;
  const featured = formData.get("featured") === "true";
  try {
    await setProductFeatured(id, featured);
    await logAdminAction(featured ? "destacar producto" : "quitar destacado", `#${id}`);
  } catch {
    return;
  }
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/productos");
}
