import "server-only";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";

export async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }
}

export async function isLoggedIn(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return Boolean(session?.user?.id);
}
