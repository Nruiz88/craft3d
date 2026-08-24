"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { catalogOrders } from "@/lib/products/catalog";
import CatalogFilters from "./catalog-filters";

interface ActiveFilters {
  categories: string[];
  priceMin?: number;
  priceMax?: number;
  availability: string;
}

export default function CatalogToolbar({
  query = "",
  order = "",
  filters,
  counts,
  totalProducts,
}: {
  query?: string;
  order?: string;
  filters: ActiveFilters;
  counts: Map<string, number>;
  totalProducts: number;
}) {
  const router = useRouter();
  const [value, setValue] = useState(query);
  const [panelOpen, setPanelOpen] = useState(false);

  function buildUrl(
    nextOrder: string,
    nextQuery: string,
    filterOverrides?: {
      categories?: string[];
      priceMin?: number;
      priceMax?: number;
      availability?: string;
    },
  ) {
    const params = new URLSearchParams();
    const q = nextQuery.trim();
    if (q) params.set("busqueda", q);
    if (nextOrder && nextOrder !== "recientes") params.set("orden", nextOrder);

    const f = filterOverrides ?? filters;
    if (f.categories?.length) {
      params.set("categorias", f.categories.join(","));
    }
    if (f.priceMin !== undefined && f.priceMin > 0) {
      params.set("priceMin", f.priceMin.toString());
    }
    if (f.priceMax !== undefined && f.priceMax > 0) {
      params.set("priceMax", f.priceMax.toString());
    }
    if (f.availability && f.availability !== "all") {
      params.set("stock", f.availability);
    }

    router.push(params.size ? `/catalogo?${params.toString()}` : "/catalogo");
  }

  const activeFilterCount =
    (filters.categories?.length ?? 0) +
    (filters.priceMin ? 1 : 0) +
    (filters.priceMax ? 1 : 0) +
    (filters.availability !== "all" ? 1 : 0);

  return (
    <div className="border-y-2 border-zinc-800/80 bg-zinc-950/60 px-4 sm:px-6">
      {/* ── Row 1: Search + Sort ── */}
      <div className="flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between">
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            buildUrl(order, value);
          }}
          className="relative flex items-center"
        >
          <input
            type="search"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Buscar por nombre, categoría o tag…"
            aria-label="Buscar productos"
            className="h-10 w-full rounded-md border-2 border-zinc-800 bg-zinc-900/80 pr-10 pl-4 text-sm text-zinc-200 transition-colors placeholder:text-zinc-600 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 lg:w-80"
          />
          <button
            type="submit"
            aria-label="Buscar"
            className="absolute right-0 inline-flex h-10 w-10 items-center justify-center text-zinc-500 transition-colors hover:text-cyan-300"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filter toggle button */}
          <button
            type="button"
            onClick={() => setPanelOpen((v) => !v)}
            className={`inline-flex items-center gap-2 rounded-md border-2 px-3 py-2 text-xs font-medium transition-all ${
              panelOpen
                ? "border-amber-400/50 bg-amber-400/10 text-amber-300"
                : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
            }`}
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" x2="4" y1="21" y2="14" />
              <line x1="4" x2="4" y1="10" y2="3" />
              <line x1="12" x2="12" y1="21" y2="12" />
              <line x1="12" x2="12" y1="8" y2="3" />
              <line x1="20" x2="20" y1="21" y2="16" />
              <line x1="20" x2="20" y1="12" y2="3" />
              <line x1="2" x2="6" y1="14" y2="14" />
              <line x1="10" x2="14" y1="8" y2="8" />
              <line x1="18" x2="22" y1="16" y2="16" />
            </svg>
            FILTROS
            {activeFilterCount > 0 ? (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-zinc-950">
                {activeFilterCount}
              </span>
            ) : null}
          </button>

          {query ? (
            <span className="inline-flex items-center gap-2 rounded-md border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-xs text-amber-300">
              Resultados para «{query}»
              <button
                type="button"
                aria-label="Quitar búsqueda"
                onClick={() => {
                  setValue("");
                  buildUrl(order, "");
                }}
                className="text-amber-400 transition-colors hover:text-amber-200"
              >
                ✕
              </button>
            </span>
          ) : null}

          <label className="inline-flex items-center gap-2 text-xs text-zinc-500">
            <span className="pixel tracking-widest">ORDENAR</span>
            <select
              value={order ?? "recientes"}
              onChange={(event) => buildUrl(event.target.value, value)}
              className="h-10 cursor-pointer rounded-md border-2 border-zinc-800 bg-zinc-900 px-3 pr-8 text-sm text-zinc-200 transition-colors focus:border-cyan-400/60 focus:outline-none"
            >
              {catalogOrders.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* ── Row 2: Filter Panel ── */}
      {panelOpen ? (
        <div className="border-t border-zinc-800/60 pb-4 pt-4">
          <CatalogFilters
            initial={{
              categories: filters.categories ?? [],
              priceRange: getInitialPriceRange(filters.priceMin, filters.priceMax),
              availability: (filters.availability as "all" | "in-stock" | "out-of-stock") ?? "all",
            }}
            counts={counts}
            totalProducts={totalProducts}
            onApply={(f) => buildUrl(order, value, f)}
          />
        </div>
      ) : null}
    </div>
  );
}

function getInitialPriceRange(min?: number, max?: number): number {
  if (!min && !max) return 0;
  if (max === 10000) return 1;
  if (min === 10000 && max === 30000) return 2;
  if (min === 30000 && max === 60000) return 3;
  if (min === 60000) return 4;
  return 0;
}
