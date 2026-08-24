"use client";

import type { DropStatus } from "@/lib/drops";

interface DropStatusBannerProps {
  status: DropStatus;
  reservationQuery?: {
    status?: string;
    orderId?: string | number;
  } | null;
}

export default function DropStatusBanner({ status, reservationQuery }: DropStatusBannerProps) {
  if (!reservationQuery?.status) return null;

  return (
    <div
      className={`mb-6 rounded-2xl border-2 p-5 ${
        reservationQuery.status === "exito"
          ? "border-emerald-500/40 bg-emerald-950/20"
          : reservationQuery.status === "pendiente"
            ? "border-amber-400/40 bg-amber-400/5"
            : "border-rose-500/40 bg-rose-950/20"
      }`}
    >
      {reservationQuery.status === "exito" ? (
        <>
          <p className="pixel text-[10px] tracking-widest text-emerald-300">
            ✓ SEÑA ACREDITADA · PEDIDO #{reservationQuery.orderId ?? "?"}
          </p>
          <p className="mt-2 text-sm text-zinc-300">
            Tu reserva está confirmada. Te contactamos por WhatsApp para
            coordinar el resto y el envío.
          </p>
        </>
      ) : reservationQuery.status === "pendiente" ? (
        <>
          <p className="pixel text-[10px] tracking-widest text-amber-300">
            🕐 PAGO PENDIENTE · PEDIDO #{reservationQuery.orderId ?? "?"}
          </p>
          <p className="mt-2 text-sm text-zinc-300">
            Tu reserva quedó registrada. Apenas se confirme la seña desde
            Mercado Pago te avisamos.
          </p>
        </>
      ) : (
        <>
          <p className="pixel text-[10px] tracking-widest text-rose-300">
            ⚠️ EL PAGO NO SE COMPLETÓ
          </p>
          <p className="mt-2 text-sm text-zinc-300">
            Podés reintentarlo con Mercado Pago o elegir transferencia
            bancaria en el panel de reserva de abajo.
          </p>
        </>
      )}
    </div>
  );
}
