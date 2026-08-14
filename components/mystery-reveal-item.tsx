"use client";

import { useMemo, useState, type CSSProperties } from "react";
import type { MysteryRarity } from "@/lib/mystery-box";
import RarityBadge from "./rarity-badge";

const CONFETTI_COLORS = ["#fbbf24", "#22d3ee", "#e879f9", "#34d399"];

export default function MysteryRevealItem({
  piece,
  qty = 1,
}: {
  piece: { name: string; emoji: string; rarity: MysteryRarity };
  qty?: number;
}) {
  const [opened, setOpened] = useState(false);

  const particles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        id: index,
        left: 6 + index * 7.5,
        top: 28 + (index % 3) * 6,
        color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
        dx: ((index * 37) % 140) - 70,
        dy: 50 + ((index * 23) % 60),
        delay: index * 0.05,
      })),
    [],
  );

  return (
    <div className={`mystery-reveal ${opened ? "opened" : ""}`}>
      <style>{`
        .mystery-reveal .box-bob { animation: mystery-bob 1.6s ease-in-out infinite; }
        .mystery-reveal .reveal-pop { animation: mystery-pop .45s cubic-bezier(.2,1.4,.4,1) both; }
        .mystery-reveal .reveal-pop-delay { animation: mystery-pop .45s cubic-bezier(.2,1.4,.4,1) .12s both; }
        .mystery-reveal .particle {
          position: absolute; width: 8px; height: 8px; border-radius: 2px;
          opacity: 0; pointer-events: none;
          animation: mystery-confetti .9s ease-out forwards;
        }
        @keyframes mystery-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes mystery-pop {
          0% { transform: scale(.2); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes mystery-confetti {
          0% { transform: translate(0,0) rotate(0); opacity: 1; }
          100% { transform: translate(var(--dx), var(--dy)) rotate(360deg); opacity: 0; }
        }
      `}</style>

      {!opened ? (
        <button
          type="button"
          onClick={() => setOpened(true)}
          className="flex w-full items-center justify-between gap-3 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-left transition-colors hover:border-amber-300/60 hover:bg-amber-400/15"
        >
          <span className="box-bob text-3xl" aria-hidden="true">
            🎁
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-amber-200">
              ¡Tocá para abrir tu sorpresa!
              {qty > 1 ? <span className="text-amber-300"> ×{qty}</span> : null}
            </span>
            <span className="block text-xs text-amber-200/70">
              El contenido ya está revelado y a tu nombre 🎲
            </span>
          </span>
          <span className="text-amber-300" aria-hidden="true">
            ▸
          </span>
        </button>
      ) : (
        <div className="mystery-reveal-opened relative overflow-hidden rounded-2xl border-2 border-amber-400/50 bg-gradient-to-br from-amber-950/40 to-zinc-950 p-5 text-center">
          {particles.map((p) => (
            <span
              key={p.id}
              className="particle"
              style={
                {
                  left: `${p.left}%`,
                  top: `${p.top}%`,
                  background: p.color,
                  animationDelay: `${p.delay}s`,
                  "--dx": `${p.dx}px`,
                  "--dy": `${p.dy}px`,
                } as CSSProperties
              }
              aria-hidden="true"
            />
          ))}
          <div
            className="reveal-pop text-6xl drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]"
            aria-hidden="true"
          >
            {piece.emoji}
          </div>
          <p className="reveal-pop-delay mt-2 text-lg font-bold text-zinc-50">
            {piece.name}
          </p>
          <div className="reveal-pop-delay mt-2 flex items-center justify-center gap-2">
            <RarityBadge rarity={piece.rarity} />
            {qty > 1 ? (
              <span className="pixel rounded-sm border border-amber-400/40 px-1.5 py-0.5 text-[9px] tracking-widest text-amber-300">
                ×{qty}
              </span>
            ) : null}
            <span className="pixel text-[9px] tracking-widest text-amber-300">
              SORPRESA REVELADA
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
