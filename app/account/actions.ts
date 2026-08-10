"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export type AuthFormState = { error?: string; message?: string } | undefined;
export type CheckoutState =
  | { error?: string; orderId?: string; initPoint?: string }
  | undefined;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function getOrigin(): Promise<string> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

function safeNext(next: string): string {
  return next.startsWith("/") && !next.startsWith("//") ? next : "/cuenta";
}

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const supabase = await createSupabaseServerClient();

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const postalCode = String(formData.get("postalCode") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const province = String(formData.get("province") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!fullName) return { error: "Ingresá tu nombre" };
  if (!EMAIL_RE.test(email)) return { error: "Ingresá un email válido" };
  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres" };
  }
  if (password !== confirm) return { error: "Las contraseñas no coinciden" };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
        address,
        postal_code: postalCode,
        city,
        province,
      },
      emailRedirectTo: `${await getOrigin()}/auth/callback`,
    },
  });

  if (error) return { error: error.message };

  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/cuenta?bienvenido=1");
  }

  return {
    message: "Cuenta creada. Revisá tu correo para confirmarla y poder ingresar.",
  };
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const supabase = await createSupabaseServerClient();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(String(formData.get("next") ?? "/cuenta"));

  if (!email || !password) {
    return { error: "Completá tu email y contraseña" };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { error: "Email o contraseña incorrectos" };

  revalidatePath("/", "layout");
  redirect(next);
}

export async function updateProfileAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const postalCode = String(formData.get("postalCode") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const province = String(formData.get("province") ?? "").trim();

  if (!fullName) return { error: "El nombre es obligatorio" };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone,
      address,
      postal_code: postalCode,
      city,
      province,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/cuenta");
  return { message: "Datos actualizados" };
}

export async function googleLoginAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const origin = await getOrigin();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });

  if (error || !data.url) {
    redirect("/ingresar?error=google");
  }

  redirect(data.url);
}

export async function logoutUserAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function checkoutAction(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar?next=/carrito");

  const rawItems = String(formData.get("items") ?? "").trim();
  let items: unknown;
  try {
    items = JSON.parse(rawItems);
  } catch {
    return { error: "El carrito no es válido" };
  }
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Tu carrito está vacío" };
  }
  for (const item of items) {
    const candidate = item as { slug?: unknown; quantity?: unknown };
    if (
      typeof candidate.slug !== "string" ||
      !candidate.slug ||
      typeof candidate.quantity !== "number" ||
      !Number.isInteger(candidate.quantity) ||
      candidate.quantity <= 0
    ) {
      return { error: "El carrito no es válido" };
    }
  }

  const paymentMethod = String(formData.get("paymentMethod") ?? "") === "mercado_pago"
    ? "mercado_pago"
    : "transferencia";

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, address, city, province, postal_code")
    .eq("id", user.id)
    .maybeSingle();

  const fullName =
    String(profile?.full_name ?? "").trim() ||
    String(user.user_metadata?.full_name ?? "").trim() ||
    String(user.user_metadata?.name ?? "").trim() ||
    "";

  const { data, error } = await supabase.rpc("place_order", {
    p_user_id: user.id,
    p_customer_name: fullName || user.email || "Cliente",
    p_customer_email: user.email ?? "",
    p_items: items,
    p_shipping_phone: String(profile?.phone ?? ""),
    p_shipping_address: String(profile?.address ?? ""),
    p_shipping_city: String(profile?.city ?? ""),
    p_shipping_province: String(profile?.province ?? ""),
    p_shipping_postal_code: String(profile?.postal_code ?? ""),
    p_payment_method: paymentMethod,
  });

  if (error) return { error: error.message };

  const orderId = String(data?.order_id ?? "");
  if (!orderId) return { error: "No se pudo registrar el pedido" };

  if (paymentMethod === "mercado_pago") {
    const origin = await getOrigin();
    const initPoint = await createMercadoPagoCheckout(orderId, origin);
    if (!initPoint) {
      return {
        error:
          "Mercado Pago no está configurado todavía. Elegí transferencia bancaria y coordinamos el pago.",
      };
    }
    revalidatePath("/");
    revalidatePath("/carrito");
    return { orderId, initPoint };
  }

  revalidatePath("/");
  revalidatePath("/carrito");
  return { orderId };
}

async function createMercadoPagoCheckout(
  orderId: string,
  origin: string,
): Promise<string | null> {
  const [{ getPaymentSettings }, { getOrderById, setOrderPreference }, { createPreference }] =
    await Promise.all([
      import("@/lib/settings"),
      import("@/lib/orders"),
      import("@/lib/mercadopago"),
    ]);

  const settings = await getPaymentSettings();
  const accessToken = settings.mercadopago.accessToken.trim();
  if (!accessToken) return null;

  const order = await getOrderById(Number(orderId));
  if (!order) return null;

  const preference = await createPreference({
    accessToken,
    items: order.items.map((item) => ({
      title: item.product_name,
      quantity: item.quantity,
      unitPrice: Number(item.price),
    })),
    externalReference: orderId,
    notificationUrl: `${origin}/api/mercadopago/webhook`,
    backUrls: {
      success: `${origin}/carrito?pago=exito&pedido=${orderId}`,
      pending: `${origin}/carrito?pago=pendiente&pedido=${orderId}`,
      failure: `${origin}/carrito?pago=error&pedido=${orderId}`,
    },
  });

  await setOrderPreference(order.id, preference.id);
  return preference.initPoint;
}
