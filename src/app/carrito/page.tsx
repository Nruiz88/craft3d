import CartView from "@/components/cart/cart-view";
import { getAllProducts } from "@/lib/orders/store";
import { getPaymentSettings, getShippingSettings } from "@/lib/payments/settings";
import { getCurrentUser } from "@/lib/auth/user";
import { getOrderById } from "@/lib/orders";
import PurchaseTracker from "@/components/analytics/purchase-tracker";

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

  // En el regreso exitoso de MercadoPago traemos el pedido para disparar el
  // evento "Purchase" de Meta con el valor real (clave para optimizar y ROAS).
  const successOrder =
    paymentRedirect === "exito" && orderId ? await getOrderById(orderId) : null;

  return (
    <>
      {successOrder ? (
        <PurchaseTracker
          orderId={orderId}
          value={successOrder.total}
          contentIds={successOrder.items.map((item) => item.product_slug)}
        />
      ) : null}
      <CartView
        products={products}
        paymentRedirect={paymentRedirect}
        paymentOrderId={orderId}
        transfer={settings.transfer}
        mercadopagoConfigured={Boolean(settings.mercadopago.accessToken)}
        shipping={shipping}
        customer={customer}
      />
    </>
  );
}
