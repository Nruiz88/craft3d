import type { Metadata } from "next";
import PagesManager from "@/components/admin/pages-manager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Páginas editables",
};

export default function AdminPagesPage() {
  return <PagesManager />;
}
