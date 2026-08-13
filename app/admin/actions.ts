"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin, login, logout } from "@/lib/auth";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductBySlug,
  setProductFeatured,
  setProductStock,
  decrementProductStock,
  slugExists,
  updateProduct,
  validateProductInput,
} from "@/lib/store";
import { getOrderById, getOrders, updateOrderStatus, updateOrderItems } from "@/lib/orders";
import { getClients } from "@/lib/clients";
import { logAdminAction } from "@/lib/admin-log";
import { awardPurchase } from "@/lib/gamification";
import {
  getMysteryPoolProducts,
  drawMysteryPiece,
  parseMysteryPool,
  mysteryPoolLabel,
} from "@/lib/mystery-box";
import {
  savePaymentSettings,
  saveReservationSettings,
  saveShippingSettings,
} from "@/lib/settings";
import { deleteWaitlistEntry } from "@/lib/waitlist";
import { deleteRestockRequest } from "@/lib/restock";
import { sendOrderPaidEmail, sendRestockNotifications } from "@/lib/email";
import { orderStatusLabels, type OrderStatus } from "@/lib/types";
import type { ProductInput } from "@/lib/store";
import { slugify } from "@/lib/slug";

export type AdminFormState = { error?: string } | undefined;

function csvCell(value: string | number): string {
  const s = String(value ?? "");
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function exportOrdersCsvAction(): Promise<{
  csv?: string;
  error?: string;
}> {
  if (!(await isAdmin())) return { error: "No autorizado" };
  try {
    const orders = await getOrders();
    const rows = [
      [
        "id",
        "fecha",
        "cliente",
        "email",
        "estado",
        "metodo",
        "subtotal",
        "envio",
        "descuento",
        "cupon",
        "total",
        "productos",
      ],
      ...orders.map((o) => [
        o.id,
        o.createdAt,
        o.customer_name,
        o.customer_email,
        orderStatusLabels[o.status],
        o.paymentMethod,
        o.subtotal,
        o.shipping,
        o.discount,
        o.couponCode ?? "",
        o.total,
        o.items.map((i) => `${i.quantity}x ${i.product_name}`).join(" | "),
      ]),
    ];
    return { csv: rows.map((r) => r.map(csvCell).join(";")).join("\r\n") };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "No se pudo exportar",
    };
  }
}

export async function exportClientsCsvAction(): Promise<{
  csv?: string;
  error?: string;
}> {
  if (!(await isAdmin())) return { error: "No autorizado" };
  try {
    const { users, contacts } = await getClients();
    const rows = [
      ["nombre", "email", "telefono", "ciudad", "provincia", "direccion", "codigo_postal", "proveedor", "fecha_alta", "ultimo_acceso"],
      ...users.map((u) => {
        const c = contacts.get(u.id);
        const provider = u.identities?.[0]?.provider ?? "email";
        return [
          c?.full_name || u.user_metadata?.full_name || "",
          u.email ?? "",
          c?.phone ?? "",
          c?.city ?? "",
          c?.province ?? "",
          c?.address ?? "",
          c?.postal_code ?? "",
          provider,
          u.created_at ?? "",
          u.last_sign_in_at ?? "",
        ];
      }),
    ];
    return { csv: rows.map((r) => r.map(csvCell).join(";")).join("\r\n") };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "No se pudo exportar",
    };
  }
}

