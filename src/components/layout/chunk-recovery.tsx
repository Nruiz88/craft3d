"use client";

import { useEffect } from "react";

/**
 * Auto-recuperación ante chunks JS que fallan al cargar (típico después de un
 * deploy: el navegador tiene referencias a chunks viejos que ya no existen).
 * Sin esto, la página queda sin hidratación: menús y botones no responden.
 * Recarga una sola vez (sesión) para evitar loops.
 */
export default function ChunkRecovery() {
  useEffect(() => {
    const KEY = "craft3d-chunk-reload";

    const reloadOnce = () => {
      if (sessionStorage.getItem(KEY)) return;
      sessionStorage.setItem(KEY, KEY);
      window.location.reload();
    };

    const onChunkError = (e: ErrorEvent) => {
      const src = (e.target as HTMLElement | null)?.getAttribute?.("src") ?? "";
      if (src.endsWith(".js") || src.includes("/_next/")) reloadOnce();
    };

    window.addEventListener("error", onChunkError, true);
    return () => window.removeEventListener("error", onChunkError, true);
  }, []);

  return null;
}
