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

`136fb54` — docs: actualizar CONTEXTO.md (pusheado a origin/main el 11/08/2026).

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

1. ~~**Link a `/favoritos`** en el header~~ — HECHO 11/08/2026 (`components/wishlist-badge.tsx`, corazón con contador junto al carrito).
2. **Verificar deploy en Vercel** tras este push (debe tomar los 8 commits nuevos). Antes del push, `/favoritos` y el OG image daban 404 en prod (no estaban commiteados).
3. **Lista de recomendaciones y mejoras** — armada (sección abajo); falta implementar las elegidas.
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

- **11/08/2026 — verificación y fixes**: recargué el server dev (estaba corrupto). Verifiqué rutas (todas 200), arreglé `share-buttons` (window en SSR) y el OG image (display flex). El usuario creó la tabla `wishlists` en Supabase vía SQL Editor (workflow: yo doy el SQL, él lo corre). Verifiqué que las 3 tablas existen. **Commiteé y pusheé todo en 7 commits** (wishlist, restock, waitlist, admin, catálogo, OG image, mejoras globales). Repo: https://github.com/Nruiz88/craft3d. Deploy: https://craft3d.vercel.app. Armé lista de recomendaciones (sección abajo).
- **11/08/2026 — WishlistBadge**: agregué el link a /favoritos en el header con corazón + contador (recomendación #2). Commit + push.
- **Sesión anterior**: implementé wishlist + restock + waitlist + catálogo con búsqueda/orden + WhatsApp float + OG image + tablas de DB. La conexión se cortó antes de terminar de atar pendientes y commitear.

## Recomendaciones de mejoras (11/08/2026)

### Tienda (páginas públicas)
1. **Link a /favoritos en el header** con badge/contador (ya pendiente).
2. **Emails reales**: avisar al cliente cuando repongan (restock) y confirmación de pedido/pago. Hoy los forms solo guardan en DB. Requiere un servicio (Resend es gratuito y simple).
3. **Cupones de descuento** (código, % o monto, vigencia y límite de usos) aplicables en el carrito.
4. **Envío real por provincia** (hoy parece costo fijo) + tracking del envío (campo nº de seguimiento) y email al marcar "enviado".
5. **Reseñas/valoraciones** de productos (estrellas + texto) — ayudan a conversión.
6. **"También te puede gustar"** en el detalle de producto (cross-sell por categoría/tags).
7. **Barra de progreso de envío gratis** en el carrito (ya existe `freeShippingFrom` = $80.000; mostrarlo como upsell).
8. **Feed de Instagram** en la home.
9. **SEO**: sitemap.xml, robots.txt y datos estructurados Product/Offer (para rich results en Google).
10. **Analytics**: GA4 o Vercel Analytics / Plausible.
11. **Páginas legales**: términos, envíos y devoluciones + aviso de privacidad/cookies.

### Panel admin
12. **Dashboard con métricas**: ingresos del mes, pedidos por estado, top productos, drops activos, avisos de reposición sin responder, últimos pedidos.
13. **Exportar pedidos y clientes a CSV**.
14. **Badges de "sin revisar"** en el sidebar para reposición/lista de espera/ventas nuevas.
15. **Stock directo desde el listado** (+/−) y toggle de destacado sin abrir el editor.
16. **Filtros/búsqueda en ventas** (estado, fecha, cliente) y en clientes.
17. **Log de actividad** (quién cambió qué en productos/ventas).
18. **2FA o mejor auth del admin** (hoy solo `ADMIN_PASSWORD`).

### Técnico / robustez
19. **Rate limiting** en forms y `/api/wishlist` (hoy se puede spamear la lista de espera).
20. **CI en GitHub Actions**: lint + build en cada push (evita deploy roto en Vercel).
21. **Monitoreo de errores** (Sentry) — sobre todo el webhook de MercadoPago.
22. **Webhook MP**: verificar firma/índice de idempotencia para evitar duplicar pedidos.
23. **Pruebas e2e** (Playwright): smoke de checkout y drops.
24. **PWA/instalable** con manifest + service worker.
25. **Verificar galería multi-foto** con productos que no tienen columna `images` (seed viejo) — no debe romper.
26. **Accesibilidad**: contrastes, focus visible, labels en forms.

---
*Última actualización: 11/08/2026 — WishlistBadge en header.*
