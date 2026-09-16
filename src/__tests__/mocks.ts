/**
 * Mock helpers for testing server actions.
 * Stack: Drizzle (db) + NextAuth. Mocks de `@/lib/db/client`,
 * `@/auth` y `next-auth` abajo.
 */

import { vi } from "vitest";
import { getTableConfig } from "drizzle-orm/pg-core";

vi.mock("server-only", () => ({}));

// ---------------------------------------------------------------------------
// Mock Drizzle en memoria.
// Soporta lo que usan las actions bajo test: select(campos?).from(tabla)
// .where(cond).orderBy(...).limit(n), insert(tabla).values(obj|arr).returning(),
// update(tabla).set(obj).where(cond), delete(tabla).where(cond) y
// execute(sql`select count(*) ... from <tabla> where ...`).
// Las condiciones (eq/and) y orderBy (asc/desc) se evalúan inspeccionando
// los queryChunks de drizzle-orm.
// ---------------------------------------------------------------------------

type Row = Record<string, unknown>;

const mockTables = new Map<string, Row[]>();
let mockIdCounter = 0;

export function resetMockStore() {
  mockTables.clear();
  mockIdCounter = 0;
}

function tableNameOf(table: unknown): string {
  return getTableConfig(table as Parameters<typeof getTableConfig>[0]).name;
}

interface ChunkItem {
  value?: unknown;
  field?: unknown;
}

function chunkList(sqlLike: unknown): unknown[] {
  const s = sqlLike as { queryChunks?: unknown[] } | null | undefined;
  if (s && Array.isArray(s.queryChunks)) return s.queryChunks;
  return [];
}

function isColumnChunk(c: unknown): c is { name: string } {
  return (
    typeof c === "object" &&
    c !== null &&
    typeof (c as { name?: unknown }).name === "string" &&
    "table" in (c as object)
  );
}

function chunkText(c: unknown): string | null {
  if (typeof c === "string") return c;
  if (typeof c === "object" && c !== null) {
    const v = (c as ChunkItem).value;
    // StringChunk de drizzle: { value: [" = "] } (array de strings).
    if (Array.isArray(v)) return v.join("");
    if (typeof v === "string" && !("encoder" in (c as object))) return v;
  }
  return null;
}

function chunkParamValue(c: unknown): { isParam: boolean; value: unknown } {
  // Param de drizzle: { value, encoder }. StringChunk también tiene `value`
  // pero sin `encoder` (y ya se maneja en chunkText).
  if (
    typeof c === "object" &&
    c !== null &&
    "value" in (c as object) &&
    "encoder" in (c as object)
  ) {
    return { isParam: true, value: (c as ChunkItem).value };
  }
  return { isParam: false, value: undefined };
}

/** Convierte una condición drizzle (eq/and anidados) en predicado sobre fila. */
function toPredicate(cond: unknown): (row: Row) => boolean {
  if (!cond) return () => true;
  const chunks = chunkList(cond);
  if (chunks.length === 0) return () => true;

  type Token =
    | { kind: "col"; name: string }
    | { kind: "op"; op: string }
    | { kind: "val"; value: unknown }
    | { kind: "pred"; fn: (row: Row) => boolean };

  const tokens: Token[] = [];
  for (const c of chunks) {
    if (isColumnChunk(c)) {
      tokens.push({ kind: "col", name: c.name });
      continue;
    }
    const nested = chunkList(c);
    if (nested.length > 0 && !isColumnChunk(c)) {
      // Sub-SQL (ej. cada eq dentro de un and).
      tokens.push({ kind: "pred", fn: toPredicate(c) });
      continue;
    }
    const text = chunkText(c);
    if (text !== null) {
      const t = text.trim().toLowerCase();
      if (t === "" || t === "(" || t === ")") continue;
      if (t.includes("and")) {
        tokens.push({ kind: "op", op: "and" });
        continue;
      }
      if (t === "=" || t.includes("=")) {
        tokens.push({ kind: "op", op: "=" });
        continue;
      }
      continue;
    }
    const p = chunkParamValue(c);
    if (p.isParam) {
      tokens.push({ kind: "val", value: p.value });
      continue;
    }
    if (typeof c === "number" || typeof c === "boolean") {
      tokens.push({ kind: "val", value: c });
      continue;
    }
  }

  // Evalúa secuencia [pred|col = val] unidos por AND.
  const parts: Array<(row: Row) => boolean> = [];
  let i = 0;
  const evalComparison = (colName: string, value: unknown) => (row: Row) =>
    row[colName] === value;
  while (i < tokens.length) {
    const t = tokens[i];
    if (t.kind === "pred") {
      parts.push(t.fn);
      i += 1;
    } else if (t.kind === "col") {
      const next = tokens[i + 1];
      const after = tokens[i + 2];
      if (next?.kind === "op" && next.op === "=" && after?.kind === "val") {
        parts.push(evalComparison(t.name, after.value));
        i += 3;
      } else {
        // Columna sin comparador: truthy.
        parts.push((row: Row) => Boolean(row[t.name]));
        i += 1;
      }
    } else {
      i += 1;
    }
  }
  return (row: Row) => parts.every((fn) => fn(row));
}

function orderSpecOf(
  expr: unknown,
): { col: string; dir: "asc" | "desc" } | null {
  let col: string | null = null;
  let dir: "asc" | "desc" = "asc";
  for (const c of chunkList(expr)) {
    if (isColumnChunk(c)) col = c.name;
    const text = chunkText(c);
    if (text && text.toLowerCase().includes("desc")) dir = "desc";
  }
  // asc()/desc() sobre columna directa sin wrapper SQL: la columna misma.
  if (!col && isColumnChunk(expr)) col = expr.name;
  if (!col) return null;
  return { col, dir };
}

