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

export async function getWaitlistEntries(): Promise<WaitlistEntry[]> {
  const rows = await db.select().from(drop_waitlist).orderBy(desc(drop_waitlist.created_at));
  return rows.map((row) => ({
    id: Number(row.id),
    productSlug: row.product_slug,
    email: row.email,
    whatsapp: row.whatsapp,
    createdAt: (row.created_at instanceof Date ? row.created_at : new Date(row.created_at)).toISOString(),
  }));
}

export async function joinDropWaitlist(input: { slug: string; email: string; whatsapp?: string }): Promise<{ ok: boolean }> {
  await db
    .insert(drop_waitlist)
    .values({
      product_slug: input.slug,
      email: input.email.toLowerCase(),
      whatsapp: input.whatsapp ?? "",
    })
    .execute();
  return { ok: true };
}

export async function deleteWaitlistEntry(id: number): Promise<{ ok: boolean }> {
  await db.delete(drop_waitlist).where(eq(drop_waitlist.id, Number(id))).execute();
  return { ok: true };
}
