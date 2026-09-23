"use client";

import { deleteProductAction } from "@/app/admin/actions";
import { useCsrfToken } from "./csrf-provider";

export default function DeleteProductButton({
  id,
  name,
  compact = false,
  redirectTo,
}: {
  id: number;
  name: string;
  compact?: boolean;
  redirectTo?: string;
}) {
  return (
    <form
      action={deleteProductAction}
      onSubmit={(event) => {
        if (!window.confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="csrf_token" value={useCsrfToken()} />
      {redirectTo ? <input type="hidden" name="origen" value={redirectTo} /> : null}
      <button
        type="submit"
        className={`rounded-full border border-red-900/70 text-xs font-medium text-red-400 transition-colors hover:bg-red-950/40 ${
          compact ? "px-3 py-1.5" : "px-4 py-1.5"
        }`}
      >
        Eliminar
      </button>
    </form>
  );
}
