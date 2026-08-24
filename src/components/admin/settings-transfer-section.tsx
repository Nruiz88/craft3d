"use client";

import { inputClass, labelClass } from "./form-helpers";


export default function TransferSection({ transfer }: { transfer: { bankName: string; holder: string; cbu: string; alias: string; note: string } }) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8">
      <div className="mb-5 flex items-center gap-3 border-b border-zinc-800 pb-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-400/25 bg-amber-400/10 text-amber-300">
          <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
        </span>
        <div>
          <h3 className="font-semibold text-zinc-100">Transferencia bancaria</h3>
          <p className="text-xs text-zinc-500">Estos datos se muestran al cliente cuando elige transferencia.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="transfer_bank_name" className={labelClass}>Banco</label>
          <input id="transfer_bank_name" name="transfer_bank_name" type="text" defaultValue={transfer.bankName} className={inputClass} placeholder="Ej: Banco Provincia" />
        </div>
        <div>
          <label htmlFor="transfer_holder" className={labelClass}>Titular de la cuenta</label>
          <input id="transfer_holder" name="transfer_holder" type="text" defaultValue={transfer.holder} className={inputClass} placeholder="Nombre completo" />
        </div>
        <div>
          <label htmlFor="transfer_cbu" className={labelClass}>CBU / CVU</label>
          <input id="transfer_cbu" name="transfer_cbu" type="text" defaultValue={transfer.cbu} className={`${inputClass} font-mono`} placeholder="0000000000000000000000" />
        </div>
        <div>
          <label htmlFor="transfer_alias" className={labelClass}>Alias</label>
          <input id="transfer_alias" name="transfer_alias" type="text" defaultValue={transfer.alias} className={`${inputClass} font-mono`} placeholder="MI_ALIAS.BANCARIO" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="transfer_note" className={labelClass}>Nota (opcional)</label>
          <textarea id="transfer_note" name="transfer_note" rows={2} defaultValue={transfer.note} className={inputClass} placeholder="Ej: Enviá el comprobante por WhatsApp" />
        </div>
      </div>
    </section>
  );
}
