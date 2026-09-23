"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import {
  coupons,
  orders,
  products,
} from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/user";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { createPreference } from "@/lib/payments/mercadopago";
import { getPaymentSettings, getReservationSettings } from "@/lib/payments/settings";
import { siteUrl as appSiteUrl } from "@/lib/email/helpers";
import type { OrderItemSnapshotDB } from "@/lib/db/schema";

export type CheckoutState =
  | { error?: string; orderId?: number; initPoint?: string }
  | undefined;
export type ReserveState =
  | { error?: string; orderId?: number; initPoint?: string }
  | undefined;

interface CartInput {
  slug: string;
  quantity: number;
}

function parseItems(raw: FormDataEntryValue | null): CartInput[] {
  try {
    const parsed = JSON.parse(String(raw ?? "[]")) as CartInput[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => ({ slug: String(item.slug ?? ""), quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)) }))
      .filter((item) => item.slug && item.quantity > 0)
      .slice(0, 50);
  } catch {
    return [];
  }
}

/* ───────────────────────── Checkout del carrito ───────────────────────── */

export async function checkoutAction(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const rl = checkRateLimit("checkout", 10, 10 * 60 * 1000);
  if (!rl.allowed) return { error: "Demasiados pedidos seguidos. Esperá unos minutos." };

  const itemsInput = parseItems(formData.get("items"));
  if (itemsInput.length === 0) return { error: "El carrito está vacío" };

  const paymentMethod = String(formData.get("paymentMethod") ?? "transferencia");
  const couponCode = String(formData.get("couponCode") ?? "").trim().toUpperCase();
  const shippingCostInput = Number(formData.get("shippingCost"));
  const giftMessage = String(formData.get("giftMessage") ?? "").trim();
  const isGift = String(formData.get("gift") ?? "") === "on" && giftMessage.length > 0;

  const user = await getCurrentUser();

  let customerName = "Cliente";
  let customerEmail = "";
  let phone = "";
  let address = "";
  let city = "";
  let province = "";
  let postalCode = "";

  if (user) {
    customerName = user.profile.full_name || "Cliente";
    customerEmail = user.email;
    phone = user.profile.phone ?? "";
    address = user.profile.address ?? "";
    city = user.profile.city ?? "";
    province = user.profile.province ?? "";
    postalCode = user.profile.postal_code ?? "";
  } else {
    // Compra de invitado: datos desde el formulario si los trae
    customerName = String(formData.get("customerName") ?? "").trim() || "Cliente";
    customerEmail = String(formData.get("customerEmail") ?? "").trim();
  }

  try {
    // Cargar productos y validar stock/precios server-side (nunca confiar en el client)
    const slugs = itemsInput.map((i) => i.slug);
    const rows = await db.select().from(products);
    const bySlug = new Map(rows.filter((p) => slugs.includes(p.slug)).map((p) => [p.slug, p]));

    const orderItems: OrderItemSnapshotDB[] = [];
    let subtotal = 0;
    for (const input of itemsInput) {
      const product = bySlug.get(input.slug);
      if (!product) return { error: `El producto "${input.slug}" ya no existe` };
      if (product.stock <= 0) return { error: `"${product.name}" está agotado` };
      const qty = Math.min(input.quantity, product.stock);
      const lineSubtotal = Number(product.price) * qty;
      subtotal += lineSubtotal;
      orderItems.push({
        product_id: Number(product.id),
        product_slug: product.slug,
        product_name: product.name,
        price: Number(product.price),
        quantity: qty,
        subtotal: lineSubtotal,
        giftMessage: isGift && product.category === "mystery-box" ? giftMessage : undefined,
      });
    }

    // Cupón (validado de nuevo server-side)
    let discount = 0;
    let appliedCoupon: string | null = null;
    if (couponCode) {
      const couponRows = await db.select().from(coupons).where(eq(coupons.code, couponCode)).limit(1);
      const coupon = couponRows[0];
      if (
        coupon &&
        coupon.times_used < coupon.max_uses &&
        (!coupon.expires_at || coupon.expires_at.getTime() > Date.now()) &&
        subtotal >= Number(coupon.min_subtotal)
      ) {
        discount =
          coupon.kind === "percent"
            ? Math.round((subtotal * Number(coupon.value)) / 100)
            : Number(coupon.value);
        discount = Math.min(discount, Math.max(0, subtotal - 1));
        appliedCoupon = coupon.code;
      }
    }

    // Envío: solo se cobra si el cliente cotizó; por encima del umbral es gratis
    let shipping = Number.isFinite(shippingCostInput) && shippingCostInput > 0 ? shippingCostInput : 0;
    if (shipping > 0 && subtotal >= 80000) shipping = 0;

    const total = Math.max(0, subtotal - discount) + shipping;

    // Insert del pedido + consumo del cupón + descuento de stock (atómico)
    const result = await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(orders)
        .values({
          user_id: user?.id ?? null,
          customer_name: customerName,
          customer_email: customerEmail,
          status: "pendiente",
          payment_method: paymentMethod === "mercado_pago" ? "mercado_pago" : "transferencia",
          shipping_phone: phone,
          shipping_address: address,
          shipping_city: city,
          shipping_province: province,
          shipping_postal_code: postalCode,
          subtotal: String(subtotal),
          shipping: String(shipping),
          total: String(total),
          discount: String(discount),
          coupon_code: appliedCoupon,
          items: orderItems,
        })
        .execute();
      // mysql2 devuelve una tupla [ResultSetHeader, fields]
      const [header] = inserted as unknown as [{ insertId?: number | bigint }];
      const orderId = Number(header?.insertId ?? 0);

      for (const item of orderItems) {
        await tx
          .update(products)
          .set({ stock: sql`${products.stock} - ${item.quantity}` })
          .where(and(eq(products.slug, item.product_slug), sql`${products.stock} >= ${item.quantity}`));
      }

      if (appliedCoupon) {
        await tx
          .update(coupons)
          .set({ times_used: sql`${coupons.times_used} + 1` })
          .where(eq(coupons.code, appliedCoupon));
      }

      return orderId;
    });

    if (!result) return { error: "No se pudo registrar el pedido" };

    revalidatePath("/admin");
    revalidatePath("/cuenta/pedidos");

    // Mercado Pago: crear preferencia de pago
    if (paymentMethod === "mercado_pago") {
      const settings = await getPaymentSettings();
      const accessToken = settings.mercadopago.accessToken.trim();
      if (!accessToken) {
        return { orderId: result, error: undefined };
      }
      try {
        const preference = await createPreference({
          accessToken,
          items: [
            {
              title: orderItems.map((i) => `${i.quantity}x ${i.product_name}`).join(", ").slice(0, 240),
              quantity: 1,
              unitPrice: total,
            },
          ],
          externalReference: String(result),
          notificationUrl: `${appSiteUrl}/api/mercadopago/webhook`,
          backUrls: {
            success: `${appSiteUrl}/carrito?pago=exito&pedido=${result}`,
            pending: `${appSiteUrl}/carrito?pago=pendiente&pedido=${result}`,
            failure: `${appSiteUrl}/carrito?pago=error&pedido=${result}`,
          },
        });
        await db.update(orders).set({ mp_preference_id: preference.id }).where(eq(orders.id, result));
        return { orderId: result, initPoint: preference.initPoint };
      } catch (mpError) {
        console.error("[checkout] MP preference", mpError);
        return {
          orderId: result,
          error: "El pedido quedó registrado pero Mercado Pago no pudo iniciar el pago. Probá de nuevo o pagá por transferencia.",
        };
      }
    }

    return { orderId: result };
  } catch (error) {
    console.error("[checkout]", error);
    return { error: "No se pudo procesar el pedido. Probá de nuevo." };
  }
}

