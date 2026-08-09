import "server-only";
import { supabase } from "./supabase";
import type { Order, OrderItemSnapshot, OrderStatus } from "./types";

interface OrderRow {
  id: number | string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  status: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_province: string;
  shipping_postal_code: string;
  subtotal: number | string;
  shipping: number | string;
  total: number | string;
  items: unknown;
  created_at: string;
}

function toOrder(row: OrderRow): Order {
  return {
    id: Number(row.id),
    user_id: row.user_id,
    customer_name: row.customer_name,
    customer_email: row.customer_email,
    status: (["pendiente", "pagado", "enviado", "entregado", "cancelado"].includes(
      row.status,
    )
      ? row.status
      : "pendiente") as OrderStatus,
    shipping_phone: row.shipping_phone,
    shipping_address: row.shipping_address,
    shipping_city: row.shipping_city,
    shipping_province: row.shipping_province,
    shipping_postal_code: row.shipping_postal_code,
    subtotal: Number(row.subtotal),
    shipping: Number(row.shipping),
    total: Number(row.total),
    items: Array.isArray(row.items)
      ? (row.items as unknown[]).map((item) => item as OrderItemSnapshot)
      : [],
    createdAt: row.created_at,
  };
}

export async function getOrders(): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return [];
    return (data ?? []).map((row) => toOrder(row as OrderRow));
  } catch {
    return [];
  }
}

export async function updateOrderStatus(
  id: number,
  status: OrderStatus,
): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
