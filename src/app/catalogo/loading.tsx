export default function CatalogoLoading() {
  return (
    <main className="min-h-screen bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-neutral-800" />
          <div className="h-8 w-64 animate-pulse rounded bg-neutral-800" />
        </div>
        <div className="mb-6 flex gap-3">
          <div className="h-10 w-64 animate-pulse rounded-lg bg-neutral-800" />
          <div className="h-10 w-40 animate-pulse rounded-lg bg-neutral-800" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
              <div className="aspect-square animate-pulse rounded-lg bg-neutral-800" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-800" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-800" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
