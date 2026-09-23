"use server";

import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { editable_pages, type PageSectionDB } from "@/lib/db/schema";
import { isAdmin } from "@/lib/auth";
import { sanitizeSlug } from "@/lib/utils/sanitize";

export interface PageSection {
  heading: string;
  body: string;
}

export interface EditablePage {
  slug: string;
  title: string;
  subtitle: string;
  content: PageSection[];
  published: boolean;
}

function toPage(row: typeof editable_pages.$inferSelect): EditablePage {
  return {
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    content: Array.isArray(row.content) ? (row.content as PageSectionDB[]) : [],
    published: Boolean(row.published),
  };
}

export async function getEditablePages(): Promise<EditablePage[]> {
  try {
    const rows = await db.select().from(editable_pages).orderBy(asc(editable_pages.slug));
    return rows.map(toPage);
  } catch {
    return [];
  }
}

export async function getEditablePage(slug: string): Promise<EditablePage | null> {
  try {
    const rows = await db.select().from(editable_pages).where(eq(editable_pages.slug, slug)).limit(1);
    return rows[0] ? toPage(rows[0]) : null;
  } catch {
    return null;
  }
}

export async function saveEditablePage(data: {
  slug: string;
  title: string;
  subtitle: string;
  content: PageSection[];
  published: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdmin())) return { ok: false, error: "No autorizado" };
  const slug = sanitizeSlug(data.slug);
  if (!slug || !data.title.trim()) return { ok: false, error: "Faltan datos" };
  try {
    await db
      .insert(editable_pages)
      .values({
        slug,
        title: data.title.trim(),
        subtitle: data.subtitle.trim(),
        content: data.content.filter((s) => s.body.trim()),
        published: data.published,
      })
      .onDuplicateKeyUpdate({
        set: {
          title: data.title.trim(),
          subtitle: data.subtitle.trim(),
          content: data.content.filter((s) => s.body.trim()),
          published: data.published,
        },
      })
      .execute();
    revalidatePath(`/info/${slug}`);
    revalidatePath("/admin/paginas");
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo guardar la página" };
  }
}

export async function deleteEditablePage(slug: string): Promise<{ ok: boolean }> {
  if (!(await isAdmin())) return { ok: false };
  try {
    await db.delete(editable_pages).where(eq(editable_pages.slug, slug)).execute();
    revalidatePath("/admin/paginas");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
