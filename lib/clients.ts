import "server-only";
import { supabase } from "./supabase";
import type { User } from "@supabase/supabase-js";

export interface ClientContact {
  full_name: string;
  phone: string;
  address: string;
  postal_code: string;
  city: string;
  province: string;
}

export interface ClientsResult {
  users: User[];
  contacts: Map<string, ClientContact>;
  error?: string;
}

export async function getClients(): Promise<ClientsResult> {
  try {
    const { data, error } = await supabase.auth.admin.listUsers({
      perPage: 1000,
    });
    if (error) return { users: [], contacts: new Map(), error: error.message };

    const users = data?.users ?? [];
    let contacts = new Map<string, ClientContact>();
    try {
      const { data: rows } = await supabase
        .from("profiles")
        .select("id, full_name, phone, address, postal_code, city, province");
      contacts = new Map(
        (rows ?? []).map((r) => [
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
    } catch {
      contacts = new Map();
    }
    return { users, contacts };
  } catch (error) {
    return {
      users: [],
      contacts: new Map(),
      error: error instanceof Error ? error.message : "Error al cargar clientes",
    };
  }
}
