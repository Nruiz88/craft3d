import type { ReactNode } from "react";
import { getCsrfToken } from "@/lib/utils/csrf";
import { CsrfProvider } from "@/components/admin/csrf-provider";

export const metadata = { title: "Admin" };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const csrfToken = await getCsrfToken();

  return (
    <CsrfProvider token={csrfToken}>
      <div className="admin-layout">{children}</div>
    </CsrfProvider>
  );
}
