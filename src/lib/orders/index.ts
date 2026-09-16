import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { orders } from "@/lib/db/schema";
import type {
  Order,
  OrderItemSnapshot,
  OrderStatus,
  PaymentMethod,
} from "@/lib/products/types";

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
  created_at: string | Date;
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
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
  };
}

export async function getOrders(): Promise<Order[]> {
  try {
    const rows = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.created_at));
    return rows.map((row) => toOrder(row as OrderRow));
  } catch {
    return [];
  }
}

export async function getOrderById(id: number): Promise<Order | null> {
  try {
    const [row] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);
    if (!row) return null;
    return toOrder(row as OrderRow);
  } catch {
    return null;
  }
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  try {
    const rows = await db
      .select()
      .from(orders)
      .where(eq(orders.user_id, userId))
      .orderBy(desc(orders.created_at));
    return rows.map((row) => toOrder(row as OrderRow));
  } catch {
    return [];
  }
}

export async function updateOrderStatus(
  id: number,
  status: OrderStatus,
): Promise<void> {
  try {
    await db.update(orders).set({ status }).where(eq(orders.id, id));
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "No se pudo actualizar",
    );
  }
}

export async function updateOrderItems(
  id: number,
  items: OrderItemSnapshot[],
): Promise<void> {
  try {
    await db
      .update(orders)
      .set({ items })
      .where(eq(orders.id, id));
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "No se pudo actualizar",
    );
  }
}

/** Añade (o actualiza) la línea "🎁 Envolver como regalo" con el mensaje. Cero SQL. */
export async function attachGiftToOrder(
  id: number,
  message: string,
): Promise<void> {
  const order = await getOrderById(id);
  if (!order) return;
  const items = [...order.items];
  const existing = items.find((i) => i.product_slug === "regalo");
  if (existing) {
    existing.giftMessage = message;
  } else {
    items.push({
      product_id: 0,
      product_slug: "regalo",
      product_name: "🎁 Envolver como regalo",
      price: 0,
      quantity: 1,
      subtotal: 0,
      giftMessage: message,
    });
  }
  await updateOrderItems(id, items);
}

export async function setOrderPreference(
  id: number,
  preferenceId: string,
): Promise<void> {
  try {
    await db
      .update(orders)
      .set({ mp_preference_id: preferenceId })
      .where(eq(orders.id, id));
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "No se pudo actualizar",
    );
  }
}

export async function markOrderPaid(
  id: number,
  paymentId: string,
): Promise<boolean> {
  try {
    const [row] = await db
      .update(orders)
      .set({
        status: "pagado",
        payment_id: paymentId,
        payment_method: "mercado_pago",
      })
      .where(and(eq(orders.id, id), eq(orders.status, "pendiente")))
      .returning({ id: orders.id });
    return !!row;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "No se pudo actualizar",
    );
  }
}

export async function markReservationDepositPaid(
  id: number,
  paymentId: string,
): Promise<boolean> {
  try {
    const [row] = await db
      .update(orders)
      .set({
        status: "reserva",
        payment_id: paymentId,
        payment_method: "mercado_pago",
      })
      .where(and(eq(orders.id, id), eq(orders.status, "pendiente")))
      .returning({ id: orders.id });
    return !!row;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "No se pudo actualizar",
    );
  }
}