/* ───────────────────── Reserva de drops (seña) ───────────────────── */

export async function reserveAction(
  _prev: ReserveState,
  formData: FormData,
): Promise<ReserveState> {
  const rl = checkRateLimit("reserve", 10, 10 * 60 * 1000);
  if (!rl.allowed) return { error: "Demasiadas reservas seguidas. Esperá unos minutos." };

  const slug = String(formData.get("slug") ?? "").trim();
  const paymentMethod = String(formData.get("paymentMethod") ?? "transferencia");
  if (!slug) return { error: "Falta el producto" };

  const user = await getCurrentUser();
  let customerName = "Cliente";
  let customerEmail = "";
  let phone = "";
  let address = "";
  let city = "";
  let province = "";
  let postalCode = "";
  if (user) {
    customerName = user.profile.full_name || "Cliente";
    customerEmail = user.email;
    phone = user.profile.phone ?? "";
    address = user.profile.address ?? "";
    city = user.profile.city ?? "";
    province = user.profile.province ?? "";
    postalCode = user.profile.postal_code ?? "";
  }

  try {
    const rows = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
    const product = rows[0];
    if (!product) return { error: "El producto ya no existe" };
    if (product.stock <= 0) return { error: "No quedan unidades del drop" };

    const reservation = await getReservationSettings();
    const price = Number(product.price);
    const deposit =
      reservation.mode === "fixed"
        ? Math.min(reservation.depositFixed, price)
        : Math.round((price * reservation.depositPct) / 100);

    const orderItems: OrderItemSnapshotDB[] = [
      {
        product_id: Number(product.id),
        product_slug: product.slug,
        product_name: product.name,
        price,
        quantity: 1,
        subtotal: price,
      },
    ];

    const orderId = await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(orders)
        .values({
          user_id: user?.id ?? null,
          customer_name: customerName,
          customer_email: customerEmail,
          status: "reserva",
          payment_method: paymentMethod === "mercado_pago" ? "mercado_pago" : "transferencia",
          shipping_phone: phone,
          shipping_address: address,
          shipping_city: city,
          shipping_province: province,
          shipping_postal_code: postalCode,
          subtotal: String(price),
          shipping: "0",
          total: String(price),
          deposit_paid: String(deposit),
          is_reservation: true,
          items: orderItems,
        })
        .execute();
      // mysql2 devuelve una tupla [ResultSetHeader, fields]
      const [header] = inserted as unknown as [{ insertId?: number | bigint }];
      const id = Number(header?.insertId ?? 0);
      await tx
        .update(products)
        .set({ stock: sql`${products.stock} - 1` })
        .where(and(eq(products.slug, slug), sql`${products.stock} >= 1`));
      return id;
    });

    revalidatePath("/admin");
    revalidatePath("/drops");

    if (paymentMethod === "mercado_pago") {
      const settings = await getPaymentSettings();
      const accessToken = settings.mercadopago.accessToken.trim();
      if (accessToken) {
        try {
          const preference = await createPreference({
            accessToken,
            items: [{ title: `Seña ${product.name}`, quantity: 1, unitPrice: deposit }],
            externalReference: String(orderId),
            notificationUrl: `${appSiteUrl}/api/mercadopago/webhook`,
            backUrls: {
              success: `${appSiteUrl}/productos/${slug}?reserva=exito&pedido=${orderId}`,
              pending: `${appSiteUrl}/productos/${slug}?reserva=pendiente&pedido=${orderId}`,
              failure: `${appSiteUrl}/productos/${slug}?reserva=error&pedido=${orderId}`,
            },
          });
          await db.update(orders).set({ mp_preference_id: preference.id }).where(eq(orders.id, orderId));
          return { orderId, initPoint: preference.initPoint };
        } catch (mpError) {
          console.error("[reserve] MP preference", mpError);
          return { orderId, error: "La reserva quedó registrada pero no se pudo iniciar el pago de la seña." };
        }
      }
    }

    return { orderId };
  } catch (error) {
    console.error("[reserve]", error);
    return { error: "No se pudo registrar la reserva. Probá de nuevo." };
  }
}
