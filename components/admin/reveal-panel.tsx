"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  drawMysteryPieceAction,
  confirmMysteryRevealAction,
  type RevealPieceResult,
} from "@/app/admin/actions";
import type { RevealEntry } from "@/app/admin/mysterybox/revelaciones/page";

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
  const [drawn, setDrawn] = useState<{
    orderId: number;
    itemIndex: number;
    piece: { slug: string; name: string; emoji: string };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleDraw(entry: RevealEntry) {
    setError(null);
    setRevealing(entry.orderId);
    setDrawn(null);
    const formData = new FormData();
    formData.set("orderId", String(entry.orderId));
    formData.set("itemIndex", String(entry.itemIndex));
    const result = (await drawMysteryPieceAction(formData)) as RevealPieceResult;
    setRevealing(null);
    if (!result || result.error || !result.piece) {
      setError(result?.error ?? "No se pudo sortear la pieza");
      return;
    }
    setDrawn({
      orderId: entry.orderId,
      itemIndex: entry.itemIndex,
      piece: result.piece,
    });
  }

  async function handleConfirm() {
    if (!drawn) return;
    setPending(true);
    setError(null);
    const formData = new FormData();
    formData.set("orderId", String(drawn.orderId));
    formData.set("itemIndex", String(drawn.itemIndex));
    formData.set("pieceSlug", drawn.piece.slug);
    const result = await confirmMysteryRevealAction(formData);
    setPending(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setDrawn(null);
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

      {drawn ? (
        <div className="rounded-2xl border-2 border-amber-400/50 bg-zinc-900/80 p-6 shadow-[0_0_40px_rgba(251,191,36,0.12)]">
          <p className="pixel text-[10px] uppercase tracking-widest text-amber-300">
            🎁 Sorpresa sorteada
          </p>
          <div className="mt-3 flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-4xl">
              {drawn.piece.emoji}
            </span>
            <div>
              <p className="text-xl font-bold text-zinc-50">{drawn.piece.name}</p>
              <p className="text-sm text-zinc-500">
                Pedido #{drawn.orderId} · confirmá para descontar stock
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Confirmando..." : "✓ Confirmar revelación"}
            </button>
            <button
              type="button"
              onClick={() => setDrawn(null)}
              disabled={pending}
              className="rounded-full border border-zinc-700 px-6 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Volver a sortear
            </button>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-zinc-800">
        <div className="hidden items-center gap-x-6 border-b border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-xs uppercase tracking-wider text-zinc-500 md:flex">
          <span className="min-w-[160px] flex-1">Pedido</span>
          <span className="w-40">Caja</span>
          <span className="w-32">Pool</span>
          <span className="w-28">Pendientes</span>
          <span className="ml-auto w-36 text-right">Acción</span>
        </div>

        <ul className="divide-y divide-zinc-800">
          {entries.map((entry) => (
            <li
              key={`${entry.orderId}-${entry.itemIndex}`}
              className="flex flex-wrap items-center gap-x-6 gap-y-3 bg-zinc-950/40 px-4 py-3 transition-colors hover:bg-zinc-900/60"
            >
              <div className="min-w-[160px] flex-1">
                <LinkOrder id={entry.orderId} />
                <span className="block text-xs text-zinc-600">
                  {entry.customerName} · {formatDate(entry.createdAt)}
                </span>
              </div>
              <div className="flex w-40 items-center gap-2">
                <span className="text-lg" aria-hidden="true">
                  {entry.boxEmoji}
                </span>
                <span className="truncate text-sm text-zinc-200">{entry.boxName}</span>
              </div>
              <div className="w-32 text-xs text-zinc-400">{entry.poolLabel}</div>
              <div className="w-28 text-xs font-medium tabular-nums text-amber-300">
                {entry.pending} {entry.pending === 1 ? "pendiente" : "pendientes"}
              </div>
              <div className="ml-auto w-36 text-right">
                <button
                  type="button"
                  onClick={() => handleDraw(entry)}
                  disabled={revealing === entry.orderId || !!drawn}
                  className="inline-flex items-center gap-2 rounded-full border border-amber-400/50 px-4 py-2 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {revealing === entry.orderId ? (
                    <>
                      <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                        <path d="M12 3a9 9 0 1 0 9 9" />
                      </svg>
                      Sorteando...
                    </>
                  ) : (
                    <>🎲 Revelar</>
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-zinc-600">
        Cada unidad de la caja se revela una vez. La pieza sorteada descuenta su
        stock real del catálogo.
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
