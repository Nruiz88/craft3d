import "server-only";

import { randomBytes } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { coin_redemptions, coupons, orders, player_profiles, products } from "@/lib/db/schema";

export interface OrderItemInput {
  slug: string;
  quantity: number;
}

export interface OrderItemSnapshot {
  product_id: number;
  product_slug: string;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

const num = (v: unknown): number => Number(v ?? 0);
const round2 = (n: number): number => Math.round(n * 100) / 100;

// SELECT ... FOR UPDATE (Drizzle no expone FOR UPDATE en el builder).
async function lockProduct(tx: Parameters<Parameters<typeof db.transaction>[0]>[0], slug: string) {
  const res = await tx.execute(sql`select * from products where slug = ${slug} for update`);
  return res.rows[0] as any;
}

/** Valida un cupón y devuelve el descuento (misma semántica que apply_coupon). */
export async function applyCouponAmount(
  runner: typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0],
  code: string | null | undefined,
  userId: string,
  subtotal: number,
): Promise<{ code: string | null; discount: number }> {
  const normalized =
    code == null || code.trim() === "" ? null : code.trim().toUpperCase();
  if (!normalized) return { code: null, discount: 0 };

  const res = await runner.execute(
    sql`select * from coupons where code = ${normalized} for update`,
  );
  const c = res.rows[0] as any;
  if (!c) throw new Error("El código no es válido");
  if (c.user_id && c.user_id !== userId) throw new Error("Este código pertenece a otra cuenta");
  if (c.max_uses > 0 && c.times_used >= c.max_uses) throw new Error("Este código ya fue usado");
  if (c.expires_at && new Date(c.expires_at) < new Date()) throw new Error("Este código está vencido");
  if (subtotal < num(c.min_subtotal)) throw new Error(`El mínimo de compra para este código es $${c.min_subtotal}`);

  let discount: number;
  if (c.kind === "percent") {
    discount = round2((subtotal * num(c.value)) / 100);
  } else {
    discount = Math.min(num(c.value), subtotal);
  }
  if (discount >= subtotal) throw new Error("El descuento no puede cubrir el total del pedido");
  return { code: normalized, discount };
}

export interface PlaceOrderInput {
  userId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItemInput[];
  shippingPhone?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingProvince?: string;
  shippingPostalCode?: string;
  paymentMethod?: string;
  couponCode?: string | null;
  shipping?: number;
}

