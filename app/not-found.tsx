import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 py-24 text-center sm:px-6">
      <span className="text-6xl" aria-hidden="true">
        🔍
      </span>
      <h1 className="text-3xl font-bold text-zinc-50">
        Página no encontrada
      </h1>
      <p className="text-lg text-zinc-400">
        No encontramos lo que buscabas. Quizás la pieza se imprimió en otra
        ruta.
      </p>
      <Link
        href="/"
        className="rounded-full bg-amber-400 px-7 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-300"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
