import "server-only";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";

// Forma mínima compatible con los consumos existentes
// (clientes/page.tsx y exportClientsCsvAction leen id, email,
// created_at, last_sign_in_at, email_confirmed_at, identities y user_metadata).
export interface ClientUser {
  id: string;
  email: string | null;
  created_at: string | null;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  user_metadata: { full_name?: string; name?: string };
  identities: { provider: string }[];
}

export interface ClientContact {
  full_name: string;
  phone: string;
  address: string;
  postal_code: string;
  city: string;
  province: string;
}

export interface ClientsResult {
  users: ClientUser[];
  contacts: Map<string, ClientContact>;
  error?: string;
}

const iso = (v: Date | string | null | undefined): string | null => {
  if (v == null) return null;
  return v instanceof Date ? v.toISOString() : String(v);
};

export async function getClients(): Promise<ClientsResult> {
  try {
    const rows = await db
      .select({
        id: profiles.id,
        email: profiles.email,
        role: profiles.role,
        full_name: profiles.full_name,
        phone: profiles.phone,
        address: profiles.address,
        postal_code: profiles.postal_code,
        city: profiles.city,
        province: profiles.province,
        created_at: profiles.created_at,
      })
      .from(profiles)
      .orderBy(asc(profiles.created_at));

    const users: ClientUser[] = rows.map((r) => ({
      id: r.id,
      email: r.email,
      created_at: iso(r.created_at),
      last_sign_in_at: null,
      email_confirmed_at: iso(r.created_at),
      user_metadata: { full_name: r.full_name || undefined },
      identities: [{ provider: "email" }],
    }));

    const contacts = new Map<string, ClientContact>(
      rows.map((r) => [
        r.id,
        {
          full_name: r.full_name ?? "",
          phone: r.phone ?? "",
          address: r.address ?? "",
          postal_code: r.postal_code ?? "",
          city: r.city ?? "",
          province: r.province ?? "",
        },
      ]),
    );

    return { users, contacts };
  } catch (error) {
    return {
      users: [],
      contacts: new Map(),
      error: error instanceof Error ? error.message : "Error al cargar clientes",
    };
  }
}
