"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useCart } from "@/lib/cart-context";
import { categoryById } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { checkoutAction } from "@/app/account/actions";
import type { PaymentSettings } from "@/lib/settings";
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
}

export default function CartView({
  products,
  paymentRedirect,
  paymentOrderId,
  transfer,
  mercadopagoConfigured = false,
}: CartViewProps) {
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("transferencia");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (paymentRedirect === "exito") clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentRedirect]);

  async function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const result = await checkoutAction(undefined, formData);
    if (result?.initPoint) {
      window.location.href = result.initPoint;
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
              <dd>A coordinar</dd>
            </div>
          </dl>
          <div className="mt-4 flex justify-between border-t border-zinc-800 pt-4 text-base font-bold text-zinc-50">
            <span>Total</span>
            <span className="tabular-nums">{formatPrice(subtotal)}</span>
          </div>

          <p className="mt-3 flex items-center gap-2 rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-xs text-amber-200/90">
            <span className="text-sm" aria-hidden="true">
              🪙
            </span>
            Con este pedido sumás{" "}
            <strong className="text-amber-400">
              {Math.floor(subtotal / 1000)} moneda
              {Math.floor(subtotal / 1000) === 1 ? "" : "s"}
            </strong>{" "}
            a tu perfil arcade.
          </p>

          <form onSubmit={handleCheckout}>
            <input type="hidden" name="items" value={JSON.stringify(items)} />

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
