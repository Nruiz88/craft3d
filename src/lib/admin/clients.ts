import "server-only";
import { desc } from "drizzle-orm";
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
