// Esquema Drizzle — espejo de las tablas de craft3d_db en MariaDB.
// Claves JS en snake_case para que las filas tengan la misma forma que
// consumen los componentes.
// profiles suma email/password_hash/role (auth propia).

import {
  bigint,
  boolean,
  decimal,
  int,
  json,
  mysqlTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';

export const products = mysqlTable('products', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull().default('figuras'),
  price: decimal('price', { precision: 12, scale: 2 }).notNull().default('0.00'),
  emoji: varchar('emoji', { length: 10 }).notNull().default('🎁'),
  image: text('image'),
  description: text('description').notNull().default(''),
  details: json('details').$type<string[]>().notNull().default([]),
  stock: int('stock').notNull().default(0),
  featured: boolean('featured').notNull().default(false),
  tags: json('tags').$type<string[]>().notNull().default([]),
  created_at: timestamp('created_at', { fsp: 6 }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { fsp: 6 }).notNull().defaultNow().onUpdateNow(),
  drop_starts_at: timestamp('drop_starts_at', { fsp: 6 }),
  drop_ends_at: timestamp('drop_ends_at', { fsp: 6 }),
  drop_units: int('drop_units'),
  images: json('images').$type<string[]>().notNull().default([]),
});

export const profiles = mysqlTable('profiles', {
  id: varchar('id', { length: 36 }).primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password_hash: varchar('password_hash', { length: 255 }),
  role: varchar('role', { length: 50 }).notNull().default('customer'),
  full_name: varchar('full_name', { length: 255 }).notNull().default(''),
  phone: varchar('phone', { length: 50 }).notNull().default(''),
  city: varchar('city', { length: 100 }).notNull().default(''),
  address: varchar('address', { length: 500 }).notNull().default(''),
  postal_code: varchar('postal_code', { length: 20 }).notNull().default(''),
  province: varchar('province', { length: 100 }).notNull().default(''),
  created_at: timestamp('created_at', { fsp: 6 }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { fsp: 6 }).notNull().defaultNow().onUpdateNow(),
});

export const settings = mysqlTable('settings', {
  key: varchar('key', { length: 100 }).primaryKey(),
  value: text('value').notNull().default(''),
  updated_at: timestamp('updated_at', { fsp: 6 }).notNull().defaultNow().onUpdateNow(),
});

export const orders = mysqlTable('orders', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  user_id: varchar('user_id', { length: 36 }),
  customer_name: varchar('customer_name', { length: 255 }).notNull().default(''),
  customer_email: varchar('customer_email', { length: 255 }).notNull().default(''),
  status: varchar('status', { length: 50 }).notNull().default('pendiente'),
  payment_method: varchar('payment_method', { length: 50 }).notNull().default('transferencia'),
  payment_id: varchar('payment_id', { length: 255 }).notNull().default(''),
  mp_preference_id: varchar('mp_preference_id', { length: 255 }).notNull().default(''),
  shipping_phone: varchar('shipping_phone', { length: 50 }).notNull().default(''),
  shipping_address: varchar('shipping_address', { length: 500 }).notNull().default(''),
  shipping_city: varchar('shipping_city', { length: 100 }).notNull().default(''),
  shipping_province: varchar('shipping_province', { length: 100 }).notNull().default(''),
  shipping_postal_code: varchar('shipping_postal_code', { length: 20 }).notNull().default(''),
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull().default('0.00'),
  shipping: decimal('shipping', { precision: 12, scale: 2 }).notNull().default('0.00'),
  total: decimal('total', { precision: 12, scale: 2 }).notNull().default('0.00'),
  items: json('items').$type<OrderItemSnapshotDB[]>().notNull().default([]),
  created_at: timestamp('created_at', { fsp: 6 }).notNull().defaultNow(),
  is_reservation: boolean('is_reservation').notNull().default(false),
  deposit_paid: decimal('deposit_paid', { precision: 12, scale: 2 }).notNull().default('0.00'),
  rewards_awarded: boolean('rewards_awarded').notNull().default(false),
  discount: decimal('discount', { precision: 12, scale: 2 }).notNull().default('0.00'),
  coupon_code: varchar('coupon_code', { length: 100 }),
});

// JSONB shape de orders.items (snapshot del carrito + mystery box)
export interface OrderItemSnapshotDB {
  product_id: number;
  product_slug: string;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
  revealed?: number;
  revealFor?: string;
  giftMessage?: string;
  priority?: boolean;
}

export const drop_waitlist = mysqlTable('drop_waitlist', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  product_slug: varchar('product_slug', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  whatsapp: varchar('whatsapp', { length: 50 }).notNull().default(''),
  created_at: timestamp('created_at', { fsp: 6 }).notNull().defaultNow(),
});

