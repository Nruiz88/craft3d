import type { Metadata } from "next";
import CouponsManager from "@/components/admin/coupons-manager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cupones",
};

export default function CouponsPage() {
  return <CouponsManager />;
}
