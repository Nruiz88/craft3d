"use client";

import { useActionState, useState } from "react";
import { setOrderStatusAction } from "@/app/admin/actions";
import { orderStatusLabels, type OrderStatus } from "@/lib/products/types";

const styles: Record<OrderStatus, string> = {
  pendiente: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  reserva: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
  pagado: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  enviado: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  entregado: "border-violet-500/40 bg-violet-500/10 text-violet-300",
  cancelado: "border-red-500/40 bg-red-500/10 text-red-400",
};

export default function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: number;
  status: OrderStatus;
}) {
  const [state, formAction, pending] = useActionState(setOrderStatusAction, undefined);
  const [showTracking, setShowTracking] = useState(status === "enviado");

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input type="hidden" name="id" value={orderId} />
        <select
          key={status}
          name="status"
          defaultValue={status}
          onChange={(e) => {
            const value = e.target.value as OrderStatus;
            setShowTracking(value === "enviado");
            // Guardar en DB al cambiar el estado. "enviado" espera a que se
            // cargue el nº de tracking (el form se envía con Enter o el botón).
            if (value !== "enviado") e.target.form?.requestSubmit();
          }}
          className={`h-8 rounded-full border px-2.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/30 ${styles[status]}`}
          aria-label={`Estado del pedido #${orderId}`}
        >
          {Object.entries(orderStatusLabels).map(([value, label]) => (
            <option key={value} value={value} className="bg-zinc-900 text-zinc-100">
              {label}
            </option>
          ))}
        </select>
        {showTracking && (
          <input
            type="text"
            name="tracking_number"
            autoFocus
            placeholder="Nº tracking"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            className="h-8 w-32 rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none"
          />
        )}
        {showTracking && (
          <button
            type="submit"
            disabled={pending}
            className="h-8 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 text-xs font-medium text-amber-300 transition-colors hover:bg-amber-500/20 disabled:opacity-50"
          >
            {pending ? "Guardando…" : "Guardar"}
          </button>
        )}
      </div>
      {state?.error && (
        <p className="text-xs text-red-400">{state.error}</p>
      )}
    </form>
  );
}
