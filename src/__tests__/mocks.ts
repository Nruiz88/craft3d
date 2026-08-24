/**
 * Mock helpers for testing server actions.
 * Supports Supabase query builder chaining.
 */

import { vi } from "vitest";

const mockStore = new Map<string, unknown[]>();

export function resetMockStore() {
  mockStore.clear();
  idCounter = 0;
}

let idCounter = 0;

function createQueryBuilder(table: string) {
  let filters: Array<{ field: string; op: string; value: unknown }> = [];
  let orderField = "";
  let orderAsc = true;
  let limitN = 0;
  let singleResult = false;
  let headOnly = false;
  let pendingData: unknown = null;
  let pendingOp: "insert" | "update" | "delete" | "upsert" | null = null;

  function applyFilters(items: unknown[]): unknown[] {
    for (const f of filters) {
      items = items.filter((item) => {
        const val = (item as Record<string, unknown>)[f.field];
        if (f.op === "eq") return val === f.value;
        if (f.op === "gte") return (val as number) >= (f.value as number);
        if (f.op === "in") return (f.value as unknown[]).includes(val);
        return true;
      });
    }
    return items;
  }

  const builder: Record<string, unknown> = {
    select(_fields?: string) { return builder; },
    eq(field: string, value: unknown) { filters.push({ field, op: "eq", value }); return builder; },
    gte(field: string, value: unknown) { filters.push({ field, op: "gte", value }); return builder; },
    in(field: string, values: unknown[]) { filters.push({ field, op: "in", value: values }); return builder; },
    order(field: string, opts?: { ascending?: boolean }) { orderField = field; orderAsc = opts?.ascending ?? true; return builder; },
    limit(n: number) { limitN = n; return builder; },
    maybeSingle() { singleResult = true; return builder; },
    single() { singleResult = true; return builder; },
    head() { headOnly = true; return builder; },

    insert(data: unknown) {
      pendingData = data;
      pendingOp = "insert";
      const items = (Array.isArray(data) ? data : [data]) as Record<string, unknown>[];
      const withIds = items.map((item) => {
        if (item && typeof item === "object" && !item.id) {
          return { ...item, id: `mock-id-${++idCounter}` };
        }
        return item;
      });
      const existing = mockStore.get(table) ?? [];
      mockStore.set(table, [...existing, ...(Array.isArray(data) ? withIds : [withIds[0]])]);
      pendingData = Array.isArray(data) ? withIds : withIds[0];
      return builder;
    },

    update(data: unknown) { pendingData = data; pendingOp = "update"; return builder; },
    delete() { pendingOp = "delete"; return builder; },

    upsert(data: unknown, opts?: { onConflict?: string }) {
      pendingOp = "upsert";
      const items = mockStore.get(table) ?? [];
      if (opts?.onConflict) {
        const existingIdx = items.findIndex(
          (item) => (item as Record<string, unknown>)[opts.onConflict!] === (data as Record<string, unknown>)[opts.onConflict!],
        );
        if (existingIdx >= 0) {
          Object.assign(items[existingIdx] as object, data);
        } else {
          items.push(data);
        }
      } else {
        items.push(data);
      }
      mockStore.set(table, items);
      return builder;
    },

    then(resolve: (result: { data: unknown; error: unknown; count?: number }) => void) {
      if (pendingOp === "insert") {
        resolve({ data: pendingData, error: null });
        return;
      }

      if (pendingOp === "update") {
        const items = mockStore.get(table) ?? [];
        let anyUpdated = false;
        for (const item of items) {
          const match = filters.every((f) => {
            if (f.op === "eq") return (item as Record<string, unknown>)[f.field] === f.value;
            return true;
          });
          if (match) {
            Object.assign(item as object, pendingData as object);
            anyUpdated = true;
          }
        }
        resolve({ data: anyUpdated ? pendingData : null, error: anyUpdated ? null : { message: "Not found" } });
        return;
      }

      if (pendingOp === "delete") {
        const items = mockStore.get(table) ?? [];
        const remaining = items.filter((item) => {
          return !filters.every((f) => {
            if (f.op === "eq") return (item as Record<string, unknown>)[f.field] === f.value;
            return true;
          });
        });
        mockStore.set(table, remaining);
        resolve({ data: null, error: null });
        return;
      }

      // SELECT
      const rawItems = mockStore.get(table) ?? [];
      let items: Record<string, unknown>[] = rawItems.map((x) => ({ ...(x as Record<string, unknown>) }));
      items = applyFilters(items) as Record<string, unknown>[];

      if (orderField) {
        items = [...items].sort((a, b) => {
          const aVal = String((a as Record<string, unknown>)[orderField] ?? "");
          const bVal = String((b as Record<string, unknown>)[orderField] ?? "");
          return orderAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        });
      }

      if (limitN > 0) items = items.slice(0, limitN);

      if (headOnly) {
        resolve({ data: null, error: null, count: items.length });
      } else if (singleResult) {
        resolve({ data: items[0] ?? null, error: items[0] ? null : { message: "Not found" } });
      } else {
        resolve({ data: items, error: null, count: items.length });
      }
    },
  };

  return builder;
}

export const mockSupabase = {
  from: (table: string) => createQueryBuilder(table),
  auth: {
    getUser: async () => ({
      data: { user: { id: "test-user-id", email: "test@example.com" } },
      error: null,
    }),
  },
};

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => mockSupabase,
}));
vi.mock("@/lib/supabase/client", () => ({
  supabase: mockSupabase,
}));
vi.mock("@/lib/auth", () => ({
  requireAdmin: async () => {},
  isAdmin: async () => true,
}));
vi.mock("@/lib/utils/admin-rate-limit", () => ({
  checkAdminRateLimit: () => {},
}));
vi.mock("@/lib/utils/sanitize", () => ({
  sanitizeString: (s: unknown) => (typeof s === "string" ? s : ""),
  sanitizeNumber: (v: unknown, min = 0, max = 999999) => {
    const n = Number(v);
    if (isNaN(n)) return null;
    return Math.max(min, Math.min(max, n));
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));
vi.mock("next/navigation", () => ({ redirect: () => {}, notFound: () => {} }));
