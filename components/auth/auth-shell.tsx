import Link from "next/link";

function CubeLogo() {
  return (
    <svg
      className="h-12 w-12 text-amber-400"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2 2.5 7v10L12 22l9.5-5V7L12 2Zm-1 2.4L4.5 8.2v6.9l6.5 3.4V4.4Zm2 0v14.1l6.5-3.4V8.2L13 4.4Z" />
      <path
        d="m12 11.8-6.5-3.6 1-1.8 6.5 3.6-1 1.8Z"
        fill="#fbbf24"
        opacity="0.6"
      />
    </svg>
  );
}

export default function AuthShell({
  title,
  subtitle,
  children,
  maxWidth = "max-w-md",
}: {
  title: string;
  subtitle: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  return (
    <div className="hero-grid relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-[36rem] -translate-x-1/2 rounded-full bg-amber-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-24 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />

      <div className={`relative w-full ${maxWidth}`}>
        <div className="mb-8 text-center">
          <CubeLogo />
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-50">
            {title}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
        </div>

        {children}

        <p className="mt-6 text-center text-sm text-zinc-500">
          <Link href="/" className="transition-colors hover:text-amber-300">
            ← Volver a la tienda
          </Link>
        </p>
      </div>
    </div>
  );
}
