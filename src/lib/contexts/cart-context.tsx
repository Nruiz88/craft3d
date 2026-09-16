"use client";

/**
 * Cart context con híbrido localStorage + server actions (Drizzle/NextAuth).
 *
 * - localStorage: fuente de verdad síncrona para UI instantánea.
 * - Server actions (getCartAction/saveCartAction): persistencia cross-device
 *   cuando el usuario está logueado.
 *
 * Flujo:
 * 1. Mount → cargar localStorage + si hay sesión, merge desde el servidor
 * 2. Mutaciones → actualizar localStorage (síncrono) + save al servidor (async)
 * 3. Login (navegación dura) → mount fusiona local + remoto
 * 4. Logout → se mantiene el localStorage local
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
import {
  getCartAction,
  getMyIdAction,
  saveCartAction,
} from "@/app/cuenta/actions/cart-sync";

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

// ── Server sync helpers ──────────────────────────────────────────

/** Debounced sync al servidor (300ms). Silencioso si es invitado. */
let syncTimeout: ReturnType<typeof setTimeout> | null = null;

function syncToServerDebounced(items: CartItem[]) {
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => syncToServer(items), 300);
}

async function syncToServer(items: CartItem[]) {
  try {
    await saveCartAction(
      items.map((item) => ({
        product_slug: item.slug,
        quantity: item.quantity,
      })),
    );
  } catch {
    // Invitado ("No autorizado") o error de red: localStorage sigue mandando
  }
}

/** Carga el carrito remoto y lo fusiona con localStorage (suma cantidades). */
async function loadAndMergeFromServer(): Promise<CartItem[] | null> {
  try {
    const userId = await getMyIdAction();
    if (!userId) return null;

    const remote = await getCartAction();
    const localItems = readItems();

    const mergedMap = new Map<string, number>();
    remote.forEach((row) => mergedMap.set(row.product_slug, row.quantity));
    localItems.forEach((item) => {
      const existing = mergedMap.get(item.slug);
      mergedMap.set(item.slug, existing ? existing + item.quantity : item.quantity);
    });

    const merged: CartItem[] = [];
    mergedMap.forEach((quantity, slug) => {
      if (quantity > 0) merged.push({ slug, quantity });
    });

    writeItems(merged);
    // Persiste la fusión en el servidor para que quede cross-device
    await syncToServer(merged);

    return merged;
  } catch {
    return null;
  }
}

// ── Provider ───────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const mountedRef = useRef(false);

  // On mount: merge con el carrito del servidor si hay sesión
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    (async () => {
      const merged = await loadAndMergeFromServer();
      if (merged && JSON.stringify(merged) !== JSON.stringify(snapshot)) {
        commit(merged);
      }
    })();
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
    syncToServerDebounced(next);
  }, []);

  const removeItem = useCallback((slug: string) => {
    const next = getSnapshot().filter((item) => item.slug !== slug);
    commit(next);
    syncToServerDebounced(next);
  }, []);

  const updateQuantity = useCallback((slug: string, quantity: number) => {
    const next =
      quantity <= 0
        ? getSnapshot().filter((item) => item.slug !== slug)
        : getSnapshot().map((item) =>
            item.slug === slug ? { ...item, quantity } : item,
          );
    commit(next);
    syncToServerDebounced(next);
  }, []);

  const clearCart = useCallback(() => {
    commit([]);
    syncToServerDebounced([]);
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
