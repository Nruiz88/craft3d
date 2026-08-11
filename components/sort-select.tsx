"use client";

import { useRouter } from "next/navigation";
import { catalogOrders } from "@/lib/catalog";

export default function SortSelect({
  order,
  basePath,
  extra,
}: {
  order?: string;
  basePath: string;
  extra?: Record<string, string>;
}) {
  const router = useRouter();

  function handleChange(value: string) {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(extra ?? {})) params.set(key, val);
    if (value && value !== "recientes") params.set("orden", value);
    router.push(params.size ? `${basePath}?${params.toString()}` : basePath);
  }

  return (
    <label className="inline-flex items-center gap-2 text-xs text-zinc-500">
      <span className="sr-only">Ordenar por</span>
      <select
        value={order ?? "recientes"}
        onChange={(event) => handleChange(event.target.value)}
        className="h-10 cursor-pointer rounded-full border-2 border-zinc-800 bg-zinc-900 px-3 pr-8 text-sm text-zinc-200 transition-colors focus:border-amber-400/60 focus:outline-none"
      >
        {catalogOrders.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
