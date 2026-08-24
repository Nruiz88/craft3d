export default function HomeLoading() {
  return (
    <main className="min-h-screen bg-neutral-950">
      {/* Hero skeleton */}
      <div className="relative overflow-hidden bg-gradient-to-b from-neutral-900 to-neutral-950 py-20">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <div className="mx-auto mb-4 h-4 w-64 animate-pulse rounded bg-neutral-800" />
          <div className="mx-auto mb-4 h-16 w-80 animate-pulse rounded bg-neutral-800" />
          <div className="mx-auto mb-8 h-4 w-96 animate-pulse rounded bg-neutral-800" />
          <div className="mx-auto h-12 w-48 animate-pulse rounded-full bg-neutral-800" />

          {/* Stats skeleton */}
          <div className="mt-12 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center space-y-2">
                <div className="h-8 w-16 mx-auto animate-pulse rounded bg-neutral-800" />
                <div className="h-3 w-20 mx-auto animate-pulse rounded bg-neutral-800" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories skeleton */}
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-4 h-4 w-36 animate-pulse rounded bg-neutral-800" />
        <div className="mb-8 h-8 w-48 animate-pulse rounded bg-neutral-800" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="h-4 w-24 animate-pulse rounded bg-neutral-800" />
                <div className="h-3 w-12 animate-pulse rounded bg-neutral-800" />
              </div>
              <div className="mb-4 flex justify-center">
                <div className="h-16 w-16 animate-pulse rounded-xl bg-neutral-800" />
              </div>
              <div className="h-5 w-32 mx-auto animate-pulse rounded bg-neutral-800" />
              <div className="mt-2 h-3 w-full animate-pulse rounded bg-neutral-800" />
            </div>
          ))}
        </div>
      </div>

      {/* Products skeleton */}
      <div className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-4 h-4 w-44 animate-pulse rounded bg-neutral-800" />
        <div className="mb-8 h-8 w-56 animate-pulse rounded bg-neutral-800" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-neutral-800 bg-neutral-900 p-4"
            >
              <div className="aspect-[3/4] animate-pulse rounded-lg bg-neutral-800" />
              <div className="mt-3 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-800" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-800" />
                <div className="flex items-center justify-between">
                  <div className="h-5 w-20 animate-pulse rounded bg-neutral-800" />
                  <div className="h-8 w-8 animate-pulse rounded-full bg-neutral-800" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
