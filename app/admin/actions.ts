"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin, login, logout } from "@/lib/auth";
import {
  createProduct,
  deleteProduct,
  getProductBySlug,
  setProductFeatured,
  slugExists,
  updateProduct,
  validateProductInput,
} from "@/lib/store";
import { getOrderById, updateOrderStatus } from "@/lib/orders";
import { awardPurchase } from "@/lib/gamification";
import { savePaymentSettings, saveReservationSettings } from "@/lib/settings";
import { deleteWaitlistEntry } from "@/lib/waitlist";
import { deleteRestockRequest } from "@/lib/restock";
import { sendOrderPaidEmail, sendRestockNotifications } from "@/lib/email";
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

function normalizeDropDate(value: FormDataEntryValue | null): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function parseProductForm(formData: FormData): ProductInput {
  const firstImage = String(formData.get("imageData") || formData.get("image") || "");
  const extraImages = [2, 3]
    .map((n) => String(formData.get(`imageData${n}`) || formData.get(`image${n}`) || ""))
    .filter((value) => value.trim() !== "");

  const raw: Record<string, unknown> = {
    name: formData.get("name"),
    category: formData.get("category"),
    price: formData.get("price"),
    emoji: formData.get("emoji"),
    image: firstImage,
    images: extraImages,
    description: formData.get("description"),
    details: String(formData.get("details") ?? "").split(/\r?\n/),
    stock: formData.get("stock"),
    featured: formData.get("featured") === "on",
    tags: String(formData.get("tags") ?? "").split(","),
    dropStartsAt: normalizeDropDate(formData.get("dropStartsAt")),
    dropEndsAt: normalizeDropDate(formData.get("dropEndsAt")),
    dropUnits: String(formData.get("dropUnits") ?? ""),
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

function targetOrigin(formData: FormData): string {
  const origen = String(formData.get("origen") ?? "");
  return origen.startsWith("/admin") ? origen : "/admin/productos";
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
  revalidatePath("/admin/productos");
  revalidatePath("/drops");
  redirect(`${targetOrigin(formData)}?creado=1`);
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
  revalidatePath("/admin/productos");
  revalidatePath("/drops");
  revalidatePath(`/productos/${formData.get("slug")}`);
  redirect(`${targetOrigin(formData)}?guardado=1`);
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;
  try {
    await deleteProduct(id);
  } catch {
    redirect(`${targetOrigin(formData)}?error=borrar`);
  }
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/productos");
  revalidatePath("/drops");
  redirect(`${targetOrigin(formData)}?borrado=1`);
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
  revalidatePath("/admin/productos");
}

const orderStatuses: OrderStatus[] = [
  "pendiente",
  "reserva",
  "pagado",
  "enviado",
  "entregado",
  "cancelado",
];

export async function deleteWaitlistEntryAction(
  formData: FormData,
): Promise<void> {
  if (!(await isAdmin())) return;
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;
  try {
    await deleteWaitlistEntry(id);
  } catch {
    return;
  }
  redirect("/admin/waitlist");
}

export async function deleteRestockRequestAction(
  formData: FormData,
): Promise<void> {
  if (!(await isAdmin())) return;
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;
  try {
    await deleteRestockRequest(id);
  } catch {
    return;
  }
  redirect("/admin/restock");
}

export async function setOrderStatusAction(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;
  const status = String(formData.get("status") ?? "");
  if (!orderStatuses.includes(status as OrderStatus)) return;

  const order = await getOrderById(id);
  if (!order) return;

  try {
    await updateOrderStatus(id, status as OrderStatus);
  } catch {
    return;
  }

  if (status === "pagado") {
    try {
      const paid = await getOrderById(id);
      if (paid) {
        await awardPurchase(paid);
        if (order.status !== "pagado") await sendOrderPaidEmail(paid);
      }
    } catch {
      // Las monedas y emails no deben romper el flujo del admin
    }
  }

  revalidatePath("/admin/ventas");
  revalidatePath("/admin");
}

export async function notifyRestockAction(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) return;

  const product = await getProductBySlug(slug);
  if (!product) return;

  try {
    const sent = await sendRestockNotifications(slug, product.name);
    if (sent === 0) {
      redirect("/admin/restock?sinavisos=1");
    }
  } catch {
    redirect("/admin/restock?error=email");
  }

  revalidatePath("/admin/restock");
  redirect("/admin/restock?notificado=1");
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

    const reservationPctRaw = str("reservation_pct");
    const reservationPct = Number(reservationPctRaw);
    const reservationFixedRaw = str("reservation_fixed");
    const reservationFixed = Number(reservationFixedRaw);

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

    await saveReservationSettings({
      enabled: formData.get("reservation_enabled") === "on",
      mode: str("reservation_mode") === "fixed" ? "fixed" : "pct",
      depositPct:
        reservationPctRaw && Number.isFinite(reservationPct)
          ? reservationPct
          : undefined,
      depositFixed:
        reservationFixedRaw && Number.isFinite(reservationFixed)
          ? reservationFixed
          : undefined,
      note: str("reservation_note") || undefined,
    });
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "No se pudo guardar la configuración",
    };
  }

  revalidatePath("/admin/configuracion");
  revalidatePath("/carrito");
  revalidatePath("/drops");
  return {};
}
