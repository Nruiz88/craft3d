"use client";

import { useEffect, useState } from "react";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export default function DropCountdown({ target }: { target: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const targetTime = new Date(target).getTime();
    const tick = () => setRemaining(Math.max(0, targetTime - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  if (remaining === null) return null;

  if (remaining <= 0) {
    return (
      <p className="pixel animate-blink text-lg tracking-widest text-emerald-400">
        ▶ DROP 001 · ABIERTO
      </p>
    );
  }

  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor(remaining / 3_600_000) % 24;
  const minutes = Math.floor(remaining / 60_000) % 60;
  const seconds = Math.floor(remaining / 1000) % 60;

  const cells = [
    { label: "DÍAS", value: days },
    { label: "HS", value: hours },
    { label: "MIN", value: minutes },
    { label: "SEG", value: seconds },
  ];

  return (
    <div className="flex flex-wrap gap-2.5">
      {cells.map((cell) => (
        <div
          key={cell.label}
          className="flex min-w-[64px] flex-col items-center gap-1 rounded-md border-2 border-zinc-800 bg-black/70 px-3 py-2"
        >
          <span className="pixel text-xl leading-none tracking-widest text-amber-300 neon-amber sm:text-2xl">
            {pad(cell.value)}
          </span>
          <span className="pixel text-[8px] tracking-widest text-zinc-500">
            {cell.label}
          </span>
        </div>
      ))}
    </div>
  );
}
