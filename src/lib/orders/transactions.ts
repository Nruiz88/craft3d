import "server-only";

import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { applyCouponAmount, redeemCoinsTx } from "@/lib/db/transactions";

export interface PlaceOrderItemInput {
  slug: string;
  quantity: number;
  price?: number;
}

export interface PlaceOrderInput {
  userId: string | null;
  customerName: string;
  customerEmail: string;
  items: PlaceOrderItemInput[];
  paymentMethod: string;
  shipping?: {
    phone?: string;
    address?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    cost?: number;
  };
  couponCode?: string | null;
  isReservation?: boolean;
  depositPaid?: number;
}

export interface PlaceReservationInput {
  userId: string | null;
  customerName: string;
  customerEmail: string;
  productSlug: string;
  quantity: number;
  depositAmount: number;
}

const num = (v: unknown): number => Number(v ?? 0);
const round2 = (n: number): number => Math.round(n * 100) / 100;

/**
 * Crea un pedido en una sola transacción: valida stock, recalcula precios
 * desde la DB, descuenta stock y consume el cupón. Reemplaza el RPC
 * Postgres `place_order`. Devuelve el id.
 */
export async function placeOrder(
  input: PlaceOrderInput,
): Promise<{ orderId: number }> {
  if (!input.items || input.items.length === 0) {
    throw new Error("El carrito está vacío");
  }
  const shippingCost = round2(Math.max(0, input.shipping?.cost ?? 0));

  const orderId = await db.transaction(async (tx) => {
    let subtotal = 0;
    const snapshots: {
      product_id: number;
      product_slug: string;
      product_name: string;
      price: number;
      quantity: number;
      subtotal: number;
    }[] = [];

    for (const item of input.items) {
      const qty = Math.floor(Number(item.quantity));
      if (!item.slug || !Number.isFinite(qty) || qty <= 0) {
        throw new Error("Cantidad inválida");
      }
      const res = await tx.execute(
        sql`select * from products where slug = ${item.slug} for update`,
      );
      const p = res.rows[0] as unknown as
        | {
            id: number;
            slug: string;
            name: string;
            price: string | number;
            stock: number;
          }
        | undefined;
      if (!p) throw new Error("Producto no encontrado");
      if (num(p.stock) < qty) {
        throw new Error(`Stock insuficiente para ${p.name} (queda ${p.stock})`);
      }
      const price = num(p.price);
      subtotal = round2(subtotal + price * qty);
      snapshots.push({
        product_id: Number(p.id),
        product_slug: p.slug,
        product_name: p.name,
        price,
        quantity: qty,
        subtotal: round2(price * qty),
      });
    }

    const { code, discount } = await applyCouponAmount(
      tx,
      input.couponCode ?? null,
      input.userId ?? "",
      subtotal,
    );
    const total = round2(subtotal - discount + shippingCost);

    // Insert crudo: la PK bigint es identity en la DB pero el schema Drizzle
    // la declara sin autoincremento, por lo que el builder exige `id`.
    const orderRes = await tx.execute(sql`
      insert into orders (
        user_id, customer_name, customer_email, status,
        payment_method,
        shipping_phone, shipping_address, shipping_city,
        shipping_province, shipping_postal_code,
        subtotal, shipping, total, discount, coupon_code, items,
        is_reservation, deposit_paid
      ) values (
        ${input.userId}::uuid, ${input.customerName}, ${input.customerEmail}, 'pendiente',
        ${input.paymentMethod === "mercado_pago" ? "mercado_pago" : "transferencia"},
        ${input.shipping?.phone ?? ""}, ${input.shipping?.address ?? ""},
        ${input.shipping?.city ?? ""}, ${input.shipping?.province ?? ""},
        ${input.shipping?.postalCode ?? ""},
        ${String(subtotal)}, ${String(shippingCost)}, ${String(total)},
        ${String(discount)}, ${code},
        ${JSON.stringify(snapshots)}::jsonb,
        ${input.isReservation ?? false}, ${String(input.depositPaid ?? 0)}
      ) returning id
    `);
    const orderRow = orderRes.rows[0] as unknown as { id: number } | undefined;
    if (!orderRow) throw new Error("No se pudo crear el pedido");
    const newOrderId = Number(orderRow.id);

    if (discount > 0 && code) {
      await tx.execute(
        sql`update coupons set times_used = times_used + 1 where code = ${code}`,
      );
      await tx.execute(
        sql`update coin_redemptions set status = 'usado' where coupon_code = ${code} and status = 'activo'`,
      );
    }

    for (const item of input.items) {
      await tx.execute(
        sql`update products set stock = stock - ${Math.floor(Number(item.quantity))} where slug = ${item.slug}`,
      );
    }

    return newOrderId;
  });

  return { orderId };
}

