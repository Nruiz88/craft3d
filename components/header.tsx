import Link from "next/link";
import { getCurrentUser } from "@/lib/auth-user";
import CartBadge from "./cart-badge";

function CubeLogo() {
  return (
    <svg
      className="h-7 w-7 text-amber-400"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2 2.5 7v10L12 22l9.5-5V7L12 2Zm-1 2.4L4.5 8.2v6.9l6.5 3.4V4.4Zm2 0v14.1l6.5-3.4V8.2L13 4.4Z" />
      <path d="m12 11.8-6.5-3.6 1-1.8 6.5 3.6-1 1.8Z" fill="#fbbf24" opacity="0.6" />
    </svg>
  );
}

export default async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <CubeLogo />
          <span className="pixel text-base tracking-widest text-zinc-50 transition-colors group-hover:text-amber-300">
            Craft<span className="neon-amber">3d</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-zinc-400 sm:flex">
          <Link
            href="/#catalogo"
            className="transition-colors hover:text-cyan-300"
          >
            Catálogo
          </Link>
          <Link
            href="/#categorias"
            className="transition-colors hover:text-cyan-300"
          >
            Categorías
          </Link>
          <Link
            href="/#proceso"
            className="transition-colors hover:text-cyan-300"
          >
            Proceso
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/cuenta"
              className="inline-flex max-w-[10rem] items-center gap-2 truncate rounded-full border border-zinc-700 px-3.5 py-1.5 text-sm font-medium text-zinc-200 transition-colors hover:border-amber-400/60 hover:text-amber-300"
            >
              <svg className="h-4 w-4 shrink-0 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
              </svg>
              <span className="truncate">{user.fullName || "Mi cuenta"}</span>
            </Link>
          ) : (
            <Link
              href="/ingresar"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-1.5 text-sm font-medium text-zinc-200 transition-colors hover:border-amber-400/60 hover:text-amber-300"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <path d="m10 17 5-5-5-5" />
                <path d="M15 12H3" />
              </svg>
              Ingresar
            </Link>
          )}
          <CartBadge />
        </div>
      </div>
    </header>
  );
}
