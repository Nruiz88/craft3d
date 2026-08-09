"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/app/account/actions";
import type { Profile } from "@/lib/auth-user";

export default function ProfileForm({ profile }: { profile: Profile | null }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-zinc-300">
          Nombre
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          defaultValue={profile?.full_name ?? ""}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-zinc-300">
            Teléfono
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={profile?.phone ?? ""}
            placeholder="+54 9 ..."
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
          />
        </div>
        <div>
          <label htmlFor="city" className="mb-1.5 block text-sm font-medium text-zinc-300">
            Ciudad
          </label>
          <input
            id="city"
            name="city"
            type="text"
            defaultValue={profile?.city ?? ""}
            placeholder="Neuquén"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="address" className="mb-1.5 block text-sm font-medium text-zinc-300">
            Dirección
          </label>
          <input
            id="address"
            name="address"
            type="text"
            defaultValue={profile?.address ?? ""}
            placeholder="Calle y número"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
          />
        </div>
        <div>
          <label htmlFor="postalCode" className="mb-1.5 block text-sm font-medium text-zinc-300">
            Código postal
          </label>
          <input
            id="postalCode"
            name="postalCode"
            type="text"
            defaultValue={profile?.postal_code ?? ""}
            placeholder="8300"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
          />
        </div>
        <div>
          <label htmlFor="province" className="mb-1.5 block text-sm font-medium text-zinc-300">
            Provincia
          </label>
          <input
            id="province"
            name="province"
            type="text"
            defaultValue={profile?.province ?? ""}
            placeholder="Neuquén"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
          />
        </div>
      </div>

      {state?.error ? (
        <div
          className="flex items-center gap-2.5 rounded-lg border border-red-900/70 bg-red-950/30 px-4 py-2.5 text-sm text-red-400"
          role="alert"
        >
          {state.error}
        </div>
      ) : null}

      {state?.message ? (
        <div
          className="flex items-center gap-2.5 rounded-lg border border-emerald-900/70 bg-emerald-950/30 px-4 py-2.5 text-sm text-emerald-400"
          role="status"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          {state.message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-400/20 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
