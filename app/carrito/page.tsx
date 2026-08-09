import CartView from "@/components/cart-view";
import { getAllProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const products = await getAllProducts();
  return <CartView products={products} />;
}