function projectRow(row: Row, fields: unknown): Row {
  if (!fields || typeof fields !== "object") return { ...row };
  const out: Row = {};
  for (const [alias, col] of Object.entries(fields as Record<string, unknown>)) {
    if (isColumnChunk(col)) out[alias] = row[col.name];
    else out[alias] = col;
  }
  return out;
}

function makeSelect(
  store: Map<string, Row[]>,
  fields: unknown,
  table: unknown,
) {
  const tname = tableNameOf(table);
  let cond: unknown = null;
  const orderBys: Array<{ col: string; dir: "asc" | "desc" }> = [];
  let limitN: number | null = null;
  const builder: Record<string, unknown> = {
    where(c: unknown) {
      cond = c;
      return builder;
    },
    orderBy(...exprs: unknown[]) {
      for (const e of exprs) {
        const spec = orderSpecOf(e);
        if (spec) orderBys.push(spec);
      }
      return builder;
    },
    limit(n: number) {
      limitN = n;
      return builder;
    },
    then(
      resolve: (v: Row[]) => void,
      reject?: (e: unknown) => void,
    ) {
      try {
        let rows = [...(store.get(tname) ?? [])];
        if (cond) rows = rows.filter(toPredicate(cond));
        for (const { col, dir } of orderBys) {
          rows = [...rows].sort((a, b) => {
            const av = a[col];
            const bv = b[col];
            if (typeof av === "boolean" || typeof bv === "boolean") {
              const n = Number(Boolean(av)) - Number(Boolean(bv));
              return dir === "asc" ? n : -n;
            }
            const cmp = String(av ?? "").localeCompare(String(bv ?? ""));
            return dir === "asc" ? cmp : -cmp;
          });
        }
        if (limitN !== null) rows = rows.slice(0, limitN);
        resolve(rows.map((r) => projectRow(r, fields)));
      } catch (e) {
        if (reject) reject(e);
      }
    },
  };
  return builder;
}

const mockDrizzleDb = {
  select(fields?: unknown) {
    return {
      from: (table: unknown) => makeSelect(mockTables, fields, table),
    };
  },
  insert(table: unknown) {
    const tname = tableNameOf(table);
    return {
      values(data: Row | Row[]) {
        const items = (Array.isArray(data) ? data : [data]).map((item) => ({
          id: `mock-id-${++mockIdCounter}`,
          created_at: new Date(),
          updated_at: new Date(),
          ...item,
        }));
        const existing = mockTables.get(tname) ?? [];
        mockTables.set(tname, [...existing, ...items]);
        return {
          returning() {
            return Promise.resolve(items.map((r) => ({ ...r })));
          },
          then(
            resolve: (v: Row[]) => void,
            reject?: (e: unknown) => void,
          ) {
            try {
              resolve(items.map((r) => ({ ...r })));
            } catch (e) {
              if (reject) reject(e);
            }
          },
        };
      },
    };
  },
  update(table: unknown) {
    const tname = tableNameOf(table);
    return {
      set(data: Row) {
        return {
          where(cond: unknown) {
            const pred = toPredicate(cond);
            const rows = mockTables.get(tname) ?? [];
            for (const row of rows) {
              if (pred(row)) Object.assign(row, data);
            }
            return Promise.resolve([]);
          },
        };
      },
    };
  },
  delete(table: unknown) {
    const tname = tableNameOf(table);
    return {
      where(cond: unknown) {
        const pred = toPredicate(cond);
        const rows = mockTables.get(tname) ?? [];
        mockTables.set(
          tname,
          rows.filter((r) => !pred(r)),
        );
        return Promise.resolve([]);
      },
    };
  },
  /** Solo los count(*) que usan las actions de addresses. */
  execute(query: unknown) {
    let raw = "";
    const params: unknown[] = [];
    for (const c of chunkList(query)) {
      const text = chunkText(c);
      if (text !== null) {
        raw += text;
        continue;
      }
      const nested = chunkList(c);
      if (nested.length > 0) {
        raw += " ?";
        continue;
      }
      const p = chunkParamValue(c);
      if (p.isParam) {
        params.push(p.value);
        raw += " ?";
        continue;
      }
    }
    const m = raw.match(/from\s+([a-z_]+)/i);
    const tname = m?.[1] ?? "";
    let rows = [...(mockTables.get(tname) ?? [])];
    // El where siempre es user_id = <p0> [and is_default = true].
    if (params.length > 0) {
      rows = rows.filter((r) => r["user_id"] === params[0]);
    }
    if (/is_default\s*=\s*true/i.test(raw)) {
      rows = rows.filter((r) => r["is_default"] === true);
    }
    return Promise.resolve({ rows: [{ count: rows.length }] });
  },
  transaction<T>(fn: (tx: unknown) => Promise<T>): Promise<T> {
    return fn(mockDrizzleDb);
  },
};

export const mockSupabase = mockDrizzleDb;

vi.mock("server-only", () => ({}));
// Nuevo stack: Drizzle + NextAuth.
vi.mock("@/lib/db/client", () => ({
  db: mockSupabase,
  pool: { query: async () => ({ rows: [] }) },
}));
vi.mock("@/auth", () => ({
  authOptions: {},
}));
vi.mock("next-auth", () => ({
  getServerSession: async () => ({ user: { id: "test-user-id" } }),
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
