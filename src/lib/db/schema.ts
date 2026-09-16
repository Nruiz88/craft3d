// Esquema Drizzle — espejo de las tablas de craft3d_db en PostgreSQL propio.
// Claves JS en snake_case para que las filas tengan la misma forma que
// consumen los componentes.
// profiles suma email/password_hash/role (auth propia; ver 001_auth_delta.sql).

import {
  bigint,
  boolean,
  date,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  category: text('category').notNull().default('figuras'),
  price: numeric('price', { precision: 12, scale: 2 }).notNull().default('0'),
  emoji: text('emoji').notNull().default('🎁'),
  image: text('image'),
  description: text('description').notNull().default(''),
  details: jsonb('details').notNull().default([]),
  stock: integer('stock').notNull().default(0),
  featured: boolean('featured').notNull().default(false),
  tags: jsonb('tags').notNull().default([]),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  drop_starts_at: timestamp('drop_starts_at', { withTimezone: true }),
  drop_ends_at: timestamp('drop_ends_at', { withTimezone: true }),
  drop_units: integer('drop_units'),
  images: jsonb('images').notNull().default([]),
});

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  email: text('email').unique(),
  password_hash: text('password_hash'),
  role: text('role').notNull().default('customer'),
  full_name: text('full_name').notNull().default(''),
  phone: text('phone').notNull().default(''),
  city: text('city').notNull().default(''),
  address: text('address').notNull().default(''),
  postal_code: text('postal_code').notNull().default(''),
  province: text('province').notNull().default(''),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull().default(''),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const orders = pgTable('orders', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  user_id: uuid('user_id'),
  customer_name: text('customer_name').notNull().default(''),
  customer_email: text('customer_email').notNull().default(''),
  status: text('status').notNull().default('pendiente'),
  payment_method: text('payment_method').notNull().default('transferencia'),
  payment_id: text('payment_id').notNull().default(''),
  mp_preference_id: text('mp_preference_id').notNull().default(''),
  shipping_phone: text('shipping_phone').notNull().default(''),
  shipping_address: text('shipping_address').notNull().default(''),
  shipping_city: text('shipping_city').notNull().default(''),
  shipping_province: text('shipping_province').notNull().default(''),
  shipping_postal_code: text('shipping_postal_code').notNull().default(''),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull().default('0'),
  shipping: numeric('shipping', { precision: 12, scale: 2 }).notNull().default('0'),
  total: numeric('total', { precision: 12, scale: 2 }).notNull().default('0'),
  items: jsonb('items').notNull().default([]),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  is_reservation: boolean('is_reservation').notNull().default(false),
  deposit_paid: numeric('deposit_paid', { precision: 12, scale: 2 }).notNull().default('0'),
  rewards_awarded: boolean('rewards_awarded').notNull().default(false),
  discount: numeric('discount', { precision: 12, scale: 2 }).notNull().default('0'),
  coupon_code: text('coupon_code'),
});

export const drop_waitlist = pgTable('drop_waitlist', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  product_slug: text('product_slug').notNull(),
  email: text('email').notNull(),
  whatsapp: text('whatsapp').notNull().default(''),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const restock_requests = pgTable('restock_requests', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  product_slug: text('product_slug').notNull(),
  email: text('email').notNull(),
  whatsapp: text('whatsapp').notNull().default(''),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const wishlists = pgTable(
  'wishlists',
  {
    user_id: uuid('user_id').notNull(),
    product_slug: text('product_slug').notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.user_id, t.product_slug] })],
);

export const player_profiles = pgTable('player_profiles', {
  user_id: uuid('user_id').primaryKey(),
  coins: integer('coins').notNull().default(0),
  total_paid: numeric('total_paid', { precision: 12, scale: 2 }).notNull().default('0'),
  order_count: integer('order_count').notNull().default(0),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const player_badges = pgTable(
  'player_badges',
  {
    user_id: uuid('user_id').notNull(),
    badge_id: text('badge_id').notNull(),
    earned_at: timestamp('earned_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.user_id, t.badge_id] })],
);

export const coupons = pgTable('coupons', {
  code: text('code').primaryKey(),
  kind: text('kind').notNull().default('fixed'),
  value: numeric('value', { precision: 12, scale: 2 }).notNull(),
  min_subtotal: numeric('min_subtotal', { precision: 12, scale: 2 }).notNull().default('0'),
  max_uses: integer('max_uses').notNull().default(1),
  times_used: integer('times_used').notNull().default(0),
  expires_at: timestamp('expires_at', { withTimezone: true }),
  user_id: uuid('user_id'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const coin_redemptions = pgTable('coin_redemptions', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  user_id: uuid('user_id').notNull(),
  coins: integer('coins').notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  coupon_code: text('coupon_code').notNull(),
  status: text('status').notNull().default('activo'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
});

export const cart_items = pgTable('cart_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  product_slug: text('product_slug').notNull(),
  quantity: integer('quantity').notNull().default(1),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const saved_addresses = pgTable('saved_addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  label: text('label').notNull().default('Mi dirección'),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  province: text('province').notNull(),
  postal_code: text('postal_code').notNull(),
  is_default: boolean('is_default').notNull().default(false),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const admin_logs = pgTable('admin_logs', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  action: text('action').notNull(),
  detail: text('detail').notNull().default(''),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  link: text('link'),
  read: boolean('read').notNull().default(false),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const editable_pages = pgTable('editable_pages', {
  slug: text('slug').primaryKey(),
  title: text('title').notNull(),
  subtitle: text('subtitle').notNull().default(''),
  content: jsonb('content').notNull().default([]),
  published: boolean('published').notNull().default(true),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
