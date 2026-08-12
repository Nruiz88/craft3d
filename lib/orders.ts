import "server-only";
import { supabase } from "./supabase";
import type {
  Order,
  OrderItemSnapshot,
  OrderStatus,
  PaymentMethod,
} from "./types";

interface OrderRow {
  id: number | string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  status: string;
  payment_method: string | null;
  payment_id: string | null;
  mp_preference_id: string | null;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_province: string;
  shipping_postal_code: string;
  subtotal: number | string;
  shipping: number | string;
  total: number | string;
  discount: number | string | null;
  coupon_code: string | null;
  is_reservation: boolean;
  deposit_paid: number | string;
  items: unknown;
  created_at: string;
}

function toOrder(row: OrderRow): Order {
  return {
    id: Number(row.id),
    user_id: row.user_id,
    customer_name: row.customer_name,
    customer_email: row.customer_email,
    status: (["pendiente", "reserva", "pagado", "enviado", "entregado", "cancelado"].includes(
      row.status,
    )
      ? row.status
      : "pendiente") as OrderStatus,
    paymentMethod: (["transferencia", "mercado_pago"].includes(
      row.payment_method ?? "",
    )
      ? row.payment_method
      : "transferencia") as PaymentMethod,
    paymentId: row.payment_id ?? "",
    mpPreferenceId: row.mp_preference_id ?? "",
    shipping_phone: row.shipping_phone,
    shipping_address: row.shipping_address,
    shipping_city: row.shipping_city,
    shipping_province: row.shipping_province,
    shipping_postal_code: row.shipping_postal_code,
    subtotal: Number(row.subtotal),
    shipping: Number(row.shipping),
    total: Number(row.total),
    discount: Number(row.discount ?? 0),
    couponCode: row.coupon_code ?? null,
    isReservation: Boolean(row.is_reservation),
    depositPaid: Number(row.deposit_paid ?? 0),
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

export async function getOrderById(id: number): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    return toOrder(data as OrderRow);
  } catch {
    return null;
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

export async function setOrderPreference(
  id: number,
  preferenceId: string,
): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ mp_preference_id: preferenceId })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function markOrderPaid(
  id: number,
  paymentId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("orders")
    .update({
      status: "pagado",
      payment_id: paymentId,
      payment_method: "mercado_pago",
    })
    .eq("id", id)
    .eq("status", "pendiente")
    .select("id")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return !!data;
}

export async function markReservationDepositPaid(
  id: number,
  paymentId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("orders")
    .update({
      status: "reserva",
      payment_id: paymentId,
      payment_method: "mercado_pago",
    })
    .eq("id", id)
    .eq("status", "pendiente")
    .select("id")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return !!data;
}
