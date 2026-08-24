import type { MysteryRarity } from "@/lib/mystery-box";
import { mysteryRarityLabel } from "@/lib/mystery-box";

export const rarityStyles: Record<MysteryRarity, string> = {
  comun: "border-zinc-600/60 text-zinc-400",
  rara: "border-cyan-400/50 text-cyan-300",
  epica: "border-fuchsia-400/50 bg-fuchsia-950/30 text-fuchsia-300",
};

export default function RarityBadge({
  rarity,
  className = "",
  uppercase = true,
}: {
  rarity: MysteryRarity;
  className?: string;
  uppercase?: boolean;
}) {
  const label = mysteryRarityLabel(rarity);
  return (
    <span
      className={`pixel inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[8px] tracking-widest ${rarityStyles[rarity]} ${className}`}
    >
      {uppercase ? label.toUpperCase() : label}
    </span>
  );
}