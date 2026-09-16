"use server";

import { redirect } from "next/navigation";

export async function logoutAction(): Promise<void> {
  redirect("/api/auth/signout?callbackUrl=/admin/login");
}
