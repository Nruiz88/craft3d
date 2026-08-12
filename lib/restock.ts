import "server-only";
import { supabase } from "./supabase";

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
  created_at: string;
}

const toRestockRequest = (row: RestockRow): RestockRequest => ({
  id: row.id,
  productSlug: row.product_slug,
  email: row.email,
  whatsapp: row.whatsapp,
  createdAt: row.created_at,
});

export async function joinRestock(input: {
  slug: string;
  email: string;
  whatsapp: string;
}): Promise<void> {
  const { error } = await supabase.from("restock_requests").insert({
    product_slug: input.slug,
    email: input.email,
    whatsapp: input.whatsapp,
  });
  if (error) {
    // 23505 = ya anotado (email + producto duplicado): no es un error
    if (error.code === "23505") return;
    throw new Error(error.message);
  }
}

export async function getRestockRequests(): Promise<RestockRequest[]> {
  const { data, error } = await supabase
    .from("restock_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => toRestockRequest(row as RestockRow));
}

export async function getRestockRequestsByProduct(
  slug: string,
): Promise<RestockRequest[]> {
  const { data, error } = await supabase
    .from("restock_requests")
    .select("*")
    .eq("product_slug", slug);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => toRestockRequest(row as RestockRow));
}

export async function deleteRestockRequestsForProduct(
  slug: string,
): Promise<void> {
  const { error } = await supabase
    .from("restock_requests")
    .delete()
    .eq("product_slug", slug);
  if (error) throw new Error(error.message);
}

export async function deleteRestockRequest(id: number): Promise<void> {
  const { error } = await supabase
    .from("restock_requests")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}
