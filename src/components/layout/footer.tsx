import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-zinc-800 bg-zinc-950">
      {/* Top decorative line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

      {/* Grid overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(251,191,36,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.3) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }} />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Main grid */}
        <div className="grid grid-cols-2 gap-6 py-8 sm:grid-cols-4 sm:py-10">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-400/40 bg-amber-400/10 text-amber-400 transition-colors group-hover:border-amber-400/60">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2 2.5 7v10L12 22l9.5-5V7L12 2Zm-1 2.4L4.5 8.2v6.9l6.5 3.4V4.4Zm2 0v14.1l6.5-3.4V8.2L13 4.4Z" />
                </svg>
              </div>
              <span className="text-base font-bold text-zinc-100">
                Craft<span className="text-amber-400">3d</span>
              </span>
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-zinc-600">
              Arte en filamento, impreso en 3D. Neuquén, Argentina.
            </p>
            {/* Social icons */}
            <div className="mt-4 flex items-center gap-2">
              <a
                href="https://wa.me/5492994018220"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-500 transition-colors hover:border-green-500/40 hover:text-green-400"
                title="WhatsApp"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/craft3d.ar"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-500 transition-colors hover:border-pink-500/40 hover:text-pink-400"
                title="Instagram"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="mailto:contacto@craft3d.com.ar"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-500 transition-colors hover:border-cyan-500/40 hover:text-cyan-400"
                title="Email"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </a>
            </div>
          </div>

          {/* Tienda */}
          <div>
            <h3 className="mb-3 text-[10px] font-bold tracking-widest text-amber-400/70">TIENDA</h3>
            <ul className="space-y-2">
              {[
                { label: "Catálogo", href: "/catalogo" },
                { label: "Drops", href: "/drops" },
                { label: "Cajas Sorpresa", href: "/mysterybox" },
                { label: "Novedades", href: "/catalogo?sort=newest" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-zinc-500 transition-colors hover:text-amber-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categorías */}
          <div>
            <h3 className="mb-3 text-[10px] font-bold tracking-widest text-cyan-400/70">CATEGORÍAS</h3>
            <ul className="space-y-2">
              {[
                { label: "Anime", href: "/anime" },
                { label: "Gaming", href: "/gaming" },
                { label: "Cine y Series", href: "/cine-series" },
                { label: "Accesorios", href: "/accesorios" },
                { label: "Mundial 2026", href: "/mundial-2026" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-zinc-500 transition-colors hover:text-cyan-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <h3 className="mb-3 text-[10px] font-bold tracking-widest text-fuchsia-400/70">AYUDA</h3>
            <ul className="space-y-2">
              {[
                { label: "FAQ", href: "/faq" },
                { label: "Cómo Comprar", href: "/terminos" },
                { label: "Envíos", href: "/envios" },
                { label: "Privacidad", href: "/privacidad" },
                { label: "Términos", href: "/terminos" },
              ].map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-zinc-500 transition-colors hover:text-fuchsia-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-zinc-800/60 py-4 sm:flex-row">
          <div className="flex items-center gap-3 text-[10px] text-zinc-700">
            <span>© {new Date().getFullYear()} Craft3d</span>
            <span className="text-zinc-800">·</span>
            <span>Neuquén, Argentina</span>
            <span className="text-zinc-800">·</span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              100% a mano
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
