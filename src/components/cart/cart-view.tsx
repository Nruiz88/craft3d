"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useCart } from "@/lib/contexts/cart-context";
import {
  checkoutAction,
  quoteShippingAction,
  validateCouponAction,
} from "@/app/account/actions";
import type { PaymentSettings, ShippingSettings } from "@/lib/payments/settings";
import type { QuoteShippingState } from "@/app/account/actions";
import type { Product } from "@/lib/products/types";
import type { PaymentRedirect } from "@/app/carrito/page";
import CartStatusPages from "./cart-status-pages";
import CartItems from "./cart-items";
import CartSummary from "./cart-summary";

type PaymentMethod = "transferencia" | "mercado_pago";

interface CartViewProps {
  products: Product[];
  paymentRedirect?: PaymentRedirect;
  paymentOrderId?: string;
  transfer?: PaymentSettings["transfer"];
  mercadopagoConfigured?: boolean;
  shipping?: ShippingSettings;
}

export default function CartView({
  products,
  paymentRedirect,
  paymentOrderId,
  transfer,
  mercadopagoConfigured = false,
  shipping,
}: CartViewProps) {
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("transferencia");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponPending, setCouponPending] = useState(false);
  const [postalCode, setPostalCode] = useState("");
  const [quotePending, setQuotePending] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [shippingOptions, setShippingOptions] = useState<NonNullable<NonNullable<QuoteShippingState>["options"]>>([]);
  const [selectedShipping, setSelectedShipping] = useState<string | null>(null);
  const [giftEnabled, setGiftEnabled] = useState(false);

  useEffect(() => {
    if (paymentRedirect === "exito") clearCart();
  }, [paymentRedirect]);

  async function handleApplyCoupon() {
    const trimmed = couponCode.trim();
    if (!trimmed) return;
    setCouponPending(true);
    setCouponError(null);
    const result = await validateCouponAction(trimmed, subtotal);
    if (result?.error) {
      setCouponError(result.error);
      setAppliedCoupon(null);
      setCouponDiscount(0);
    } else if (result?.discount && result.code) {
      setCouponError(null);
      setAppliedCoupon(result.code);
      setCouponDiscount(result.discount);
    }
    setCouponPending(false);
  }

  async function handleQuoteShipping() {
    const code = postalCode.trim();
    if (code.length !== 4) return;
    setQuotePending(true);
    setQuoteError(null);
    setShippingOptions([]);
    setSelectedShipping(null);
    const formData = new FormData();
    formData.set("postalCode", code);
    const result = await quoteShippingAction(undefined, formData);
    if (result?.error) {
      setQuoteError(result.error);
    } else if (result?.options?.length) {
      setShippingOptions(result.options);
      setSelectedShipping(result.options[0].deliveredType);
    } else {
      setQuoteError("No hay envíos disponibles para ese código postal");
    }
    setQuotePending(false);
  }

  async function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    formData.set("items", JSON.stringify(entries.map(({ item }) => ({ slug: item.slug, quantity: item.quantity }))));
    const result = await checkoutAction(undefined, formData);
    if (result?.initPoint) {
      window.location.replace(result.initPoint);
      return;
    }
    if (result?.orderId) {
      clearCart();
      setOrderPlaced(true);
    } else if (result?.error) {
      setError(result.error);
    }
    setPending(false);
  }

  const productsById = useMemo(() => {
    const map = new Map<string, Product>();
    for (const product of products) map.set(product.slug, product);
    return map;
  }, [products]);

  useEffect(() => {
    for (const item of items) {
      if (!productsById.has(item.slug)) removeItem(item.slug);
    }
  }, [items, productsById, removeItem]);

  const entries = items
    .map((item) => ({ item, product: productsById.get(item.slug) }))
    .filter((entry): entry is { item: (typeof items)[number]; product: Product } => !!entry.product);

  const subtotal = entries.reduce((sum, entry) => sum + entry.product.price * entry.item.quantity, 0);
  const hasBox = entries.some((entry) => entry.product.category === "mystery-box");

  const freeShippingEnabled = Boolean(shipping?.freeShipping.enabled);
  const freeShippingFrom = shipping?.freeShipping.from ?? 0;
  const freeShippingActive = freeShippingEnabled && subtotal >= freeShippingFrom;
  const selectedRate = shippingOptions.find((option) => option.deliveredType === selectedShipping);
  const shippingCost = freeShippingActive ? 0 : selectedRate ? selectedRate.price : null;
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingFrom) * 100));

  /* ─── Status pages ─── */
  const showStatus =
    Boolean(paymentRedirect) ||
    orderPlaced ||
    entries.length === 0;
  if (showStatus) {
    return (
      <CartStatusPages
        paymentRedirect={paymentRedirect}
        paymentOrderId={paymentOrderId}
        transfer={transfer}
        orderPlaced={orderPlaced}
        isEmpty={entries.length === 0}
        onResetOrder={() => { clearCart(); setOrderPlaced(false); }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-3xl font-bold text-zinc-50">Carrito</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <CartItems entries={entries} onUpdateQuantity={updateQuantity} onRemoveItem={removeItem} hasBox={hasBox} />
        <CartSummary
          entries={entries}
          subtotal={subtotal}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          transfer={transfer}
          mercadopagoConfigured={mercadopagoConfigured}
          shipping={shipping}
          couponCode={couponCode}
          onCouponCodeChange={setCouponCode}
          appliedCoupon={appliedCoupon}
          couponDiscount={couponDiscount}
          couponError={couponError}
          couponPending={couponPending}
          onApplyCoupon={handleApplyCoupon}
          onRemoveCoupon={() => { setAppliedCoupon(null); setCouponDiscount(0); setCouponError(null); setCouponCode(""); }}
          postalCode={postalCode}
          onPostalCodeChange={setPostalCode}
          quotePending={quotePending}
          quoteError={quoteError}
          shippingOptions={shippingOptions}
          selectedShipping={selectedShipping}
          onSelectedShippingChange={setSelectedShipping}
          onQuoteShipping={handleQuoteShipping}
          giftEnabled={giftEnabled}
          onGiftEnabledChange={setGiftEnabled}
          freeShippingActive={freeShippingActive}
          freeShippingProgress={freeShippingProgress}
          freeShippingFrom={freeShippingFrom}
          shippingCost={shippingCost}
          pending={pending}
          error={error}
          items={items}
          onSubmit={handleCheckout}
        />
      </div>
    </div>
  );
}
