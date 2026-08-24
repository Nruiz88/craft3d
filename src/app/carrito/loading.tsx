export default function CartLoading() {
  return (
    <main className="min-h-screen bg-neutral-950">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Title */}
        <div className="mb-8 space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-neutral-800" />
          <div className="h-8 w-48 animate-pulse rounded bg-neutral-800" />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex gap-4 rounded-xl border border-neutral-800 bg-neutral-900 p-4"
              >
                <div className="h-20 w-20 animate-pulse rounded-lg bg-neutral-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-800" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-neutral-800" />
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 animate-pulse rounded bg-neutral-800" />
                    <div className="h-6 w-12 animate-pulse rounded bg-neutral-800" />
                    <div className="h-8 w-8 animate-pulse rounded bg-neutral-800" />
                  </div>
                </div>
                <div className="h-5 w-20 animate-pulse rounded bg-neutral-800" />
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
            <div className="h-6 w-32 animate-pulse rounded bg-neutral-800" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="h-4 w-24 animate-pulse rounded bg-neutral-800" />
                <div className="h-4 w-16 animate-pulse rounded bg-neutral-800" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-20 animate-pulse rounded bg-neutral-800" />
                <div className="h-4 w-12 animate-pulse rounded bg-neutral-800" />
              </div>
              <div className="border-t border-neutral-800 pt-3">
                <div className="flex justify-between">
                  <div className="h-5 w-16 animate-pulse rounded bg-neutral-800" />
                  <div className="h-5 w-20 animate-pulse rounded bg-neutral-800" />
                </div>
              </div>
            </div>
            <div className="h-12 w-full animate-pulse rounded-full bg-neutral-800" />
          </div>
        </div>
      </div>
    </main>
  );
}
