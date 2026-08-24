"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CONSENT_KEY = "craft3d-cookie-consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(CONSENT_KEY)) return;
    const timer = setTimeout(() => setVisible(true), 0);
    return () => clearTimeout(timer);
  }, []);

  function accept() {
    localStorage.setItem(CONSENT_KEY, "1");
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
          Usamos cookies para el funcionamiento de la tienda (sesión, carrito y
          preferencias). No vendemos datos a terceros. Más info en nuestra{" "}
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
            onClick={accept}
            className="rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-300"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}