export async function updateStockAction(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = Number(formData.get("id"));
  const stock = Number(formData.get("stock"));
  if (!Number.isInteger(id) || id <= 0) return;
  if (!Number.isInteger(stock) || stock < 0) return;
  try {
    await setProductStock(id, stock);
    await logAdminAction("stock", `Producto #${id} → ${stock} u.`);
  } catch {
    return;
  }
  revalidatePath("/");
  revalidatePath("/admin/productos");
  revalidatePath("/admin");
}

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

  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim().replace(/^#/, ""))
    .filter(Boolean);

  const category = String(formData.get("category") ?? "").trim();
  if (category === "mystery-box") {
    const pool = String(formData.get("mysteryPool") ?? "").trim() || "all";
    tags.push(`pool:${pool}`);
  }

  const raw: Record<string, unknown> = {
    name: formData.get("name"),
    category,
    price: formData.get("price"),
    emoji: formData.get("emoji"),
    image: firstImage,
    images: extraImages,
    description: formData.get("description"),
    details: String(formData.get("details") ?? "").split(/\r?\n/),
    stock: formData.get("stock"),
    featured: formData.get("featured") === "on",
    tags,
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
    await logAdminAction("crear producto", input.slug);
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
  revalidatePath("/mysterybox");
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
    await logAdminAction("editar producto", input.slug);
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
  revalidatePath("/mysterybox");
  revalidatePath(`/productos/${formData.get("slug")}`);
  redirect(`${targetOrigin(formData)}?guardado=1`);
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;
  try {
    await deleteProduct(id);
    await logAdminAction("borrar producto", `#${id}`);
  } catch {
    redirect(`${targetOrigin(formData)}?error=borrar`);
  }
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/productos");
  revalidatePath("/drops");
  revalidatePath("/mysterybox");
  redirect(`${targetOrigin(formData)}?borrado=1`);
}

export async function toggleFeaturedAction(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;
  const featured = formData.get("featured") === "true";
  try {
    await setProductFeatured(id, featured);
    await logAdminAction(
      featured ? "destacar producto" : "quitar destacado",
      `#${id}`,
    );
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
    await logAdminAction(
      "estado pedido",
      `#${id}: ${orderStatusLabels[order.status]} → ${orderStatusLabels[status as OrderStatus]}`,
    );
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

    const shippingFreeRaw = str("shipping_free_from");
    const shippingFree = Number(shippingFreeRaw);
    const weightRaw = str("correo_weight_grams");
    const weight = Number(weightRaw);

    await saveShippingSettings({
      correo: {
        enabled: formData.get("shipping_enabled") === "on",
        customerId:
          formData.get("clearCorreoCustomerId") === "on"
            ? ""
            : str("correo_customer_id") || undefined,
        userToken:
          formData.get("clearCorreoUserToken") === "on"
            ? ""
            : str("correo_user_token") || undefined,
        passwordToken:
          formData.get("clearCorreoPasswordToken") === "on"
            ? ""
            : str("correo_password_token") || undefined,
        postalCodeOrigin:
          str("correo_postal_code_origin") || undefined,
        weightGrams:
          weightRaw && Number.isFinite(weight) ? weight : undefined,
        environment:
          str("correo_environment") === "TEST" ? "TEST" : "PROD",
      },
      freeShipping: {
        enabled: formData.get("shipping_free_enabled") === "on",
        from:
          shippingFreeRaw && Number.isFinite(shippingFree)
            ? shippingFree
            : undefined,
      },
    });

    await logAdminAction("configuracion", "guardar ajustes");
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

export type RevealPieceResult = {
  piece?: { slug: string; name: string; emoji: string };
  error?: string;
} | undefined;

function orderItemBoxIndex(orderId: number, itemIndex: number): number {
  if (!Number.isInteger(itemIndex) || itemIndex < 0) return -1;
  return itemIndex;
}

export async function drawMysteryPieceAction(
  formData: FormData,
): Promise<RevealPieceResult> {
  if (!(await isAdmin())) return { error: "No autorizado" };
  const orderId = Number(formData.get("orderId"));
  const itemIndex = orderItemBoxIndex(orderId, Number(formData.get("itemIndex")));
  if (!Number.isInteger(orderId) || orderId <= 0 || itemIndex < 0) {
    return { error: "Pedido inválido" };
  }

  const order = await getOrderById(orderId);
  if (!order || !Array.isArray(order.items)) {
    return { error: "Pedido no encontrado" };
  }
  const item = order.items[itemIndex];
  if (!item) return { error: "Ítem no encontrado" };

  const box = await getProductBySlug(item.product_slug);
  if (!box || box.category !== "mystery-box") {
    return { error: "No es una caja sorpresa" };
  }

  try {
    const allProducts = await getAllProducts();
    const pool = getMysteryPoolProducts(allProducts, box);
    const piece = drawMysteryPiece(pool);
    if (!piece) {
      return {
        error: "No hay piezas disponibles para esta caja (reponé stock o cambiá el pool).",
      };
    }
    return { piece: { slug: piece.slug, name: piece.name, emoji: piece.emoji } };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "No se pudo sortear la pieza",
    };
  }
}

export async function confirmMysteryRevealAction(
  formData: FormData,
): Promise<{ error?: string } | undefined> {
  if (!(await isAdmin())) return { error: "No autorizado" };
  const orderId = Number(formData.get("orderId"));
  const itemIndex = orderItemBoxIndex(orderId, Number(formData.get("itemIndex")));
  const pieceSlug = String(formData.get("pieceSlug") ?? "").trim();
  if (!Number.isInteger(orderId) || orderId <= 0 || itemIndex < 0) {
    return { error: "Pedido inválido" };
  }
  if (!pieceSlug) return { error: "Pieza inválida" };

  const order = await getOrderById(orderId);
  if (!order || !Array.isArray(order.items)) {
    return { error: "Pedido no encontrado" };
  }
  const item = order.items[itemIndex];
  if (!item) return { error: "Ítem no encontrado" };

  const box = await getProductBySlug(item.product_slug);
  if (!box || box.category !== "mystery-box") {
    return { error: "No es una caja sorpresa" };
  }

  const piece = await getProductBySlug(pieceSlug);
  if (!piece) return { error: "La pieza sorteada ya no existe" };

  try {
    const allProducts = await getAllProducts();
    const pool = getMysteryPoolProducts(allProducts, box);
    if (!pool.some((p) => p.slug === pieceSlug)) {
      return { error: "La pieza no pertenece al pool de la caja" };
    }
    if (piece.stock <= 0) {
      return { error: `"${piece.name}" quedó sin stock. Sortea otra pieza.` };
    }

    await decrementProductStock(piece.id, 1);

    const revealed = Number(item.revealed ?? 0);
    const items = order.items.map((i, index) =>
      index === itemIndex ? { ...i, revealed: revealed + 1 } : i,
    );
    items.push({
      product_id: piece.id,
      product_slug: piece.slug,
      product_name: `🎁 Incluye: ${piece.name}`,
      price: 0,
      quantity: 1,
      subtotal: 0,
      revealFor: item.product_slug,
    });

    await updateOrderItems(order.id, items);
    await logAdminAction(
      "revelar caja",
      `Pedido #${order.id}: ${piece.name} (pool ${mysteryPoolLabel(
        parseMysteryPool(box.tags),
      )})`,
    );
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "No se pudo revelar la pieza",
    };
  }

  revalidatePath("/admin/mysterybox/revelaciones");
  revalidatePath("/cuenta/pedidos");
  return {};
}
