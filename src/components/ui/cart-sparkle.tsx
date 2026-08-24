"use client";

import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  distance: number;
  rotation: number;
  shape: "star" | "circle" | "square";
  delay: number;
}

const COLORS = [
  "#fbbf24", // amber
  "#f59e0b", // amber-dark
  "#22d3ee", // cyan
  "#a855f7", // purple
  "#34d399", // emerald
  "#fb7185", // rose
  "#fff",    // white
];

function createParticles(count = 18): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 200,
    y: -(Math.random() * 180 + 40),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: Math.random() * 6 + 3,
    angle: Math.random() * 360,
    distance: Math.random() * 80 + 40,
    rotation: Math.random() * 720 - 360,
    shape: (["star", "circle", "square"] as const)[Math.floor(Math.random() * 3)],
    delay: Math.random() * 200,
  }));
}

function ParticleShape({ shape, size, color }: { shape: string; size: number; color: string }) {
  if (shape === "star") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
      </svg>
    );
  }
  if (shape === "square") {
    return (
      <div
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: 1,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: "50%",
      }}
    />
  );
}

export default function CartSparkle({ trigger }: { trigger: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (trigger) {
      setParticles(createParticles());
      setKey((k) => k + 1);
    }
  }, [trigger]);

  if (!trigger || particles.length === 0) return null;

  return (
    <div
      key={key}
      className="pointer-events-none absolute inset-0 z-30 overflow-visible"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute left-1/2 top-1/2"
          style={{
            animation: `cart-sparkle-fly 0.7s ${p.delay}ms ease-out forwards`,
            "--tx": `${p.x}px`,
            "--ty": `${p.y}px`,
            "--rot": `${p.rotation}deg`,
          } as React.CSSProperties}
        >
          <ParticleShape shape={p.shape} size={p.size} color={p.color} />
        </span>
      ))}
    </div>
  );
}
