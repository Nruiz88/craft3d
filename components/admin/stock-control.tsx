"use client";

import { useState, useTransition } from "react";
import { updateStockAction } from "@/app/admin/actions";

export default function StockControl({
  id,
  stock,
}: {
  id: number;
  stock: number;
}) {
  const [value, setValue] = useState(stock);
  const [pending, startTransition] = useTransition();

  function change(delta: number) {
    const next = Math.max(0, value + delta);
    if (next === value) return;
    setValue(next);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", String(id));
      formData.set("stock", String(next));
      await updateStockAction(formData);
    });
  }

  return (
    <div
      className="flex w-28 items-center gap-1 rounded-full border border-zinc-700 bg-zinc-950 px-1 py-0.5"
      aria-label={`Stock de ${value} unidades`}
    >
      <button
        type="button"
        onClick={() => change(-1)}
        disabled={pending || value <= 0}
        aria-label="Quitar una unidad de stock"
        className="inline-flex h-6 w-6 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
      >
        −
      </button>
      <span
        className={`min-w-0 flex-1 text-center text-xs font-bold tabular-nums ${
          value <= 0
            ? "text-red-400"
            : value <= 3
              ? "text-amber-400"
              : "text-emerald-400"
        }`}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => change(1)}
        disabled={pending}
        aria-label="Agregar una unidad de stock"
        className="inline-flex h-6 w-6 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-amber-300 disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}
