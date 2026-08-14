"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { confirmMysteryRevealAction } from "@/app/admin/actions";
import type { RevealEntry } from "@/app/admin/mysterybox/revelaciones/page";
import RarityBadge from "../rarity-badge";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

export default function RevealPanel({ entries }: { entries: RevealEntry[] }) {
  const router = useRouter();
  const [revealing, setRevealing] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm(entry: RevealEntry) {
    setError(null);
    setRevealing(entry.orderId);
    const formData = new FormData();
    formData.set("orderId", String(entry.orderId));
    formData.set("itemIndex", String(entry.itemIndex));
    const result = await confirmMysteryRevealAction(formData);
    setRevealing(null);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-red-900/70 bg-red-950/30 px-4 py-3 text-sm text-red-400"
        >
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-zinc-800">
        <div className="hidden items-center gap-x-6 border-b border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-xs uppercase tracking-wider text-zinc-500 md:flex">
          <span className="min-w-[160px] flex-1">Pedido</span>
          <span className="w-40">Caja</span>
          <span className="w-32">Piezas</span>
          <span className="w-28">Pendientes</span>
          <span className="ml-auto w-44 text-right">Acción</span>
        </div>

        <ul className="divide-y divide-zinc-800">
          {entries.map((entry) => (
            <li
              key={`${entry.orderId}-${entry.itemIndex}`}
              className="bg-zinc-950/40 px-4 py-3 transition-colors hover:bg-zinc-900/60"
            >
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <div className="min-w-[160px] flex-1">
                  <div className="flex items-center gap-2">
                    <LinkOrder id={entry.orderId} />
                    {entry.priority ? (
                      <span className="pixel shrink-0 rounded-sm border border-orange-400/50 bg-orange-500/10 px-1.5 py-0.5 text-[8px] tracking-widest text-orange-300">
                        🔥 PRIORIDAD
                      </span>
                    ) : null}
                  </div>
                  <span className="block text-xs text-zinc-600">
                    {entry.customerName} · {formatDate(entry.createdAt)}
                  </span>
                </div>
                <div className="flex w-40 items-center gap-2">
                  <span className="text-lg" aria-hidden="true">
                    {entry.boxEmoji}
                  </span>
                  <span className="truncate text-sm text-zinc-200">
                    {entry.boxName}
                  </span>
                </div>
                <div className="w-32 text-xs text-zinc-400">
                  {entry.poolLabel}
                </div>
                <div className="w-28 text-xs font-medium tabular-nums text-amber-300">
                  {entry.pending} {entry.pending === 1 ? "pendiente" : "pendientes"}
                </div>
                <div className="ml-auto w-44 text-right">
                  <button
                    type="button"
                    onClick={() => handleConfirm(entry)}
                    disabled={revealing !== null}
                    className="inline-flex items-center gap-2 rounded-full border border-amber-400/50 px-4 py-2 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {revealing === entry.orderId ? (
                      <>
                        <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                          <path d="M12 3a9 9 0 1 0 9 9" />
                        </svg>
                        Revelando...
                      </>
                    ) : (
                      <>🎁 Revelar caja</>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {entry.pieces.length > 0 ? (
                  entry.pieces.map((piece) => (
                    <span
                      key={piece.slug}
                      className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-[11px] text-zinc-300"
                    >
                      <span aria-hidden="true">{piece.emoji}</span>
                      <span className="truncate">{piece.name}</span>
                      {piece.qty > 1 ? (
                        <span className="font-medium text-amber-300">
                          ×{piece.qty}
                        </span>
                      ) : null}
                      <RarityBadge rarity={piece.rarity} className="shrink-0" />
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-zinc-600">
                    Sin piezas seleccionadas — editá la caja.
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-zinc-600">
        Al revelar se entregan <strong className="text-zinc-400">todas las
        piezas</strong> de la caja (con su cantidad) y se descuentan de su stock
        real del catálogo.
      </p>
    </div>
  );
}

function LinkOrder({ id }: { id: number }) {
  return (
    <Link
      href={`/admin/ventas?q=${id}`}
      className="block truncate font-medium text-zinc-100 hover:text-amber-300"
    >
      #{id}
    </Link>
  );
}