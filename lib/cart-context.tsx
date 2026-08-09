"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { CartItem } from "./types";

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

let snapshot: CartItem[] = [];
let initialized = false;

function getSnapshot(): CartItem[] {
  if (!initialized) {
    snapshot = readItems();
    initialized = true;
  }
  return snapshot;
}

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function commit(next: CartItem[]) {
  snapshot = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage no disponible (modo privado, etc.): el carrito sigue en memoria
  }
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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, () => []);

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
  }, []);

  const removeItem = useCallback((slug: string) => {
    commit(getSnapshot().filter((item) => item.slug !== slug));
  }, []);

  const updateQuantity = useCallback((slug: string, quantity: number) => {
    commit(
      quantity <= 0
        ? getSnapshot().filter((item) => item.slug !== slug)
        : getSnapshot().map((item) =>
            item.slug === slug ? { ...item, quantity } : item,
          ),
    );
  }, []);

  const clearCart = useCallback(() => {
    commit([]);
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
