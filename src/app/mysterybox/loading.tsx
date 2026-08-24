export default function MysteryBoxLoading() {
  return (
    <main className="min-h-screen bg-neutral-950">
      {/* Hero skeleton */}
      <div className="relative overflow-hidden bg-gradient-to-b from-neutral-900 to-neutral-950 py-16">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <div className="mx-auto mb-4 h-4 w-48 animate-pulse rounded bg-neutral-800" />
          <div className="mx-auto mb-4 h-12 w-80 animate-pulse rounded bg-neutral-800" />
          <div className="mx-auto h-4 w-96 animate-pulse rounded bg-neutral-800" />
          <div className="mx-auto mt-6 h-10 w-32 animate-pulse rounded-full bg-neutral-800" />
        </div>
      </div>

      {/* Social proof skeleton */}
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-4 h-4 w-40 animate-pulse rounded bg-neutral-800" />
        <div className="mb-8 h-8 w-64 animate-pulse rounded bg-neutral-800" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-4"
            >
              <div className="h-10 w-10 animate-pulse rounded-full bg-neutral-800" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 animate-pulse rounded bg-neutral-800" />
                <div className="h-3 w-32 animate-pulse rounded bg-neutral-800" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Box cards skeleton */}
      <div className="mx-auto max-w-4xl px-4 pb-16">
        <div className="mb-4 h-4 w-40 animate-pulse rounded bg-neutral-800" />
        <div className="mb-8 h-8 w-56 animate-pulse rounded bg-neutral-800" />
        <div className="grid gap-6 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6"
            >
              <div className="mb-4 flex gap-2">
                <div className="h-6 w-20 animate-pulse rounded-full bg-neutral-800" />
                <div className="h-6 w-16 animate-pulse rounded-full bg-neutral-800" />
              </div>
              <div className="mb-3 h-6 w-3/4 animate-pulse rounded bg-neutral-800" />
              <div className="mb-4 space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-neutral-800" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-800" />
              </div>
              <div className="flex items-center justify-between">
                <div className="h-8 w-24 animate-pulse rounded bg-neutral-800" />
                <div className="h-10 w-32 animate-pulse rounded-full bg-neutral-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
