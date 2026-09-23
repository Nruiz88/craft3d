import "server-only";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { orders, type OrderItemSnapshotDB } from "@/lib/db/schema";
import type { Order, OrderStatus, PaymentMethod } from "@/lib/products/types";

function toISO(value: Date | string | null): string {
  if (!value) return new Date(0).toISOString();
  return (value instanceof Date ? value : new Date(value)).toISOString();
}

function toOrder(row: typeof orders.$inferSelect): Order {
  return {
    id: Number(row.id),
    user_id: row.user_id ?? null,
    customer_name: row.customer_name,
    customer_email: row.customer_email,
    status: row.status as OrderStatus,
    paymentMethod: (row.payment_method as PaymentMethod) ?? "transferencia",
    paymentId: row.payment_id ?? "",
    mpPreferenceId: row.mp_preference_id ?? "",
    shipping_phone: row.shipping_phone ?? "",
    shipping_address: row.shipping_address ?? "",
    shipping_city: row.shipping_city ?? "",
    shipping_province: row.shipping_province ?? "",
    shipping_postal_code: row.shipping_postal_code ?? "",
    subtotal: Number(row.subtotal),
    shipping: Number(row.shipping),
    total: Number(row.total),
    discount: Number(row.discount),
    couponCode: row.coupon_code ?? null,
    isReservation: Boolean(row.is_reservation),
    depositPaid: Number(row.deposit_paid),
    items: Array.isArray(row.items) ? (row.items as OrderItemSnapshotDB[]) : [],
    createdAt: toISO(row.created_at),
  };
}

export async function getOrders(): Promise<Order[]> {
  const rows = await db.select().from(orders).orderBy(desc(orders.created_at), desc(orders.id));
  return rows.map(toOrder);
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.user_id, userId))
    .orderBy(desc(orders.created_at), desc(orders.id));
  return rows.map(toOrder);
}

export async function getOrderById(id: number | string): Promise<Order | null> {
  const rows = await db.select().from(orders).where(eq(orders.id, Number(id))).limit(1);
  return rows[0] ? toOrder(rows[0]) : null;
}

export interface CreateOrderInput {
  user_id?: string | null;
  customer_name: string;
  customer_email: string;
  status?: OrderStatus;
  payment_method?: PaymentMethod;
  shipping_phone?: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_province?: string;
  shipping_postal_code?: string;
  subtotal: number;
  shipping?: number;
  total: number;
  discount?: number;
  coupon_code?: string | null;
  deposit_paid?: number;
  is_reservation?: boolean;
  items: OrderItemSnapshotDB[];
}

export async function createOrder(
  input: CreateOrderInput,
): Promise<{ data: Order | null; error: string | null }> {
  try {
    const inserted = await db
      .insert(orders)
      .values({
        user_id: input.user_id ?? null,
        customer_name: input.customer_name,
        customer_email: input.customer_email,
        status: input.status ?? "pendiente",
        payment_method: input.payment_method ?? "transferencia",
        shipping_phone: input.shipping_phone ?? "",
        shipping_address: input.shipping_address ?? "",
        shipping_city: input.shipping_city ?? "",
        shipping_province: input.shipping_province ?? "",
        shipping_postal_code: input.shipping_postal_code ?? "",
        subtotal: String(input.subtotal),
        shipping: String(input.shipping ?? 0),
        total: String(input.total),
        discount: String(input.discount ?? 0),
        coupon_code: input.coupon_code ?? null,
        deposit_paid: String(input.deposit_paid ?? 0),
        is_reservation: Boolean(input.is_reservation),
        items: input.items,
      })
      .execute();
    const insertId = Number((inserted as unknown as { insertId?: number }).insertId ?? 0);
    const created = insertId ? await getOrderById(insertId) : null;
    return { data: created, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Error al crear pedido" };
  }
}

export async function updateOrderStatus(id: number | string, status: OrderStatus): Promise<{ ok: boolean }> {
  await db.update(orders).set({ status }).where(eq(orders.id, Number(id))).execute();
  return { ok: true };
}

export async function updateOrderItems(id: number | string, items: OrderItemSnapshotDB[]): Promise<{ ok: boolean }> {
  await db.update(orders).set({ items }).where(eq(orders.id, Number(id))).execute();
  return { ok: true };
}

/**
 * Marca el pedido como pagado (idempotente): devuelve true solo si
 * antes NO estaba pagado. Guarda el payment_id de Mercado Pago.
 */
export async function markOrderPaid(id: number | string, paymentId?: string): Promise<boolean> {
  const rows = await db
    .update(orders)
    .set({
      status: "pagado",
      payment_id: paymentId ?? "",
      rewards_awarded: true,
    })
    .where(sql`${orders.id} = ${Number(id)} AND ${orders.status} <> 'pagado'`)
    .execute();
  const affected = (rows as unknown as { rowsAffected?: number } | undefined)?.rowsAffected ?? 0;
  return affected > 0;
}

/** Marca la seña de una reserva como pagada (idempotente). */
export async function markReservationDepositPaid(id: number | string, paymentId?: string): Promise<boolean> {
  const rows = await db
    .update(orders)
    .set({
      deposit_paid: sql`${orders.deposit_paid}`,
      payment_id: paymentId ?? "",
    })
    .where(sql`${orders.id} = ${Number(id)} AND ${orders.is_reservation} = TRUE AND ${orders.status} = 'reserva'`)
    .execute();
  const affected = (rows as unknown as { rowsAffected?: number } | undefined)?.rowsAffected ?? 0;
  return affected > 0;
}
