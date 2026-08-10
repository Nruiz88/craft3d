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
  description text not null default '',
  details jsonb not null default '[]'::jsonb,
  stock integer not null default 0 check (stock >= 0),
  featured boolean not null default false,
  tags jsonb not null default '[]'::jsonb,
  drop_starts_at timestamptz,
  drop_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Asegura las columnas nuevas si la tabla ya existía
alter table public.products add column if not exists drop_starts_at timestamptz;
alter table public.products add column if not exists drop_ends_at timestamptz;

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
    check (status in ('pendiente', 'pagado', 'enviado', 'entregado', 'cancelado')),
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
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- Asegura las columnas nuevas si la tabla ya existía
alter table public.orders add column if not exists payment_method text not null default 'transferencia';
alter table public.orders add column if not exists payment_id text not null default '';
alter table public.orders add column if not exists mp_preference_id text not null default '';

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
  p_payment_method text default 'transferencia'
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

  insert into public.orders (
    user_id, customer_name, customer_email, status,
    payment_method,
    shipping_phone, shipping_address, shipping_city, shipping_province, shipping_postal_code,
    subtotal, shipping, total, items
  )
  values (
    p_user_id, p_customer_name, p_customer_email, 'pendiente',
    case when p_payment_method = 'mercado_pago' then 'mercado_pago' else 'transferencia' end,
    p_shipping_phone, p_shipping_address, p_shipping_city, p_shipping_province, p_shipping_postal_code,
    v_subtotal, 0, v_subtotal, v_items
  )
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    update public.products
    set stock = stock - (v_item ->> 'quantity')::integer
    where slug = v_item ->> 'slug';
  end loop;

  return jsonb_build_object('order_id', v_order_id, 'total', v_subtotal);
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
('lampara-asta', 'Lámpara Asta Modo Demonio', 'ediciones-limitadas', 65000.00, '👹', 'Lámpara Asta Modo Demonio con impresión 3D, proyección de sombra poderosa y diseño único. Ideal para ambientar tu espacio.', '["Sombras Shadow Collection","Proyección en alta definición","Incluye luz LED","Diseño exclusivo Craft3d"]', 6, true, '["lampara","shadow collection","black clover","anime"]'),
('lampara-luffy-gear-5', 'Lámpara Luffy Gear 5', 'ediciones-limitadas', 65000.00, '⚡', 'Lámpara Luffy Gear 5 con efecto sombra de Joy Boy, diseño premium y tecnología LED. Ilumina tu espacio con estilo único.', '["Sombras Shadow Collection","Efecto Joy Boy","Incluye luz LED","Diseño exclusivo Craft3d"]', 6, true, '["lampara","shadow collection","one piece","anime"]'),
('lampara-zoro', 'Lámpara Zoro', 'ediciones-limitadas', 65000.00, '🗡️', 'Ilumina tu espacio con la lámpara Zoro que proyecta su silueta en alta definición. Ideal para fans y setups gamers.', '["Sombras Shadow Collection","Silueta en alta definición","Incluye luz LED","Diseño exclusivo Craft3d"]', 10, false, '["lampara","shadow collection","one piece","anime"]'),
('lampara-goku', 'Lámpara Goku', 'ediciones-limitadas', 65000.00, '🟠', 'Ilumina tu espacio con la lámpara Goku Ultra Instinto, diseño exclusivo que proyecta su icónica sombra y ambiente guerrero.', '["Sombras Shadow Collection","Proyección en alta definición","Incluye luz LED","Diseño exclusivo Craft3d"]', 6, false, '["lampara","shadow collection","dragon ball","anime"]'),
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
