"use client";

import { useEffect, useState } from "react";

/**
 * Barra de urgencia navideña: avisa la fecha límite para que el regalo llegue
 * a tiempo. Se descarta (localStorage) y se oculta sola pasadas las fiestas.
 * Para cambiarla el año que viene, actualizá las fechas y el storage key.
 */
const CUTOFF = new Date("2026-12-18T23:59:59-03:00"); // último día recomendado
const HIDE_AFTER = new Date("2026-12-26T00:00:00-03:00"); // no mostrar tras Navidad
const STORAGE_KEY = "xmas-bar-2026";

export default function ChristmasBar() {
  const [state, setState] = useState<"hidden" | "before" | "lastcall">("hidden");

  useEffect(() => {
    const now = new Date();
    if (now >= HIDE_AFTER) return;
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      // sin localStorage: la mostramos igual
    }
    // Estado solo-cliente: depende de localStorage y la fecha, por eso se
    // resuelve recién tras el montado (evita mismatch de hidratación).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(now <= CUTOFF ? "before" : "lastcall");
  }, []);

  if (state === "hidden") return null;

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignorar
    }
    setState("hidden");
  };

  return (
    <div className="relative z-20 bg-gradient-to-r from-rose-600 via-rose-500 to-emerald-600">
      <p className="mx-auto max-w-6xl px-10 py-2 text-center text-[11px] font-semibold leading-snug text-white sm:text-xs">
        <span aria-hidden="true">🎄</span>{" "}
        {state === "before" ? (
          <>
            Pedí antes del <strong>18/12</strong> y asegurá tu regalo para{" "}
            <strong>Navidad</strong> · Envío a todo el país 🎁
          </>
        ) : (
          <>
            <strong>Últimos días</strong> para pedir tu regalo de Navidad · Envío a todo el país 🎁
          </>
        )}
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Cerrar aviso"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-sm text-white/80 transition-colors hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}
