"use client";

/**
 * Cart context con híbrido localStorage + Supabase.
 *
 * - localStorage: fuente de verdad síncrona para UI instantánea.
 * - Supabase: persistencia cross-device cuando el usuario está logueado.
 *
 * Flujo:
 * 1. Mount → cargar localStorage + si hay sesión, merge desde Supabase
 * 2. Mutaciones → actualizar localStorage (síncrono) + sync a Supabase (async)
 * 3. Login → sync localStorage → Supabase
 * 4. Logout → limpiar Supabase cart, mantener localStorage
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import type { CartItem } from "@/lib/products/types";
import { supabaseBrowser } from "@/lib/supabase/browser";
import type { Session } from "@supabase/supabase-js";

const STORAGE_KEY = "craft3d-cart";

interface CartContextValue {
  items: CartItem[];
  count: number;
  addItem: (slug: string, quantity?: number) => void;
  removeItem: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function isValidItem(item: unknown): item is CartItem {
  if (!item) return false;
  const candidate = item as CartItem;
  return (
    typeof candidate.slug === "string" &&
    typeof candidate.quantity === "number" &&
    candidate.quantity > 0
  );
}

function readItems(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidItem);
  } catch {
    return [];
  }
}

function writeItems(items: CartItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage no disponible (modo privado, etc.)
  }
}

// Stable snapshot
let snapshot: CartItem[] = [];
let initialized = false;

function getSnapshot(): CartItem[] {
  if (!initialized) {
    snapshot = readItems();
    initialized = true;
  }
  return snapshot;
}

const emptySnapshot: CartItem[] = [];
function getServerSnapshot(): CartItem[] {
  return emptySnapshot;
}

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function commit(next: CartItem[]) {
  snapshot = next;
  writeItems(next);
  emit();
}

function handleStorage(event: StorageEvent) {
  if (event.key === STORAGE_KEY) {
    snapshot = readItems();
    emit();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

// ── Supabase sync helpers ──────────────────────────────────────

/** Debounced sync to Supabase (300ms) */
let syncTimeout: ReturnType<typeof setTimeout> | null = null;

function syncToSupabaseDebounced(items: CartItem[]) {
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => syncToSupabase(items), 300);
}

async function syncToSupabase(items: CartItem[]) {
  try {
    const {
      data: { session },
    } = await supabaseBrowser.auth.getSession();
    if (!session?.user) return;

    const userId = session.user.id;

    // Fetch current Supabase cart
    const { data: existing } = await supabaseBrowser
      .from("cart_items")
      .select("product_slug, quantity")
      .eq("user_id", userId);

    const existingMap = new Map<string, number>();
    (existing ?? []).forEach((row) =>
      existingMap.set(row.product_slug, row.quantity),
    );

    const localStorageMap = new Map<string, number>();
    items.forEach((item) => localStorageMap.set(item.slug, item.quantity));

    // Delete items removed from localStorage
    const toDelete: string[] = [];
    existingMap.forEach((_, slug) => {
      if (!localStorageMap.has(slug)) toDelete.push(slug);
    });
    if (toDelete.length > 0) {
      await supabaseBrowser
        .from("cart_items")
        .delete()
        .eq("user_id", userId)
        .in("product_slug", toDelete);
    }

    // Upsert all current localStorage items
    if (items.length > 0) {
      const rows = items.map((item) => ({
        user_id: userId,
        product_slug: item.slug,
        quantity: item.quantity,
      }));

      const { error } = await supabaseBrowser
        .from("cart_items")
        .upsert(rows, {
          onConflict: "user_id,product_slug",
          ignoreDuplicates: false,
        });

      if (error) {
        console.error("Cart sync error:", error.message);
      }
    }
  } catch {
    // Silently fail — localStorage is still the source of truth
  }
}

/** Load Supabase cart and merge with localStorage */
async function loadAndMergeFromSupabase(): Promise<CartItem[]> {
  try {
    const {
      data: { session },
    } = await supabaseBrowser.auth.getSession();
    if (!session?.user) return readItems();

    const { data: remoteItems } = await supabaseBrowser
      .from("cart_items")
      .select("product_slug, quantity")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: true });

    const localItems = readItems();
    const localMap = new Map<string, number>();
    localItems.forEach((item) => localMap.set(item.slug, item.quantity));

    const remoteMap = new Map<string, number>();
    (remoteItems ?? []).forEach((row) =>
      remoteMap.set(row.product_slug, row.quantity),
    );

    // Merge: sum quantities when both have the slug
    const mergedMap = new Map<string, number>();
    remoteMap.forEach((qty, slug) => mergedMap.set(slug, qty));
    localMap.forEach((qty, slug) => {
      const existing = mergedMap.get(slug);
      mergedMap.set(slug, existing ? existing + qty : qty);
    });

    const merged: CartItem[] = [];
    mergedMap.forEach((quantity, slug) => {
      if (quantity > 0) merged.push({ slug, quantity });
    });

    // Persist merged to localStorage
    writeItems(merged);

    return merged;
  } catch {
    return readItems();
  }
}

// ── Provider ───────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const mountedRef = useRef(false);
  const userIdRef = useRef<string | null>(null);

  // On mount: merge Supabase cart if logged in
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    (async () => {
      const {
        data: { session },
      } = await supabaseBrowser.auth.getSession();

      if (session?.user) {
        userIdRef.current = session.user.id;
        const merged = await loadAndMergeFromSupabase();
        if (JSON.stringify(merged) !== JSON.stringify(snapshot)) {
          commit(merged);
        }
      }
    })();
  }, []);

  // Listen for auth state changes (login/logout)
  useEffect(() => {
    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        userIdRef.current = session.user.id;
        const merged = await loadAndMergeFromSupabase();
        if (JSON.stringify(merged) !== JSON.stringify(snapshot)) {
          commit(merged);
        }
      } else if (event === "SIGNED_OUT") {
        userIdRef.current = null;
        // Keep localStorage cart for when they log back in
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const addItem = useCallback((slug: string, quantity = 1) => {
    const current = getSnapshot();
    const existing = current.find((item) => item.slug === slug);
    const next = existing
      ? current.map((item) =>
          item.slug === slug
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      : [...current, { slug, quantity }];
    commit(next);
    syncToSupabaseDebounced(next);
  }, []);

  const removeItem = useCallback((slug: string) => {
    const next = getSnapshot().filter((item) => item.slug !== slug);
    commit(next);
    syncToSupabaseDebounced(next);
  }, []);

  const updateQuantity = useCallback((slug: string, quantity: number) => {
    const next =
      quantity <= 0
        ? getSnapshot().filter((item) => item.slug !== slug)
        : getSnapshot().map((item) =>
            item.slug === slug ? { ...item, quantity } : item,
          );
    commit(next);
    syncToSupabaseDebounced(next);
  }, []);

  const clearCart = useCallback(() => {
    commit([]);
    syncToSupabaseDebounced([]);
  }, []);

  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({ items, count, addItem, removeItem, updateQuantity, clearCart }),
    [items, count, addItem, removeItem, updateQuantity, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de un <CartProvider>");
  }
  return context;
}
