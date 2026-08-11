import "server-only";
import { supabase } from "./supabase";

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
  created_at: string;
}

const toWaitlistEntry = (row: WaitlistRow): WaitlistEntry => ({
  id: row.id,
  productSlug: row.product_slug,
  email: row.email,
  whatsapp: row.whatsapp,
  createdAt: row.created_at,
});

export async function joinDropWaitlist(input: {
  slug: string;
  email: string;
  whatsapp: string;
}): Promise<void> {
  const { error } = await supabase.from("drop_waitlist").insert({
    product_slug: input.slug,
    email: input.email,
    whatsapp: input.whatsapp,
  });
  if (error) {
    // 23505 = ya anotado (email + drop duplicado): no es un error
    if (error.code === "23505") return;
    throw new Error(error.message);
  }
}

export async function getWaitlistEntries(): Promise<WaitlistEntry[]> {
  const { data, error } = await supabase
    .from("drop_waitlist")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => toWaitlistEntry(row as WaitlistRow));
}

export async function deleteWaitlistEntry(id: number): Promise<void> {
  const { error } = await supabase
    .from("drop_waitlist")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}
