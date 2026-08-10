"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveSettingsAction } from "@/app/admin/actions";

const inputClass =
  "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none";

const labelClass = "mb-1.5 block text-sm font-medium text-zinc-300";

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8">
      <div className="mb-5 border-b border-zinc-800 pb-4">
        <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
        {hint ? <p className="mt-0.5 text-xs text-zinc-500">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

function MpayInput({
  name,
  label,
  configured,
  clearName,
  placeholder,
}: {
  name: string;
  label: string;
  configured: boolean;
  clearName: string;
  placeholder: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <label htmlFor={name} className={labelClass}>
          {label}
        </label>
        {configured ? (
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-300">
            Configurado
          </span>
        ) : (
          <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            Sin clave
          </span>
        )}
      </div>
      <input
        id={name}
        name={name}
        type="password"
        autoComplete="off"
        className={`${inputClass} font-mono`}
        placeholder={placeholder}
      />
      {configured ? (
        <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-xs text-zinc-500">
          <input
            type="checkbox"
            name={clearName}
            className="h-4 w-4 rounded border-zinc-600 bg-zinc-950 accent-red-400"
          />
          Borrar esta clave guardada
        </label>
      ) : null}
      <p className="mt-1 text-xs text-zinc-500">
        Dejalo vacío para mantener la clave actual.
      </p>
    </div>
  );
}

export default function SettingsForm({
  mercadopagoConfigured,
  publicKeyConfigured,
  transfer,
}: {
  mercadopagoConfigured: boolean;
  publicKeyConfigured: boolean;
  transfer: {
    bankName: string;
    holder: string;
    cbu: string;
    alias: string;
    note: string;
  };
}) {
  const [state, formAction, pending] = useActionState(saveSettingsAction, undefined);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-900/70 bg-red-950/30 px-4 py-3 text-sm text-red-400"
        >
          {state.error}
        </div>
      ) : null}

      {!state?.error && state ? (
        <div
          role="status"
          className="rounded-xl border border-emerald-900/70 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300"
        >
          Configuración guardada.
        </div>
      ) : null}

      <Section
        title="Mercado Pago"
        hint="Creá una aplicación en Mercado Pago Developers y pegá las claves de producción."
      >
        <div className="space-y-5">
          <MpayInput
            name="mp_access_token"
            label="Access token"
            configured={mercadopagoConfigured}
            clearName="clearMpAccessToken"
            placeholder="APP_USR-123456…"
          />
          <MpayInput
            name="mp_public_key"
            label="Public key"
            configured={publicKeyConfigured}
            clearName="clearMpPublicKey"
            placeholder="APP_USR-…"
          />
          <p className="rounded-lg border border-cyan-900/60 bg-cyan-950/30 px-4 py-3 text-xs leading-relaxed text-cyan-300">
            Al activarlo, en el carrito el cliente podrá elegir{" "}
            <strong>Mercado Pago</strong> y pagar con tarjeta, débito o dinero en
            cuenta. Los pedidos se marcan como <strong>pagados</strong>
            automáticamente al confirmarse el pago.
          </p>
        </div>
      </Section>

      <Section
        title="Transferencia bancaria"
        hint="Estos datos se muestran al cliente cuando elige transferencia."
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="transfer_bank_name" className={labelClass}>
              Banco
            </label>
            <input
              id="transfer_bank_name"
              name="transfer_bank_name"
              type="text"
              defaultValue={transfer.bankName}
              className={inputClass}
              placeholder="Ej: Banco Provincia"
            />
          </div>
          <div>
            <label htmlFor="transfer_holder" className={labelClass}>
              Titular de la cuenta
            </label>
            <input
              id="transfer_holder"
              name="transfer_holder"
              type="text"
              defaultValue={transfer.holder}
              className={inputClass}
              placeholder="Nombre y apellido"
            />
          </div>
          <div>
            <label htmlFor="transfer_cbu" className={labelClass}>
              CBU
            </label>
            <input
              id="transfer_cbu"
              name="transfer_cbu"
              type="text"
              defaultValue={transfer.cbu}
              className={`${inputClass} font-mono`}
              placeholder="0000003100000000000000"
            />
          </div>
          <div>
            <label htmlFor="transfer_alias" className={labelClass}>
              Alias
            </label>
            <input
              id="transfer_alias"
              name="transfer_alias"
              type="text"
              defaultValue={transfer.alias}
              className={`${inputClass} font-mono`}
              placeholder="craft3d.cuenta.3d"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="transfer_note" className={labelClass}>
              Nota para el cliente
            </label>
            <textarea
              id="transfer_note"
              name="transfer_note"
              rows={2}
              defaultValue={transfer.note}
              className={inputClass}
              placeholder="Ej: Enviá el comprobante por WhatsApp y coordinamos el envío."
            />
          </div>
        </div>
      </Section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-6 py-4">
        <p className="text-xs text-zinc-500">
          Los cambios se aplican de inmediato en la tienda.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin"
            className="rounded-full border border-zinc-700 px-6 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-7 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Guardando..." : "Guardar configuración"}
          </button>
        </div>
      </div>
    </form>
  );
}
