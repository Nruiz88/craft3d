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

interface RestockRow {
  id: number;
  product_slug: string;
  email: string;
  whatsapp: string;
  created_at: string | Date;
}

const toRestockRequest = (row: RestockRow): RestockRequest => ({
  id: row.id,
  productSlug: row.product_slug,
  email: row.email,
  whatsapp: row.whatsapp,
  createdAt:
    row.created_at instanceof Date
      ? row.created_at.toISOString()
      : String(row.created_at),
});

export async function joinRestock(input: {
  slug: string;
  email: string;
  whatsapp: string;
}): Promise<void> {
  try {
    await db.insert(restock_requests).values({
      product_slug: input.slug,
      email: input.email,
      whatsapp: input.whatsapp,
    });
  } catch (error: unknown) {
    // 23505 = ya anotado (email + producto duplicado): no es un error
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

export async function getRestockRequests(): Promise<RestockRequest[]> {
  try {
    const rows = await db
      .select()
      .from(restock_requests)
      .orderBy(desc(restock_requests.created_at));
    return rows.map((row) => toRestockRequest(row as RestockRow));
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "No se pudo cargar la lista",
    );
  }
}

export async function getRestockRequestsByProduct(
  slug: string,
): Promise<RestockRequest[]> {
  try {
    const rows = await db
      .select()
      .from(restock_requests)
      .where(eq(restock_requests.product_slug, slug));
    return rows.map((row) => toRestockRequest(row as RestockRow));
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "No se pudo cargar la lista",
    );
  }
}

export async function deleteRestockRequestsForProduct(
  slug: string,
): Promise<void> {
  try {
    await db
      .delete(restock_requests)
      .where(eq(restock_requests.product_slug, slug));
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "No se pudo eliminar",
    );
  }
}

export async function deleteRestockRequest(id: number): Promise<void> {
  try {
    await db.delete(restock_requests).where(eq(restock_requests.id, id));
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "No se pudo eliminar",
    );
  }
}
