"use server";

/**
 * Server actions para direcciones guardadas del usuario.
 * CRUD completo: listar, crear, actualizar, eliminar, marcar default.
 */

import { getServerSession } from "next-auth";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { authOptions } from "@/auth";
import { db } from "@/lib/db/client";
import { saved_addresses } from "@/lib/db/schema";

export interface SavedAddress {
  id: string;
  label: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
  createdAt: string;
}

interface AddressRow {
  id: string;
  user_id: string;
  label: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
  created_at: string | Date;
}

function rowToAddress(row: AddressRow): SavedAddress {
  return {
    id: row.id,
    label: row.label,
    name: row.name,
    phone: row.phone,
    address: row.address,
    city: row.city,
    province: row.province,
    postalCode: row.postal_code,
    isDefault: row.is_default,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
  };
}

async function currentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

/** Obtener todas las direcciones del usuario actual */
export async function getAddresses(): Promise<SavedAddress[]> {
  const userId = await currentUserId();
  if (!userId) return [];

  try {
    const rows = await db
      .select()
      .from(saved_addresses)
      .where(eq(saved_addresses.user_id, userId))
      .orderBy(
        desc(saved_addresses.is_default),
        desc(saved_addresses.created_at),
      );
    return (rows as AddressRow[]).map(rowToAddress);
  } catch (error) {
    console.error(
      "Error fetching addresses:",
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

/** Crear una nueva dirección */
export async function createAddress(
  addr: Omit<SavedAddress, "id" | "isDefault" | "createdAt">,
): Promise<{ ok: boolean; address?: SavedAddress; error?: string }> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Debes iniciar sesión" };

  try {
    // Verificar si es la primera dirección (será la default)
    const countRes = await db.execute(
      sql`select count(*)::int as count from saved_addresses where user_id = ${userId}`,
    );
    const isFirst =
      Number(
        (countRes.rows[0] as { count?: unknown } | undefined)?.count ?? 0,
      ) === 0;

    const [row] = await db
      .insert(saved_addresses)
      .values({
        user_id: userId,
        label: addr.label || "Mi dirección",
        name: addr.name,
        phone: addr.phone,
        address: addr.address,
        city: addr.city,
        province: addr.province,
        postal_code: addr.postalCode,
        is_default: isFirst,
      })
      .returning();
    if (!row) return { ok: false, error: "No se pudo crear la dirección" };

    return { ok: true, address: rowToAddress(row as AddressRow) };
  } catch (error) {
    console.error(
      "Error creating address:",
      error instanceof Error ? error.message : error,
    );
    return {
      ok: false,
      error: error instanceof Error ? error.message : "No se pudo crear",
    };
  }
}

/** Actualizar una dirección existente */
export async function updateAddress(
  id: string,
  addr: Omit<SavedAddress, "id" | "isDefault" | "createdAt">,
): Promise<{ ok: boolean; error?: string }> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Debes iniciar sesión" };

  try {
    await db
      .update(saved_addresses)
      .set({
        label: addr.label,
        name: addr.name,
        phone: addr.phone,
        address: addr.address,
        city: addr.city,
        province: addr.province,
        postal_code: addr.postalCode,
        updated_at: new Date(),
      })
      .where(
        and(
          eq(saved_addresses.id, id),
          eq(saved_addresses.user_id, userId),
        ),
      );
    return { ok: true };
  } catch (error) {
    console.error(
      "Error updating address:",
      error instanceof Error ? error.message : error,
    );
    return {
      ok: false,
      error: error instanceof Error ? error.message : "No se pudo actualizar",
    };
  }
}

/** Eliminar una dirección */
export async function deleteAddress(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Debes iniciar sesión" };

  try {
    await db
      .delete(saved_addresses)
      .where(
        and(
          eq(saved_addresses.id, id),
          eq(saved_addresses.user_id, userId),
        ),
      );

    // Si era la default, marcar la primera restante como default
    const [remaining] = await db
      .select({ id: saved_addresses.id })
      .from(saved_addresses)
      .where(eq(saved_addresses.user_id, userId))
      .orderBy(asc(saved_addresses.created_at))
      .limit(1);

    if (remaining) {
      const countRes = await db.execute(
        sql`select count(*)::int as count from saved_addresses where user_id = ${userId} and is_default = true`,
      );
      if (
        Number(
          (countRes.rows[0] as { count?: unknown } | undefined)?.count ?? 0,
        ) === 0
      ) {
        await db
          .update(saved_addresses)
          .set({ is_default: true, updated_at: new Date() })
          .where(eq(saved_addresses.id, remaining.id));
      }
    }

    return { ok: true };
  } catch (error) {
    console.error(
      "Error deleting address:",
      error instanceof Error ? error.message : error,
    );
    return {
      ok: false,
      error: error instanceof Error ? error.message : "No se pudo eliminar",
    };
  }
}

/** Marcar una dirección como default (desmarcar las demás) */
export async function setDefaultAddress(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Debes iniciar sesión" };

  try {
    // Desmarcar todas las direcciones del usuario
    await db
      .update(saved_addresses)
      .set({ is_default: false, updated_at: new Date() })
      .where(
        and(
          eq(saved_addresses.user_id, userId),
          eq(saved_addresses.is_default, true),
        ),
      );

    // Marcar la nueva default
    await db
      .update(saved_addresses)
      .set({ is_default: true, updated_at: new Date() })
      .where(
        and(
          eq(saved_addresses.id, id),
          eq(saved_addresses.user_id, userId),
        ),
      );

    return { ok: true };
  } catch (error) {
    console.error(
      "Error setting default:",
      error instanceof Error ? error.message : error,
    );
    return {
      ok: false,
      error: error instanceof Error ? error.message : "No se pudo actualizar",
    };
  }
}

/**
 * Migrar direcciones viejas de localStorage → DB.
 * Se llama una vez al primer login si hay datos en el browser.
 */
export async function migrateGuestAddresses(
  guestAddresses: Array<{
    label?: string;
    name: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    isDefault?: boolean;
  }>,
): Promise<{ ok: boolean; migrated: number; error?: string }> {
  if (guestAddresses.length === 0) return { ok: true, migrated: 0 };

  const userId = await currentUserId();
  if (!userId) return { ok: false, migrated: 0, error: "Debes iniciar sesión" };

  try {
    // Verificar si ya tiene direcciones (no migrar si ya tiene)
    const countRes = await db.execute(
      sql`select count(*)::int as count from saved_addresses where user_id = ${userId}`,
    );
    if (
      Number(
        (countRes.rows[0] as { count?: unknown } | undefined)?.count ?? 0,
      ) > 0
    ) {
      return { ok: true, migrated: 0 };
    }

    // Insertar todas las direcciones del guest
    const rows = guestAddresses.map((addr, i) => ({
      user_id: userId,
      label: addr.label || "Mi dirección",
      name: addr.name,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      province: addr.province,
      postal_code: addr.postalCode,
      is_default: addr.isDefault ?? i === 0,
    }));

    await db.insert(saved_addresses).values(rows);

    return { ok: true, migrated: rows.length };
  } catch (error) {
    console.error(
      "Error migrating addresses:",
      error instanceof Error ? error.message : error,
    );
    return {
      ok: false,
      migrated: 0,
      error: error instanceof Error ? error.message : "No se pudo migrar",
    };
  }
}
