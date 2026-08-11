# CONTEXTO del proyecto — Craft3d

Archivo de memoria para la IA. Se actualiza al final de cada sesión.
Idioma: español. Stack: Next.js (App Router) + Supabase + MercadoPago.

---

## Cómo empezar una sesión

1. Leer este archivo completo.
2. `git status` y `git diff --stat` para ver el estado actual.
3. `git log --oneline -15` para ubicar el último commit.
4. Revisar `CONTEXTO.md` sección "Pendientes" y retomar desde ahí.

## Workflow de base de datos (IMPORTANTE)

- **Yo NO toco la DB directamente.** Cuando hay que crear/alterar tablas o políticas, le paso al usuario el SQL y **él lo corre en el SQL Editor de Supabase**.
- El SQL siempre va también appendeado al final de `supabase/schema.sql` para que quede versionado.
- La service key (SUPABASE_SECRET_KEY) NO puede ejecutar DDL; solo lectura/escritura vía API. Por eso el flujo es manual.
- Scripts de chequeo usan el supabase-js desde `node_modules` del proyecto (ver "Scripts de utilidad").

## Estado actual

- Tienda e-commerce de impresión 3D (cuadros Hueforge, figuras, dummys, mates).
- Autenticación con Supabase (email/password).
- Pagos y reservas con MercadoPago (webhook + checkout directo).
- Sistema de drops: drops activos con countdown, reservas con seña (% configurable), pre-reservas, lista de espera.
- Favoritos (wishlist) con sesión, avisos de reposición (restock) y lista de espera para drops.

## Último commit

`6322cdf` — feat: opengraph-image por producto (pusheado a origin/main el 11/08/2026).

## Estado del repo

Todo commiteado y pusheado (árbol limpio). Deploy en Vercel: https://craft3d.vercel.app (se conecta desde GitHub, se actualiza solo al pushear).

Últimos commits:
```
6322cdf feat: opengraph-image por producto
3bc9e19 feat: catálogo con búsqueda y ordenamiento
abb716a feat: panel admin - listado y eliminación de reposición y lista de espera
3cf2d5a feat: lista de espera de drops
11c6c05 feat: avisos de reposición
ab100fc feat: wishlist/favoritos con sesión
3c109d6 feat: mejoras globales (whatsapp float, metadata OG, fix share-buttons, tablas DB)
```

## Pendientes

1. **Link a `/favoritos`** en `components/header-nav.tsx` — la página existe pero no hay acceso desde el nav. No logueado redirige a `/ingresar?next=/favoritos`.
2. **Verificar deploy en Vercel** tras este push (debe tomar los 7 commits nuevos). Antes del push, `/favoritos` y el OG image daban 404 en prod (no estaban commiteados).
3. **Lista de recomendaciones y mejoras** — el usuario la pidió; armar nueva (la anterior se perdió en la sesión cortada).
4. **Revisar el aviso de reposición**: los productos en la DB (seed via migrate.mjs) no tienen la columna `images`; verificar que la galería multi-foto no rompa para productos sin imágenes.

## Bugs arreglados en sesión 11/08/2026

- `components/share-buttons.tsx` usaba `window.location.origin` en render → `ReferenceError: window is not defined` (500 en productos). Fix: usar `NEXT_PUBLIC_SITE_URL` en SSR y `window` solo en handlers client.
- `app/productos/[slug]/opengraph-image.tsx` crasheaba: Satori exige `display` explícito en divs con múltiples hijos. Fix: agregar `display: "flex"` al div CRAFT3D.

## Decisiones de arquitectura

- RLS: `drop_waitlist` y `restock_requests` sin políticas → solo `service_role` (secret key) vía API/actions. `wishlists` con políticas por `auth.uid()`.
- Wishlist usa fetch a `/api/wishlist` desde contexto client; 401 → redirige a `/ingresar?next=...`.
- Migración de DB se hace appendeando al final de `supabase/schema.sql`.
- Drops: categoría unificada `drops`. Productos drops redirigen de /catalogo a /drops.
- Seña de reserva configurable (% o monto fijo) desde panel admin.

## Scripts de utilidad (en Temp, no se versionan)

- `C:\Users\chin0\AppData\Local\Temp\opencode\craft3d-migrate.mjs` — reemplaza productos en Supabase con seed (13 productos).
- `C:\Users\chin0\AppData\Local\Temp\opencode\craft3d-inspect.mjs` — lista productos actuales de Supabase.
- Ambos leen credenciales de `.env.local` (SUPABASE_URL + SUPABASE_SECRET_KEY).

## Registro de sesiones

- **11/08/2026 — verificación y fixes**: recargué el server dev (estaba corrupto). Verifiqué rutas (todas 200), arreglé `share-buttons` (window en SSR) y el OG image (display flex). El usuario creó la tabla `wishlists` en Supabase vía SQL Editor (workflow: yo doy el SQL, él lo corre). Verifiqué que las 3 tablas existen. **Commiteé y pusheé todo en 7 commits** (wishlist, restock, waitlist, admin, catálogo, OG image, mejoras globales). Repo: https://github.com/Nruiz88/craft3d. Deploy: https://craft3d.vercel.app.
- **Sesión anterior**: implementé wishlist + restock + waitlist + catálogo con búsqueda/orden + WhatsApp float + OG image + tablas de DB. La conexión se cortó antes de terminar de atar pendientes y commitear.

---
*Última actualización: 11/08/2026 — 7 commits pusheados.*
