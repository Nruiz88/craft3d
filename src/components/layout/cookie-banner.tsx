"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// "1" = aceptó, "0" = rechazó. Mismo valor que lee google-analytics.tsx.
const CONSENT_KEY = "craft3d-cookie-consent";

type GtagWindow = { gtag?: (...args: unknown[]) => void };

function updateConsent(granted: boolean) {
  const value = granted ? "granted" : "denied";
  (window as unknown as GtagWindow).gtag?.("consent", "update", {
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
    analytics_storage: value,
  });
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(CONSENT_KEY)) return;
    } catch {
      // Sin acceso a localStorage (modo privado): se muestra el banner igual.
    }
    const timer = setTimeout(() => setVisible(true), 0);
    return () => clearTimeout(timer);
  }, []);

  function choose(granted: boolean) {
    try {
      localStorage.setItem(CONSENT_KEY, granted ? "1" : "0");
    } catch {
      // Si no se puede guardar, la decisión vale solo para esta visita.
    }
    updateConsent(granted);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-zinc-950/95 px-4 py-4 backdrop-blur-md sm:px-6"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <p className="max-w-2xl text-sm text-zinc-400">
          Usamos cookies necesarias para la tienda (sesión, carrito y
          preferencias). Con tu permiso, también usamos cookies de medición y
          publicidad (Google Analytics y Google Ads). No vendemos datos a
          terceros. Más info en nuestra{" "}
          <Link
            href="/privacidad"
            className="font-medium text-amber-300 transition-colors hover:text-amber-200"
          >
            política de privacidad
          </Link>
          .
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/privacidad"
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
          >
            Leer más
          </Link>
          <button
            type="button"
            onClick={() => choose(false)}
            className="rounded-full border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
          >
            Rechazar
          </button>
          <button
            type="button"
            onClick={() => choose(true)}
            className="rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-300"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}