import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 text-sm text-zinc-500 sm:flex-row sm:px-6">
        <p>
          © {new Date().getFullYear()} <span className="font-semibold text-zinc-300">Craft3d</span> — Impresión 3D
          y arte en filamento.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <p className="flex items-center gap-2">
            <span aria-hidden="true">🧵</span> Cada pieza se imprime y revisa a mano.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/terminos"
              className="text-xs text-zinc-500 transition-colors hover:text-cyan-300"
            >
              Términos
            </Link>
            <Link
              href="/envios"
              className="text-xs text-zinc-500 transition-colors hover:text-cyan-300"
            >
              Envíos y devoluciones
            </Link>
            <Link
              href="/privacidad"
              className="text-xs text-zinc-500 transition-colors hover:text-cyan-300"
            >
              Privacidad
            </Link>
          </div>
          <Link
            href="/admin"
            className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-500 transition-colors hover:border-amber-400/50 hover:text-amber-300"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
