export default function DropsLoading() {
  return (
    <main className="min-h-screen bg-neutral-950">
      <div className="relative overflow-hidden bg-gradient-to-b from-neutral-900 to-neutral-950 py-16">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <div className="mx-auto mb-4 h-4 w-48 animate-pulse rounded bg-neutral-800" />
          <div className="mx-auto mb-4 h-12 w-80 animate-pulse rounded bg-neutral-800" />
          <div className="mx-auto h-4 w-96 animate-pulse rounded bg-neutral-800" />
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-xl bg-neutral-800" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 animate-pulse rounded bg-neutral-800" />
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-neutral-800" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-800" />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-neutral-800" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
