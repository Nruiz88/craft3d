-- ============================================================
-- Craft3d · Migración: saved_addresses + cart_items
-- Reemplaza localStorage con Supabase para persistencia cross-device
-- Ejecutá esto en: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- ============================================================
-- 1. saved_addresses — Direcciones guardadas del usuario
-- ============================================================

create table if not exists public.saved_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Mi dirección',
  name text not null,
  phone text not null,
  address text not null,
  city text not null,
  province text not null,
  postal_code text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índices
create index if not exists saved_addresses_user_id_idx on public.saved_addresses (user_id);

-- RLS
alter table public.saved_addresses enable row level security;

-- El usuario ve y modifica solo sus propias direcciones
drop policy if exists saved_addresses_select_own on public.saved_addresses;
create policy saved_addresses_select_own on public.saved_addresses
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists saved_addresses_insert_own on public.saved_addresses;
create policy saved_addresses_insert_own on public.saved_addresses
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists saved_addresses_update_own on public.saved_addresses;
create policy saved_addresses_update_own on public.saved_addresses
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists saved_addresses_delete_own on public.saved_addresses;
create policy saved_addresses_delete_own on public.saved_addresses
  for delete to authenticated
  using (auth.uid() = user_id);

-- Trigger para updated_at
drop trigger if exists saved_addresses_set_updated_at on public.saved_addresses;
create trigger saved_addresses_set_updated_at
before update on public.saved_addresses
for each row execute function public.set_updated_at();

-- ============================================================
-- 2. cart_items — Items del carrito por usuario
-- ============================================================

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_slug text not null,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_slug)
);

-- Índices
create index if not exists cart_items_user_id_idx on public.cart_items (user_id);

-- RLS
alter table public.cart_items enable row level security;

-- El usuario ve y modifica solo su propio carrito
drop policy if exists cart_items_select_own on public.cart_items;
create policy cart_items_select_own on public.cart_items
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists cart_items_insert_own on public.cart_items;
create policy cart_items_insert_own on public.cart_items
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists cart_items_update_own on public.cart_items;
create policy cart_items_update_own on public.cart_items
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists cart_items_delete_own on public.cart_items;
create policy cart_items_delete_own on public.cart_items
  for delete to authenticated
  using (auth.uid() = user_id);

-- Trigger para updated_at
drop trigger if exists cart_items_set_updated_at on public.cart_items;
create trigger cart_items_set_updated_at
before update on public.cart_items
for each row execute function public.set_updated_at();

-- ============================================================
-- 3. editable_pages — Páginas editables desde el admin
-- ============================================================

create table if not exists public.editable_pages (
  slug text primary key,
  title text not null,
  subtitle text not null default '',
  content jsonb not null default '[]'::jsonb,
  published boolean not null default true,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- RLS: cualquiera puede leer las publicadas, solo admin puede editar
alter table public.editable_pages enable row level security;

drop policy if exists editable_pages_select_public on public.editable_pages;
create policy editable_pages_select_public on public.editable_pages
  for select
  using (published = true);

drop policy if exists editable_pages_admin_all on public.editable_pages;
create policy editable_pages_admin_all on public.editable_pages
  for all
  to authenticated
  using (
    exists (
      select 1 from public.settings
      where key = 'admin_email' and value = auth.email()
    )
  )
  with check (
    exists (
      select 1 from public.settings
      where key = 'admin_email' and value = auth.email()
    )
  );

drop trigger if exists editable_pages_set_updated_at on public.editable_pages;
create trigger editable_pages_set_updated_at
before update on public.editable_pages
for each row execute function public.set_updated_at();

-- ============================================================
-- 4. notifications — Notificaciones in-app para el usuario
-- ============================================================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_idx on public.notifications (user_id);
create index if not exists notifications_read_idx on public.notifications (user_id, read);

alter table public.notifications enable row level security;

drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own on public.notifications
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists notifications_insert_admin on public.notifications;
create policy notifications_insert_admin on public.notifications
  for insert to authenticated
  with check (
    exists (
      select 1 from public.settings
      where key = 'admin_email' and value = auth.email()
    )
  );

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own on public.notifications
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
