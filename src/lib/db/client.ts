import 'server-only';

import { drizzle } from 'drizzle-orm/mysql2';
import { createPool, type Pool, type PoolConnection } from 'mysql2/promise';
import * as schema from './schema';

// Pool singleton por proceso. El usuario de DATABASE_URL es owner de la DB:
// TODA la autorización vive en la app (sesiones cookie + gates por rol).
// Lazy a propósito: importar este módulo (build, sitemap, OG images) nunca
// debe reventar por falta de DATABASE_URL; el error aparece solo al primer
// query en runtime.
const globalForPool = globalThis as unknown as { __craft3dPool?: Pool };

function getPool(): Pool {
  if (!globalForPool.__craft3dPool) {
    const raw = process.env.DATABASE_URL;
    if (!raw) {
      throw new Error('DATABASE_URL no está definida. Revisá tu .env');
    }
    const url = new URL(raw);
    url.searchParams.delete('schema');
    globalForPool.__craft3dPool = retryPool(
      createPool({
        uri: url.toString(),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
      }),
    );
  }
  return globalForPool.__craft3dPool;
}

/**
 * El DNS interno de Docker (network de Coolify) puede fallar de forma
 * transitoria (ENOTFOUND/EAI_AGAIN) al abrir conexiones nuevas, p. ej.
 * justo después de un redeploy. Reintentamos con backoff corto antes de
 * propagar el error.
 */
function retryPool(pool: Pool): Pool {
  const handler: ProxyHandler<Pool> = {
    get(_target, prop, _receiver) {
      const value = Reflect.get(pool, prop);
      if (prop === 'getConnection' && typeof value === 'function') {
        const getConnection = value as () => Promise<PoolConnection>;
        return async (): Promise<PoolConnection> => {
          let lastError: unknown;
          for (let attempt = 0; attempt < 3; attempt++) {
            try {
              return await getConnection.call(pool);
            } catch (error) {
              lastError = error;
              const code = (error as { code?: string })?.code;
              const transient =
                code === 'ENOTFOUND' ||
                code === 'EAI_AGAIN' ||
                code === 'ECONNREFUSED' ||
                code === 'ECONNRESET' ||
                code === 'ETIMEDOUT';
              if (!transient || attempt === 2) throw error;
              await new Promise((r) => setTimeout(r, 200 * 2 ** attempt));
            }
          }
          throw lastError;
        };
      }
      return typeof value === 'function' ? value.bind(pool) : value;
    },
  };
  return new Proxy(pool, handler) as Pool;
}

// Proxy que difiere la creación del Pool hasta el primer uso.
function lazyPool(): Pool {
  const handler: ProxyHandler<object> = {
    get(_target, prop, receiver) {
      const pool = getPool();
      const value = Reflect.get(pool as object, prop, receiver);
      return typeof value === 'function' ? value.bind(pool) : value;
    },
  };
  return new Proxy({}, handler) as Pool;
}

export const pool: Pool = lazyPool();

// drizzle() toca el pool al crearse, así que la instancia también se difiere:
type DrizzleDb = ReturnType<typeof drizzle>;
const globalForDb = globalThis as unknown as { __craft3dDb?: DrizzleDb };

function getDb(): DrizzleDb {
  if (!globalForDb.__craft3dDb) {
    globalForDb.__craft3dDb = drizzle(getPool(), { schema, mode: 'default' }) as unknown as DrizzleDb;
  }
  return globalForDb.__craft3dDb;
}

export const db = new Proxy(
  {},
  {
    get(_target, prop) {
      const instance = getDb();
      const value = Reflect.get(instance as object, prop);
      return typeof value === 'function' ? value.bind(instance) : value;
    },
  },
) as unknown as DrizzleDb;
export type Db = DrizzleDb;
