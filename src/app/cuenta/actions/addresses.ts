"use server";

/**
 * Server actions para direcciones guardadas del usuario.
 * CRUD completo: listar, crear, actualizar, eliminar, marcar default.
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";

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
  created_at: string;
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
    createdAt: row.created_at,
  };
}

/** Obtener todas las direcciones del usuario actual */
export async function getAddresses(): Promise<SavedAddress[]> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("saved_addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching addresses:", error.message);
    return [];
  }

  return (data as AddressRow[]).map(rowToAddress);
}

/** Crear una nueva dirección */
export async function createAddress(
  addr: Omit<SavedAddress, "id" | "isDefault" | "createdAt">,
): Promise<{ ok: boolean; address?: SavedAddress; error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión" };

  // Verificar si es la primera dirección (será la default)
  const { count } = await supabase
    .from("saved_addresses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const isFirst = (count ?? 0) === 0;

  const { data, error } = await supabase
    .from("saved_addresses")
    .insert({
      user_id: user.id,
      label: addr.label || "Mi dirección",
      name: addr.name,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      province: addr.province,
      postal_code: addr.postalCode,
      is_default: isFirst,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating address:", error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true, address: rowToAddress(data as AddressRow) };
}

/** Actualizar una dirección existente */
export async function updateAddress(
  id: string,
  addr: Omit<SavedAddress, "id" | "isDefault" | "createdAt">,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión" };

  const { error } = await supabase
    .from("saved_addresses")
    .update({
      label: addr.label,
      name: addr.name,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      province: addr.province,
      postal_code: addr.postalCode,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating address:", error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

/** Eliminar una dirección */
export async function deleteAddress(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión" };

  const { error } = await supabase
    .from("saved_addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting address:", error.message);
    return { ok: false, error: error.message };
  }

  // Si era la default, marcar la primera restante como default
  const { data: remaining } = await supabase
    .from("saved_addresses")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1);

  if (remaining && remaining.length > 0) {
    const hasDefault = await supabase
      .from("saved_addresses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_default", true);

    if ((hasDefault.count ?? 0) === 0) {
      await supabase
        .from("saved_addresses")
        .update({ is_default: true })
        .eq("id", remaining[0].id);
    }
  }

  return { ok: true };
}

/** Marcar una dirección como default (desmarcar las demás) */
export async function setDefaultAddress(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión" };

  // Desmarcar todas las direcciones del usuario
  const { error: clearError } = await supabase
    .from("saved_addresses")
    .update({ is_default: false })
    .eq("user_id", user.id)
    .eq("is_default", true);

  if (clearError) {
    console.error("Error clearing defaults:", clearError.message);
    return { ok: false, error: clearError.message };
  }

  // Marcar la nueva default
  const { error } = await supabase
    .from("saved_addresses")
    .update({ is_default: true })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error setting default:", error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

/**
 * Migrar direcciones viejas de localStorage → Supabase.
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

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, migrated: 0, error: "Debes iniciar sesión" };

  // Verificar si ya tiene direcciones (no migrar si ya tiene)
  const { count } = await supabase
    .from("saved_addresses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if ((count ?? 0) > 0) {
    return { ok: true, migrated: 0 };
  }

  // Insertar todas las direcciones del guest
  const rows = guestAddresses.map((addr, i) => ({
    user_id: user.id,
    label: addr.label || "Mi dirección",
    name: addr.name,
    phone: addr.phone,
    address: addr.address,
    city: addr.city,
    province: addr.province,
    postal_code: addr.postalCode,
    is_default: addr.isDefault ?? i === 0,
  }));

  const { error } = await supabase.from("saved_addresses").insert(rows);

  if (error) {
    console.error("Error migrating addresses:", error.message);
    return { ok: false, migrated: 0, error: error.message };
  }

  return { ok: true, migrated: rows.length };
}
