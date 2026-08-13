import CartView from "@/components/cart-view";
import { getAllProducts } from "@/lib/store";
import { getPaymentSettings, getShippingSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export type PaymentRedirect = "exito" | "pendiente" | "error" | null;

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ pago?: string; pedido?: string }>;
}) {
  const [{ pago, pedido }, products, settings, shipping] = await Promise.all([
    searchParams,
    getAllProducts(),
    getPaymentSettings(),
    getShippingSettings(),
  ]);

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
    />
  );
}
