"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils/format";

const slides = [
  { src: "/krafty/slide-1.webp", alt: "KRAFTY — creá tus propios personajes con cartón" },
  { src: "/krafty/slide-2.webp", alt: "KRAFTY — construí lo que imagines, herramientas seguras" },
  { src: "/krafty/slide-3.webp", alt: "KRAFTY — transformá el cartón en grandes aventuras" },
];

const AUTOPLAY_MS = 4500;

export default function KraftyPromo({ price }: { price?: number }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  const go = useCallback(
    (dir: number) => setIndex((i) => (i + dir + count) % count),
    [count],
  );

  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (paused) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    timer.current = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, count]);

  return (
    <section className="krafty-hero-bg relative overflow-hidden border-b-4 border-zinc-800">
      <div className="arcade-grid absolute inset-0" />
      <div className="krafty-snow pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="crt-overlay" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-amber-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-rose-500/15 blur-3xl" />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:py-16">
        {/* ===== Texto / CTA ===== */}
        <div className="order-2 text-center lg:order-1 lg:text-left">
          <span className="pixel inline-flex items-center gap-2 rounded-sm border-2 border-rose-400/40 bg-rose-400/10 px-4 py-2 text-[10px] tracking-widest text-rose-300">
            🎄 NUEVO · EDICIÓN NAVIDAD
          </span>

          <h2 className="pixel mt-5 text-4xl leading-[1.15] text-zinc-100 sm:text-5xl">
            <span className="text-amber-300">KRAFTY</span>
          </h2>
          <p className="pixel mt-3 text-[11px] leading-relaxed tracking-widest text-zinc-400">
            HERRAMIENTAS PARA CREAR CON CARTÓN
          </p>

          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-zinc-300 lg:mx-0">
            Herramientas <span className="text-emerald-300">seguras y sin filo</span>{" "}
            para que los chicos transformen cualquier caja en castillos, cohetes y
            máscaras. <span className="text-amber-300">El regalo de esta Navidad.</span>
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
            {["🛡️ SIN FILO", "📵 SIN PANTALLAS", "🎁 PARA REGALAR"].map((chip) => (
              <span
                key={chip}
                className="pixel rounded-sm border border-zinc-700 bg-zinc-900/60 px-3 py-1.5 text-[9px] tracking-widest text-zinc-400"
              >
                {chip}
              </span>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            <Link
              href="/krafty"
              className="pixel rounded-md bg-amber-400 px-6 py-3 text-xs tracking-widest text-zinc-950 shadow-[0_0_24px_rgba(251,191,36,0.4)] transition-colors hover:bg-amber-300"
            >
              ▶ DESCUBRIR KRAFTY
            </Link>
            {typeof price === "number" ? (
              <div className="text-left">
                <p className="pixel text-[9px] tracking-widest text-zinc-500">DESDE</p>
                <p className="text-2xl font-black text-amber-300">{formatPrice(price)}</p>
              </div>
            ) : null}
          </div>
        </div>

        {/* ===== Slider ===== */}
        <div className="order-1 lg:order-2">
          <div
            className="group relative mx-auto w-full max-w-[330px]"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <Link
              href="/krafty"
              aria-label="Ver KRAFTY"
              className="krafty-frame relative block aspect-[9/16] overflow-hidden rounded-2xl bg-[#140d05]"
            >
              {slides.map((s, i) => (
                <Image
                  key={s.src}
                  src={s.src}
                  alt={s.alt}
                  fill
                  sizes="(min-width: 1024px) 330px, 85vw"
                  priority={i === 0}
                  className={`object-contain transition-opacity duration-700 ${
                    i === index ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
              <span className="pixel absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-4 py-2 text-[9px] tracking-widest text-zinc-950 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                VER PRODUCTO →
              </span>
            </Link>

            {/* Flechas */}
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Anterior"
              className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full border border-zinc-700 bg-zinc-950/70 p-2 text-zinc-300 backdrop-blur transition-colors hover:border-amber-400/60 hover:text-amber-300"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Siguiente"
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full border border-zinc-700 bg-zinc-950/70 p-2 text-zinc-300 backdrop-blur transition-colors hover:border-amber-400/60 hover:text-amber-300"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>

            {/* Puntos */}
            <div className="mt-4 flex items-center justify-center gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.src}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Ir a la imagen ${i + 1}`}
                  aria-current={i === index}
                  className={`h-2 rounded-full transition-all ${
                    i === index ? "w-6 bg-amber-400" : "w-2 bg-zinc-600 hover:bg-zinc-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
