"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { openBoxEarlyAction } from "@/app/cuenta/actions";

export default function OpenBoxEarly({
  orderId,
  itemIndex,
  coins,
  cost,
}: {
  orderId: number;
  itemIndex: number;
  coins: number;
  cost: number;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const canAfford = coins >= cost;

  async function handleOpen() {
    if (!canAfford) return;
    setPending(true);
    setMessage(null);
    const formData = new FormData();
    formData.set("orderId", String(orderId));
    formData.set("itemIndex", String(itemIndex));
    const result = await openBoxEarlyAction(formData);
    setPending(false);
    if (result?.error) {
      setMessage(result.error);
      return;
    }
    setMessage("🔥 ¡Listo! Tu caja tiene prioridad de revelación.");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleOpen}
        disabled={pending || !canAfford}
        className="inline-flex items-center gap-2 rounded-full border border-amber-400/50 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Procesando…" : `🪙 Abrir antes (${cost} monedas)`}
      </button>
      {!canAfford ? (
        <p className="text-[10px] text-zinc-600">
          Te faltan {cost - coins} monedas para abrir antes
        </p>
      ) : null}
      {message ? (
        <p className="text-[11px] text-amber-300/90" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
