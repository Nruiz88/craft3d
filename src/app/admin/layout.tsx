import type { ReactNode } from "react";

export const metadata = { title: "Admin" };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="admin-layout">{children}</div>;
}
