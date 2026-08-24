"use server";

import { checkRateLimit } from "@/lib/utils/rate-limit";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { attachGiftToOrder } from "@/lib/orders";
import {
  getOrigin,
  safeNext,
  getCustomerProfile,
  sendOrderCreatedEmailAction,
  createMercadoPagoCheckout,
} from "./helpers";

export type CheckoutState =
  | { error?: string; orderId?: string; initPoint?: string }
  | undefined;

export type ReserveState =
  | { error?: string; orderId?: string; initPoint?: string }
  | undefined;

export async function checkoutAction(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const rl = checkRateLimit("checkout", 3, 10 * 60 * 1000);
  if (!rl.allowed) return { error: "Demasiados pedidos. Esperá unos minutos." };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar?next=/carrito");

  const rawItems = String(formData.get("items") ?? "").trim();
  let items: unknown;
  try {
    items = JSON.parse(rawItems);
  } catch {
    return { error: "El carrito no es válido" };
  }
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Tu carrito está vacío" };
  }
  for (const item of items) {
    const candidate = item as { slug?: unknown; quantity?: unknown };
    if (
      typeof candidate.slug !== "string" ||
      !candidate.slug ||
      typeof candidate.quantity !== "number" ||
      !Number.isInteger(candidate.quantity) ||
      candidate.quantity <= 0
    ) {
      return { error: "El carrito no es válido" };
    }
  }

  const paymentMethod =
    String(formData.get("paymentMethod") ?? "") === "mercado_pago"
      ? "mercado_pago"
      : "transferencia";

  const couponCode =
    String(formData.get("couponCode") ?? "").trim().toUpperCase() || null;

  const shippingCostRaw = String(formData.get("shippingCost") ?? "").trim();
  const shippingCost = Number(shippingCostRaw);
  if (shippingCostRaw && (!Number.isFinite(shippingCost) || shippingCost < 0)) {
    return { error: "Costo de envío inválido" };
  }

  const profile = await getCustomerProfile(supabase, user);
  const fullName = profile.fullName || user.email || "Cliente";

  const { data, error } = await supabase.rpc("place_order", {
    p_user_id: user.id,
    p_customer_name: fullName,
    p_customer_email: user.email ?? "",
    p_items: items,
    p_shipping_phone: profile.phone,
    p_shipping_address: profile.address,
    p_shipping_city: profile.city,
    p_shipping_province: profile.province,
    p_shipping_postal_code: profile.postalCode,
    p_payment_method: paymentMethod,
    p_coupon_code: couponCode,
    p_shipping: shippingCostRaw ? shippingCost : 0,
  });

  if (error) return { error: error.message };

  const orderId = String(data?.order_id ?? "");
  if (!orderId) return { error: "No se pudo registrar el pedido" };

  if (formData.get("gift") === "on") {
    const giftMessage = String(formData.get("giftMessage") ?? "").trim();
    await attachGiftToOrder(Number(orderId), giftMessage);
  }

  if (paymentMethod === "mercado_pago") {
    const origin = await getOrigin();
    const initPoint = await createMercadoPagoCheckout(orderId, origin);
    if (!initPoint) {
      return {
        error:
          "Mercado Pago no está configurado todavía. Elegí transferencia bancaria y coordinamos el pago.",
      };
    }
    await sendOrderCreatedEmailAction(orderId, { paymentUrl: initPoint });
    revalidatePath("/");
    revalidatePath("/carrito");
    return { orderId, initPoint };
  }

  await sendOrderCreatedEmailAction(orderId);
  revalidatePath("/");
  revalidatePath("/carrito");
  return { orderId };
}

export async function reserveAction(
  _prev: ReserveState,
  formData: FormData,
): Promise<ReserveState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const next = String(formData.get("next") ?? "");
  if (!user) {
    redirect(`/ingresar?next=${encodeURIComponent(safeNext(next))}`);
  }

  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) return { error: "Producto inválido" };

  const paymentMethod =
    String(formData.get("paymentMethod") ?? "") === "mercado_pago"
      ? "mercado_pago"
      : "transferencia";

  const [{ getReservationSettings }, profile] = await Promise.all([
    import("@/lib/payments/settings"),
    getCustomerProfile(supabase, user),
  ]);

  const reservation = await getReservationSettings();
  if (!reservation.enabled) {
    return { error: "Las reservas no están habilitadas por el momento" };
  }

  const { data, error } = await supabase.rpc("place_reservation", {
    p_user_id: user.id,
    p_customer_name: profile.fullName || user.email || "Cliente",
    p_customer_email: user.email ?? "",
    p_slug: slug,
    p_shipping_phone: profile.phone,
    p_shipping_address: profile.address,
    p_shipping_city: profile.city,
    p_shipping_province: profile.province,
    p_shipping_postal_code: profile.postalCode,
    p_payment_method: paymentMethod,
    p_deposit_pct: reservation.depositPct,
    p_deposit_fixed:
      reservation.mode === "fixed" ? reservation.depositFixed : 0,
  });

  if (error) return { error: error.message };

  const orderId = String(data?.order_id ?? "");
  if (!orderId) return { error: "No se pudo registrar la reserva" };

  if (paymentMethod === "mercado_pago") {
    const origin = await getOrigin();
    const initPoint = await createMercadoPagoCheckout(orderId, origin, {
      reservation: true,
    });
    if (!initPoint) {
      return {
        error:
          "Mercado Pago no está configurado todavía. Elegí transferencia bancaria y coordinamos el pago.",
      };
    }
    await sendOrderCreatedEmailAction(orderId, { paymentUrl: initPoint });
    revalidatePath("/");
    revalidatePath(`/productos/${slug}`, "page");
    return { orderId, initPoint };
  }

  await sendOrderCreatedEmailAction(orderId);
  revalidatePath("/");
  revalidatePath(`/productos/${slug}`, "page");
  return { orderId };
}
