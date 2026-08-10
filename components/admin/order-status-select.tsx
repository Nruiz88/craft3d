"use client";

import { setOrderStatusAction } from "@/app/admin/actions";
import { orderStatusLabels, type OrderStatus } from "@/lib/types";

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
  return (
    <form action={setOrderStatusAction}>
      <input type="hidden" name="id" value={orderId} />
      <select
        name="status"
        defaultValue={status}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className={`h-8 rounded-full border px-2.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/30 ${styles[status]}`}
        aria-label={`Estado del pedido #${orderId}`}
      >
        {Object.entries(orderStatusLabels).map(([value, label]) => (
          <option key={value} value={value} className="bg-zinc-900 text-zinc-100">
            {label}
          </option>
        ))}
      </select>
    </form>
  );
}
