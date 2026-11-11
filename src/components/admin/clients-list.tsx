"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils/date";
import { formatPrice } from "@/lib/utils/format";

export interface ClientRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  province: string;
  address: string;
  postalCode: string;
  provider: string;
  confirmed: boolean;
  createdAt: string | null;
  ordersCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
}

const providerLabels: Record<string, string> = {
  email: "Email",
  google: "Google",
};

function initials(name: string, email: string): string {
  const source = name.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const last = parts[1]?.[0] ?? "";
  return (first + last).toUpperCase();
}

export default function ClientsList({ rows }: { rows: ClientRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q),
    );
  }, [rows, query]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full lg:max-w-xs">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, email o teléfono…"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 py-2 pl-10 pr-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none"
          />
        </div>
        <p className="text-xs text-zinc-500 tabular-nums">
          {filtered.length} de {rows.length}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-800">
        {filtered.length === 0 ? (
          <div className="bg-zinc-950/40 px-4 py-14 text-center">
            <p className="text-3xl" aria-hidden="true">
              🔍
            </p>
            <p className="mt-3 font-medium text-zinc-300">
              No se encontraron clientes
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Probá con otro nombre, email o teléfono.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {filtered.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/admin/clientes/${r.id}`}
                  className="flex flex-wrap items-center gap-x-6 gap-y-3 bg-zinc-950/40 px-4 py-3.5 transition-colors hover:bg-zinc-900/60"
                >
                  <div className="flex min-w-[220px] flex-1 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-sm font-semibold text-amber-300">
                      {initials(r.name, r.email)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-zinc-100">
                        {r.name || "Cliente"}
                      </p>
                      <p className="truncate text-xs text-zinc-500">{r.email}</p>
                    </div>
                  </div>

                  <div className="w-40">
                    <p className="truncate text-sm text-zinc-300">
                      {r.phone || "—"}
                    </p>
                    <p className="truncate text-xs text-zinc-600">
                      {r.city || "Sin ciudad"}
                      {r.province ? `, ${r.province}` : ""}
                    </p>
                  </div>

                  <div className="w-28">
                    <p className="text-sm font-semibold tabular-nums text-zinc-100">
                      {r.ordersCount} {r.ordersCount === 1 ? "pedido" : "pedidos"}
                    </p>
                    <p className="truncate text-xs text-emerald-400/90 tabular-nums">
                      {r.totalSpent > 0 ? formatPrice(r.totalSpent) : "—"}
                    </p>
                  </div>

                  <div className="flex w-24 flex-col gap-1">
                    <span
                      className={`inline-flex w-fit items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        r.provider === "google"
                          ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                          : "border-amber-500/40 bg-amber-500/10 text-amber-300"
                      }`}
                    >
                      {providerLabels[r.provider] ?? r.provider}
                    </span>
                    {!r.confirmed ? (
                      <span className="w-fit rounded-full border border-red-900/60 bg-red-950/30 px-2.5 py-0.5 text-xs text-red-400">
                        Sin confirmar
                      </span>
                    ) : null}
                  </div>

                  <div className="hidden w-24 text-xs tabular-nums text-zinc-500 lg:block">
                    {r.lastOrderAt ? (
                      <>Últ. pedido: {formatDate(r.lastOrderAt)}</>
                    ) : (
                      <>Alta: {formatDate(r.createdAt)}</>
                    )}
                  </div>

                  <svg
                    className="hidden h-4 w-4 shrink-0 text-zinc-600 lg:block"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
