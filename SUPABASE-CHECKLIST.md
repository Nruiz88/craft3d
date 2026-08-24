# Craft3d · Checklist de producción (Supabase)

Plan registrado al 13/08/2026. Escala esperada: ~100 personas/semana —
hoy sobra con pulir detalles; este doc es el plan a futuro.

## 🔴 Hallazgos a corregir (cuando corresponda)

1. **`public.coupons` no tiene RLS habilitado** — es la única tabla sin
   `enable row level security` (settings, waitlist, restock, admin_logs, etc.
   sí lo tienen). Con RLS apagado, la API con anon key podría leer/abrir
   códigos de cupón. Fix:

   ```sql
   alter table public.coupons enable row level security;
   -- sin políticas → solo service_role / RPC lo toca (apply_coupon ya es security definer)
   ```

2. **Overload muerto de `place_order` (11 args)** — queda de una versión
   anterior; el `drop` de la línea 719 solo borra la de 12 args. Funciona
   igual (la app usa la de 12 args), pero conviene:

   ```sql
   drop function if exists public.place_order(uuid, text, text, jsonb, text, text, text, text, text, text, text);
   ```

## ✅ Aplicar en una DB nueva

**1. Previo**
- Postgres 15+ (default de Supabase).
- Aplicar `supabase/schema.sql` completo en SQL Editor → 0 errores
  (todo es `create if not exists` / `drop if exists`).

**2. Post-schema (Dashboard Supabase — no está en el archivo)**
- Auth → Providers: email con **confirmación de email ON**; Google OAuth
  con `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.
- Auth → URL: site URL y redirects apuntando al **dominio real** de Vercel.
- Database → Backups: PITR habilitado.
- Verificar que el trigger `on_auth_user_created` crea el perfil al registrarse.

**3. Datos iniciales**
- El seed crea 14 productos demo (`on conflict do nothing`). Decidir si se
  dejan de base o se empieza limpio cargando el catálogo real desde `/admin`.
- Cargar settings de transferencia + token de Mercado Pago desde
  `/admin/configuracion` (la tabla arranca vacía).

**4. Smoke test post-deploy**
- Registro (email + Google) → perfil creado.
- Compra transferencia y MP (webhook marca pagado, otorga monedas).
- Drop: pre-reserva (seña) + waitlist + restock.
- Cupón (fijo/%, mínimo, vencimiento) y canje de monedas.
- Mystery box: crear caja con cantidades → compra → revelado admin
  (descuenta stock) → email + animación en Mis Pedidos.
- Favoritos y Mis pedidos.

## 🗓️ Plan a futuro (solo si se superan ~100 personas/semana)

1. **Feed de reveladas** (`getOrders()` entero) → paginar/limitar; es lo
   primero en degradarse.
2. **Revelado de cajas**: `decrementProductStock` hoy es read → write no
   atómico (riesgo bajo, admin-only). Migrar a RPC con `FOR UPDATE`.
3. **Pedidos**: si crecen, pasar `orders.items` (jsonb) a tabla `order_items`.
4. **Rate limiting** en server actions (hoy no hay; con el tráfico actual sobra).