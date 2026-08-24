"use client";

import { useMemo, useState } from "react";
import { categories } from "@/lib/products";
import type { Product } from "@/lib/products/types";
import ProductTableRow from "./product-table-row";
import ProductTableCard from "./product-table-card";
import PaginationControls from "./pagination-controls";

const SORT_OPTIONS = [
  { value: "name-asc", label: "Nombre A-Z" },
  { value: "name-desc", label: "Nombre Z-A" },
  { value: "price-asc", label: "Menor precio" },
  { value: "price-desc", label: "Mayor precio" },
  { value: "stock-asc", label: "Menor stock" },
  { value: "stock-desc", label: "Mayor stock" },
  { value: "created-desc", label: "Más recientes" },
  { value: "created-asc", label: "Más antiguos" },
];

type View = "tabla" | "grilla";

const PAGE_SIZE = 8;

export default function ProductTable({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("name-asc");
  const [view, setView] = useState<View>("tabla");
  const [page, setPage] = useState(1);

  const hasFilters = query.trim() !== "" || category !== "all";

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = products.filter((p) => {
      const okCategory = category === "all" || p.category === category;
      const okQuery = !q || p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
      return okCategory && okQuery;
    });
    const [key, dir] = sort.split("-") as ["name" | "price" | "stock" | "created", "asc" | "desc"];
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (key === "name") cmp = a.name.localeCompare(b.name);
      else if (key === "price") cmp = a.price - b.price;
      else if (key === "stock") cmp = a.stock - b.stock;
      else cmp = a.createdAt.localeCompare(b.createdAt);
      return dir === "asc" ? cmp : -cmp;
    });
  }, [products, query, category, sort]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function clearFilters() {
    setQuery("");
    setCategory("all");
    setPage(1);
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xs">
          <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input type="search" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Buscar por nombre o slug..." className="w-full rounded-lg border border-zinc-700 bg-zinc-950 py-2 pl-10 pr-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} aria-label="Filtrar por categoría" className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-400 focus:outline-none">
            <option value="all">Todas las categorías</option>
            {categories.map((c) => (<option key={c.id} value={c.id}>{c.emoji} {c.name}</option>))}
          </select>
          <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} aria-label="Ordenar productos" className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-400 focus:outline-none">
            {SORT_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
          </select>
          {hasFilters ? (
            <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-400 transition-colors hover:border-amber-400/60 hover:text-amber-300">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              Limpiar
            </button>
          ) : null}
          <div className="ml-auto flex rounded-lg border border-zinc-700 bg-zinc-950 p-0.5 lg:ml-0">
            <button type="button" onClick={() => { setView("tabla"); setPage(1); }} aria-label="Vista lista" aria-pressed={view === "tabla"} className={`inline-flex h-8 w-9 items-center justify-center rounded-md transition-colors ${view === "tabla" ? "bg-amber-400/15 text-amber-300" : "text-zinc-500 hover:text-zinc-300"}`}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18" /><path d="M9 4v16" /></svg>
            </button>
            <button type="button" onClick={() => { setView("grilla"); setPage(1); }} aria-label="Vista grilla" aria-pressed={view === "grilla"} className={`inline-flex h-8 w-9 items-center justify-center rounded-md transition-colors ${view === "grilla" ? "bg-amber-400/15 text-amber-300" : "text-zinc-500 hover:text-zinc-300"}`}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
            </button>
          </div>
        </div>
      </div>

      {view === "tabla" ? (
        <div className="overflow-hidden rounded-2xl border border-zinc-800">
          <div className="hidden items-center gap-x-6 border-b border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-xs uppercase tracking-wider text-zinc-500 md:flex">
            <span className="min-w-[200px] flex-1">Producto</span>
            <span className="w-40">Categoría</span>
            <span className="w-24">Precio</span>
            <span className="w-28">Stock</span>
            <span className="hidden w-24 lg:block">Creado</span>
            <span className="w-8 text-center">Destacado</span>
            <span className="ml-auto w-44 text-right">Acciones</span>
          </div>
          <div>
            <ul className="divide-y divide-zinc-800">
              {pageRows.map((product) => (<ProductTableRow key={product.id} product={product} />))}
            </ul>
          </div>
          {rows.length === 0 ? (
            <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
          ) : (
            <Footer rows={rows} page={page} PAGE_SIZE={PAGE_SIZE} hasFilters={hasFilters} onClear={clearFilters} totalPages={totalPages} setPage={setPage} />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pageRows.map((product) => (<ProductTableCard key={product.id} product={product} />))}
        </div>
      )}

      {view === "grilla" && rows.length === 0 ? (
        <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
      ) : null}

      {view === "grilla" && rows.length > 0 ? (
        <div className="mt-3 flex flex-col items-end justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-xs text-zinc-500">
            <span className="tabular-nums">
              Mostrando {rows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, rows.length)} de {rows.length} productos
            </span>
          </p>
          <PaginationControls page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      ) : null}
    </div>
  );
}

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <div className="bg-zinc-950/40 px-4 py-14 text-center">
      <p className="text-3xl" aria-hidden="true">🔍</p>
      <p className="mt-3 font-medium text-zinc-300">No se encontraron productos</p>
      <p className="mt-1 text-sm text-zinc-500">Probá con otra búsqueda o cambiá el filtro de categoría.</p>
      {hasFilters ? (
        <button type="button" onClick={onClear} className="mt-4 rounded-lg border border-amber-400/40 px-4 py-1.5 text-sm font-medium text-amber-300 transition-colors hover:bg-amber-400/10">
          Limpiar filtros
        </button>
      ) : null}
    </div>
  );
}

function Footer({ rows, page, PAGE_SIZE, hasFilters, onClear, totalPages, setPage }: { rows: Product[]; page: number; PAGE_SIZE: number; hasFilters: boolean; onClear: () => void; totalPages: number; setPage: (p: number) => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 bg-zinc-950/40 px-4 py-2.5 text-xs text-zinc-500">
      <span className="tabular-nums">
        Mostrando {rows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, rows.length)} de {rows.length} productos
      </span>
      <div className="flex items-center gap-3">
        {hasFilters ? (
          <button type="button" onClick={onClear} className="inline-flex items-center gap-1.5 font-medium text-amber-300/90 transition-colors hover:text-amber-300">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            Limpiar filtros
          </button>
        ) : null}
        <PaginationControls page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  );
}
