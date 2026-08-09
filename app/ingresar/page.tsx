import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-user";
import AuthShell from "@/components/auth/auth-shell";
import LoginForm from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  if (await getCurrentUser()) redirect("/cuenta");

  return (
    <AuthShell
      title="Ingresar"
      subtitle={
        <>
          Entrá con Google o con tu cuenta de Craf
          <span className="text-amber-400">3d</span>
        </>
      }
    >
      <LoginForm next={params.next} error={params.error} />
    </AuthShell>
  );
}
