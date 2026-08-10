"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";
import { dropStatusConfig, formatDropDateTime, type DropStatus } from "@/lib/drops";
import type { Product } from "@/lib/types";
import ProductVisual from "@/components/product-visual";
import DeleteProductButton from "./delete-product-button";

function StatusBadge({ status }: { status: DropStatus }) {
  const config = dropStatusConfig[status];
  return (
    <span
      className={`pixel inline-flex items-center whitespace-nowrap rounded-sm border px-2 py-1 text-[9px] tracking-widest ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export default function DropsTable({
  items,
}: {
  items: { product: Product; status: DropStatus }[];
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | DropStatus>("all");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(({ product, status: itemStatus }) => {
      const okStatus = status === "all" || itemStatus === status;
      const okQuery =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.slug.toLowerCase().includes(q);
      return okStatus && okQuery;
    });
  }, [items, query, status]);

  const hasFilters = query.trim() !== "" || status !== "all";

  function clearFilters() {
    setQuery("");
    setStatus("all");
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xs">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar drop por nombre o slug..."
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 py-2 pl-10 pr-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "all" | DropStatus)}
            aria-label="Filtrar por estado"
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-400 focus:outline-none"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Abiertos</option>
            <option value="upcoming">Próximos</option>
            <option value="past">Finalizados</option>
          </select>
          {hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-400 transition-colors hover:border-amber-400/60 hover:text-amber-300"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
              Limpiar
            </button>
          ) : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-800">
        <div className="hidden items-center gap-x-6 border-b border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-xs uppercase tracking-wider text-zinc-500 md:flex">
          <span className="min-w-[200px] flex-1">Drop</span>
          <span className="w-28">Estado</span>
          <span className="w-52">Ventana</span>
          <span className="w-24">Precio</span>
          <span className="w-24">Stock</span>
          <span className="ml-auto w-44 text-right">Acciones</span>
        </div>

        <ul className="divide-y divide-zinc-800">
          {rows.map(({ product, status: itemStatus }) => {
            const starts = formatDropDateTime(product.dropStartsAt);
            const ends = formatDropDateTime(product.dropEndsAt);
            return (
              <li
                key={product.id}
                className="flex flex-wrap items-center gap-x-6 gap-y-3 bg-zinc-950/40 px-4 py-3 transition-colors hover:bg-zinc-900/60"
              >
                <div className="flex min-w-[200px] flex-1 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-violet-500/40 to-fuchsia-950 text-xl shadow-inner" aria-hidden="true">
                    <ProductVisual
                      product={product}
                      className="h-full w-full"
                    />
                  </span>
                  <div className="min-w-0">
                    <Link
                      href={`/drops`}
                      className="block truncate font-medium text-zinc-100 hover:text-amber-300"
                    >
                      {product.name}
                    </Link>
                    <span className="block truncate text-xs text-zinc-600">
                      /productos/{product.slug}
                    </span>
                  </div>
                </div>
                <div className="w-28">
                  <StatusBadge status={itemStatus} />
                </div>
                <div className="w-52 text-xs tabular-nums text-zinc-400">
                  {starts && ends ? (
                    <>
                      {starts} <span className="text-zinc-600">→</span> {ends}
                    </>
                  ) : starts ? (
                    <>
                      Desde {starts} <span className="text-zinc-600">·</span>{" "}
                      <span className="text-emerald-400">sin fin</span>
                    </>
                  ) : ends ? (
                    <>
                      <span className="text-emerald-400">sin inicio</span>{" "}
                      <span className="text-zinc-600">→</span> {ends}
                    </>
                  ) : (
                    <span className="text-zinc-600">Siempre activo</span>
                  )}
                </div>
                <div className="w-24 font-medium tabular-nums text-zinc-100">
                  {formatPrice(product.price)}
                </div>
                <div
                  className={`w-24 text-xs font-medium tabular-nums ${
                    product.stock <= 0 ? "text-red-400" : "text-emerald-400"
                  }`}
                >
                  {product.stock <= 0 ? "Agotado" : `${product.stock} u.`}
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Link
                    href={`/productos/${product.slug}`}
                    target="_blank"
                    aria-label={`Ver ${product.name} en la tienda`}
                    title="Ver en la tienda"
                    className="rounded-full border border-zinc-700 p-2 text-zinc-400 transition-colors hover:border-amber-400/60 hover:text-amber-300"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </Link>
                  <Link
                    href={`/admin/drops/${product.id}/editar`}
                    className="rounded-full border border-zinc-700 px-4 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-amber-400/60 hover:text-amber-300"
                  >
                    Editar
                  </Link>
                  <DeleteProductButton
                    id={product.id}
                    name={product.name}
                    redirectTo="/admin/drops"
                  />
                </div>
              </li>
            );
          })}
        </ul>

        {rows.length === 0 ? (
          <div className="bg-zinc-950/40 px-4 py-14 text-center">
            <p className="text-3xl" aria-hidden="true">
              💧
            </p>
            <p className="mt-3 font-medium text-zinc-300">
              No se encontraron drops
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Cargá tu primer drop con el botón &quot;Nuevo drop&quot;.
            </p>
            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 rounded-lg border border-amber-400/40 px-4 py-1.5 text-sm font-medium text-amber-300 transition-colors hover:bg-amber-400/10"
              >
                Limpiar filtros
              </button>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 bg-zinc-950/40 px-4 py-2.5 text-xs text-zinc-500">
            <span className="tabular-nums">
              {rows.length} {rows.length === 1 ? "drop" : "drops"}
            </span>
            <span className="text-zinc-600">
              Los drops se ven en <span className="text-zinc-400">/drops</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
