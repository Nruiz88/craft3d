-- Craft3d · Esquema Supabase
-- Ejecutá esto en: Supabase Dashboard → SQL Editor → New query → Run

create table if not exists public.products (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  category text not null default 'anime',
  price numeric(12, 2) not null default 0 check (price >= 0),
  emoji text not null default '📦',
  image text,
  images jsonb not null default '[]'::jsonb,
  description text not null default '',
  details jsonb not null default '[]'::jsonb,
  stock integer not null default 0 check (stock >= 0),
  featured boolean not null default false,
  tags jsonb not null default '[]'::jsonb,
  drop_starts_at timestamptz,
  drop_ends_at timestamptz,
  drop_units integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Asegura las columnas nuevas si la tabla ya existía
alter table public.products add column if not exists drop_starts_at timestamptz;
alter table public.products add column if not exists drop_ends_at timestamptz;
alter table public.products add column if not exists drop_units integer;
alter table public.products add column if not exists images jsonb not null default '[]'::jsonb;

create index if not exists products_category_idx on public.products (category);

-- Actualiza updated_at automáticamente
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

-- ============================================================
-- Usuarios / Clientes (Supabase Auth: email + Google)
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  address text not null default '',
  postal_code text not null default '',
  city text not null default '',
  province text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Asegura las columnas nuevas si la tabla ya existía
alter table public.profiles add column if not exists address text not null default '';
alter table public.profiles add column if not exists postal_code text not null default '';
alter table public.profiles add column if not exists province text not null default '';

alter table public.profiles enable row level security;

-- El usuario ve y edita su propio perfil
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Crea el perfil automáticamente al registrarse (email o Google)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, address, postal_code, city, province)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.raw_user_meta_data ->> 'address', ''),
    coalesce(new.raw_user_meta_data ->> 'postal_code', ''),
    coalesce(new.raw_user_meta_data ->> 'city', ''),
    coalesce(new.raw_user_meta_data ->> 'province', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Configuración del panel (claves de pago, datos de transferencia)
-- ============================================================

create table if not exists public.settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;

-- Sin políticas: solo el service_role (secret key) lee/escribe.

-- ============================================================
-- Pedidos / Ventas
-- ============================================================

create table if not exists public.orders (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null default '',
  customer_email text not null default '',
  status text not null default 'pendiente'
    check (status in ('pendiente', 'reserva', 'pagado', 'enviado', 'entregado', 'cancelado')),
  payment_method text not null default 'transferencia'
    check (payment_method in ('transferencia', 'mercado_pago')),
  payment_id text not null default '',
  mp_preference_id text not null default '',
  shipping_phone text not null default '',
  shipping_address text not null default '',
  shipping_city text not null default '',
  shipping_province text not null default '',
  shipping_postal_code text not null default '',
  subtotal numeric(12, 2) not null default 0 check (subtotal >= 0),
  shipping numeric(12, 2) not null default 0 check (shipping >= 0),
  total numeric(12, 2) not null default 0 check (total >= 0),
  is_reservation boolean not null default false,
  deposit_paid numeric(12, 2) not null default 0 check (deposit_paid >= 0),
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- Asegura las columnas nuevas si la tabla ya existía
alter table public.orders add column if not exists payment_method text not null default 'transferencia';
alter table public.orders add column if not exists payment_id text not null default '';
alter table public.orders add column if not exists mp_preference_id text not null default '';

-- Reservas de drops: columna de tipo de pedido y seña pagada
alter table public.orders add column if not exists is_reservation boolean not null default false;
alter table public.orders add column if not exists deposit_paid numeric(12, 2) not null default 0 check (deposit_paid >= 0);

-- Estado "reserva" (seña paga, falta el resto)
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('pendiente', 'reserva', 'pagado', 'enviado', 'entregado', 'cancelado'));

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

alter table public.orders enable row level security;

-- El cliente ve sus propios pedidos; el service_role (admin) los ve todos
drop policy if exists orders_select_own on public.orders;
create policy orders_select_own on public.orders
  for select to authenticated
  using (auth.uid() = user_id);

-- Crea el pedido en una sola transacción: valida stock, calcula precios
-- desde la tabla products (nunca confía en el precio del cliente),
-- guarda el snapshot de items y descuenta stock.
-- Reemplaza la versión anterior (sin cupón) para evitar sobrecargas ambiguas.
drop function if exists public.place_order(uuid, text, text, jsonb, text, text, text, text, text, text);
create or replace function public.place_order(
  p_user_id uuid,
  p_customer_name text,
  p_customer_email text,
  p_items jsonb,
  p_shipping_phone text default '',
  p_shipping_address text default '',
  p_shipping_city text default '',
  p_shipping_province text default '',
  p_shipping_postal_code text default '',
  p_payment_method text default 'transferencia',
  p_coupon_code text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id bigint;
  v_item jsonb;
  v_product public.products%rowtype;
  v_quantity integer;
  v_subtotal numeric := 0;
  v_discount numeric := 0;
  v_total numeric := 0;
  v_coupon_code text;
  v_items jsonb := '[]'::jsonb;
begin
  if p_user_id is null or p_user_id <> auth.uid() then
    raise exception 'No autorizado';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'El carrito está vacío';
  end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item ->> 'quantity')::integer;
    if v_quantity is null or v_quantity <= 0 then
      raise exception 'Cantidad inválida';
    end if;

    select * into v_product
    from public.products
    where slug = v_item ->> 'slug'
    for update;

    if not found then
      raise exception 'Producto no encontrado';
    end if;
    if v_product.stock < v_quantity then
      raise exception 'Stock insuficiente para % (queda %)', v_product.name, v_product.stock;
    end if;

    v_subtotal := v_subtotal + (v_product.price * v_quantity);
    v_items := v_items || jsonb_build_object(
      'product_id', v_product.id,
      'product_slug', v_product.slug,
      'product_name', v_product.name,
      'price', v_product.price,
      'quantity', v_quantity,
      'subtotal', v_product.price * v_quantity
    );
  end loop;

  -- Cupón: valida y calcula el descuento sobre el subtotal
  v_coupon_code := case
    when p_coupon_code is null or btrim(p_coupon_code) = '' then null
    else upper(btrim(p_coupon_code))
  end;
  v_discount := public.apply_coupon(v_coupon_code, p_user_id, v_subtotal);
  v_total := v_subtotal - v_discount;

  insert into public.orders (
    user_id, customer_name, customer_email, status,
    payment_method,
    shipping_phone, shipping_address, shipping_city, shipping_province, shipping_postal_code,
    subtotal, shipping, total, discount, coupon_code, items
  )
  values (
    p_user_id, p_customer_name, p_customer_email, 'pendiente',
    case when p_payment_method = 'mercado_pago' then 'mercado_pago' else 'transferencia' end,
    p_shipping_phone, p_shipping_address, p_shipping_city, p_shipping_province, p_shipping_postal_code,
    v_subtotal, 0, v_total, v_discount, v_coupon_code, v_items
  )
  returning id into v_order_id;

  -- Consumir el cupón (una sola vez, atómico con el pedido)
  if v_discount > 0 and v_coupon_code is not null then
    update public.coupons
    set times_used = times_used + 1
    where code = v_coupon_code;

    update public.coin_redemptions
    set status = 'usado'
    where coupon_code = v_coupon_code and status = 'activo';
  end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    update public.products
    set stock = stock - (v_item ->> 'quantity')::integer
    where slug = v_item ->> 'slug';
  end loop;

  return jsonb_build_object('order_id', v_order_id, 'total', v_total, 'discount', v_discount);
end;
$$;

-- ============================================================
-- Reservas de drops (seña porcentual)
-- ============================================================

-- Crea una reserva/pre-reserva de un drop: guarda el pedido por el precio
-- total, registra la seña a pagar (monto fijo o porcentaje del precio),
-- descuenta 1 unidad y solo valida que el drop no haya finalizado (permite
-- pre-reservar antes de abrir).
create or replace function public.place_reservation(
  p_user_id uuid,
  p_customer_name text,
  p_customer_email text,
  p_slug text,
  p_shipping_phone text default '',
  p_shipping_address text default '',
  p_shipping_city text default '',
  p_shipping_province text default '',
  p_shipping_postal_code text default '',
  p_payment_method text default 'transferencia',
  p_deposit_pct numeric default 30,
  p_deposit_fixed numeric default 0
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id bigint;
  v_product public.products%rowtype;
  v_deposit numeric;
  v_pct numeric;
  v_item jsonb;
begin
  if p_user_id is null or p_user_id <> auth.uid() then
    raise exception 'No autorizado';
  end if;

  if p_slug is null or btrim(p_slug) = '' then
    raise exception 'Producto inválido';
  end if;

  select * into v_product
  from public.products
  where slug = p_slug
  for update;

  if not found then
    raise exception 'Producto no encontrado';
  end if;

  if v_product.category <> 'drops' then
    raise exception 'Este producto no acepta reservas';
  end if;

  if v_product.drop_ends_at is not null and now() > v_product.drop_ends_at then
    raise exception 'El drop ya finalizó';
  end if;

  if v_product.stock <= 0 then
    raise exception 'Tiraje agotado para %', v_product.name;
  end if;

  -- Seña: monto fijo si viene seteado, si no porcentaje del precio
  if p_deposit_fixed is not null and p_deposit_fixed > 0 then
    v_deposit := round(least(p_deposit_fixed, v_product.price), 2);
  else
    v_pct := greatest(1, least(100, coalesce(p_deposit_pct, 30)));
    v_deposit := round((v_product.price * v_pct) / 100, 2);
  end if;

  if v_deposit <= 0 then
    raise exception 'La seña no puede ser $0';
  end if;

  v_item := jsonb_build_object(
    'product_id', v_product.id,
    'product_slug', v_product.slug,
    'product_name', v_product.name,
    'price', v_product.price,
    'quantity', 1,
    'subtotal', v_product.price
  );

  insert into public.orders (
    user_id, customer_name, customer_email, status,
    payment_method,
    shipping_phone, shipping_address, shipping_city, shipping_province, shipping_postal_code,
    subtotal, shipping, total, items,
    is_reservation, deposit_paid
  )
  values (
    p_user_id, p_customer_name, p_customer_email, 'pendiente',
    case when p_payment_method = 'mercado_pago' then 'mercado_pago' else 'transferencia' end,
    p_shipping_phone, p_shipping_address, p_shipping_city, p_shipping_province, p_shipping_postal_code,
    v_product.price, 0, v_product.price, jsonb_build_array(v_item),
    true, v_deposit
  )
  returning id into v_order_id;

  update public.products
  set stock = stock - 1
  where slug = p_slug;

  return jsonb_build_object('order_id', v_order_id, 'total', v_product.price, 'deposit', v_deposit);
end;
$$;

-- Row Level Security
alter table public.products enable row level security;

-- Cualquiera (publishable/anon) puede leer el catálogo
drop policy if exists products_select_public on public.products;
create policy products_select_public on public.products
  for select
  to anon, authenticated
  using (true);

-- El rol service_role (secret key) administra todo (bypassa RLS por defecto)

-- Seed: catálogo inicial de ejemplo
insert into public.products (slug, name, category, price, emoji, description, details, stock, featured, tags) values
('lampara-asta', 'Lámpara Asta Modo Demonio', 'drops', 65000.00, '👹', 'Lámpara Asta Modo Demonio con impresión 3D, proyección de sombra poderosa y diseño único. Ideal para ambientar tu espacio.', '["Sombras Shadow Collection","Proyección en alta definición","Incluye luz LED","Diseño exclusivo Craft3d"]', 6, true, '["lampara","shadow collection","black clover","anime"]'),
('lampara-luffy-gear-5', 'Lámpara Luffy Gear 5', 'drops', 65000.00, '⚡', 'Lámpara Luffy Gear 5 con efecto sombra de Joy Boy, diseño premium y tecnología LED. Ilumina tu espacio con estilo único.', '["Sombras Shadow Collection","Efecto Joy Boy","Incluye luz LED","Diseño exclusivo Craft3d"]', 6, true, '["lampara","shadow collection","one piece","anime"]'),
('lampara-zoro', 'Lámpara Zoro', 'drops', 65000.00, '🗡️', 'Ilumina tu espacio con la lámpara Zoro que proyecta su silueta en alta definición. Ideal para fans y setups gamers.', '["Sombras Shadow Collection","Silueta en alta definición","Incluye luz LED","Diseño exclusivo Craft3d"]', 10, false, '["lampara","shadow collection","one piece","anime"]'),
('lampara-goku', 'Lámpara Goku', 'drops', 65000.00, '🟠', 'Ilumina tu espacio con la lámpara Goku Ultra Instinto, diseño exclusivo que proyecta su icónica sombra y ambiente guerrero.', '["Sombras Shadow Collection","Proyección en alta definición","Incluye luz LED","Diseño exclusivo Craft3d"]', 6, false, '["lampara","shadow collection","dragon ball","anime"]'),
('dummy-13-rojo-fuego', 'Dummy 13: Edición Rojo Fuego', 'accesorios', 12000.00, '🔥', 'La revolución de la articulación: el Dummy 13 no es solo una figura de acción, es la herramienta definitiva para artistas, animadores y coleccionistas.', '["Totalmente articulado","Alto ~17 cm","Ideal para sketch y escenas","Edición de color exclusiva"]', 8, true, '["dummy 13","articulado","coleccion"]'),
('dummy-13-azul-bionico', 'Dummy 13: Edición Azul Biónico', 'accesorios', 12000.00, '🦾', 'El Dummy 13 en edición Azul Biónico: articulación total y un color que no pasa desapercibido en tu colección.', '["Totalmente articulado","Alto ~17 cm","Ideal para sketch y escenas","Edición de color exclusiva"]', 8, false, '["dummy 13","articulado","coleccion"]'),
('dummy-13-verde-zafiro', 'Dummy 13: Edición Verde Zafiro', 'accesorios', 12000.00, '💎', 'El Dummy 13 en edición Verde Zafiro: articulación total y un color que no pasa desapercibido en tu colección.', '["Totalmente articulado","Alto ~17 cm","Ideal para sketch y escenas","Edición de color exclusiva"]', 8, false, '["dummy 13","articulado","coleccion"]'),
('dummy-13-negro', 'Dummy 13: Edición Negro', 'accesorios', 12000.00, '⚫', 'El Dummy 13 en edición Negro: articulación total y un color que no pasa desapercibido en tu colección.', '["Totalmente articulado","Alto ~17 cm","Ideal para sketch y escenas","Edición de color exclusiva"]', 8, false, '["dummy 13","articulado","coleccion"]'),
('dummy-13-blanco-fantasma', 'Dummy 13: Blanco Fantasma', 'accesorios', 12000.00, '👻', 'El Dummy 13 en Blanco Fantasma: articulación total y un color que no pasa desapercibido en tu colección.', '["Totalmente articulado","Alto ~17 cm","Ideal para sketch y escenas","Edición de color exclusiva"]', 8, false, '["dummy 13","articulado","coleccion"]'),
('mate-mundial-2026', 'Mate Copa del Mundo 2026 – Edición Coleccionista', 'mundial-2026', 26000.00, '🧉', 'Viví la pasión del fútbol en cada mate: diseño exclusivo inspirado en el trofeo, con detalles dorados y relieves cuidadosamente trabajados.', '["Diseño exclusivo Copa del Mundo","Detalles en relieve de alta calidad","Liviano y resistente","Ideal para regalar"]', 12, true, '["mate","mundial 2026","coleccion","seleccion"]'),
('mate-campeon', 'Mate Campeón Edición Especial', 'mundial-2026', 24000.00, '🏆', 'El mate para el fanático de la Selección: terminaciones cuidadas, gran nivel de detalle y una pieza que se convierte en objeto de colección.', '["Diseño exclusivo edición especial","Terminaciones cuidadas","Liviano y resistente","Ideal para regalar"]', 15, false, '["mate","mundial 2026","seleccion"]'),
('dummy-13-figura-roja', 'Figura Articulada Roja', 'anime', 12000.00, '🔴', 'Figura totalmente articulada de alto detalle. Imprimida por partes y ensamblada a mano para un acabado impecable.', '["Totalmente articulada","Alto ~17 cm","Ensamble a mano","Sin pintura, color del filamento"]', 10, false, '["figura","articulada","coleccion"]'),
('soporte-celular', 'Soporte de Celular Impreso', 'accesorios', 10000.00, '📱', 'Soporte de escritorio para celular con inclinación ajustable y diseño reforzado para uso diario.', '["Apto para hasta 6.8 pulgadas","Base antideslizante","Ángulo cómodo para ver video","PLA resistente"]', 25, false, '["soporte","celular","escritorio"]')
on conflict (slug) do nothing;

-- Migración: unifica la categoría de drops (antes "Ediciones Limitadas")
update public.products set category = 'drops' where category = 'ediciones-limitadas';

-- ============================================================
-- Lista de espera de drops
-- ============================================================

create table if not exists public.drop_waitlist (
  id bigint generated always as identity primary key,
  product_slug text not null,
  email text not null,
  whatsapp text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists drop_waitlist_product_idx on public.drop_waitlist (product_slug);
create unique index if not exists drop_waitlist_product_email_idx
  on public.drop_waitlist (product_slug, lower(email));

-- Sin políticas: solo el service_role (secret key) lee/escribe.
alter table public.drop_waitlist enable row level security;

-- ============================================================
-- Avisos de reposición (productos agotados)
-- ============================================================

create table if not exists public.restock_requests (
  id bigint generated always as identity primary key,
  product_slug text not null,
  email text not null,
  whatsapp text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists restock_requests_product_idx on public.restock_requests (product_slug);
create unique index if not exists restock_requests_product_email_idx
  on public.restock_requests (product_slug, lower(email));

-- Sin políticas: solo el service_role (secret key) lee/escribe.
alter table public.restock_requests enable row level security;

-- ============================================================
-- Wishlist / Favoritos (requiere sesión)
-- ============================================================

create table if not exists public.wishlists (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_slug text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, product_slug)
);

create index if not exists wishlists_user_id_idx on public.wishlists (user_id);
create index if not exists wishlists_product_slug_idx on public.wishlists (product_slug);

alter table public.wishlists enable row level security;

-- El usuario ve y modifica solo su propia lista
drop policy if exists wishlists_select_own on public.wishlists;
create policy wishlists_select_own on public.wishlists
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists wishlists_insert_own on public.wishlists;
create policy wishlists_insert_own on public.wishlists
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists wishlists_delete_own on public.wishlists;
create policy wishlists_delete_own on public.wishlists
  for delete to authenticated
  using (auth.uid() = user_id);

-- ============================================================
-- Gamificación arcade: perfil del jugador (niveles, monedas, insignias)
-- ============================================================

-- Marca si el pedido ya otorgó monedas (idempotencia ante webhooks/status repetidos)
alter table public.orders add column if not exists rewards_awarded boolean not null default false;

-- Perfil del jugador: monedas acumuladas, total pagado y pedidos completados.
-- Lo escribe el service_role (server) al acreditar un pago; el usuario solo lo lee.
create table if not exists public.player_profiles (
  user_id uuid not null references auth.users(id) on delete cascade primary key,
  coins integer not null default 0 check (coins >= 0),
  total_paid numeric(12, 2) not null default 0 check (total_paid >= 0),
  order_count integer not null default 0 check (order_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists player_profiles_user_id_idx on public.player_profiles (user_id);

-- Insignias ganadas (badge_id definidos en lib/gamification.ts)
create table if not exists public.player_badges (
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id text not null,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

create index if not exists player_badges_user_id_idx on public.player_badges (user_id);

alter table public.player_profiles enable row level security;
alter table public.player_badges enable row level security;

-- El usuario lee su propio perfil/insignias; los writes son del service_role (server)
drop policy if exists player_profiles_select_own on public.player_profiles;
create policy player_profiles_select_own on public.player_profiles
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists player_badges_select_own on public.player_badges;
create policy player_badges_select_own on public.player_badges
  for select to authenticated
  using (auth.uid() = user_id);

-- ============================================================
-- Cupones de descuento + canje de monedas arcade
-- ============================================================

create table if not exists public.coupons (
  code text primary key,
  kind text not null default 'fixed' check (kind in ('percent', 'fixed')),
  value numeric(12, 2) not null check (value > 0),
  min_subtotal numeric(12, 2) not null default 0 check (min_subtotal >= 0),
  max_uses integer not null default 1 check (max_uses >= 1),
  times_used integer not null default 0 check (times_used >= 0),
  expires_at timestamptz,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (kind <> 'percent' or value <= 100)
);

create index if not exists coupons_user_id_idx on public.coupons (user_id);

-- Canjes de monedas por cupones
create table if not exists public.coin_redemptions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  coins integer not null check (coins > 0),
  amount numeric(12, 2) not null check (amount > 0),
  coupon_code text not null references public.coupons(code) on delete cascade,
  status text not null default 'activo' check (status in ('activo', 'usado', 'vencido')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists coin_redemptions_user_id_idx on public.coin_redemptions (user_id);
create index if not exists coin_redemptions_coupon_idx on public.coin_redemptions (coupon_code);

-- Descuento y cupón aplicados a un pedido
alter table public.orders add column if not exists discount numeric(12, 2) not null default 0 check (discount >= 0);
alter table public.orders add column if not exists coupon_code text;

alter table public.coin_redemptions enable row level security;

-- El usuario ve sus propios canjes; los writes son del service_role / RPC
drop policy if exists coin_redemptions_select_own on public.coin_redemptions;
create policy coin_redemptions_select_own on public.coin_redemptions
  for select to authenticated
  using (auth.uid() = user_id);

-- Canjea monedas por un cupón de descuento (monto fijo).
-- Security definer: valida saldo (bloquea la fila), descuenta monedas,
-- crea el cupón y registra el canje en una sola transacción.
create or replace function public.redeem_coins(
  p_user_id uuid,
  p_coins integer
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.player_profiles%rowtype;
  v_rate numeric := 20; -- $20 de descuento por moneda
  v_amount numeric;
  v_code text;
  v_expires timestamptz;
begin
  if p_user_id is null or coalesce(p_user_id <> auth.uid(), true) then
    raise exception 'No autorizado';
  end if;

  if p_coins is null or p_coins < 100 then
    raise exception 'El canje mínimo es de 100 monedas';
  end if;

  select * into v_profile
  from public.player_profiles
  where user_id = p_user_id
  for update;

  if not found or v_profile.coins < p_coins then
    raise exception 'No tenés suficientes monedas';
  end if;

  v_amount := p_coins * v_rate;
  v_code := 'CRAFT-' || upper(substr(md5(random()::text), 1, 6));
  v_expires := now() + interval '90 days';

  insert into public.coupons (code, kind, value, max_uses, user_id, expires_at)
  values (v_code, 'fixed', v_amount, 1, p_user_id, v_expires);

  update public.player_profiles
  set coins = coins - p_coins, updated_at = now()
  where user_id = p_user_id;

  insert into public.coin_redemptions (user_id, coins, amount, coupon_code, expires_at)
  values (p_user_id, p_coins, v_amount, v_code, v_expires);

  return jsonb_build_object('code', v_code, 'amount', v_amount);
end;
$$;

-- Valida un cupón y devuelve el descuento a aplicar sobre el subtotal (0 si no hay cupón).
-- Security definer: bloquea la fila del cupón para serializar consumos.
create or replace function public.apply_coupon(
  p_code text,
  p_user_id uuid,
  p_subtotal numeric
) returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coupon public.coupons%rowtype;
  v_discount numeric := 0;
begin
  if p_code is null or btrim(p_code) = '' then
    return 0;
  end if;

  select * into v_coupon
  from public.coupons
  where code = p_code
  for update;

  if not found then
    raise exception 'El código no es válido';
  end if;

  if v_coupon.user_id is not null and v_coupon.user_id <> p_user_id then
    raise exception 'Este código pertenece a otra cuenta';
  end if;

  if v_coupon.max_uses > 0 and v_coupon.times_used >= v_coupon.max_uses then
    raise exception 'Este código ya fue usado';
  end if;

  if v_coupon.expires_at is not null and v_coupon.expires_at < now() then
    raise exception 'Este código está vencido';
  end if;

  if p_subtotal < v_coupon.min_subtotal then
    raise exception 'El mínimo de compra para este código es $%', v_coupon.min_subtotal;
  end if;

  if v_coupon.kind = 'percent' then
    v_discount := round(p_subtotal * v_coupon.value / 100, 2);
  else
    v_discount := least(v_coupon.value, p_subtotal);
  end if;

  if v_discount >= p_subtotal then
    raise exception 'El descuento no puede cubrir el total del pedido';
  end if;

  return v_discount;
end;
$$;
