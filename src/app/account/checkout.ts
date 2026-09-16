"use server";

import { checkRateLimit } from "@/lib/utils/rate-limit";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { attachGiftToOrder } from "@/lib/orders";
import { placeOrderTx, placeReservationTx } from "@/lib/db/transactions";
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

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const userEmail = session?.user?.email ?? "";
  if (!userId) redirect("/ingresar?next=/carrito");

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

  const profile = await getCustomerProfile(userId);
  const fullName = profile.fullName || userEmail || "Cliente";

  let result;
  try {
    result = await placeOrderTx({
      userId,
      customerName: fullName,
      customerEmail: userEmail,
      items: items as { slug: string; quantity: number }[],
      shippingPhone: profile.phone,
      shippingAddress: profile.address,
      shippingCity: profile.city,
      shippingProvince: profile.province,
      shippingPostalCode: profile.postalCode,
      paymentMethod,
      couponCode,
      shipping: shippingCostRaw ? shippingCost : 0,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo registrar el pedido" };
  }

  const orderId = String(result.order_id ?? "");
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
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const userEmail = session?.user?.email ?? "";

  const next = String(formData.get("next") ?? "");
  if (!userId) {
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
    getCustomerProfile(userId),
  ]);

  const reservation = await getReservationSettings();
  if (!reservation.enabled) {
    return { error: "Las reservas no están habilitadas por el momento" };
  }

  let result;
  try {
    result = await placeReservationTx({
      userId,
      customerName: profile.fullName || userEmail || "Cliente",
      customerEmail: userEmail,
      slug,
      shippingPhone: profile.phone,
      shippingAddress: profile.address,
      shippingCity: profile.city,
      shippingProvince: profile.province,
      shippingPostalCode: profile.postalCode,
      paymentMethod,
      depositPct: reservation.depositPct,
      depositFixed: reservation.mode === "fixed" ? reservation.depositFixed : 0,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo registrar la reserva" };
  }

  const orderId = String(result.order_id ?? "");
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
