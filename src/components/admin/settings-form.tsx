"use client";

import { useActionState, useState } from "react";
import { saveSettingsAction } from "@/app/admin/actions";
import type { AdminFormState } from "@/app/admin/actions";
import MpSection from "./settings-mp-section";
import TransferSection from "./settings-transfer-section";
import ReservationSection from "./settings-reservation-section";
import ShippingSection from "./settings-shipping-section";

export default function SettingsForm({
  mercadopagoConfigured,
  publicKeyConfigured,
  transfer,
  reservation,
  shipping,
}: {
  mercadopagoConfigured: boolean;
  publicKeyConfigured: boolean;
  transfer: { bankName: string; holder: string; cbu: string; alias: string; note: string };
  reservation: { enabled: boolean; mode: "pct" | "fixed"; depositPct: number; depositFixed: number; note: string };
  shipping: {
    correo: { enabled: boolean; customerId: string; userToken: string; passwordToken: string; postalCodeOrigin: string; weightGrams: number; environment: "PROD" | "TEST" };
    freeShipping: { enabled: boolean; from: number };
  };
}) {
  const [state, formAction, pending] = useActionState(saveSettingsAction, undefined);
  const [depositMode, setDepositMode] = useState<"pct" | "fixed">(reservation.mode);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error ? (
        <div role="alert" className="rounded-xl border border-red-900/70 bg-red-950/30 px-4 py-3 text-sm text-red-400">{state.error}</div>
      ) : null}
      {!state?.error && state ? (
        <div role="status" className="rounded-xl border border-emerald-900/70 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300">Configuración guardada.</div>
      ) : null}

      <MpSection mercadopagoConfigured={mercadopagoConfigured} publicKeyConfigured={publicKeyConfigured} />
      <TransferSection transfer={transfer} />
      <ReservationSection reservation={reservation} depositMode={depositMode} onDepositModeChange={setDepositMode} />
      <ShippingSection shipping={shipping} />

      <div className="flex items-center justify-end gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-6 py-4">
        <button type="submit" disabled={pending} className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-7 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60">
          {pending ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9" /></svg>
              Guardando...
            </>
          ) : "Guardar configuración"}
        </button>
      </div>
    </form>
  );
}
