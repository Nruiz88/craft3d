export type CategoryId =
  | "anime"
  | "gaming"
  | "cine-series"
  | "accesorios"
  | "ediciones-limitadas"
  | "mundial-2026";

export interface Category {
  id: CategoryId;
  name: string;
  emoji: string;
  description: string;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  category: CategoryId;
  price: number;
  emoji: string;
  image: string | null;
  description: string;
  details: string[];
  stock: number;
  featured?: boolean;
  tags: string[];
  createdAt: string;
}

export interface CartItem {
  slug: string;
  quantity: number;
}

export type OrderStatus =
  | "pendiente"
  | "pagado"
  | "enviado"
  | "entregado"
  | "cancelado";

export type PaymentMethod = "transferencia" | "mercado_pago";

export const orderStatusLabels: Record<OrderStatus, string> = {
  pendiente: "Pendiente",
  pagado: "Pagado",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  transferencia: "Transferencia bancaria",
  mercado_pago: "Mercado Pago",
};

export interface OrderItemSnapshot {
  product_id: number;
  product_slug: string;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentId: string;
  mpPreferenceId: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_province: string;
  shipping_postal_code: string;
  subtotal: number;
  shipping: number;
  total: number;
  items: OrderItemSnapshot[];
  createdAt: string;
}
