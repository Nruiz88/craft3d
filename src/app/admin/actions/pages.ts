"use server";

/**
 * Server actions para páginas editables del admin.
 * CRUD completo para páginas como "Quiénes somos", "Cómo comprar", etc.
 */

import { revalidatePath } from "next/cache";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { editable_pages } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth";
import { checkAdminRateLimit } from "@/lib/utils/admin-rate-limit";
import { sanitizeString } from "@/lib/utils/sanitize";

export interface EditablePage {
  slug: string;
  title: string;
  subtitle: string;
  content: PageSection[];
  published: boolean;
  updatedAt: string;
}

export interface PageSection {
  heading?: string;
  body: string;
}

interface PageRow {
  slug: string;
  title: string;
  subtitle: string;
  content: PageSection[];
  published: boolean;
  updated_at: string;
}

function rowToPage(row: PageRow): EditablePage {
  return {
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    content: Array.isArray(row.content) ? row.content : [],
    published: row.published,
    updatedAt: row.updated_at,
  };
}

/** Listar todas las páginas editables */
export async function getEditablePages(): Promise<EditablePage[]> {
  await requireAdmin();
  checkAdminRateLimit("pages-list", 30, 60_000);

  try {
    const rows = await db
      .select()
      .from(editable_pages)
      .orderBy(asc(editable_pages.created_at));
    return rows.map((row) => rowToPage(row as unknown as PageRow));
  } catch (e) {
    console.error("Error fetching pages:", e instanceof Error ? e.message : e);
    return [];
  }
}

/** Obtener una página por slug (pública o admin) */
export async function getEditablePage(slug: string): Promise<EditablePage | null> {
  try {
    const [row] = await db
      .select()
      .from(editable_pages)
      .where(eq(editable_pages.slug, slug))
      .limit(1);
    if (!row) return null;
    return rowToPage(row as unknown as PageRow);
  } catch {
    return null;
  }
}

/** Crear o actualizar una página */
export async function saveEditablePage(input: {
  slug: string;
  title: string;
  subtitle?: string;
  content: PageSection[];
  published?: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  checkAdminRateLimit("pages-save", 10, 60_000);

  const slug = sanitizeString(input.slug).toLowerCase().replace(/[^a-z0-9-]/g, "-");
  if (!slug) return { ok: false, error: "Slug inválido" };

  try {
    await db.insert(editable_pages).values({
      slug,
      title: sanitizeString(input.title),
      subtitle: sanitizeString(input.subtitle ?? ""),
      content: input.content,
      published: input.published ?? true,
    }).onConflictDoUpdate({
      target: editable_pages.slug,
      set: {
        title: sanitizeString(input.title),
        subtitle: sanitizeString(input.subtitle ?? ""),
        content: input.content,
        published: input.published ?? true,
      },
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al guardar" };
  }

  revalidatePath(`/admin/paginas`);
  revalidatePath(`/${slug}`);
  return { ok: true };
}

/** Eliminar una página */
export async function deleteEditablePage(
  slug: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  checkAdminRateLimit("pages-delete", 5, 60_000);

  try {
    await db.delete(editable_pages).where(eq(editable_pages.slug, slug));
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al eliminar" };
  }

  revalidatePath("/admin/paginas");
  return { ok: true };
}
