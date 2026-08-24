"use client";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4">
      <div className="text-6xl">💥</div>
      <h2 className="font-pixel text-lg text-red-400">Algo salió mal</h2>
      <p className="max-w-md text-center text-neutral-400">
        {error.message || "Ocurrió un error inesperado. Probá de nuevo."}
      </p>
      {error.digest && (
        <p className="font-mono text-xs text-neutral-600">
          Error ID: {error.digest}
        </p>
      )}
      <button
        onClick={reset}
        className="rounded-lg bg-yellow-400 px-6 py-3 font-pixel text-xs text-black transition hover:bg-yellow-300"
      >
        ▶ INTENTAR DE NUEVO
      </button>
    </main>
  );
}
