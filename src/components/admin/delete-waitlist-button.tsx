"use client";

import { deleteWaitlistEntryAction } from "@/app/admin/actions";

export default function DeleteWaitlistButton({ id }: { id: number }) {
  return (
    <form
      action={deleteWaitlistEntryAction}
      onSubmit={(event) => {
        if (!window.confirm("¿Quitar esta persona de la lista de espera?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-full border border-red-900/70 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-950/40"
      >
        Quitar
      </button>
    </form>
  );
}
