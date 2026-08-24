"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface WishlistContextValue {
  saved: Set<string>;
  isSaved: (slug: string) => boolean;
  toggle: (slug: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const fetched = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch("/api/wishlist")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { slugs?: string[] } | null) => {
        if (data?.slugs) setSaved(new Set(data.slugs));
      })
      .catch(() => {});
  }, []);

  const isSaved = useCallback((slug: string) => saved.has(slug), [saved]);

  const toggle = useCallback(
    async (slug: string) => {
      const wasSaved = saved.has(slug);

      setSaved((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.delete(slug);
        else next.add(slug);
        return next;
      });

      const res = await fetch("/api/wishlist", {
        method: wasSaved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });

      if (res.status === 401) {
        setSaved((prev) => {
          const next = new Set(prev);
          if (wasSaved) next.add(slug);
          else next.delete(slug);
          return next;
        });
        const path = window.location.pathname + window.location.search;
        router.push(`/ingresar?next=${encodeURIComponent(path)}`);
        return;
      }

      if (!res.ok) {
        setSaved((prev) => {
          const next = new Set(prev);
          if (wasSaved) next.add(slug);
          else next.delete(slug);
          return next;
        });
      }
    },
    [saved, router],
  );

  return (
    <WishlistContext.Provider value={{ saved, isSaved, toggle }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist debe usarse dentro de <WishlistProvider>");
  }
  return ctx;
}
