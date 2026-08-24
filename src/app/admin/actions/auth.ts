"use server";

import { redirect } from "next/navigation";
import { login, logout } from "@/lib/auth";
import type { AdminFormState } from "./helpers";

export async function loginAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const password = String(formData.get("password") ?? "");
  const result = await login(password);
  if (!result.ok) return { error: result.error ?? "Error de autenticación" };
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await logout();
  redirect("/admin/login");
}
