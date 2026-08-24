"use client";

import { formatPrice } from "@/lib/utils/format";
import type { PaymentSettings, ShippingSettings } from "@/lib/payments/settings";
import type { QuoteShippingState } from "@/app/account/actions";
import type { Product } from "@/lib/products/types";
import type { CartItem } from "@/lib/products/types";

type PaymentMethod = "transferencia" | "mercado_pago";
type ShippingOption = NonNullable<NonNullable<QuoteShippingState>["options"]>[number];

export default function CartSummary({
  entries,
  subtotal,
  paymentMethod,
  onPaymentMethodChange,
  transfer,
  mercadopagoConfigured,
  shipping,
  // Coupon
  couponCode,
  onCouponCodeChange,
  appliedCoupon,
  couponDiscount,
  couponError,
  couponPending,
  onApplyCoupon,
  onRemoveCoupon,
  // Shipping
  postalCode,
  onPostalCodeChange,
  quotePending,
  quoteError,
  shippingOptions,
  selectedShipping,
  onSelectedShippingChange,
  onQuoteShipping,
  // Gift
  giftEnabled,
  onGiftEnabledChange,
  // Totals
  freeShippingActive,
  freeShippingProgress,
  freeShippingFrom,
  shippingCost,
  // Submit
  pending,
  error,
  items,
  onSubmit,
}: {
  entries: { item: CartItem; product: Product }[];
  subtotal: number;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (m: PaymentMethod) => void;
  transfer?: PaymentSettings["transfer"];
  mercadopagoConfigured: boolean;
  shipping?: ShippingSettings;
  couponCode: string;
  onCouponCodeChange: (v: string) => void;
  appliedCoupon: string | null;
  couponDiscount: number;
  couponError: string | null;
  couponPending: boolean;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
  postalCode: string;
  onPostalCodeChange: (v: string) => void;
  quotePending: boolean;
  quoteError: string | null;
  shippingOptions: ShippingOption[];
  selectedShipping: string | null;
  onSelectedShippingChange: (v: string) => void;
  onQuoteShipping: () => void;
  giftEnabled: boolean;
  onGiftEnabledChange: (v: boolean) => void;
  freeShippingActive: boolean;
  freeShippingProgress: number;
  freeShippingFrom: number;
  shippingCost: number | null;
  pending: boolean;
  error: string | null;
  items: CartItem[];
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
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
    <aside className="h-fit rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 lg:sticky lg:top-24">
      <h2 className="mb-4 text-lg font-semibold text-zinc-100">Resumen</h2>

      {/* Totals */}
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
                <span className="font-mono text-[10px] text-zinc-500">{appliedCoupon}</span>
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

      {/* Free shipping */}
      {shipping?.freeShipping.enabled ? (
        <div className="mt-3">
          {freeShippingActive ? (
            <p className="rounded-lg border border-emerald-900/70 bg-emerald-950/30 px-3 py-2 text-xs text-emerald-300">
              🎉 ¡Tenés envío gratis en este pedido!
            </p>
          ) : (
            <div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${freeShippingProgress}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-zinc-500">
                Te faltan{" "}
                <strong className="text-amber-300">{formatPrice(freeShippingFrom - subtotal)}</strong>{" "}
                para envío gratis 🚚
              </p>
            </div>
          )}
        </div>
      ) : null}

      {/* Coins */}
      <p className="mt-3 flex items-center gap-2 rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-xs text-amber-200/90">
        <span className="text-sm" aria-hidden="true">🪙</span>
        Con este pedido sumás{" "}
        <strong className="text-amber-400">
          {Math.floor((subtotal - couponDiscount) / 1000)} moneda
          {Math.floor((subtotal - couponDiscount) / 1000) === 1 ? "" : "s"}
        </strong>{" "}
        a tu perfil arcade.
      </p>

      {/* Coupon */}
      <div className="mt-4">
        {appliedCoupon ? (
          <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-900/70 bg-emerald-950/30 px-3 py-2.5 text-sm">
            <span className="text-emerald-400">✓ Cupón aplicado ({formatPrice(couponDiscount)})</span>
            <button type="button" onClick={onRemoveCoupon} className="text-xs text-zinc-500 transition-colors hover:text-red-400">
              Quitar
            </button>
          </div>
        ) : (
          <div>
            <label htmlFor="coupon-code" className="mb-1.5 block text-xs font-medium text-zinc-500">
              Código de descuento
            </label>
            <div className="flex gap-2">
              <input
                id="coupon-code"
                value={couponCode}
                onChange={(e) => onCouponCodeChange(e.target.value)}
                placeholder="CRAFT-XXXXXX"
                className="min-w-0 flex-1 rounded-full border border-zinc-700 bg-zinc-950/60 px-4 py-2 text-sm uppercase tracking-wider text-zinc-100 placeholder:text-zinc-700 focus:border-amber-400/60 focus:outline-none"
              />
              <button
                type="button"
                onClick={onApplyCoupon}
                disabled={couponPending || !couponCode.trim()}
                className="shrink-0 rounded-full border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-amber-400/60 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {couponPending ? "…" : "Aplicar"}
              </button>
            </div>
            {couponError ? (
              <p className="mt-1.5 text-xs text-red-400" role="alert">{couponError}</p>
            ) : null}
          </div>
        )}
      </div>

      <form onSubmit={onSubmit}>
        <input type="hidden" name="items" value={JSON.stringify(items.map((item) => ({ slug: item.slug, quantity: item.quantity })))} />
        {appliedCoupon ? <input type="hidden" name="couponCode" value={appliedCoupon} /> : null}
        {shippingCost !== null ? <input type="hidden" name="shippingCost" value={shippingCost} /> : null}

        {/* Shipping */}
        {shipping?.correo.enabled ? (
          <div className="mt-6 border-t border-zinc-800 pt-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-100">Envío a domicilio</h3>
              <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-500">
                Correo Argentino
              </span>
            </div>
            <label htmlFor="shipping-postal" className="mb-1.5 block text-xs font-medium text-zinc-500">
              Código postal de entrega
            </label>
            <div className="flex gap-2">
              <input
                id="shipping-postal"
                value={postalCode}
                onChange={(e) => onPostalCodeChange(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                maxLength={4}
                placeholder="XXXX"
                className="min-w-0 w-24 rounded-full border border-zinc-700 bg-zinc-950/60 px-4 py-2 text-center font-mono text-sm text-zinc-100 placeholder:text-zinc-700 focus:border-amber-400/60 focus:outline-none"
              />
              <button
                type="button"
                onClick={onQuoteShipping}
                disabled={quotePending || postalCode.length !== 4}
                className="flex-1 shrink-0 rounded-full border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-amber-400/60 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {quotePending ? "Cotizando…" : "Cotizar envío"}
              </button>
            </div>
            {quoteError ? (
              <p className="mt-2 text-xs text-red-400" role="alert">{quoteError}</p>
            ) : null}

            {shippingOptions.length > 0 ? (
              <div className="mt-3 space-y-2">
                {shippingOptions.map((option) => {
                  const checked = selectedShipping === option.deliveredType;
                  return (
                    <label
                      key={option.deliveredType}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
                        checked ? "border-amber-400/60 bg-amber-400/5" : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="shippingOption"
                        value={option.deliveredType}
                        checked={checked}
                        onChange={() => onSelectedShippingChange(option.deliveredType)}
                        className="h-4 w-4 accent-amber-400"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-zinc-100">{option.label}</span>
                        <span className="block text-xs text-zinc-500">{option.timeMin}-{option.timeMax} días hábiles</span>
                      </span>
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-zinc-100">
                        {formatPrice(option.price)}
                      </span>
                    </label>
                  );
                })}
                <p className="text-[10px] text-zinc-600">
                  El costo se calcula al momento de la entrega por Correo Argentino; puede variar levemente.
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Gift */}
        {entries.some((e) => e.product.category === "mystery-box") ? (
          <div className="mt-6 border-t border-zinc-800 pt-5">
            <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-100">
              <input
                type="checkbox"
                name="gift"
                value="on"
                checked={giftEnabled}
                onChange={(e) => onGiftEnabledChange(e.target.checked)}
                className="h-4 w-4 rounded accent-amber-400"
              />
              🎁 Es un regalo — envolvemos la caja con tarjeta
            </label>
            {giftEnabled ? (
              <textarea
                name="giftMessage"
                rows={2}
                placeholder="Mensaje para la tarjeta (opcional)…"
                className="mt-3 w-full rounded-xl border border-zinc-700 bg-zinc-950/60 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400/60 focus:outline-none"
              />
            ) : null}
          </div>
        ) : null}

        {/* Payment method */}
        <fieldset className="mt-6">
          <legend className="mb-3 text-sm font-semibold text-zinc-100">Método de pago</legend>
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
                    onChange={() => onPaymentMethodChange(option.value)}
                    className="mt-1 h-4 w-4 accent-amber-400"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span aria-hidden="true">{option.emoji}</span>
                      <span className="font-medium text-zinc-100">{option.title}</span>
                      {option.tag ? (
                        <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-500">
                          {option.tag}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-500">{option.description}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Submit */}
        <button
          type="submit"
          disabled={pending}
          className="mt-6 w-full rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Procesando pedido…" : "Realizar pedido"}
        </button>
      </form>

      {error ? (
        <p className="mt-3 rounded-lg border border-red-900/70 bg-red-950/30 px-3 py-2 text-center text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <p className="mt-3 text-center text-xs text-zinc-500">
        {paymentMethod === "mercado_pago"
          ? "Vas a continuar en Mercado Pago para completar el pago."
          : "El pago se coordina al confirmar el pedido. Se registra con tus datos de contacto de Mi cuenta."}
      </p>
    </aside>
  );
}
