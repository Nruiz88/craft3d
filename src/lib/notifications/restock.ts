import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { restock_requests } from "@/lib/db/schema";

export interface RestockRequest {
  id: number;
  productSlug: string;
  email: string;
  whatsapp: string;
  createdAt: string;
}

function toISO(value: Date | string): string {
  return (value instanceof Date ? value : new Date(value)).toISOString();
}

export async function getRestockRequests(): Promise<RestockRequest[]> {
  const rows = await db.select().from(restock_requests).orderBy(desc(restock_requests.created_at));
  return rows.map((row) => ({
    id: Number(row.id),
    productSlug: row.product_slug,
    email: row.email,
    whatsapp: row.whatsapp,
    createdAt: toISO(row.created_at),
  }));
}

export async function getRestockRequestsByProduct(slug: string): Promise<RestockRequest[]> {
  const rows = await db
    .select()
    .from(restock_requests)
    .where(eq(restock_requests.product_slug, slug))
    .orderBy(desc(restock_requests.created_at));
  return rows.map((row) => ({
    id: Number(row.id),
    productSlug: row.product_slug,
    email: row.email,
    whatsapp: row.whatsapp,
    createdAt: toISO(row.created_at),
  }));
}

export async function joinRestock(input: { slug: string; email: string; whatsapp?: string }): Promise<{ ok: boolean }> {
  await db
    .insert(restock_requests)
    .values({
      product_slug: input.slug,
      email: input.email.toLowerCase(),
      whatsapp: input.whatsapp ?? "",
    })
    .execute();
  return { ok: true };
}

export async function deleteRestockRequest(id: number): Promise<{ ok: boolean }> {
  await db.delete(restock_requests).where(eq(restock_requests.id, Number(id))).execute();
  return { ok: true };
}

export async function deleteRestockRequestsForProduct(slug: string): Promise<{ ok: boolean }> {
  await db.delete(restock_requests).where(eq(restock_requests.product_slug, slug)).execute();
  return { ok: true };
}