export async function placeOrderTx(input: PlaceOrderInput) {
  return db.transaction(async (tx) => {
    if (!input.items || input.items.length === 0) throw new Error("El carrito está vacío");

    const shipping = round2(Math.max(0, input.shipping ?? 0));
    let subtotal = 0;
    const snapshots: OrderItemSnapshot[] = [];

    for (const item of input.items) {
      const qty = Math.floor(Number(item.quantity));
      if (!item.slug || !Number.isFinite(qty) || qty <= 0) throw new Error("Cantidad inválida");
      const p = await lockProduct(tx, item.slug);
      if (!p) throw new Error("Producto no encontrado");
      if (num(p.stock) < qty) throw new Error(`Stock insuficiente para ${p.name} (queda ${p.stock})`);
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

    const { code, discount } = await applyCouponAmount(tx, input.couponCode, input.userId, subtotal);
    const total = round2(subtotal - discount + shipping);

    const [order] = await tx
      .insert(orders)
      .values({
        user_id: input.userId,
        customer_name: input.customerName,
        customer_email: input.customerEmail,
        status: "pendiente",
        payment_method: input.paymentMethod === "mercado_pago" ? "mercado_pago" : "transferencia",
        shipping_phone: input.shippingPhone ?? "",
        shipping_address: input.shippingAddress ?? "",
        shipping_city: input.shippingCity ?? "",
        shipping_province: input.shippingProvince ?? "",
        shipping_postal_code: input.shippingPostalCode ?? "",
        subtotal: String(subtotal),
        shipping: String(shipping),
        total: String(total),
        discount: String(discount),
        coupon_code: code,
        items: snapshots,
      })
      .returning({ id: orders.id });
    if (!order) throw new Error("No se pudo crear el pedido");

    if (discount > 0 && code) {
      await tx.execute(sql`update coupons set times_used = times_used + 1 where code = ${code}`);
      await tx.execute(
        sql`update coin_redemptions set status = 'usado' where coupon_code = ${code} and status = 'activo'`,
      );
    }

    for (const item of input.items) {
      await tx.execute(sql`update products set stock = stock - ${Math.floor(Number(item.quantity))} where slug = ${item.slug}`);
    }

    return { order_id: order.id, total, discount, shipping };
  });
}

export interface PlaceReservationInput {
  userId: string;
  customerName: string;
  customerEmail: string;
  slug: string;
  shippingPhone?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingProvince?: string;
  shippingPostalCode?: string;
  paymentMethod?: string;
  depositPct?: number;
  depositFixed?: number;
}

export async function placeReservationTx(input: PlaceReservationInput) {
  return db.transaction(async (tx) => {
    if (!input.slug || input.slug.trim() === "") throw new Error("Producto inválido");
    const p = await lockProduct(tx, input.slug);
    if (!p) throw new Error("Producto no encontrado");
    if (p.category !== "drops") throw new Error("Este producto no acepta reservas");
    if (p.drop_ends_at && new Date(p.drop_ends_at) < new Date()) throw new Error("El drop ya finalizó");
    if (num(p.stock) <= 0) throw new Error(`Tiraje agotado para ${p.name}`);

    const price = num(p.price);
    let deposit: number;
    if (input.depositFixed != null && input.depositFixed > 0) {
      deposit = round2(Math.min(input.depositFixed, price));
    } else {
      const pct = Math.max(1, Math.min(100, input.depositPct ?? 30));
      deposit = round2((price * pct) / 100);
    }
    if (deposit <= 0) throw new Error("La seña no puede ser $0");

    const snapshot: OrderItemSnapshot = {
      product_id: Number(p.id),
      product_slug: p.slug,
      product_name: p.name,
      price,
      quantity: 1,
      subtotal: price,
    };

    const [order] = await tx
      .insert(orders)
      .values({
        user_id: input.userId,
        customer_name: input.customerName,
        customer_email: input.customerEmail,
        status: "pendiente",
        payment_method: input.paymentMethod === "mercado_pago" ? "mercado_pago" : "transferencia",
        shipping_phone: input.shippingPhone ?? "",
        shipping_address: input.shippingAddress ?? "",
        shipping_city: input.shippingCity ?? "",
        shipping_province: input.shippingProvince ?? "",
        shipping_postal_code: input.shippingPostalCode ?? "",
        subtotal: String(price),
        shipping: "0",
        total: String(price),
        items: [snapshot],
        is_reservation: true,
        deposit_paid: String(deposit),
      })
      .returning({ id: orders.id });
    if (!order) throw new Error("No se pudo crear la reserva");

    await tx.execute(sql`update products set stock = stock - 1 where slug = ${input.slug}`);
    return { order_id: order.id, total: price, deposit };
  });
}

export async function redeemCoinsTx(userId: string, coins: number) {
  const RATE = 20;
  if (!Number.isInteger(coins) || coins < 100) throw new Error("El canje mínimo es de 100 monedas");

  return db.transaction(async (tx) => {
    const res = await tx.execute(sql`select * from player_profiles where user_id = ${userId} for update`);
    const profile = res.rows[0] as any;
    if (!profile || num(profile.coins) < coins) throw new Error("No tenés suficientes monedas");

    const amount = coins * RATE;
    const expires = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const code = `CRAFT-${randomBytes(3).toString("hex").toUpperCase()}`;
      try {
        await tx.insert(coupons).values({
          code,
          kind: "fixed",
          value: String(amount),
          max_uses: 1,
          user_id: userId,
          expires_at: expires,
        });
        await tx.execute(sql`update player_profiles set coins = coins - ${coins}, updated_at = now() where user_id = ${userId}`);
        await tx.insert(coin_redemptions).values({
          user_id: userId,
          coins,
          amount: String(amount),
          coupon_code: code,
          expires_at: expires,
        });
        return { code, amount };
      } catch (e: any) {
        // Colisión de código (PK): reintenta con otro.
        if (e?.code !== "23505" || attempt === 2) throw e;
      }
    }
    throw new Error("No se pudo generar el cupón, probá de nuevo");
  });
}
