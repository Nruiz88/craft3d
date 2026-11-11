"use client";

import { duplicateProductAction } from "@/app/admin/actions";
import { useCsrfToken } from "./csrf-provider";

export default function DuplicateProductButton({
  id,
  name,
}: {
  id: number;
  name: string;
}) {
  const csrf = useCsrfToken();
  return (
    <form action={duplicateProductAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="csrf_token" value={csrf} />
      <button
        type="submit"
        aria-label={`Duplicar ${name}`}
        title="Duplicar producto"
        className="inline-flex items-center justify-center rounded-full border border-zinc-700 p-2 text-zinc-400 transition-colors hover:border-amber-400/60 hover:text-amber-300"
      >
        <svg
          className="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      </button>
    </form>
  );
}
