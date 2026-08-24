export default function ProductLoading() {
  return (
    <main className="min-h-screen bg-neutral-950">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex gap-2">
          <div className="h-4 w-16 animate-pulse rounded bg-neutral-800" />
          <div className="h-4 w-32 animate-pulse rounded bg-neutral-800" />
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="aspect-[3/4] animate-pulse rounded-2xl bg-neutral-800" />
          <div className="space-y-6">
            <div className="h-4 w-24 animate-pulse rounded bg-neutral-800" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-neutral-800" />
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-neutral-800" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-800" />
            </div>
            <div className="h-12 w-48 animate-pulse rounded-xl bg-neutral-800" />
            <div className="h-14 w-full animate-pulse rounded-xl bg-neutral-800" />
          </div>
        </div>
      </div>
    </main>
  );
}
