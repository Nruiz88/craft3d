import { getCurrentUser } from "@/lib/auth-user";
import HeaderNav from "./header-nav";

export default async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <HeaderNav
        user={
          user
            ? { name: user.fullName || user.email || "Mi cuenta" }
            : null
        }
      />
    </header>
  );
}
