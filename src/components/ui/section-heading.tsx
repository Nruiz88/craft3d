import Link from "next/link";

export default function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="pixel text-[11px] uppercase tracking-widest text-cyan-300 neon-cyan">
            <span className="text-zinc-600" aria-hidden="true">
              {"// "}
            </span>
            {eyebrow}
          </p>
        ) : null}
        <h2 className="pixel mt-3 text-lg leading-snug text-zinc-100 sm:text-xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
            {description}
          </p>
        ) : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="pixel shrink-0 rounded-md border border-amber-400/40 px-4 py-2 text-[11px] tracking-widest text-amber-300 transition-colors hover:border-amber-400 hover:bg-amber-400/10"
        >
          {linkLabel ?? "Ver todos"} ▸
        </Link>
      ) : null}
    </div>
  );
}
