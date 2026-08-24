export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header skeleton */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="h-4 w-48 animate-pulse rounded bg-zinc-800" />
          <div className="mt-2 h-8 w-40 animate-pulse rounded bg-zinc-800" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-zinc-800" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-36 animate-pulse rounded-full bg-zinc-800" />
          <div className="h-10 w-28 animate-pulse rounded-full bg-zinc-800" />
        </div>
      </div>

      {/* KPI skeleton */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5"
          >
            <div className="mb-3 h-9 w-9 animate-pulse rounded-lg bg-zinc-800" />
            <div className="h-7 w-24 animate-pulse rounded bg-zinc-800" />
            <div className="mt-2 h-3 w-32 animate-pulse rounded bg-zinc-800" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-5 w-28 animate-pulse rounded bg-zinc-800" />
                  <div className="mt-2 h-3 w-48 animate-pulse rounded bg-zinc-800" />
                </div>
                <div className="h-6 w-20 animate-pulse rounded-full bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-8">
          <div className="rounded-2xl border border-zinc-800 p-4">
            <div className="h-4 w-40 animate-pulse rounded bg-zinc-800 mb-4" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="mb-3">
                <div className="h-3 w-full animate-pulse rounded bg-zinc-800" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
