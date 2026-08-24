"use client";

interface DropScarcityBarProps {
  totalUnits: number;
  remaining: number;
  sold: number;
  soldPct: number;
  outOfStock: boolean;
}

export default function DropScarcityBar({
  totalUnits,
  remaining,
  sold,
  soldPct,
  outOfStock,
}: DropScarcityBarProps) {
  if (totalUnits <= 0) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className={outOfStock ? "text-red-400" : "text-zinc-400"}>
          {outOfStock
            ? "Tiraje agotado"
            : `Se agotaron ${sold} de ${totalUnits} unidades`}
        </span>
        <span className="tabular-nums text-zinc-500">
          {soldPct}% vendido
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full border-2 border-zinc-800 bg-zinc-950">
        <div
          className={`h-full transition-all ${
            soldPct >= 85
              ? "bg-gradient-to-r from-rose-600 to-rose-400"
              : "bg-gradient-to-r from-amber-600 to-amber-300"
          }`}
          style={{ width: `${soldPct}%` }}
        />
      </div>
    </div>
  );
}
