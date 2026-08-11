"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { REDEEM_OPTIONS } from "@/lib/coupons";

export type RedeemState =
  | { code?: string; amount?: number; error?: string }
  | undefined;

export async function redeemCoinsAction(
  coins: number,
): Promise<RedeemState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Ingresá a tu cuenta para canjear monedas" };

  const option = REDEEM_OPTIONS.find((candidate) => candidate.coins === coins);
  if (!option) return { error: "Opción de canje inválida" };

  const { data, error } = await supabase.rpc("redeem_coins", {
    p_user_id: user.id,
    p_coins: coins,
  });

  if (error) return { error: error.message };

  revalidatePath("/cuenta");
  return {
    code: String(data?.code ?? ""),
    amount: Number(data?.amount ?? 0),
  };
}
