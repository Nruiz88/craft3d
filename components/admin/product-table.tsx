"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { categories, categoryById } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import ProductVisual from "@/components/product-visual";
import DeleteProductButton from "./delete-product-button";
import ToggleFeaturedButton from "./toggle-featured-button";

type View = "tabla" | "grilla";

const SORT_OPTIONS = [
  { value: "name-asc", label: "Nombre (A → Z)" },
  { value: "name-desc", label: "Nombre (Z → A)" },
  { value: "price-asc", label: "Precio (menor a mayor)" },
  { value: "price-desc", label: "Precio (mayor a menor)" },
  { value: "stock-asc", label: "Stock (menor a mayor)" },
  { value: "created-desc", label: "Más recientes" },
  { value: "created-asc", label: "Más antiguos" },
];

const badgeByCategory: Record<string, string> = {
  anime: "border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-300",
  gaming: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
  "cine-series": "border-rose-500/40 bg-rose-500/10 text-rose-300",
  accesorios: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  "ediciones-limitadas": "border-violet-500/40 bg-violet-500/10 text-violet-300",
  "mundial-2026": "border-sky-500/40 bg-sky-500/10 text-sky-300",
};

const thumbByCategory: Record<string, string> = {
  anime: "from-fuchsia-500/40 to-indigo-950",
  gaming: "from-cyan-500/40 to-blue-950",
  "cine-series": "from-rose-500/40 to-zinc-900",
  accesorios: "from-amber-500/40 to-yellow-950",
  "ediciones-limitadas": "from-violet-500/40 to-fuchsia-950",
  "mundial-2026": "from-sky-500/40 to-blue-950",
};

function StockBadge({ stock }: { stock: number }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium tabular-nums ${
        stock <= 0
          ? "bg-red-950/50 text-red-400"
          : stock <= 3
            ? "bg-amber-950/50 text-amber-400"
            : "bg-emerald-950/50 text-emerald-400"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          stock <= 0 ? "bg-red-400" : stock <= 3 ? "bg-amber-400" : "bg-emerald-400"
        }`}
        aria-hidden="true"
      />
      {stock <= 0 ? "Agotado" : `${stock} u.`}
    </span>
  );
}

function Thumb({ product }: { product: Product }) {
  return (
    <span
      className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br text-xl shadow-inner ${
        thumbByCategory[product.category] ?? "from-zinc-700 to-zinc-900"
      }`}
      aria-hidden="true"
    >
      {product.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.image}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="drop-shadow">{product.emoji}</span>
      )}
    </span>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

const PAGE_SIZE = 8;

function pageWindow(page: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const wanted = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...wanted].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  const result: (number | "...")[] = [];
  let prev = 0;
  for (const n of sorted) {
    if (n - prev > 1) result.push("...");
    result.push(n);
    prev = n;
  }
  return result;
}

