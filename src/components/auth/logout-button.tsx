"use client";

import { useTransition } from "react";
import { logoutUserAction } from "@/app/account/actions";

export default function LogoutButton() {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(async () => { await logoutUserAction(); })}
      className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:border-red-900 hover:text-red-400 disabled:opacity-50"
    >
      {pending ? "Saliendo..." : "Cerrar sesión"}
    </button>
  );
}
