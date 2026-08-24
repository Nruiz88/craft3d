import Link from "next/link";

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

const footerLinks: { title: string; links: FooterLink[] }[] = [
  {
    title: "Tienda",
    links: [
      { label: "Catálogo", href: "/catalogo" },
      { label: "Drops", href: "/drops" },
      { label: "Cajas sorpresa", href: "/mysterybox" },
      { label: "Novedades", href: "/catalogo?sort=newest" },
    ],
  },
  {
    title: "Soporte",
    links: [
      { label: "Preguntas frecuentes", href: "/faq" },
      { label: "Cómo comprar", href: "/terminos" },
      { label: "Envíos y devoluciones", href: "/envios" },
      { label: "Política de privacidad", href: "/privacidad" },
      { label: "Términos y condiciones", href: "/terminos" },
    ],
  },
  {
    title: "Contacto",
    links: [
      { label: "WhatsApp", href: "https://wa.me/5492994018220", external: true },
      { label: "Instagram", href: "https://instagram.com/craft3d.ar", external: true },
      { label: "Email", href: "mailto:contacto@craft3d.com.ar", external: true },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-zinc-800 bg-zinc-950">
      {/* Decorative top gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Main footer content */}
        <div className="grid grid-cols-1 gap-8 py-8 sm:grid-cols-2 sm:gap-10 sm:py-10 lg:grid-cols-4">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-amber-400/40 bg-amber-400/10 text-amber-400 transition-colors group-hover:border-amber-400/60 group-hover:bg-amber-400/20">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2 2.5 7v10L12 22l9.5-5V7L12 2Zm-1 2.4L4.5 8.2v6.9l6.5 3.4V4.4Zm2 0v14.1l6.5-3.4V8.2L13 4.4Z" />
                </svg>
              </div>
              <div>
                <span className="text-lg font-bold text-zinc-100">
                  Craft<span className="text-amber-400">3d</span>
                </span>
                <p className="text-[10px] pixel tracking-widest text-zinc-600">
                  IMPRESIÓN 3D
                </p>
              </div>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-500">
              Arte en filamento, impreso en 3D. Cuadros Hueforge, figuras,
              dummys y objetos únicos que salen de la impresora para tu espacio.
            </p>

            {/* Pixel art decorative element */}
            <div className="mt-5 flex items-center gap-1" aria-hidden="true">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-2 w-2 rounded-sm"
                  style={{
                    backgroundColor: i % 2 === 0 ? "rgb(251,191,36)" : "rgb(34,211,238)",
                    opacity: 0.4 + (i * 0.08),
                  }}
                />
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="pixel text-[10px] tracking-widest text-zinc-500 mb-4">
                {section.title.toUpperCase()}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-cyan-300"
                    >
                      {link.label}
                      {link.external && (
                        <svg className="h-3 w-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M7 17L17 7" />
                          <path d="M7 7h10v10" />
                        </svg>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-zinc-800 py-5 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-4">
            <p className="text-xs text-zinc-600">
              © {new Date().getFullYear()}{" "}
              <span className="font-semibold text-zinc-400">Craft3d</span> · Neuquén, Argentina
            </p>
            <span className="hidden text-zinc-700 sm:inline">·</span>
            <p className="hidden items-center gap-1.5 text-xs text-zinc-600 sm:flex">
              <span aria-hidden="true">🧵</span>
              Cada pieza se imprime y revisa a mano
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Admin link */}
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 px-3 py-1.5 text-[10px] pixel tracking-wider text-zinc-600 transition-colors hover:border-amber-400/40 hover:text-amber-400"
            >
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="9" rx="1" />
                <rect x="14" y="3" width="7" height="5" rx="1" />
                <rect x="14" y="12" width="7" height="9" rx="1" />
                <rect x="3" y="16" width="7" height="5" rx="1" />
              </svg>
              ADMIN
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
