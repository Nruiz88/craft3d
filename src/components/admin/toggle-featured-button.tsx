"use client";

import { useState, useTransition } from "react";
import { toggleFeaturedAction } from "@/app/admin/actions";

export default function ToggleFeaturedButton({
  id,
  featured,
}: {
  id: number;
  featured: boolean;
}) {
  const [isFeatured, setIsFeatured] = useState(featured);
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    const next = !isFeatured;
    setIsFeatured(next);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", String(id));
      formData.set("featured", String(next));
      await toggleFeaturedAction(formData);
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={pending}
      aria-pressed={isFeatured}
      aria-label={isFeatured ? "Quitar de destacados" : "Marcar como destacado"}
      title={isFeatured ? "Quitar de destacados" : "Marcar como destacado"}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-base transition-colors disabled:opacity-60 ${
        isFeatured
          ? "border-amber-400/50 bg-amber-400/15 text-amber-400"
          : "border-zinc-700 bg-zinc-950 text-zinc-600 hover:border-amber-400/40 hover:text-amber-300"
      }`}
    >
      {isFeatured ? "★" : "☆"}
    </button>
  );
}