/**
 * Crea una reserva (seña de drop) en una sola transacción. Reemplaza el RPC
 * Postgres `place_reservation`. Acepta cantidad y monto de seña explícitos.
 */
export async function placeReservation(
  input: PlaceReservationInput,
): Promise<{ orderId: number }> {
  const qty = Math.floor(Number(input.quantity));
  if (!input.productSlug || !Number.isFinite(qty) || qty <= 0) {
    throw new Error("Cantidad inválida");
  }
  const deposit = round2(Number(input.depositAmount));
  if (!Number.isFinite(deposit) || deposit <= 0) {
    throw new Error("La seña no puede ser $0");
  }

  const orderId = await db.transaction(async (tx) => {
    const res = await tx.execute(
      sql`select * from products where slug = ${input.productSlug} for update`,
    );
    const p = res.rows[0] as unknown as
      | {
          id: number;
          slug: string;
          name: string;
          price: string | number;
          stock: number;
          category: string;
          drop_ends_at: string | Date | null;
        }
      | undefined;
    if (!p) throw new Error("Producto no encontrado");
    if (p.category !== "drops") {
      throw new Error("Este producto no acepta reservas");
    }
    if (p.drop_ends_at && new Date(p.drop_ends_at) < new Date()) {
      throw new Error("El drop ya finalizó");
    }
    if (num(p.stock) < qty) throw new Error(`Tiraje agotado para ${p.name}`);

    const price = num(p.price);
    const subtotal = round2(price * qty);
    const snapshot = {
      product_id: Number(p.id),
      product_slug: p.slug,
      product_name: p.name,
      price,
      quantity: qty,
      subtotal,
    };

    const resRes = await tx.execute(sql`
      insert into orders (
        user_id, customer_name, customer_email, status, payment_method,
        shipping_phone, shipping_address, shipping_city,
        shipping_province, shipping_postal_code,
        subtotal, shipping, total, items,
        is_reservation, deposit_paid
      ) values (
        ${input.userId}::uuid, ${input.customerName}, ${input.customerEmail},
        'pendiente', 'transferencia',
        '', '', '', '', '',
        ${String(subtotal)}, '0', ${String(subtotal)},
        ${JSON.stringify([snapshot])}::jsonb,
        true, ${String(Math.min(deposit, subtotal))}
      ) returning id
    `);
    const resRow = resRes.rows[0] as unknown as { id: number } | undefined;
    if (!resRow) throw new Error("No se pudo crear la reserva");

    await tx.execute(
      sql`update products set stock = stock - ${qty} where slug = ${input.productSlug}`,
    );
    return Number(resRow.id);
  });

  return { orderId };
}

/**
 * Canjea monedas por un cupón (1 moneda = $20, mínimo 100). Genera un código
 * CRAFT-XXXXXX válido 90 días en `coupons` + fila en `coin_redemptions` y
 * descuenta las monedas atómicamente. Reemplaza el RPC `redeem_coins`.
 */
export async function redeemCoins(
  userId: string,
  coins: number,
): Promise<{ couponCode: string; amount: number }> {
  const result = await redeemCoinsTx(userId, coins);
  return { couponCode: result.code, amount: result.amount };
}

/**
 * Valida un cupón y calcula el descuento sobre el subtotal sin consumirlo.
 * Reemplaza el RPC `apply_coupon` (solo validación/cálculo).
 */
export async function applyCoupon(
  code: string,
  subtotal: number,
  userId?: string | null,
): Promise<{ code: string; discount: number }> {
  const normalized = code?.trim().toUpperCase() ?? "";
  if (!normalized) return { code: "", discount: 0 };
  const result = await applyCouponAmount(db, normalized, userId ?? "", subtotal);
  return { code: result.code ?? normalized, discount: result.discount };
}
