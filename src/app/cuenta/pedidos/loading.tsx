export default function PedidosLoading() {
  return (
    <main className="min-h-screen bg-neutral-950">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Title */}
        <div className="mb-8 space-y-2">
          <div className="h-4 w-24 animate-pulse rounded bg-neutral-800" />
          <div className="h-8 w-40 animate-pulse rounded bg-neutral-800" />
        </div>

        {/* Order cards */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-neutral-800 bg-neutral-900 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-neutral-800" />
                  <div className="h-3 w-48 animate-pulse rounded bg-neutral-800" />
                </div>
                <div className="h-6 w-20 animate-pulse rounded-full bg-neutral-800" />
              </div>
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <div className="h-10 w-10 animate-pulse rounded-lg bg-neutral-800" />
                    <div className="flex-1 space-y-1">
                      <div className="h-4 w-40 animate-pulse rounded bg-neutral-800" />
                      <div className="h-3 w-24 animate-pulse rounded bg-neutral-800" />
                    </div>
                    <div className="h-4 w-16 animate-pulse rounded bg-neutral-800" />
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between border-t border-neutral-800 pt-4">
                <div className="h-4 w-24 animate-pulse rounded bg-neutral-800" />
                <div className="h-4 w-20 animate-pulse rounded bg-neutral-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
