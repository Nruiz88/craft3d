"use server";

import { revalidatePath } from "next/cache";
import { joinRestock } from "@/lib/restock";

export type RestockState = { ok?: boolean; error?: string } | undefined;

export async function joinRestockAction(
  _prev: RestockState,
  formData: FormData,
): Promise<RestockState> {
  const slug = String(formData.get("productSlug") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();

  if (!slug) return { error: "Falta el producto" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Email inválido" };
  }
  if (whatsapp && !/^[+0-9 ().-]{6,20}$/.test(whatsapp)) {
    return { error: "WhatsApp inválido" };
  }

  try {
    await joinRestock({ slug, email, whatsapp });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "No se pudo guardar tu email. Probá de nuevo.",
    };
  }

  revalidatePath("/");
  revalidatePath(`/productos/${slug}`);
  return { ok: true };
}