export const restock_requests = mysqlTable('restock_requests', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  product_slug: varchar('product_slug', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  whatsapp: varchar('whatsapp', { length: 50 }).notNull().default(''),
  created_at: timestamp('created_at', { fsp: 6 }).notNull().defaultNow(),
});

export const wishlists = mysqlTable(
  'wishlists',
  {
    user_id: varchar('user_id', { length: 36 }).notNull(),
    product_slug: varchar('product_slug', { length: 255 }).notNull(),
    created_at: timestamp('created_at', { fsp: 6 }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.user_id, t.product_slug] })],
);

export const player_profiles = mysqlTable('player_profiles', {
  user_id: varchar('user_id', { length: 36 }).primaryKey(),
  coins: int('coins').notNull().default(0),
  total_paid: decimal('total_paid', { precision: 12, scale: 2 }).notNull().default('0.00'),
  order_count: int('order_count').notNull().default(0),
  created_at: timestamp('created_at', { fsp: 6 }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { fsp: 6 }).notNull().defaultNow().onUpdateNow(),
});

export const player_badges = mysqlTable(
  'player_badges',
  {
    user_id: varchar('user_id', { length: 36 }).notNull(),
    badge_id: varchar('badge_id', { length: 100 }).notNull(),
    earned_at: timestamp('earned_at', { fsp: 6 }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.user_id, t.badge_id] })],
);

export const coupons = mysqlTable('coupons', {
  code: varchar('code', { length: 100 }).primaryKey(),
  kind: varchar('kind', { length: 20 }).notNull().default('fixed'),
  value: decimal('value', { precision: 12, scale: 2 }).notNull(),
  min_subtotal: decimal('min_subtotal', { precision: 12, scale: 2 }).notNull().default('0.00'),
  max_uses: int('max_uses').notNull().default(1),
  times_used: int('times_used').notNull().default(0),
  expires_at: timestamp('expires_at', { fsp: 6 }),
  user_id: varchar('user_id', { length: 36 }),
  created_at: timestamp('created_at', { fsp: 6 }).notNull().defaultNow(),
});

export const coin_redemptions = mysqlTable('coin_redemptions', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  user_id: varchar('user_id', { length: 36 }).notNull(),
  coins: int('coins').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  coupon_code: varchar('coupon_code', { length: 100 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('activo'),
  created_at: timestamp('created_at', { fsp: 6 }).notNull().defaultNow(),
  expires_at: timestamp('expires_at', { fsp: 6 }).notNull(),
});

export const cart_items = mysqlTable('cart_items', {
  id: varchar('id', { length: 36 }).primaryKey(),
  user_id: varchar('user_id', { length: 36 }).notNull(),
  product_slug: varchar('product_slug', { length: 255 }).notNull(),
  quantity: int('quantity').notNull().default(1),
  created_at: timestamp('created_at', { fsp: 6 }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { fsp: 6 }).notNull().defaultNow().onUpdateNow(),
});

export const saved_addresses = mysqlTable('saved_addresses', {
  id: varchar('id', { length: 36 }).primaryKey(),
  user_id: varchar('user_id', { length: 36 }).notNull(),
  label: varchar('label', { length: 100 }).notNull().default('Mi dirección'),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  address: varchar('address', { length: 500 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  province: varchar('province', { length: 100 }).notNull(),
  postal_code: varchar('postal_code', { length: 20 }).notNull(),
  is_default: boolean('is_default').notNull().default(false),
  created_at: timestamp('created_at', { fsp: 6 }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { fsp: 6 }).notNull().defaultNow().onUpdateNow(),
});

export const admin_logs = mysqlTable('admin_logs', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  action: varchar('action', { length: 255 }).notNull(),
  detail: text('detail').notNull().default(''),
  created_at: timestamp('created_at', { fsp: 6 }).notNull().defaultNow(),
});

export const notifications = mysqlTable('notifications', {
  id: varchar('id', { length: 36 }).primaryKey(),
  user_id: varchar('user_id', { length: 36 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull().default(''),
  link: varchar('link', { length: 500 }),
  read: boolean('read').notNull().default(false),
  created_at: timestamp('created_at', { fsp: 6 }).notNull().defaultNow(),
});

export const editable_pages = mysqlTable('editable_pages', {
  slug: varchar('slug', { length: 255 }).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  subtitle: varchar('subtitle', { length: 255 }).notNull().default(''),
  content: json('content').$type<PageSectionDB[]>().notNull().default([]),
  published: boolean('published').notNull().default(true),
  updated_at: timestamp('updated_at', { fsp: 6 }).notNull().defaultNow().onUpdateNow(),
  created_at: timestamp('created_at', { fsp: 6 }).notNull().defaultNow(),
});

// Forma de una sección de editable_pages.content
export interface PageSectionDB {
  heading: string;
  body: string;
}