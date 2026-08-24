"use client";

import { inputClass, labelClass } from "./form-helpers";


export default function ReservationSection({ reservation, depositMode, onDepositModeChange }: { reservation: { enabled: boolean; mode: "pct" | "fixed"; depositPct: number; depositFixed: number; note: string }; depositMode: "pct" | "fixed"; onDepositModeChange: (mode: "pct" | "fixed") => void }) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8">
      <div className="mb-5 flex items-center gap-3 border-b border-zinc-800 pb-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-violet-400/25 bg-violet-400/10 text-violet-300">
          <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
        </span>
        <div>
          <h3 className="font-semibold text-zinc-100">Reserva de drops</h3>
          <p className="text-xs text-zinc-500">Configurá la seña para reservar un drop antes de pagarlo completo.</p>
        </div>
      </div>
      <div className="space-y-5">
        <label className="inline-flex w-fit cursor-pointer items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-300">
          <input type="checkbox" name="reservation_enabled" defaultChecked={reservation.enabled} className="h-4 w-4 rounded border-zinc-600 bg-zinc-950 accent-amber-400" />
          Habilitar reserva con seña
        </label>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Modo de seña</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => onDepositModeChange("pct")} className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${depositMode === "pct" ? "border-amber-400/60 bg-amber-400/10 text-amber-300" : "border-zinc-700 text-zinc-400 hover:border-zinc-600"}`}>
                Porcentaje (%)
              </button>
              <button type="button" onClick={() => onDepositModeChange("fixed")} className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${depositMode === "fixed" ? "border-amber-400/60 bg-amber-400/10 text-amber-300" : "border-zinc-700 text-zinc-400 hover:border-zinc-600"}`}>
                Monto fijo ($)
              </button>
            </div>
            <input type="hidden" name="reservation_mode" value={depositMode} />
          </div>
          <div>
            <label htmlFor="reservation_pct" className={labelClass}>{depositMode === "pct" ? "Porcentaje de seña" : "Monto fijo de seña"}</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500">{depositMode === "pct" ? "%" : "$"}</span>
              <input id={depositMode === "pct" ? "reservation_pct" : "reservation_fixed"} name={depositMode === "pct" ? "reservation_pct" : "reservation_fixed"} type="number" min={depositMode === "pct" ? "1" : "0"} max={depositMode === "pct" ? "100" : undefined} step="1" defaultValue={depositMode === "pct" ? reservation.depositPct : reservation.depositFixed} className={`${inputClass} pl-8 tabular-nums`} placeholder={depositMode === "pct" ? "30" : "5000"} />
            </div>
            <p className="mt-1 text-xs text-zinc-500">{depositMode === "pct" ? "Porcentaje del total que se paga como seña." : "Monto fijo que se paga como seña."}</p>
          </div>
        </div>
        <div>
          <label htmlFor="reservation_note" className={labelClass}>Nota para el cliente (opcional)</label>
          <textarea id="reservation_note" name="reservation_note" rows={2} defaultValue={reservation.note} className={inputClass} placeholder="Ej: La seña es a cuenta del total y no es reembolsable." />
        </div>
      </div>
    </section>
  );
}
