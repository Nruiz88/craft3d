"use client";

import { notifyRestockAction } from "@/app/admin/actions";

export default function NotifyRestockButton({
  slug,
  count,
}: {
  slug: string;
  count: number;
}) {
  return (
    <form
      action={notifyRestockAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `¿Avisar a los ${count} anotados que ${slug} volvió a tener stock? Se envían los emails y se limpia la lista.`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        className="rounded-full border border-cyan-600/70 px-3 py-1.5 text-xs font-medium text-cyan-300 transition-colors hover:bg-cyan-950/40"
      >
        Notificar reposición
      </button>
    </form>
  );
}
