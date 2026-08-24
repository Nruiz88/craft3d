"use client";

import { inputClass, labelClass } from "./form-helpers";


export default function ShippingSection({ shipping }: { shipping: { correo: { enabled: boolean; customerId: string; userToken: string; passwordToken: string; postalCodeOrigin: string; weightGrams: number; environment: "PROD" | "TEST" }; freeShipping: { enabled: boolean; from: number } } }) {
  return (
    <>
      {/* Correo Argentino */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-3 border-b border-zinc-800 pb-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-400/25 bg-emerald-400/10 text-emerald-300">
            <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
          </span>
          <div>
            <h3 className="font-semibold text-zinc-100">Envíos — Correo Argentino</h3>
            <p className="text-xs text-zinc-500">Cotización automática en el carrito. Configurá las credenciales de MiCorreo.</p>
          </div>
        </div>
        <div className="space-y-5">
          <label className="inline-flex w-fit cursor-pointer items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-300">
            <input type="checkbox" name="shipping_enabled" defaultChecked={shipping.correo.enabled} className="h-4 w-4 rounded border-zinc-600 bg-zinc-950 accent-amber-400" />
            Habilitar envíos por Correo Argentino
          </label>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="correo_customer_id" className={labelClass}>Customer ID</label>
              <div className="flex gap-2">
                <input id="correo_customer_id" name="correo_customer_id" type="text" defaultValue={shipping.correo.customerId} className={`${inputClass} flex-1 font-mono`} placeholder={shipping.correo.customerId ? "••••••••" : "12345"} />
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-700 px-3 text-xs text-zinc-400 transition-colors hover:border-amber-400/60 hover:text-amber-300">
                  <input type="checkbox" name="clearCorreoCustomerId" className="sr-only peer" />
                  <span className="hidden peer-checked:inline">🗑️</span>
                  <span className="peer-checked:hidden">{shipping.correo.customerId ? "Configurado" : "Pegar"}</span>
                </label>
              </div>
            </div>
            <div>
              <label htmlFor="correo_user_token" className={labelClass}>User Token</label>
              <div className="flex gap-2">
                <input id="correo_user_token" name="correo_user_token" type="password" autoComplete="off" defaultValue="" className={`${inputClass} flex-1 font-mono`} placeholder={shipping.correo.userToken ? "••••••••" : "tk_..."} />
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-700 px-3 text-xs text-zinc-400 transition-colors hover:border-amber-400/60 hover:text-amber-300">
                  <input type="checkbox" name="clearCorreoUserToken" className="sr-only peer" />
                  <span className="hidden peer-checked:inline">🗑️</span>
                  <span className="peer-checked:hidden">{shipping.correo.userToken ? "Configurado" : "Pegar"}</span>
                </label>
              </div>
            </div>
            <div>
              <label htmlFor="correo_password_token" className={labelClass}>Password Token</label>
              <div className="flex gap-2">
                <input id="correo_password_token" name="correo_password_token" type="password" autoComplete="off" defaultValue="" className={`${inputClass} flex-1 font-mono`} placeholder={shipping.correo.passwordToken ? "••••••••" : "pk_..."} />
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-700 px-3 text-xs text-zinc-400 transition-colors hover:border-amber-400/60 hover:text-amber-300">
                  <input type="checkbox" name="clearCorreoPasswordToken" className="sr-only peer" />
                  <span className="hidden peer-checked:inline">🗑️</span>
                  <span className="peer-checked:hidden">{shipping.correo.passwordToken ? "Configurado" : "Pegar"}</span>
                </label>
              </div>
            </div>
            <div>
              <label htmlFor="correo_postal_code_origin" className={labelClass}>CP de origen</label>
              <input id="correo_postal_code_origin" name="correo_postal_code_origin" type="text" defaultValue={shipping.correo.postalCodeOrigin} className={`${inputClass} font-mono`} placeholder="8300" />
            </div>
            <div>
              <label htmlFor="correo_weight_grams" className={labelClass}>Peso default (gramos)</label>
              <input id="correo_weight_grams" name="correo_weight_grams" type="number" min="1" max="25000" step="1" defaultValue={shipping.correo.weightGrams} className={`${inputClass} tabular-nums`} placeholder="500" />
            </div>
            <div>
              <label htmlFor="correo_environment" className={labelClass}>Entorno</label>
              <select id="correo_environment" name="correo_environment" defaultValue={shipping.correo.environment} className={inputClass}>
                <option value="PROD">Producción</option>
                <option value="TEST">Test</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Envío gratis */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-3 border-b border-zinc-800 pb-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-400/25 bg-emerald-400/10 text-emerald-300">
            <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
          </span>
          <div>
            <h3 className="font-semibold text-zinc-100">Envío gratis</h3>
            <p className="text-xs text-zinc-500">Mostrá una barra de progreso en el carrito cuando se acerca al umbral.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <label className="inline-flex w-fit cursor-pointer items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-300">
            <input type="checkbox" name="shipping_free_enabled" defaultChecked={shipping.freeShipping.enabled} className="h-4 w-4 rounded border-zinc-600 bg-zinc-950 accent-amber-400" />
            Habilitar envío gratis
          </label>
          <div>
            <label htmlFor="shipping_free_from" className={labelClass}>Monto mínimo para envío gratis</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500">$</span>
              <input id="shipping_free_from" name="shipping_free_from" type="number" min="0" step="1000" defaultValue={shipping.freeShipping.from} className={`${inputClass} pl-8 tabular-nums`} placeholder="80000" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
