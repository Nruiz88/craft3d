"use client";

import { useState } from "react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { signIn } from "next-auth/react";
import { registerAction } from "@/app/account/actions";

export default function RegisterForm({ next = "/cuenta" }: { next?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const res = await registerAction(undefined, formData);
      if (res?.error) {
        setError(res.error);
        setPending(false);
        return;
      }
      // registerAction redirige al éxito, así que no debería llegar acá.
      setPending(false);
    } catch (err) {
      if (isRedirectError(err)) {
        // Registro OK: auto-login con las mismas credenciales (como admin login).
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        if (!res || res.error) {
          window.location.href = `/ingresar?next=${encodeURIComponent(next)}&registrado=1`;
          return;
        }
        window.location.href = next;
        return;
      }
      throw err;
    }
  }

  return (
    <div className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-2xl shadow-black/40 backdrop-blur">
        <form onSubmit={onSubmit} className="space-y-5">
          <input type="hidden" name="next" value={next} />
          <div>
            <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-zinc-300">
              Nombre
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              autoComplete="name"
              placeholder="Tu nombre"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-zinc-300">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="tucorreo@ejemplo.com"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-zinc-300">
                Teléfono (opcional)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+54 9 ..."
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
              />
            </div>
            <div>
              <label htmlFor="city" className="mb-1.5 block text-sm font-medium text-zinc-300">
                Ciudad (opcional)
              </label>
              <input
                id="city"
                name="city"
                type="text"
                autoComplete="address-level2"
                placeholder="Neuquén"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="address" className="mb-1.5 block text-sm font-medium text-zinc-300">
                Dirección (opcional)
              </label>
              <input
                id="address"
                name="address"
                type="text"
                autoComplete="street-address"
                placeholder="Calle y número"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
              />
            </div>
            <div>
              <label htmlFor="postalCode" className="mb-1.5 block text-sm font-medium text-zinc-300">
                Código postal (opcional)
              </label>
              <input
                id="postalCode"
                name="postalCode"
                type="text"
                autoComplete="postal-code"
                placeholder="8300"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
              />
            </div>
            <div>
              <label htmlFor="province" className="mb-1.5 block text-sm font-medium text-zinc-300">
                Provincia (opcional)
              </label>
              <input
                id="province"
                name="province"
                type="text"
                autoComplete="address-level1"
                placeholder="Neuquén"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-zinc-300">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="Mínimo 6 caracteres"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
              />
            </div>
            <div>
              <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-zinc-300">
                Confirmar contraseña
              </label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="Repetí la contraseña"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
              />
            </div>
          </div>

          {error ? (
            <div
              className="flex items-center gap-2.5 rounded-lg border border-red-900/70 bg-red-950/30 px-4 py-2.5 text-sm text-red-400"
              role="alert"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-400/20 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 3a9 9 0 1 0 9 9" />
                </svg>
                Creando cuenta...
              </>
            ) : (
              "Crear cuenta"
            )}
          </button>
        </form>
    </div>
  );
}
