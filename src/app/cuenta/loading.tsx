export default function CuentaLoading() {
  return (
    <main className="min-h-screen bg-neutral-950">
      {/* Hero skeleton */}
      <div className="relative overflow-hidden bg-gradient-to-b from-neutral-900 to-neutral-950 py-12">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 animate-pulse rounded-full bg-neutral-800" />
            <div className="space-y-2">
              <div className="h-6 w-48 animate-pulse rounded bg-neutral-800" />
              <div className="h-4 w-32 animate-pulse rounded bg-neutral-800" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Player card skeleton */}
        <div className="mb-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 animate-pulse rounded-full bg-neutral-800" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-40 animate-pulse rounded bg-neutral-800" />
              <div className="h-3 w-56 animate-pulse rounded bg-neutral-800" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center space-y-1">
                <div className="h-8 w-16 mx-auto animate-pulse rounded bg-neutral-800" />
                <div className="h-3 w-20 mx-auto animate-pulse rounded bg-neutral-800" />
              </div>
            ))}
          </div>
        </div>

        {/* Quick access tiles skeleton */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 space-y-3"
            >
              <div className="h-10 w-10 animate-pulse rounded-lg bg-neutral-800" />
              <div className="h-4 w-20 animate-pulse rounded bg-neutral-800" />
              <div className="h-3 w-16 animate-pulse rounded bg-neutral-800" />
            </div>
          ))}
        </div>

        {/* Addresses skeleton */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
          <div className="h-5 w-40 animate-pulse rounded bg-neutral-800" />
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 space-y-2"
            >
              <div className="h-4 w-24 animate-pulse rounded bg-neutral-800" />
              <div className="h-3 w-40 animate-pulse rounded bg-neutral-800" />
              <div className="h-3 w-56 animate-pulse rounded bg-neutral-800" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
