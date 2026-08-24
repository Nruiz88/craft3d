"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getOrderById, getOrders, updateOrderStatus, updateOrderItems } from "@/lib/orders";
import { getClients } from "@/lib/admin/clients";
import { logAdminAction } from "@/lib/admin/admin-log";
import { checkAdminRateLimit } from "@/lib/utils/admin-rate-limit";
import { awardPurchase } from "@/lib/gamification";
import { getMysteryBoxItems, mysteryBoxPoolLabel, parseMysteryRarity } from "@/lib/mystery-box";
import { sendOrderPaidEmail, sendMysteryRevealedEmail } from "@/lib/email";
import { orderStatusLabels, type OrderStatus } from "@/lib/products/types";
import { csvCell } from "./helpers";

export type RevealResult = { error?: string } | undefined;

const orderStatuses: OrderStatus[] = ["pendiente", "reserva", "pagado", "enviado", "entregado", "cancelado"];

export async function exportOrdersCsvAction(): Promise<{ csv?: string; error?: string }> {
  if (!(await isAdmin())) return { error: "No autorizado" };
  const rl = checkAdminRateLimit("export-csv", 3, 60 * 1000);
  if (!rl.allowed) return { error: rl.error };
  try {
    const orders = await getOrders();
    const rows = [
      ["id", "fecha", "cliente", "email", "estado", "metodo", "subtotal", "envio", "descuento", "cupon", "total", "productos"],
      ...orders.map((o) => [
        o.id, o.createdAt, o.customer_name, o.customer_email,
        orderStatusLabels[o.status], o.paymentMethod, o.subtotal, o.shipping,
        o.discount, o.couponCode ?? "", o.total,
        o.items.map((i) => `${i.quantity}x ${i.product_name}`).join(" | "),
      ]),
    ];
    return { csv: rows.map((r) => r.map(csvCell).join(";")).join("\r\n") };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo exportar" };
  }
}

export async function exportClientsCsvAction(): Promise<{ csv?: string; error?: string }> {
  if (!(await isAdmin())) return { error: "No autorizado" };
  const rl2 = checkAdminRateLimit("export-clients", 3, 60 * 1000);
  if (!rl2.allowed) return { error: rl2.error };
  try {
    const { users, contacts } = await getClients();
    const rows = [
      ["nombre", "email", "telefono", "ciudad", "provincia", "direccion", "codigo_postal", "proveedor", "fecha_alta", "ultimo_acceso"],
      ...users.map((u) => {
        const c = contacts.get(u.id);
        const provider = u.identities?.[0]?.provider ?? "email";
        return [
          c?.full_name || u.user_metadata?.full_name || "", u.email ?? "", c?.phone ?? "",
          c?.city ?? "", c?.province ?? "", c?.address ?? "", c?.postal_code ?? "",
          provider, u.created_at ?? "", u.last_sign_in_at ?? "",
        ];
      }),
    ];
    return { csv: rows.map((r) => r.map(csvCell).join(";")).join("\r\n") };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo exportar" };
  }
}

export async function setOrderStatusAction(
  prevState: unknown,
  formData: FormData,
): Promise<{ error?: string } | undefined> {
  if (!(await isAdmin())) return { error: "No autorizado" };
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return { error: "ID inválido" };
  const status = String(formData.get("status") ?? "");
  if (!orderStatuses.includes(status as OrderStatus)) return { error: "Estado inválido" };

  const order = await getOrderById(id);
  if (!order) return { error: "Pedido no encontrado" };

  const trackingNumber = String(formData.get("tracking_number") ?? "").trim() || null;

  try {
    await updateOrderStatus(id, status as OrderStatus);
    const trackingNote = trackingNumber ? ` (tracking: ${trackingNumber})` : "";
    await logAdminAction("estado pedido", `#${id}: ${orderStatusLabels[order.status]} → ${orderStatusLabels[status as OrderStatus]}${trackingNote}`);

    // Send email notification on status change
    const { sendOrderShippedEmail, sendOrderDeliveredEmail } = await import("@/lib/email");
    if (status === "enviado" && order.status !== "enviado") {
      await sendOrderShippedEmail(order, trackingNumber ?? undefined);
    } else if (status === "entregado" && order.status !== "entregado") {
      await sendOrderDeliveredEmail(order);
    }
  } catch {
    return { error: "Error al actualizar" };
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
  return undefined;
}

export async function deleteWaitlistEntryAction(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const { deleteWaitlistEntry } = await import("@/lib/notifications/waitlist");
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;
  try {
    await deleteWaitlistEntry(id);
  } catch {
    return;
  }
  redirect("/admin/waitlist");
}

export async function deleteRestockRequestAction(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const { deleteRestockRequest } = await import("@/lib/notifications/restock");
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;
  try {
    await deleteRestockRequest(id);
  } catch {
    return;
  }
  redirect("/admin/restock");
}

export async function notifyRestockAction(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const { getProductBySlug } = await import("@/lib/orders/store");
  const { sendRestockNotifications } = await import("@/lib/email");
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) return;

  const product = await getProductBySlug(slug);
  if (!product) return;

  try {
    const sent = await sendRestockNotifications(slug, product.name);
    if (sent === 0) redirect("/admin/restock?sinavisos=1");
  } catch {
    redirect("/admin/restock?error=email");
  }

  revalidatePath("/admin/restock");
  redirect("/admin/restock?notificado=1");
}
