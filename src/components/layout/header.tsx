import HeaderNav from "./header-nav";
import { getCurrentUser } from "@/lib/auth/user";

export default async function Header() {
  let name: string | null = null;
  try {
    const user = await getCurrentUser();
    name = user?.name || user?.email.split("@")[0] || null;
  } catch {
    name = null;
  }
  return (
    <header>
      <HeaderNav user={name ? { name } : null} />
    </header>
  );
}
