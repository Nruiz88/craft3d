"use client";

import { useState, type FormEvent } from "react";
import { joinRestockAction } from "@/app/restock/actions";

export default function RestockForm({
  productName,
  productSlug,
  compact = false,
  className = "",
}: {
  productName: string;
  productSlug: string;
  compact?: boolean;
  className?: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const result = await joinRestockAction(undefined, formData);
    if (result?.ok) {
      setJoined(true);
    } else if (result?.error) {
      setError(result.error);
    }
    setPending(false);
  }

  if (joined) {
    return (
      <div
        className={`rounded-2xl border-2 border-emerald-500/40 bg-emerald-950/20 p-5 ${className}`}
        role="status"
      >
        <p className="pixel text-[10px] tracking-widest text-emerald-300">
          ✓ TE AVISAMOS AL REPONER
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-300">
          Te contactamos apenas vuelva a estar disponible{" "}
          <strong className="text-emerald-300">{productName}</strong>.
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <form
        onSubmit={handleSubmit}
        className={`flex flex-col gap-2 sm:flex-row ${className}`}
      >
        <input type="hidden" name="productSlug" value={productSlug} />
        <input type="hidden" name="productName" value={productName} />
        <input
          type="email"
          name="email"
          required
          placeholder="tu@email.com"
          aria-label="Tu email para avisarte"
          className="h-11 min-w-0 flex-1 rounded-md border-2 border-zinc-700 bg-zinc-950/80 px-4 text-sm text-zinc-200 transition-colors placeholder:text-zinc-600 focus:border-cyan-400/60 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="pixel inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-amber-400 px-5 text-[10px] tracking-widest text-zinc-950 transition-all hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "…" : "🔔 AVISAME"}
        </button>
        {error ? (
          <p className="text-xs text-rose-400" role="alert">
            {error}
          </p>
        ) : null}
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-2xl border-2 border-zinc-700 bg-zinc-900/50 p-5 ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="pixel text-[10px] tracking-widest text-cyan-300">
          🔔 AVISO DE REPOSICIÓN
        </p>
        <span className="pixel rounded-sm border border-zinc-700 bg-zinc-950/60 px-2 py-0.5 text-[9px] tracking-widest text-zinc-400">
          SIN COSTO
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">
        Dejá tu email y te avisamos apenas repongamos{" "}
        <strong className="text-zinc-200">{productName}</strong>.
      </p>

      <input type="hidden" name="productSlug" value={productSlug} />
      <input type="hidden" name="productName" value={productName} />

      <div className="mt-4 space-y-2.5">
        <input
          type="email"
          name="email"
          required
          placeholder="Tu email"
          aria-label="Tu email"
          className="h-11 w-full rounded-md border-2 border-zinc-700 bg-zinc-950/80 px-4 text-sm text-zinc-200 transition-colors placeholder:text-zinc-600 focus:border-cyan-400/60 focus:outline-none"
        />
        <input
          type="tel"
          name="whatsapp"
          placeholder="WhatsApp (opcional)"
          aria-label="WhatsApp (opcional)"
          className="h-11 w-full rounded-md border-2 border-zinc-700 bg-zinc-950/80 px-4 text-sm text-zinc-200 transition-colors placeholder:text-zinc-600 focus:border-cyan-400/60 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-amber-400 px-5 py-3 text-sm font-semibold text-zinc-950 transition-all active:scale-[0.98] hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Anotando…" : "🔔 Avisarme cuando repongan"}
      </button>

      {error ? (
        <p
          className="mt-3 rounded-lg border border-red-900/70 bg-red-950/30 px-3 py-2 text-center text-xs text-red-400"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <p className="mt-3 text-center text-xs text-zinc-500">
        Un solo aviso, sin spam.
      </p>
    </form>
  );
}
