import CartView from "@/components/cart/cart-view";
import { getAllProducts } from "@/lib/orders/store";
import { getPaymentSettings, getShippingSettings } from "@/lib/payments/settings";
import { getCurrentUser } from "@/lib/auth/user";

export const dynamic = "force-dynamic";

export type PaymentRedirect = "exito" | "pendiente" | "error" | null;

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ pago?: string; pedido?: string }>;
}) {
  const [{ pago, pedido }, products, settings, shipping, user] = await Promise.all([
    searchParams,
    getAllProducts(),
    getPaymentSettings(),
    getShippingSettings(),
    getCurrentUser(),
  ]);

  const customer = user
    ? {
        name: user.profile.full_name ?? "",
        email: user.email ?? "",
        phone: user.profile.phone ?? "",
        address: user.profile.address ?? "",
        city: user.profile.city ?? "",
        province: user.profile.province ?? "",
        postalCode: user.profile.postal_code ?? "",
      }
    : undefined;

  const paymentRedirect: PaymentRedirect =
    pago === "exito" || pago === "pendiente" || pago === "error" ? pago : null;
  const orderId = String(pedido ?? "");

  return (
    <CartView
      products={products}
      paymentRedirect={paymentRedirect}
      paymentOrderId={orderId}
      transfer={settings.transfer}
      mercadopagoConfigured={Boolean(settings.mercadopago.accessToken)}
      shipping={shipping}
      customer={customer}
    />
  );
}
