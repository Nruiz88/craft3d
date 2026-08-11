"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { catalogOrders } from "@/lib/catalog";

export default function CatalogToolbar({
  query = "",
  order = "",
}: {
  query?: string;
  order?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(query);

  function go(nextOrder: string, nextQuery: string) {
    const params = new URLSearchParams();
    const q = nextQuery.trim();
    if (q) params.set("busqueda", q);
    if (nextOrder && nextOrder !== "recientes") params.set("orden", nextOrder);
    router.push(params.size ? `/catalogo?${params.toString()}` : "/catalogo");
  }

  return (
    <div className="flex flex-col gap-3 border-y-2 border-zinc-800/80 bg-zinc-950/60 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          go(order, value);
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
        {query ? (
          <span className="inline-flex items-center gap-2 rounded-md border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-xs text-amber-300">
            Resultados para «{query}»
            <button
              type="button"
              aria-label="Quitar búsqueda"
              onClick={() => {
                setValue("");
                go(order, "");
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
            onChange={(event) => go(event.target.value, value)}
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
  );
}
