import type { ReactNode } from "react";

export const metadata = { title: "Admin Login" };

export default function AdminLoginLayout({ children }: { children: ReactNode }) {
  return <div className="admin-login-layout">{children}</div>;
}
