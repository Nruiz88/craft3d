import 'server-only';

import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Pool singleton por proceso. El usuario de DATABASE_URL es owner de la DB:
// TODA la autorización vive en la app (sesión NextAuth + gates por rol).
// Lazy a propósito: importar este módulo (build, sitemap, OG images) nunca
// debe reventar por falta de DATABASE_URL; el error aparece solo al primer
// query en runtime.
const globalForPg = globalThis as unknown as { __craft3dPool?: Pool };

function getPool(): Pool {
  if (!globalForPg.__craft3dPool) {
    const raw = process.env.DATABASE_URL;
    if (!raw) {
      throw new Error('DATABASE_URL no está definida. Revisá tu .env');
    }
    const url = new URL(raw);
    url.searchParams.delete('schema');
    globalForPg.__craft3dPool = new Pool({
      connectionString: url.toString(),
      max: 10,
    });
  }
  return globalForPg.__craft3dPool;
}

// Proxy que difiere la creación del Pool hasta el primer uso.
function lazyPool(): Pool {
  const handler: ProxyHandler<object> = {
    get(_target, prop, receiver) {
      const pool = getPool();
      const value = Reflect.get(pool as object, prop, receiver);
      return typeof value === "function" ? value.bind(pool) : value;
    },
  };
  return new Proxy({}, handler) as Pool;
}

export const pool: Pool = lazyPool();

// drizzle() toca el pool al crearse, así que la instancia también se difiere:
// importar este módulo nunca revienta; el error sale solo al primer query.
const globalForDb = globalThis as unknown as { __craft3dDb?: NodePgDatabase<typeof schema> };

function getDb(): NodePgDatabase<typeof schema> {
  if (!globalForDb.__craft3dDb) {
    globalForDb.__craft3dDb = drizzle(getPool(), { schema });
  }
  return globalForDb.__craft3dDb;
}

export const db: NodePgDatabase<typeof schema> = new Proxy(
  {},
  {
    get(_target, prop) {
      const db = getDb();
      const value = Reflect.get(db as object, prop);
      return typeof value === "function" ? value.bind(db) : value;
    },
  },
) as NodePgDatabase<typeof schema>;
export type Db = typeof db;
