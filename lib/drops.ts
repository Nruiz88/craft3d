export type DropStatus = "active" | "upcoming" | "past";

export function dropStatus(
  product: {
    dropStartsAt: string | null;
    dropEndsAt: string | null;
  },
  now: number,
): DropStatus {
  const start = product.dropStartsAt
    ? new Date(product.dropStartsAt).getTime()
    : null;
  const end = product.dropEndsAt
    ? new Date(product.dropEndsAt).getTime()
    : null;

  if (start != null && start > now) return "upcoming";
  if (end != null && end < now) return "past";
  return "active";
}

export function formatDropDateTime(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const dropStatusConfig: Record<
  DropStatus,
  { label: string; className: string }
> = {
  active: {
    label: "● ABIERTO",
    className: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300",
  },
  upcoming: {
    label: "▶ PRÓXIMO",
    className: "border-amber-400/50 bg-amber-400/10 text-amber-300",
  },
  past: {
    label: "■ FINALIZADO",
    className: "border-zinc-700 bg-zinc-900/60 text-zinc-500",
  },
};
