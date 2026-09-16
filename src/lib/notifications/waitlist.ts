import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { drop_waitlist } from "@/lib/db/schema";

export interface WaitlistEntry {
  id: number;
  productSlug: string;
  email: string;
  whatsapp: string;
  createdAt: string;
}

interface WaitlistRow {
  id: number;
  product_slug: string;
  email: string;
  whatsapp: string;
  created_at: string | Date;
}

const toWaitlistEntry = (row: WaitlistRow): WaitlistEntry => ({
  id: row.id,
  productSlug: row.product_slug,
  email: row.email,
  whatsapp: row.whatsapp,
  createdAt:
    row.created_at instanceof Date
      ? row.created_at.toISOString()
      : String(row.created_at),
});

export async function joinDropWaitlist(input: {
  slug: string;
  email: string;
  whatsapp: string;
}): Promise<void> {
  try {
    await db.insert(drop_waitlist).values({
      product_slug: input.slug,
      email: input.email,
      whatsapp: input.whatsapp,
    });
  } catch (error: unknown) {
    // 23505 = ya anotado (email + drop duplicado): no es un error
    if (
      typeof error === "object" &&
      error !== null &&
      (error as { code?: string }).code === "23505"
    )
      return;
    throw new Error(
      error instanceof Error ? error.message : "No se pudo anotar",
    );
  }
}

export async function getWaitlistEntries(): Promise<WaitlistEntry[]> {
  try {
    const rows = await db
      .select()
      .from(drop_waitlist)
      .orderBy(desc(drop_waitlist.created_at));
    return rows.map((row) => toWaitlistEntry(row as WaitlistRow));
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "No se pudo cargar la lista",
    );
  }
}

export async function deleteWaitlistEntry(id: number): Promise<void> {
  try {
    await db.delete(drop_waitlist).where(eq(drop_waitlist.id, id));
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "No se pudo eliminar",
    );
  }
}
