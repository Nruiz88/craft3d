"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin, login, logout } from "@/lib/auth";
import {
  createProduct,
  deleteProduct,
  setProductFeatured,
  slugExists,
  updateProduct,
  validateProductInput,
} from "@/lib/store";
import { updateOrderStatus } from "@/lib/orders";
import { savePaymentSettings } from "@/lib/settings";
import type { ProductInput } from "@/lib/store";
import type { OrderStatus } from "@/lib/types";
import { slugify } from "@/lib/slug";

export type AdminFormState = { error?: string } | undefined;

export async function loginAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const password = String(formData.get("password") ?? "");
  const ok = await login(password);
  if (!ok) return { error: "Contraseña incorrecta" };
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await logout();
  redirect("/admin/login");
}

function parseProductForm(formData: FormData): ProductInput {
  const raw: Record<string, unknown> = {
    name: formData.get("name"),
    category: formData.get("category"),
    price: formData.get("price"),
    emoji: formData.get("emoji"),
    image:
      String(formData.get("imageData") || formData.get("image") || ""),
    description: formData.get("description"),
    details: String(formData.get("details") ?? "").split(/\r?\n/),
    stock: formData.get("stock"),
    featured: formData.get("featured") === "on",
    tags: String(formData.get("tags") ?? "").split(","),
  };
  return validateProductInput(raw);
}

async function resolveSlug(
  slugInput: string,
  name: string,
  excludeId?: number,
): Promise<string> {
  const base = slugify(slugInput.trim() ? slugInput : name) || "producto";
  let candidate = base;
  let i = 2;
  while (await slugExists(candidate, excludeId)) {
    candidate = `${base}-${i++}`;
  }
  return candidate;
}

export async function createProductAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  if (!(await isAdmin())) return { error: "No autorizado" };
  try {
    const input = parseProductForm(formData);
    input.slug = await resolveSlug(
      String(formData.get("slug") ?? ""),
      input.name,
    );
    await createProduct(input);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "No se pudo guardar el producto",
    };
  }
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?creado=1");
}

export async function updateProductAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  if (!(await isAdmin())) return { error: "No autorizado" };
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return { error: "ID de producto inválido" };
  }
  try {
    const input = parseProductForm(formData);
    input.slug = await resolveSlug(
      String(formData.get("slug") ?? ""),
      input.name,
      id,
    );
    await updateProduct(id, input);
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "No se pudo actualizar el producto",
    };
  }
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/productos/${formData.get("slug")}`);
  redirect(`/admin/productos/${id}/editar?guardado=1`);
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;
  try {
    await deleteProduct(id);
  } catch {
    redirect("/admin?error=borrar");
  }
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?borrado=1");
}

export async function toggleFeaturedAction(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;
  const featured = formData.get("featured") === "true";
  try {
    await setProductFeatured(id, featured);
  } catch {
    return;
  }
  revalidatePath("/");
  revalidatePath("/admin");
}

const orderStatuses: OrderStatus[] = [
  "pendiente",
  "pagado",
  "enviado",
  "entregado",
  "cancelado",
];

export async function setOrderStatusAction(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;
  const status = String(formData.get("status") ?? "");
  if (!orderStatuses.includes(status as OrderStatus)) return;
  try {
    await updateOrderStatus(id, status as OrderStatus);
  } catch {
    return;
  }
  revalidatePath("/admin/ventas");
  revalidatePath("/admin");
}

export async function saveSettingsAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  if (!(await isAdmin())) return { error: "No autorizado" };

  try {
    const str = (name: string) => String(formData.get(name) ?? "").trim();

    const accessToken = str("mp_access_token");
    const publicKey = str("mp_public_key");

    await savePaymentSettings({
      mercadopago: {
        accessToken:
          formData.get("clearMpAccessToken") === "on"
            ? ""
            : accessToken || undefined,
        publicKey:
          formData.get("clearMpPublicKey") === "on"
            ? ""
            : publicKey || undefined,
      },
      transfer: {
        bankName: str("transfer_bank_name"),
        holder: str("transfer_holder"),
        cbu: str("transfer_cbu"),
        alias: str("transfer_alias"),
        note: str("transfer_note"),
      },
    });
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "No se pudo guardar la configuración",
    };
  }

  revalidatePath("/admin/configuracion");
  revalidatePath("/carrito");
  return {};
}
