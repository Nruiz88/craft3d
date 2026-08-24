"use server";

/**
 * Server actions para páginas editables del admin.
 * CRUD completo para páginas como "Quiénes somos", "Cómo comprar", etc.
 */

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase/client";
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

  const { data, error } = await supabase
    .from("editable_pages")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching pages:", error.message);
    return [];
  }

  return (data as PageRow[]).map(rowToPage);
}

/** Obtener una página por slug (pública o admin) */
export async function getEditablePage(slug: string): Promise<EditablePage | null> {
  const { data, error } = await supabase
    .from("editable_pages")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  return rowToPage(data as PageRow);
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

  const { error } = await supabase
    .from("editable_pages")
    .upsert({
      slug,
      title: sanitizeString(input.title),
      subtitle: sanitizeString(input.subtitle ?? ""),
      content: input.content,
      published: input.published ?? true,
    }, { onConflict: "slug" });

  if (error) return { ok: false, error: error.message };

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

  const { error } = await supabase.from("editable_pages").delete().eq("slug", slug);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/paginas");
  return { ok: true };
}
