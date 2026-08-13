"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
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
  reservation,
  shipping,
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
  reservation: {
    enabled: boolean;
    mode: "pct" | "fixed";
    depositPct: number;
    depositFixed: number;
    note: string;
  };
  shipping: {
    correo: {
      enabled: boolean;
      customerId: string;
      userToken: string;
      passwordToken: string;
      postalCodeOrigin: string;
      weightGrams: number;
      environment: "PROD" | "TEST";
    };
    freeShipping: { enabled: boolean; from: number };
  };
}) {
  const [state, formAction, pending] = useActionState(saveSettingsAction, undefined);
  const [depositMode, setDepositMode] = useState<"pct" | "fixed">(
    reservation.mode,
  );

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

      <Section
        title="Reservas de drops"
        hint="Reserva y pre-reserva de ediciones limitadas pagando un porcentaje (seña)."
      >
        <div className="space-y-5">
          <label className="inline-flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              name="reservation_enabled"
              defaultChecked={reservation.enabled}
              className="h-5 w-5 rounded border-zinc-600 bg-zinc-950 accent-amber-400"
            />
            <span>
              <span className="block text-sm font-medium text-zinc-100">
                Habilitar reservas con seña en drops
              </span>
              <span className="block text-xs text-zinc-500">
                Aparece el botón “Reservar con seña” en los drops activos y
                próximos.
              </span>
            </span>
          </label>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Tipo de seña</label>
              <div className="flex gap-2">
                <label
                  className={`flex-1 cursor-pointer rounded-xl border px-3 py-2.5 text-center text-sm font-medium transition-colors ${
                    depositMode === "pct"
                      ? "border-amber-400/60 bg-amber-400/5 text-amber-300"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="reservation_mode"
                    value="pct"
                    checked={depositMode === "pct"}
                    onChange={() => setDepositMode("pct")}
                    className="sr-only"
                  />
                  Porcentaje
                </label>
                <label
                  className={`flex-1 cursor-pointer rounded-xl border px-3 py-2.5 text-center text-sm font-medium transition-colors ${
                    depositMode === "fixed"
                      ? "border-amber-400/60 bg-amber-400/5 text-amber-300"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="reservation_mode"
                    value="fixed"
                    checked={depositMode === "fixed"}
                    onChange={() => setDepositMode("fixed")}
                    className="sr-only"
                  />
                  Monto fijo
                </label>
              </div>
            </div>

            {depositMode === "pct" ? (
              <div>
                <label htmlFor="reservation_pct" className={labelClass}>
                  Porcentaje de la seña
                </label>
                <input
                  id="reservation_pct"
                  name="reservation_pct"
                  type="number"
                  min={1}
                  max={100}
                  defaultValue={reservation.depositPct}
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-zinc-500">
                  Se calcula sobre el precio de cada drop.
                </p>
              </div>
            ) : (
              <div>
                <label htmlFor="reservation_fixed" className={labelClass}>
                  Monto fijo de la seña (AR$)
                </label>
                <input
                  id="reservation_fixed"
                  name="reservation_fixed"
                  type="number"
                  min={1}
                  step={100}
                  defaultValue={reservation.depositFixed || ""}
                  className={inputClass}
                  placeholder="Ej: 19500"
                />
                <p className="mt-1 text-xs text-zinc-500">
                  El mismo monto en todos los drops (nunca mayor al precio).
                </p>
              </div>
            )}

            <div className="sm:col-span-2">
              <label htmlFor="reservation_note" className={labelClass}>
                Nota para el cliente
              </label>
              <textarea
                id="reservation_note"
                name="reservation_note"
                rows={2}
                defaultValue={reservation.note}
                className={inputClass}
                placeholder="Ej: El resto se abona antes del envío, coordinado por WhatsApp."
              />
            </div>
          </div>
        </div>
      </Section>

      <Section
        title="Envíos (Correo Argentino)"
        hint="Cotización de envío a domicilio en el carrito usando MiCorreo."
      >
        <div className="space-y-5">
          <label className="inline-flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              name="shipping_enabled"
              defaultChecked={shipping.correo.enabled}
              className="h-5 w-5 rounded border-zinc-600 bg-zinc-950 accent-amber-400"
            />
            <span>
              <span className="block text-sm font-medium text-zinc-100">
                Habilitar cotización de envío en el carrito
              </span>
              <span className="block text-xs text-zinc-500">
                El cliente ingresa su código postal y elige entre envío a
                domicilio o retiro en sucursal.
              </span>
            </span>
          </label>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <MpayInput
              name="correo_customer_id"
              label="Customer ID"
              configured={Boolean(shipping.correo.customerId)}
              clearName="clearCorreoCustomerId"
              placeholder="MiCorreo customer ID"
            />
            <div>
              <label
                htmlFor="correo_postal_code_origin"
                className={labelClass}
              >
                Código postal de origen
              </label>
              <input
                id="correo_postal_code_origin"
                name="correo_postal_code_origin"
                type="text"
                defaultValue={shipping.correo.postalCodeOrigin}
                className={`${inputClass} font-mono`}
                placeholder="8300"
              />
            </div>
            <MpayInput
              name="correo_user_token"
              label="User token"
              configured={Boolean(shipping.correo.userToken)}
              clearName="clearCorreoUserToken"
              placeholder="MiCorreo user token"
            />
            <MpayInput
              name="correo_password_token"
              label="Password token"
              configured={Boolean(shipping.correo.passwordToken)}
              clearName="clearCorreoPasswordToken"
              placeholder="MiCorreo password token"
            />
            <div>
              <label htmlFor="correo_weight_grams" className={labelClass}>
                Peso del paquete (gramos)
              </label>
              <input
                id="correo_weight_grams"
                name="correo_weight_grams"
                type="number"
                min={1}
                max={25000}
                defaultValue={shipping.correo.weightGrams}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-zinc-500">
                Peso estimado usado para cotizar (hasta 25 kg).
              </p>
            </div>
            <div>
              <label className={labelClass}>Entorno</label>
              <div className="flex gap-2">
                {(["PROD", "TEST"] as const).map((env) => (
                  <label
                    key={env}
                    className={`flex-1 cursor-pointer rounded-xl border px-3 py-2.5 text-center text-sm font-medium transition-colors ${
                      shipping.correo.environment === env
                        ? "border-amber-400/60 bg-amber-400/5 text-amber-300"
                        : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="correo_environment"
                      value={env}
                      defaultChecked={shipping.correo.environment === env}
                      className="sr-only"
                    />
                    {env === "PROD" ? "Producción" : "Pruebas"}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section
        title="Envío gratis"
        hint="Mostrado como barra de progreso en el carrito."
      >
        <div className="space-y-5">
          <label className="inline-flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              name="shipping_free_enabled"
              defaultChecked={shipping.freeShipping.enabled}
              className="h-5 w-5 rounded border-zinc-600 bg-zinc-950 accent-amber-400"
            />
            <span>
              <span className="block text-sm font-medium text-zinc-100">
                Habilitar envío gratis
              </span>
              <span className="block text-xs text-zinc-500">
                El envío es gratis cuando el pedido supera el umbral.
              </span>
            </span>
          </label>
          <div>
            <label htmlFor="shipping_free_from" className={labelClass}>
              Umbral de envío gratis (AR$)
            </label>
            <input
              id="shipping_free_from"
              name="shipping_free_from"
              type="number"
              min={0}
              step={100}
              defaultValue={shipping.freeShipping.from}
              className={inputClass}
              placeholder="Ej: 80000"
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
