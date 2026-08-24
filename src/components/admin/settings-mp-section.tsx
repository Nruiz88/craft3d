"use client";

import { inputClass, labelClass } from "./form-helpers";


function MpayInput({ name, label, configured, clearName, placeholder }: { name: string; label: string; configured: boolean; clearName: string; placeholder: string }) {
  return (
    <div>
      <label htmlFor={name} className={labelClass}>{label}</label>
      <div className="flex gap-2">
        <input id={name} name={name} type="password" autoComplete="off" defaultValue="" className={`${inputClass} flex-1 font-mono`} placeholder={configured ? "••••••••" : placeholder} />
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-700 px-3 text-xs text-zinc-400 transition-colors hover:border-amber-400/60 hover:text-amber-300">
          <input type="checkbox" name={clearName} className="sr-only peer" />
          <span className="hidden peer-checked:inline">🗑️</span>
          <span className="peer-checked:hidden">{configured ? "Configurado" : "Pegar"}</span>
        </label>
      </div>
      {configured ? <p className="mt-1 text-xs text-emerald-400">✓ Ya está configurado. Dejalo vacío para mantenerlo.</p> : null}
    </div>
  );
}

export default function MpSection({ mercadopagoConfigured, publicKeyConfigured }: { mercadopagoConfigured: boolean; publicKeyConfigured: boolean }) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8">
      <div className="mb-5 flex items-center gap-3 border-b border-zinc-800 pb-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-400/25 bg-cyan-400/10 text-cyan-300">
          <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
        </span>
        <div>
          <h3 className="font-semibold text-zinc-100">Mercado Pago</h3>
          <p className="text-xs text-zinc-500">Creá una aplicación en Mercado Pago Developers y pegá las claves de producción.</p>
        </div>
      </div>
      <div className="space-y-5">
        <MpayInput name="mp_access_token" label="Access token" configured={mercadopagoConfigured} clearName="clearMpAccessToken" placeholder="APP_USR-123456…" />
        <MpayInput name="mp_public_key" label="Public key" configured={publicKeyConfigured} clearName="clearMpPublicKey" placeholder="APP_USR-…" />
        <p className="rounded-lg border border-cyan-900/60 bg-cyan-950/30 px-4 py-3 text-xs leading-relaxed text-cyan-300">
          Al activarlo, en el carrito el cliente podrá elegir <strong>Mercado Pago</strong> y pagar con tarjeta, débito o dinero en cuenta.
        </p>
      </div>
    </section>
  );
}
