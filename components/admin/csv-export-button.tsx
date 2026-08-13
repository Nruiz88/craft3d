"use client";

import { useState } from "react";

type CsvResult = { csv?: string; error?: string };

export default function CsvExportButton({
  action,
  filename,
  label = "Exportar CSV",
}: {
  action: () => Promise<CsvResult>;
  filename: string;
  label?: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setPending(true);
    setError(null);
    const result = await action();
    if (result?.csv) {
      const blob = new Blob(["\uFEFF" + result.csv], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } else if (result?.error) {
      setError(result.error);
    }
    setPending(false);
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleExport}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-amber-400/60 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg
          className="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <path d="m7 10 5 5 5-5" />
          <path d="M12 15V3" />
        </svg>
        {pending ? "Generando…" : label}
      </button>
      {error ? (
        <p className="mt-1.5 text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
