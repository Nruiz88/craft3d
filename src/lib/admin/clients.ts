import "server-only";
import { count, desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";

export interface AdminClient {
  id: string;
  email: string | null;
  created_at: string | null;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  user_metadata: { full_name?: string; name?: string } | null;
  identities: { provider: string }[] | null;
}

export interface ClientContact {
  full_name: string;
  phone: string;
  city: string;
  province: string;
  address: string;
  postal_code: string;
}

export interface ClientsResult {
  users: AdminClient[];
  contacts: Map<string, ClientContact>;
  error?: string;
}

/**
 * Clientes registrados: ahora viven en la tabla profiles de MariaDB.
 * Se mantiene la forma { users, contacts } para no reescribir las páginas.
 */
export async function getClients(): Promise<ClientsResult> {
  try {
    const rows = await db.select().from(profiles).orderBy(desc(profiles.created_at));
    const contacts = new Map<string, ClientContact>();
    const users: AdminClient[] = rows.map((row) => {
      contacts.set(row.id, {
        full_name: row.full_name,
        phone: row.phone,
        city: row.city,
        province: row.province,
        address: row.address,
        postal_code: row.postal_code,
      });
      return {
        id: row.id,
        email: row.email,
        created_at: row.created_at ? (row.created_at instanceof Date ? row.created_at : new Date(row.created_at)).toISOString() : null,
        last_sign_in_at: null,
        // Con auth propia (email+contraseña) el email siempre está verificado.
        email_confirmed_at: row.created_at ? new Date(row.created_at).toISOString() : null,
        user_metadata: { full_name: row.full_name },
        identities: [{ provider: "email" }],
      };
    });
    return { users, contacts };
  } catch (error) {
    return {
      users: [],
      contacts: new Map(),
      error: error instanceof Error ? error.message : "No se pudieron cargar los clientes",
    };
  }
}

export async function getClientById(id: string): Promise<AdminClient | null> {
  const { users } = await getClients();
  return users.find((u) => u.id === id) ?? null;
}

/** Cantidad de clientes registrados (sin traer las filas). */
export async function countClients(): Promise<number> {
  try {
    const [row] = await db.select({ value: count() }).from(profiles);
    return Number(row?.value ?? 0);
  } catch {
    return 0;
  }
}

export interface ClientOrderStats {
  count: number;
  /** Total gastado, sin contar pedidos cancelados. */
  total: number;
  lastAt: string | null;
}

interface MinimalOrder {
  user_id: string | null;
  customer_email: string;
  status: string;
  total: number;
  createdAt: string;
}

/** ¿Este pedido pertenece a este cliente? Por user_id o por email. */
export function orderBelongsToClient(
  order: MinimalOrder,
  client: { id: string; email: string | null },
): boolean {
  if (order.user_id && order.user_id === client.id) return true;
  if (
    client.email &&
    order.customer_email &&
    order.customer_email.toLowerCase() === client.email.toLowerCase()
  ) {
    return true;
  }
  return false;
}

/**
 * Agrega pedidos por cliente (match por user_id o por email) en una sola
 * pasada. Devuelve un Map clientId → { count, total, lastAt }.
 */
export function buildClientOrderStats(
  users: { id: string; email: string | null }[],
  orders: MinimalOrder[],
): Map<string, ClientOrderStats> {
  const byId = new Map<string, ClientOrderStats>();
  const emailToId = new Map<string, string>();
  for (const u of users) {
    byId.set(u.id, { count: 0, total: 0, lastAt: null });
    if (u.email) emailToId.set(u.email.toLowerCase(), u.id);
  }
  for (const order of orders) {
    let id =
      order.user_id && byId.has(order.user_id) ? order.user_id : null;
    if (!id && order.customer_email) {
      id = emailToId.get(order.customer_email.toLowerCase()) ?? null;
    }
    if (!id) continue;
    const stats = byId.get(id)!;
    stats.count += 1;
    if (order.status !== "cancelado") stats.total += order.total;
    if (!stats.lastAt || order.createdAt > stats.lastAt) {
      stats.lastAt = order.createdAt;
    }
  }
  return byId;
}
