export default function Section({
  icon,
  title,
  hint,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8">
      <div className="mb-5 flex items-center gap-3 border-b border-zinc-800 pb-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-400/25 bg-amber-400/10 text-amber-300">
          {icon}
        </span>
        <div>
          <h3 className="font-semibold text-zinc-100">{title}</h3>
          {hint ? <p className="text-xs text-zinc-500">{hint}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}
