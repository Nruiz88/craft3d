import Link from "next/link";

export default function AuthShell({
  title,
  subtitle,
  children,
  maxWidth = "max-w-3xl",
}: {
  title: string;
  subtitle: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10 sm:px-6">
      <div className={`mx-auto ${maxWidth}`}>
        {/* Hero header */}
        <div className="relative mb-8 overflow-hidden rounded-3xl border-2 border-amber-400/30 bg-gradient-to-br from-zinc-900 via-zinc-950 to-amber-950/20 p-8 sm:p-10">
          <div className="crt-overlay" aria-hidden="true" />

          {/* Decorative grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            aria-hidden="true"
            style={{
              backgroundImage:
                "linear-gradient(rgba(251,191,36,1) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,1) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-amber-400/40 bg-amber-400/10">
                <svg className="h-7 w-7 text-amber-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2 2.5 7v10L12 22l9.5-5V7L12 2Zm-1 2.4L4.5 8.2v6.9l6.5 3.4V4.4Zm2 0v14.1l6.5-3.4V8.2L13 4.4Z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
                  {title}
                </h1>
                <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div>{children}</div>

        {/* Back link */}
        <p className="mt-8 text-center text-sm text-zinc-600">
          <Link href="/" className="transition-colors hover:text-amber-300">
            ← Volver a la tienda
          </Link>
        </p>
      </div>
    </div>
  );
}
