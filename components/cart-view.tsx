"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useCart } from "@/lib/cart-context";
import { categoryById } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import {
  checkoutAction,
  quoteShippingAction,
  validateCouponAction,
} from "@/app/account/actions";
import type { PaymentSettings, ShippingSettings } from "@/lib/settings";
import type { QuoteShippingState } from "@/app/account/actions";
import type { Product } from "@/lib/types";
import ProductVisual from "@/components/product-visual";
import type { PaymentRedirect } from "@/app/carrito/page";

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
  const [shippingOptions, setShippingOptions] = useState<
    NonNullable<NonNullable<QuoteShippingState>["options"]>
  >([]);
  const [selectedShipping, setSelectedShipping] = useState<string | null>(null);

  useEffect(() => {
    if (paymentRedirect === "exito") clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    formData.set(
      "items",
      JSON.stringify(
        entries.map(({ item }) => ({ slug: item.slug, quantity: item.quantity })),
      ),
    );
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
    .filter(
      (entry): entry is { item: (typeof items)[number]; product: Product } =>
        !!entry.product,
    );

  const subtotal = entries.reduce(
    (sum, entry) => sum + entry.product.price * entry.item.quantity,
    0,
  );

  const freeShippingEnabled = Boolean(shipping?.freeShipping.enabled);
  const freeShippingFrom = shipping?.freeShipping.from ?? 0;
  const freeShippingActive = freeShippingEnabled && subtotal >= freeShippingFrom;
  const selectedRate = shippingOptions.find(
    (option) => option.deliveredType === selectedShipping,
  );
  const shippingCost = freeShippingActive
    ? 0
    : selectedRate
      ? selectedRate.price
      : null;
  const freeShippingProgress = Math.min(
    100,
    Math.round((subtotal / freeShippingFrom) * 100),
  );

  const transferReady = Boolean(
    transfer && (transfer.cbu || transfer.alias) && transfer.holder,
  );

  if (paymentRedirect === "exito") {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 py-24 text-center sm:px-6">
        <span className="text-6xl" aria-hidden="true">
          ✅
        </span>
        <h1 className="text-3xl font-bold text-zinc-50">Pago confirmado</h1>
        <p className="text-lg text-zinc-400">
          ¡Gracias por tu compra! Tu pedido{" "}
          {paymentOrderId ? <strong>#{paymentOrderId}</strong> : null} fue
          pagado con Mercado Pago y ya está en proceso.
        </p>
        <Link
          href="/cuenta"
          className="rounded-full bg-amber-400 px-7 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-300"
        >
          Ver mis pedidos
        </Link>
        <Link
          href="/"
          className="text-sm text-zinc-500 transition-colors hover:text-amber-300"
        >
          Volver a la tienda
        </Link>
      </div>
    );
  }

  if (paymentRedirect === "pendiente") {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 py-24 text-center sm:px-6">
        <span className="text-6xl" aria-hidden="true">
          🕐
        </span>
        <h1 className="text-3xl font-bold text-zinc-50">Pago pendiente</h1>
        <p className="text-lg text-zinc-400">
          Tu pedido está registrado pero el pago quedó pendiente. Te avisamos
          apenas se confirme desde Mercado Pago.
        </p>
        <Link
          href="/"
          className="rounded-full bg-amber-400 px-7 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-300"
        >
          Volver a la tienda
        </Link>
      </div>
    );
  }

  if (paymentRedirect === "error") {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 py-24 text-center sm:px-6">
        <span className="text-6xl" aria-hidden="true">
          ⚠️
        </span>
        <h1 className="text-3xl font-bold text-zinc-50">
          El pago no se completó
        </h1>
        <p className="text-lg text-zinc-400">
          Podés volver a intentarlo con Mercado Pago o elegir transferencia
          bancaria.
        </p>
        <Link
          href="/carrito"
          className="rounded-full bg-amber-400 px-7 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-300"
        >
          Volver al carrito
        </Link>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 py-24 text-center sm:px-6">
        <span className="text-6xl" aria-hidden="true">
          🎉
        </span>
        <h1 className="text-3xl font-bold text-zinc-50">Pedido registrado</h1>
        <p className="text-lg text-zinc-400">
          Gracias por tu compra. Tu pedido quedó pendiente de pago por
          transferencia bancaria.
        </p>

        {transferReady ? (
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-left">
            <h2 className="mb-4 text-lg font-semibold text-zinc-100">
              Datos para la transferencia
            </h2>
            <dl className="space-y-3 text-sm">
              {transfer!.bankName ? (
                <div>
                  <dt className="text-xs text-zinc-500">Banco</dt>
                  <dd className="font-medium text-zinc-100">
                    {transfer!.bankName}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="text-xs text-zinc-500">Titular</dt>
                <dd className="font-medium text-zinc-100">{transfer!.holder}</dd>
              </div>
              {transfer!.cbu ? (
                <div>
                  <dt className="text-xs text-zinc-500">CBU</dt>
                  <dd className="font-mono text-sm text-zinc-100">
                    {transfer!.cbu}
                  </dd>
                </div>
              ) : null}
              {transfer!.alias ? (
                <div>
                  <dt className="text-xs text-zinc-500">Alias</dt>
                  <dd className="font-mono text-sm text-zinc-100">
                    {transfer!.alias}
                  </dd>
                </div>
              ) : null}
              {transfer!.note ? (
                <div>
                  <dt className="text-xs text-zinc-500">Nota</dt>
                  <dd className="text-zinc-300">{transfer!.note}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            En breve te contactamos para coordinar el pago y el envío.
          </p>
        )}

        <button
          type="button"
          onClick={() => {
            clearCart();
            setOrderPlaced(false);
          }}
          className="rounded-full bg-amber-400 px-7 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-300"
        >
          Volver a la tienda
        </button>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 py-24 text-center sm:px-6">
        <span className="text-6xl" aria-hidden="true">
          🛒
        </span>
        <h1 className="text-3xl font-bold text-zinc-50">
          Tu carrito está vacío
        </h1>
        <p className="text-lg text-zinc-400">
          Todavía no agregaste nada. Explorá el catálogo y elegí tus piezas
          favoritas.
        </p>
        <Link
          href="/"
          className="rounded-full bg-amber-400 px-7 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-300"
        >
          Ir al catálogo
        </Link>
      </div>
    );
  }

  const paymentOptions: {
    value: PaymentMethod;
    title: string;
    description: string;
    emoji: string;
    disabled?: boolean;
    tag?: string;
  }[] = [
    {
      value: "transferencia",
      title: "Transferencia bancaria",
      description: "Transferís desde tu banco y coordinamos por WhatsApp.",
      emoji: "🏦",
    },
    {
      value: "mercado_pago",
      title: "Mercado Pago",
      description: "Tarjeta, débito o dinero en cuenta de Mercado Pago.",
      emoji: "💳",
      disabled: !mercadopagoConfigured,
      tag: mercadopagoConfigured ? undefined : "Próximamente",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-3xl font-bold text-zinc-50">Carrito</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {entries.map(({ item, product }) => (
            <div
              key={item.slug}
              className="flex gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4"
            >
              <Link
                href={`/productos/${product.slug}`}
                className="shrink-0"
                aria-label={product.name}
              >
                <ProductVisual product={product} className="h-24 w-24 rounded-xl" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-500">
                      {categoryById[product.category].name}
                    </p>
                    <Link
                      href={`/productos/${product.slug}`}
                      className="line-clamp-1 font-semibold text-zinc-100 hover:text-amber-300"
                    >
                      {product.name}
                    </Link>
                  </div>
                  <span className="shrink-0 font-semibold tabular-nums text-zinc-100">
                    {formatPrice(product.price * item.quantity)}
                  </span>
                </div>
                <div className="mt-auto flex items-center justify-between gap-3">
                  <div className="flex items-center rounded-full border border-zinc-700">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.slug, item.quantity - 1)
                      }
                      className="flex h-9 w-9 items-center justify-center text-zinc-400 transition-colors hover:text-amber-300"
                      aria-label="Quitar uno"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-zinc-100">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.slug, item.quantity + 1)
                      }
                      className="flex h-9 w-9 items-center justify-center text-zinc-400 transition-colors hover:text-amber-300"
                      aria-label="Agregar uno"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.slug)}
                    className="text-sm text-zinc-500 transition-colors hover:text-red-400"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 lg:sticky lg:top-24">
          <h2 className="mb-4 text-lg font-semibold text-zinc-100">Resumen</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between text-zinc-400">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-zinc-400">
              <dt>Envío</dt>
              {freeShippingActive ? (
                <dd className="font-medium text-emerald-400">Gratis</dd>
              ) : shippingCost !== null ? (
                <dd className="tabular-nums">{formatPrice(shippingCost)}</dd>
              ) : (
                <dd>A cotizar</dd>
              )}
            </div>
            {couponDiscount > 0 ? (
              <div className="flex justify-between text-emerald-400">
                <dt>
                  Descuento{" "}
                  {appliedCoupon ? (
                    <span className="font-mono text-[10px] text-zinc-500">
                      {appliedCoupon}
                    </span>
                  ) : null}
                </dt>
                <dd className="tabular-nums">−{formatPrice(couponDiscount)}</dd>
              </div>
            ) : null}
          </dl>
          <div className="mt-4 flex justify-between border-t border-zinc-800 pt-4 text-base font-bold text-zinc-50">
            <span>Total</span>
            <span className="tabular-nums">
              {formatPrice(subtotal - couponDiscount + (shippingCost ?? 0))}
            </span>
          </div>

          {freeShippingEnabled ? (
            <div className="mt-3">
              {freeShippingActive ? (
                <p className="rounded-lg border border-emerald-900/70 bg-emerald-950/30 px-3 py-2 text-xs text-emerald-300">
                  🎉 ¡Tenés envío gratis en este pedido!
                </p>
              ) : (
                <div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${freeShippingProgress}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-zinc-500">
                    Te faltan{" "}
                    <strong className="text-amber-300">
                      {formatPrice(freeShippingFrom - subtotal)}
                    </strong>{" "}
                    para envío gratis 🚚
                  </p>
                </div>
              )}
            </div>
          ) : null}

          <p className="mt-3 flex items-center gap-2 rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-xs text-amber-200/90">
            <span className="text-sm" aria-hidden="true">
              🪙
            </span>
            Con este pedido sumás{" "}
            <strong className="text-amber-400">
              {Math.floor((subtotal - couponDiscount) / 1000)} moneda
              {Math.floor((subtotal - couponDiscount) / 1000) === 1 ? "" : "s"}
            </strong>{" "}
            a tu perfil arcade.
          </p>

          <div className="mt-4">
            {appliedCoupon ? (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-900/70 bg-emerald-950/30 px-3 py-2.5 text-sm">
                <span className="text-emerald-400">
                  ✓ Cupón aplicado ({formatPrice(couponDiscount)})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAppliedCoupon(null);
                    setCouponDiscount(0);
                    setCouponError(null);
                    setCouponCode("");
                  }}
                  className="text-xs text-zinc-500 transition-colors hover:text-red-400"
                >
                  Quitar
                </button>
              </div>
            ) : (
              <div>
                <label
                  htmlFor="coupon-code"
                  className="mb-1.5 block text-xs font-medium text-zinc-500"
                >
                  Código de descuento
                </label>
                <div className="flex gap-2">
                  <input
                    id="coupon-code"
                    value={couponCode}
                    onChange={(event) => setCouponCode(event.target.value)}
                    placeholder="CRAFT-XXXXXX"
                    className="min-w-0 flex-1 rounded-full border border-zinc-700 bg-zinc-950/60 px-4 py-2 text-sm uppercase tracking-wider text-zinc-100 placeholder:text-zinc-700 focus:border-amber-400/60 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponPending || !couponCode.trim()}
                    className="shrink-0 rounded-full border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-amber-400/60 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {couponPending ? "…" : "Aplicar"}
                  </button>
                </div>
                {couponError ? (
                  <p className="mt-1.5 text-xs text-red-400" role="alert">
                    {couponError}
                  </p>
                ) : null}
              </div>
            )}
          </div>

          <form onSubmit={handleCheckout}>
            <input type="hidden" name="items" value={JSON.stringify(items)} />
            {appliedCoupon ? (
              <input type="hidden" name="couponCode" value={appliedCoupon} />
            ) : null}
            {shippingCost !== null ? (
              <input type="hidden" name="shippingCost" value={shippingCost} />
            ) : null}

            {shipping?.correo.enabled ? (
              <div className="mt-6 border-t border-zinc-800 pt-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-100">
                    Envío a domicilio
                  </h3>
                  <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-500">
                    Correo Argentino
                  </span>
                </div>

                <label
                  htmlFor="shipping-postal"
                  className="mb-1.5 block text-xs font-medium text-zinc-500"
                >
                  Código postal de entrega
                </label>
                <div className="flex gap-2">
                  <input
                    id="shipping-postal"
                    value={postalCode}
                    onChange={(event) =>
                      setPostalCode(event.target.value.replace(/\D/g, ""))
                    }
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="XXXX"
                    className="min-w-0 w-24 rounded-full border border-zinc-700 bg-zinc-950/60 px-4 py-2 text-center font-mono text-sm text-zinc-100 placeholder:text-zinc-700 focus:border-amber-400/60 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleQuoteShipping}
                    disabled={quotePending || postalCode.length !== 4}
                    className="flex-1 shrink-0 rounded-full border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-amber-400/60 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {quotePending ? "Cotizando…" : "Cotizar envío"}
                  </button>
                </div>
                {quoteError ? (
                  <p className="mt-2 text-xs text-red-400" role="alert">
                    {quoteError}
                  </p>
                ) : null}

                {shippingOptions.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {shippingOptions.map((option) => {
                      const checked = selectedShipping === option.deliveredType;
                      return (
                        <label
                          key={option.deliveredType}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
                            checked
                              ? "border-amber-400/60 bg-amber-400/5"
                              : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700"
                          }`}
                        >
                          <input
                            type="radio"
                            name="shippingOption"
                            value={option.deliveredType}
                            checked={checked}
                            onChange={() =>
                              setSelectedShipping(option.deliveredType)
                            }
                            className="h-4 w-4 accent-amber-400"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium text-zinc-100">
                              {option.label}
                            </span>
                            <span className="block text-xs text-zinc-500">
                              {option.timeMin}-{option.timeMax} días hábiles
                            </span>
                          </span>
                          <span className="shrink-0 text-sm font-semibold tabular-nums text-zinc-100">
                            {formatPrice(option.price)}
                          </span>
                        </label>
                      );
                    })}
                    <p className="text-[10px] text-zinc-600">
                      El costo se calcula al momento de la entrega por Correo
                      Argentino; puede variar levemente.
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}

            <fieldset className="mt-6">
              <legend className="mb-3 text-sm font-semibold text-zinc-100">
                Método de pago
              </legend>
              <div className="space-y-2">
                {paymentOptions.map((option) => {
                  const checked = paymentMethod === option.value;
                  return (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                        option.disabled
                          ? "cursor-not-allowed border-zinc-800 bg-zinc-950/40 opacity-60"
                          : checked
                            ? "border-amber-400/60 bg-amber-400/5"
                            : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={option.value}
                        checked={checked}
                        disabled={option.disabled}
                        onChange={() => setPaymentMethod(option.value)}
                        className="mt-1 h-4 w-4 accent-amber-400"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span aria-hidden="true">{option.emoji}</span>
                          <span className="font-medium text-zinc-100">
                            {option.title}
                          </span>
                          {option.tag ? (
                            <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-500">
                              {option.tag}
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-0.5 block text-xs text-zinc-500">
                          {option.description}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <button
              type="submit"
              disabled={pending}
              className="mt-6 w-full rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Procesando pedido…" : "Realizar pedido"}
            </button>
          </form>
          {error ? (
            <p
              className="mt-3 rounded-lg border border-red-900/70 bg-red-950/30 px-3 py-2 text-center text-xs text-red-400"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          <p className="mt-3 text-center text-xs text-zinc-500">
            {paymentMethod === "mercado_pago"
              ? "Vas a continuar en Mercado Pago para completar el pago."
              : "El pago se coordina al confirmar el pedido. Se registra con tus datos de contacto de Mi cuenta."}
          </p>
        </aside>
      </div>
    </div>
  );
}
