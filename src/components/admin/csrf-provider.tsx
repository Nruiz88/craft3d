"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * Token CSRF del panel, generado una vez en el layout admin (server) y
 * compartido por contexto. Cualquier form de acción admin lo consume con
 * useCsrfToken() sin tener que enroscar props por todos los niveles.
 */
const CsrfContext = createContext<string>("");

export function CsrfProvider({
  token,
  children,
}: {
  token: string;
  children: ReactNode;
}) {
  return <CsrfContext.Provider value={token}>{children}</CsrfContext.Provider>;
}

export function useCsrfToken(): string {
  return useContext(CsrfContext);
}

export default CsrfProvider;
