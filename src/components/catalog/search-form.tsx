"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchForm({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const q = value.trim();
    onNavigate?.();
    router.push(q ? `/catalogo?busqueda=${encodeURIComponent(q)}` : "/catalogo");
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="group relative flex items-center"
    >
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Buscar en el catálogo…"
        aria-label="Buscar en el catálogo"
        className="h-9 w-full rounded-full border-2 border-zinc-800 bg-zinc-900/80 pr-9 pl-4 text-sm text-zinc-200 transition-colors placeholder:text-zinc-600 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
      />
      <button
        type="submit"
        aria-label="Buscar"
        className="absolute right-0 inline-flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition-colors hover:text-cyan-300"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>
    </form>
  );
}
