import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrderById } from "@/lib/orders";
import { sendOrderCreatedEmail } from "@/lib/email";

export async function getOrigin(): Promise<string> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

export function safeNext(next: string): string {
  return next.startsWith("/") && !next.startsWith("//") ? next : "/cuenta";
}

export async function getCustomerProfile(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  user: { id: string; user_metadata?: Record<string, unknown> },
) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, address, city, province, postal_code")
    .eq("id", user.id)
    .maybeSingle();

  return {
    fullName:
      String(profile?.full_name ?? "").trim() ||
      String(user.user_metadata?.full_name ?? "").trim() ||
      String(user.user_metadata?.name ?? "").trim() ||
      "",
    phone: String(profile?.phone ?? ""),
    address: String(profile?.address ?? ""),
    city: String(profile?.city ?? ""),
    province: String(profile?.province ?? ""),
    postalCode: String(profile?.postal_code ?? ""),
  };
}

export async function sendOrderCreatedEmailAction(
  orderId: string,
  opts?: { paymentUrl?: string },
): Promise<void> {
  try {
    const order = await getOrderById(Number(orderId));
    if (order) await sendOrderCreatedEmail(order, opts);
  } catch {
    // El email no debe romper el checkout
  }
}

export async function createMercadoPagoCheckout(
  orderId: string,
  origin: string,
  opts?: { reservation?: boolean },
): Promise<string | null> {
  const [
    { getPaymentSettings },
    { getOrderById, setOrderPreference },
    { createPreference },
  ] = await Promise.all([
    import("@/lib/payments/settings"),
    import("@/lib/orders"),
    import("@/lib/payments/mercadopago"),
  ]);

  const settings = await getPaymentSettings();
  const accessToken = settings.mercadopago.accessToken.trim();
  if (!accessToken) return null;

  const order = await getOrderById(Number(orderId));
  if (!order) return null;

  const isReservation = opts?.reservation === true && order.isReservation;
  const productSlug = order.items[0]?.product_slug ?? "";

  const itemsSubtotal = order.items.reduce(
    (sum, item) => sum + Number(item.subtotal),
    0,
  );
  const scaleFactor =
    order.discount > 0 && itemsSubtotal > 0 ? order.total / itemsSubtotal : 1;

  const preference = await createPreference({
    accessToken,
    items: isReservation
      ? order.items.map((item) => ({
          title: `Seña · ${item.product_name}`,
          quantity: 1,
          unitPrice: order.depositPaid,
        }))
      : order.items.map((item) => ({
          title: item.product_name,
          quantity: item.quantity,
          unitPrice:
            Math.max(1, Math.round(Number(item.price) * scaleFactor * 100) / 100),
        })),
    externalReference: orderId,
    notificationUrl: `${origin}/api/mercadopago/webhook`,
    backUrls: isReservation
      ? {
          success: `${origin}/productos/${productSlug}?reserva=exito&pedido=${orderId}`,
          pending: `${origin}/productos/${productSlug}?reserva=pendiente&pedido=${orderId}`,
          failure: `${origin}/productos/${productSlug}?reserva=error&pedido=${orderId}`,
        }
      : {
          success: `${origin}/carrito?pago=exito&pedido=${orderId}`,
          pending: `${origin}/carrito?pago=pendiente&pedido=${orderId}`,
          failure: `${origin}/carrito?pago=error&pedido=${orderId}`,
        },
  });

  await setOrderPreference(order.id, preference.id);
  return preference.initPoint;
}
