import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-user";
import AuthShell from "@/components/auth/auth-shell";
import RegisterForm from "@/components/auth/register-form";

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/cuenta");

  return (
    <AuthShell
      title="Crear cuenta"
      subtitle="Registrate para acceder a tu cuenta de cliente en Craft3d."
    >
      <RegisterForm />
    </AuthShell>
  );
}
