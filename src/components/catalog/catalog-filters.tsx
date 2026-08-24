"use client";

import { useState } from "react";
import { categories } from "@/lib/products";
import type { CatalogAvailability } from "@/lib/products/catalog";

const priceRanges = [
  { label: "Todos", min: undefined, max: undefined },
  { label: "< $10.000", min: undefined, max: 10000 },
  { label: "$10.000 – $30.000", min: 10000, max: 30000 },
  { label: "$30.000 – $60.000", min: 30000, max: 60000 },
  { label: "> $60.000", min: 60000, max: undefined },
];

interface FilterState {
  categories: string[];
  priceRange: number;
  availability: CatalogAvailability;
}

interface CatalogFiltersProps {
  initial: FilterState;
  counts: Map<string, number>;
  totalProducts: number;
  onApply: (filters: {
    categories: string[];
    priceMin?: number;
    priceMax?: number;
    availability: CatalogAvailability;
  }) => void;
}

export default function CatalogFilters({
  initial,
  counts,
  totalProducts,
  onApply,
}: CatalogFiltersProps) {
  const [selected, setSelected] = useState<FilterState>(initial);
  const [priceInput, setPriceInput] = useState({
    min: initial.priceRange >= 0 ? priceRanges[initial.priceRange]?.min?.toString() ?? "" : "",
    max: initial.priceRange >= 0 ? priceRanges[initial.priceRange]?.max?.toString() ?? "" : "",
  });

  const availableCategories = categories.filter(
    (c) => c.id !== "drops" && c.id !== "mystery-box",
  );

  function toggleCategory(id: string) {
    setSelected((prev) => {
      const next = prev.categories.includes(id)
        ? prev.categories.filter((c) => c !== id)
        : [...prev.categories, id];
      return { ...prev, categories: next };
    });
  }

  function setPriceRange(idx: number) {
    setSelected((prev) => ({ ...prev, priceRange: idx }));
    const range = priceRanges[idx];
    setPriceInput({
      min: range.min?.toString() ?? "",
      max: range.max?.toString() ?? "",
    });
  }

  function handleApply() {
    const range = priceRanges[selected.priceRange];
    onApply({
      categories: selected.categories,
      priceMin: range.min,
      priceMax: range.max,
      availability: selected.availability,
    });
  }

  function handleClear() {
    setSelected({ categories: [], priceRange: 0, availability: "all" });
    setPriceInput({ min: "", max: "" });
    onApply({ categories: [], availability: "all" });
  }

  const hasActiveFilters =
    selected.categories.length > 0 ||
    selected.priceRange !== 0 ||
    selected.availability !== "all";

  return (
    <div className="space-y-5">
      {/* ── Categorías ── */}
      <div>
        <p className="pixel mb-2.5 text-[10px] tracking-widest text-zinc-500">
          CATEGORÍA
        </p>
        <div className="flex flex-wrap gap-2">
          {availableCategories.map((cat) => {
            const active = selected.categories.includes(cat.id);
            const count = counts.get(cat.id) ?? 0;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? "border-amber-400/50 bg-amber-400/15 text-amber-300"
                    : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
                <span className="ml-0.5 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Precio ── */}
      <div>
        <p className="pixel mb-2.5 text-[10px] tracking-widest text-zinc-500">
          PRECIO
        </p>
        <div className="flex flex-wrap gap-2">
          {priceRanges.map((range, idx) => {
            const active = selected.priceRange === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setPriceRange(idx)}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? "border-cyan-400/50 bg-cyan-400/15 text-cyan-300"
                    : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
                }`}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Disponibilidad ── */}
      <div>
        <p className="pixel mb-2.5 text-[10px] tracking-widest text-zinc-500">
          DISPONIBILIDAD
        </p>
        <div className="flex flex-wrap gap-2">
          {([
            { value: "all" as const, label: "Todos", icon: "◈" },
            { value: "in-stock" as const, label: "En stock", icon: "●" },
            { value: "out-of-stock" as const, label: "Agotados", icon: "○" },
          ]).map((opt) => {
            const active = selected.availability === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setSelected((prev) => ({ ...prev, availability: opt.value }))
                }
                className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? "border-fuchsia-400/50 bg-fuchsia-400/15 text-fuchsia-300"
                    : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
                }`}
              >
                <span className={active ? "text-fuchsia-400" : "text-zinc-600"}>
                  {opt.icon}
                </span>
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Acciones ── */}
      <div className="flex items-center gap-3 border-t border-zinc-800/60 pt-4">
        <button
          type="button"
          onClick={handleApply}
          className="rounded-md border-2 border-amber-400/60 bg-amber-400/10 px-5 py-2 text-xs font-bold tracking-wider text-amber-300 transition-colors hover:bg-amber-400/20"
        >
          APLICAR FILTROS
        </button>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-md border border-zinc-700 px-4 py-2 text-xs text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
          >
            Limpiar todo
          </button>
        ) : null}
      </div>
    </div>
  );
}