function PaginationControls({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  return (
    <nav className="flex items-center gap-1" aria-label="Paginación">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 transition-colors hover:border-amber-400/60 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
      {pageWindow(page, totalPages).map((item, index) =>
        item === "..." ? (
          <span key={`e-${index}`} className="px-1 text-xs text-zinc-600">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-current={item === page ? "page" : undefined}
            className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-medium tabular-nums transition-colors ${
              item === page
                ? "bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/40"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
            }`}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Página siguiente"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 transition-colors hover:border-amber-400/60 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </nav>
  );
}

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
      const okQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q);
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
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por nombre o slug..."
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 py-2 pl-10 pr-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            aria-label="Filtrar por categoría"
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-400 focus:outline-none"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.name}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            aria-label="Ordenar productos"
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-400 focus:outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
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
          <div className="ml-auto flex rounded-lg border border-zinc-700 bg-zinc-950 p-0.5 lg:ml-0">
            <button
              type="button"
              onClick={() => {
                setView("tabla");
                setPage(1);
              }}
              aria-label="Vista lista"
              aria-pressed={view === "tabla"}
              className={`inline-flex h-8 w-9 items-center justify-center rounded-md transition-colors ${
                view === "tabla" ? "bg-amber-400/15 text-amber-300" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M3 10h18" />
                <path d="M9 4v16" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => {
                setView("grilla");
                setPage(1);
              }}
              aria-label="Vista grilla"
              aria-pressed={view === "grilla"}
              className={`inline-flex h-8 w-9 items-center justify-center rounded-md transition-colors ${
                view === "grilla" ? "bg-amber-400/15 text-amber-300" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
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
              {pageRows.map((product) => (
                <li
                  key={product.id}
                  className="flex flex-wrap items-center gap-x-6 gap-y-3 bg-zinc-950/40 px-4 py-3 transition-colors hover:bg-zinc-900/60"
                >
                  <div className="flex min-w-[200px] flex-1 items-center gap-3">
                    <Thumb product={product} />
                    <div className="min-w-0">
                      <Link
                        href={`/productos/${product.slug}`}
                        target="_blank"
                        className="block truncate font-medium text-zinc-100 hover:text-amber-300"
                      >
                        {product.name}
                      </Link>
                      <span className="block truncate text-xs text-zinc-600">
                        /productos/{product.slug}
                      </span>
                    </div>
                  </div>
                  <div className="w-40">
                    <span
                      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        badgeByCategory[product.category] ?? "border-zinc-700 bg-zinc-800/60 text-zinc-300"
                      }`}
                    >
                      {categoryById[product.category]?.emoji}
                      {categoryById[product.category]?.name ?? product.category}
                    </span>
                  </div>
                  <div className="w-24 font-medium tabular-nums text-zinc-100">
                    {formatPrice(product.price)}
                  </div>
                  <div className="w-28">
                    <StockBadge stock={product.stock} />
                  </div>
                  <div className="hidden w-24 text-xs tabular-nums text-zinc-500 lg:block">
                    {formatDate(product.createdAt)}
                  </div>
                  <div className="w-8">
                    <ToggleFeaturedButton id={product.id} featured={Boolean(product.featured)} />
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <Link
                      href={`/productos/${product.slug}`}
                      target="_blank"
                      aria-label={`Ver ${product.name}`}
                      title="Ver en la tienda"
                      className="rounded-full border border-zinc-700 p-2 text-zinc-400 transition-colors hover:border-amber-400/60 hover:text-amber-300"
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </Link>
                    <Link
                      href={`/admin/productos/${product.id}/editar`}
                      className="rounded-full border border-zinc-700 px-4 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-amber-400/60 hover:text-amber-300"
                    >
                      Editar
                    </Link>
                    <DeleteProductButton id={product.id} name={product.name} />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {rows.length === 0 ? (
            <div className="bg-zinc-950/40 px-4 py-14 text-center">
              <p className="text-3xl" aria-hidden="true">
                🔍
              </p>
              <p className="mt-3 font-medium text-zinc-300">No se encontraron productos</p>
              <p className="mt-1 text-sm text-zinc-500">
                Probá con otra búsqueda o cambiá el filtro de categoría.
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
                Mostrando {rows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, rows.length)} de {rows.length} productos
              </span>
              <div className="flex items-center gap-3">
                {hasFilters ? (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1.5 font-medium text-amber-300/90 transition-colors hover:text-amber-300"
                  >
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                    Limpiar filtros
                  </button>
                ) : null}
                <PaginationControls page={page} totalPages={totalPages} onChange={setPage} />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pageRows.map((product) => (
            <article
              key={product.id}
              className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 transition-colors hover:border-zinc-700"
            >
              <div className="absolute right-3 top-3 z-10">
                <ToggleFeaturedButton id={product.id} featured={Boolean(product.featured)} />
              </div>
              <Link
                href={`/productos/${product.slug}`}
                target="_blank"
                className="block focus:outline-none"
                aria-label={product.name}
              >
                <ProductVisual
                  product={product}
                  className="aspect-square w-full transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </Link>
              <div className="flex flex-col gap-2.5 p-4">
                <div className="flex items-center justify-between gap-2 pr-9">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs ${
                      badgeByCategory[product.category] ?? "border-zinc-700 bg-zinc-800/60 text-zinc-300"
                    }`}
                  >
                    <span aria-hidden="true">{categoryById[product.category]?.emoji}</span>
                    {categoryById[product.category]?.name ?? product.category}
                  </span>
                </div>
                <p className="truncate font-semibold text-zinc-100" title={product.name}>
                  {product.name}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold tabular-nums text-amber-400">
                    {formatPrice(product.price)}
                  </span>
                  <StockBadge stock={product.stock} />
                </div>
                <div className="mt-1 flex items-center justify-between gap-2 border-t border-zinc-800 pt-2.5">
                  <span className="truncate text-xs text-zinc-500">/productos/{product.slug}</span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/productos/${product.slug}`}
                      target="_blank"
                      aria-label={`Ver ${product.name}`}
                      className="rounded-full border border-zinc-700 p-1.5 text-zinc-400 transition-colors hover:border-amber-400/60 hover:text-amber-300"
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </Link>
                    <Link
                      href={`/admin/productos/${product.id}/editar`}
                      className="rounded-full border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-amber-400/60 hover:text-amber-300"
                    >
                      Editar
                    </Link>
                    <DeleteProductButton id={product.id} name={product.name} compact />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {view === "grilla" && rows.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 px-4 py-14 text-center">
          <p className="text-3xl" aria-hidden="true">
            🔍
          </p>
          <p className="mt-3 font-medium text-zinc-300">No se encontraron productos</p>
          <p className="mt-1 text-sm text-zinc-500">
            Probá con otra búsqueda o cambiá el filtro de categoría.
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
      ) : null}

      {view === "grilla" && rows.length > 0 ? (
        <div className="mt-3 flex flex-col items-end justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-xs text-zinc-500">
            <span className="tabular-nums">
              Mostrando {rows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, rows.length)} de {rows.length} productos
            </span>
          </p>
          <PaginationControls page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      ) : null}
    </div>
  );
}
