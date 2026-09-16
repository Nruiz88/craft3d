"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";

function errorMessage(key: string): string {
  switch (key) {
    case "oauth":
      return "No se pudo completar el inicio de sesión. Probá de nuevo.";
    case "config":
      return "La autenticación no está configurada correctamente.";
    default:
      return key;
  }
}

function safeTarget(next?: string): string {
  return next?.startsWith("/") && !next.startsWith("//") ? next : "/cuenta";
}

export default function LoginForm({
  next = "/cuenta",
  error: initError,
}: {
  next?: string;
  error?: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(initError ?? null);
  const [pending, setPending] = useState(false);
  const target = safeTarget(next);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    if (!res || res.error) {
      setError("Email o contraseña incorrectos");
      setPending(false);
      return;
    }
    window.location.href = target;
  }

  return (
    <div className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-2xl shadow-black/40 backdrop-blur">
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
          {errorMessage(error)}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: target })}
        className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-zinc-700 bg-zinc-950 px-6 py-2.5 text-sm font-medium text-zinc-100 transition-colors hover:border-zinc-500 hover:bg-zinc-900"
      >
        <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.46a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.1 3.56-5.18 3.56-8.82Z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.94-2.91l-3.88-3a7.15 7.15 0 0 1-10.68-3.76H1.29v3.11A12 12 0 0 0 12 24Z" />
          <path fill="#FBBC05" d="M5.38 14.33a7.2 7.2 0 0 1 0-4.66V6.56H1.29a12 12 0 0 0 0 10.88l4.09-3.11Z" />
          <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.58 1.8l3.44-3.44A12 12 0 0 0 1.3 6.55l4.09 3.11A7.16 7.16 0 0 1 12 4.77Z" />
        </svg>
        Continuar con Google
      </button>

      <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-zinc-600">
        <span className="h-px flex-1 bg-zinc-800" />
        o con tu email
        <span className="h-px flex-1 bg-zinc-800" />
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tucorreo@ejemplo.com"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-zinc-300">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
          />
        </div>

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
              Ingresando...
            </>
          ) : (
            "Ingresar"
          )}
        </button>
      </form>

      <p className="text-center text-sm text-zinc-500">
        ¿No tenés cuenta?{" "}
        <Link href="/registrarse" className="font-medium text-amber-300 transition-colors hover:text-amber-200">
          Crear una cuenta
        </Link>
      </p>
    </div>
  );
}
