"use client";

function pageWindow(page: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const wanted = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...wanted].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  const result: (number | "...")[] = [];
  let prev = 0;
  for (const n of sorted) {
    if (n - prev > 1) result.push("...");
    result.push(n);
    prev = n;
  }
  return result;
}

export default function PaginationControls({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  return (
    <nav className="flex items-center gap-1" aria-label="Paginación">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 transition-colors hover:border-amber-400/60 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
      {pageWindow(page, totalPages).map((item, index) =>
        item === "..." ? (
          <span key={`e-${index}`} className="px-1 text-xs text-zinc-600">…</span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-current={item === page ? "page" : undefined}
            className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-medium tabular-nums transition-colors ${
              item === page
                ? "bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/40"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
            }`}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Página siguiente"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 transition-colors hover:border-amber-400/60 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </nav>
  );
}
