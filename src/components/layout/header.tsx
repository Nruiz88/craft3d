import HeaderNav from "./header-nav";

export default function Header({ user }: { user?: { name: string | null } | null }) {
  return (
    <header>
      <HeaderNav user={user ?? null} />
    </header>
  );
}
