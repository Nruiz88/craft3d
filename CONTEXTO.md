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

`7499def` — feat: galería de fotos en la página de detalle de drops (flechas, contador y filmstrip arcade).

## Trabajo SIN commitear (hasta última sesión)

14 archivos modificados + ~20 nuevos. Features en curso:

| Feature | Archivos clave | Estado |
|---|---|---|
| **Wishlist/Favoritos** | `app/favoritos/`, `app/api/wishlist/`, `lib/wishlist-context.tsx`, `components/wishlist-button.tsx` | Sin commitear |
| **Aviso de reposición (restock)** | `app/restock/`, `lib/restock.ts`, `components/restock-form.tsx`, `app/admin/restock/` | Sin commitear |
| **Lista de espera drops** | `app/waitlist/`, `lib/waitlist.ts`, `components/waitlist-form.tsx`, `app/admin/waitlist/` | Sin commitear |
| **Catálogo: búsqueda y orden** | `lib/catalog.ts`, `components/catalog-toolbar.tsx`, `search-form.tsx`, `sort-select.tsx` | Sin commitear |
| **WhatsApp float** | `components/whatsapp-float.tsx` | Sin commitear |
| **OG image por producto** | `app/productos/[slug]/opengraph-image.tsx` | Sin commitear |
| **Tablas nuevas DB** | `supabase/schema.sql` (drop_waitlist, restock_requests, wishlists) | Sin commitear |

Modificados: `.env.example`, `app/admin/actions.ts`, `app/catalogo/page.tsx`, `app/cuenta/page.tsx`, `app/layout.tsx`, `app/page.tsx`, `app/productos/[slug]/page.tsx`, `components/admin/admin-shell.tsx`, `components/category-catalog.tsx`, `components/drop-product-view.tsx`, `components/header-nav.tsx`, `components/next-drop-panel.tsx`, `components/product-card.tsx`, `supabase/schema.sql`.

## Pendientes

1. **Commitear** todo el trabajo sin commitear (revisar antes con `git diff`).
2. **Link a `/favoritos`** en `components/header-nav.tsx` — la página existe pero no hay acceso desde el nav. No logueado redirige a `/ingresar?next=/favoritos`.
3. **Verificar build** completo con las features nuevas.
4. **Revisar deploy de Vercel** — se conecta desde GitHub. El usuario puede pasar el link del proyecto. Último deploy puede estar roto porque los fixes de esta sesión (`share-buttons`, OG image) aún no se committearon.

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

- **11/08/2026 — verificación y fixes**: recargué el server dev (estaba corrupto). Verifiqué rutas (todas 200), arreglé `share-buttons` (window en SSR) y el OG image (display flex). El usuario creó la tabla `wishlists` en Supabase vía SQL Editor (workflow: yo doy el SQL, él lo corre). Verifiqué que las 3 tablas existen. Pendiente: lista de recomendaciones, link a /favoritos, commitear, revisar Vercel.
- **Sesión anterior**: implementé wishlist + restock + waitlist + catálogo con búsqueda/orden + WhatsApp float + OG image + tablas de DB. La conexión se cortó antes de terminar de atar pendientes y commitear.

---
*Última actualización: 11/08/2026 — fixes + verificación de DB.*
