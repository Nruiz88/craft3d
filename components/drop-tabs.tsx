"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { categoryById } from "@/lib/products";
import { formatModelName, formatPrice } from "@/lib/format";

const tabs = [
  { id: "specs", label: "Ficha técnica" },
  { id: "shipping", label: "Envío y pago" },
  { id: "care", label: "Cuidados" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function SkuChip({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  async function copySku() {
    try {
      await navigator.clipboard.writeText(slug);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // portapapeles no disponible
    }
  }

  return (
    <button
      type="button"
      onClick={copySku}
      title="Copiar código de referencia"
      className="group flex flex-col items-end gap-1 text-right"
    >
      <span className="pixel inline-flex items-center gap-1.5 rounded-sm border border-cyan-900/60 bg-cyan-950/30 px-2.5 py-1.5 text-[9px] tracking-widest text-cyan-300 neon-cyan transition-colors group-hover:border-cyan-400/60">
        {formatModelName(slug)}
        <svg
          className={`h-3 w-3 ${
            copied ? "text-emerald-400" : "text-cyan-500/70"
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {copied ? (
            <path d="M20 6 9 17l-5-5" />
          ) : (
            <>
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </>
          )}
        </svg>
      </span>
      <code className="font-mono text-[11px] leading-none text-zinc-500">
        {copied ? "¡Copiado!" : slug}
      </code>
    </button>
  );
}

export default function DropTabs({
  product,
  freeShipping,
  freeShippingFrom,
  edition,
  totalUnits,
  remaining,
  starts,
  ends,
}: {
  product: Product;
  freeShipping: boolean;
  freeShippingFrom: number;
  edition?: number;
  totalUnits?: number | null;
  remaining: number;
  starts?: string | null;
  ends?: string | null;
}) {
  const [active, setActive] = useState<TabId>("specs");

  const outOfStock = remaining <= 0;
  const windowValue =
    starts && ends
      ? `Abre ${starts} → Cierra ${ends}`
      : starts
        ? `Abre ${starts}`
        : ends
          ? `Cierra ${ends}`
          : "Disponible hasta agotar stock";

  const specsRows = [
    {
      label: "Categoría",
      value: `${categoryById[product.category].emoji} ${categoryById[product.category].name}`,
    },
    {
      label: "Edición",
      value: `Numerada N.º ${edition != null ? String(edition).padStart(3, "0") : "?"}`,
    },
    ...(totalUnits != null
      ? [{ label: "Tiraje", value: `${totalUnits} unidades` }]
      : []),
    {
      label: "Restan",
      value: outOfStock ? "Agotado" : `${remaining} unidades`,
    },
    { label: "Ventana", value: windowValue },
    { label: "SKU", value: "" },
    { label: "Material", value: "PLA (filamento)" },
    { label: "Técnica", value: "Impresión FDM · capa 0.2 mm" },
    { label: "Acabado", value: "Ensamble y revisión a mano" },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-amber-400/60 bg-gradient-to-br from-zinc-900 via-zinc-950 to-amber-950/40 shadow-[0_0_80px_rgba(251,191,36,0.1)]">
      <div className="crt-overlay" aria-hidden="true" />

      <div className="relative z-10 flex overflow-x-auto border-b-2 border-amber-400/30 bg-black/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            aria-pressed={active === tab.id}
            className={`pixel flex-1 whitespace-nowrap px-4 py-3.5 text-[10px] tracking-widest transition-colors ${
              active === tab.id
                ? "border-b-2 border-amber-400 bg-zinc-950/50 text-amber-300 neon-amber"
                : "text-zinc-500 hover:text-zinc-200"
            }`}
          >
            {tab.label.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="relative z-10 p-6 sm:p-8">
        {active === "specs" ? (
          <div>
            <dl className="divide-y divide-amber-400/15">
              {specsRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-4 py-2.5 text-sm"
                >
                  <dt className="text-zinc-500">{row.label}</dt>
                  <dd className="text-right font-medium text-zinc-100">
                    {row.label === "SKU" ? (
                      <SkuChip slug={product.slug} />
                    ) : row.label === "Ventana" ? (
                      <span className="text-xs text-zinc-300">{row.value}</span>
                    ) : (
                      row.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            {product.tags.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2 border-t border-amber-400/15 pt-4">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="pixel rounded-sm border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-[9px] tracking-widest text-zinc-500"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {active === "shipping" ? (
          <ul className="space-y-4 text-sm text-zinc-400">
            <li className="flex items-start gap-3">
              <span className="text-xl" aria-hidden="true">📦</span>
              <p>
                <strong className="font-semibold text-zinc-100">Envíos a todo el país.</strong>{" "}
                El envío se coordina por WhatsApp después de confirmar el pedido.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-xl" aria-hidden="true">🖨️</span>
              <p>
                <strong className="font-semibold text-zinc-100">Despacho en 2 a 5 días hábiles</strong>{" "}
                desde la confirmación, según la pieza y la impresión.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-xl" aria-hidden="true">🚚</span>
              <p>
                {freeShipping ? (
                  <strong className="font-semibold text-emerald-400">Este producto incluye envío gratis.</strong>
                ) : (
                  <>
                    <strong className="font-semibold text-zinc-100">Envío gratis</strong> en pedidos superiores a{" "}
                    <span className="font-semibold text-amber-400 neon-amber">
                      {formatPrice(freeShippingFrom)}
                    </span>
                    .
                  </>
                )}
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-xl" aria-hidden="true">💳</span>
              <p>
                <strong className="font-semibold text-zinc-100">Pago coordinado al confirmar</strong>{" "}
                (transferencia o Mercado Pago). Reservá tu pieza cuando quieras.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-xl" aria-hidden="true">🛡️</span>
              <p>
                <strong className="font-semibold text-zinc-100">Empaque seguro</strong> y con
                protección para que la pieza llegue intacta.
              </p>
            </li>
          </ul>
        ) : null}

        {active === "care" ? (
          <ul className="space-y-4 text-sm text-zinc-400">
            <li className="flex items-start gap-3">
              <span className="text-xl" aria-hidden="true">☀️</span>
              <p>
                <strong className="font-semibold text-zinc-100">Evitar el sol directo</strong>{" "}
                durante horas: puede decolorar el filamento.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-xl" aria-hidden="true">🧹</span>
              <p>
                <strong className="font-semibold text-zinc-100">Limpiar con un paño seco</strong>{" "}
                o apenas húmedo. No usar productos químicos.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-xl" aria-hidden="true">💧</span>
              <p>
                <strong className="font-semibold text-zinc-100">No sumergir en agua</strong>{" "}
                ni exponer a humedad prolongada.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-xl" aria-hidden="true">🤲</span>
              <p>
                <strong className="font-semibold text-zinc-100">Manipular con cuidado.</strong>{" "}
                Es una pieza decorativa de impresión 3D: no es un juguete.
              </p>
            </li>
          </ul>
        ) : null}
      </div>
    </div>
  );
}
