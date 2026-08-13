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
- Gamificación arcade: perfil PLAYER en /cuenta (nivel, monedas, insignias) alimentado al pagar pedidos (1 moneda por $1.000).
- Canje de monedas por cupones de descuento (1 moneda = $20, mínimo 100) aplicables en el carrito. Tablas `coupons` y `coin_redemptions`; pedidos guardan `discount` + `coupon_code`.

## Último commit

`6693727` — feat: páginas legales (términos, envíos y devoluciones, privacidad) + links en footer (11/08/2026).

## Estado del repo

Todo commiteado y pusheado (árbol limpio). Deploy en Vercel: https://craft3d.vercel.app (se conecta desde GitHub, se actualiza solo al pushear).

Últimos commits:
```
6693727 feat: páginas legales - términos, envíos y devoluciones, privacidad + links en footer
34e1071 feat: emails con Resend - confirmación de pedido, pago, seña y aviso de reposición
1526921 docs: registrar fixes de checkout y header en CONTEXTO.md
e18602b fix: scroll horizontal en header por buscador con ancho fijo
67b09c5 fix: checkout - enviar solo items validos y purgar slugs obsoletos del carrito (evita 'Producto no encontrado')
6322cdf feat: opengraph-image por producto
3bc9e19 feat: catálogo con búsqueda y ordenamiento
abb716a feat: panel admin - listado y eliminación de reposición y lista de espera
```

## Pendientes

1. ~~**Link a `/favoritos`** en el header~~ — HECHO 11/08/2026 (`components/wishlist-badge.tsx`, corazón con contador junto al carrito).
2. ~~**SEO**~~ — HECHO 11/08/2026: `app/sitemap.ts`, `app/robots.ts`, JSON-LD (Product+Breadcrumb en productos, Organization+WebSite en home), canonical en productos/catálogo/drops. Pendiente verificar en Google Search Console.
3. **Verificar deploy en Vercel** tras el push (debe tomar los commits nuevos).
4. **Revisar el aviso de reposición**: los productos en la DB (seed via migrate.mjs) no tienen la columna `images`; verificar que la galería multi-foto no rompa para productos sin imágenes.
5. ~~**GAMIFICACIÓN — correr el SQL**~~ — HECHO 11/08/2026: tablas `player_profiles`, `player_badges`, columna `orders.rewards_awarded` y políticas RLS.
6. ~~**Gamificación v2: canje de monedas por cupones**~~ — HECHO 11/08/2026: tablas `coupons` + `coin_redemptions`, RPC `redeem_coins`/`apply_coupon`, `place_order` con cupón (descuento atómico), input de cupón en el carrito y canje en /cuenta. SQL corrido por el usuario.
7. ~~**Páginas legales**~~ — HECHO 11/08/2026: `/terminos`, `/envios` y `/privacidad` + links en footer (`components/legal-page.tsx`).
8. ~~**Dashboard admin**~~ — HECHO 12/08/2026: KPIs (ingresos/pedidos 30 días, pendientes, avisos de reposición, drops activos, valor de inventario), últimos pedidos, pedidos por estado, top productos. Listado de productos movido a `/admin/productos`.
9. ~~**Webhook MP: firma e idempotencia**~~ — HECHO 12/08/2026: verificación de firma HMAC (`MERCADOPAGO_WEBHOOK_SECRET`) + validación de monto. Pendiente: configurar el secret en Vercel.
10. **Recomendaciones pendientes de implementar** (lista en sección abajo): emails (Resend ya integrado), envío real con tracking, reseñas, banner de cookies, CSV, rate limiting, CI, Sentry. (Estados de impresión por pedido: descartados por el usuario como innecesarios.)
11. **Envío real (Correo Argentino)**: implementado cotización en carrito (CP → domicilio/sucursal), configurado en `/admin/configuracion`, `place_order` acepta `p_shipping`. **Pendiente**: correr el nuevo `place_order` del `supabase/schema.sql` en Supabase (necesario para el checkout), configurar las credenciales de MiCorreo, y campo de tracking + email al marcar "enviado".

## Bugs arreglados después del 11/08/2026

- `components/cart-view.tsx`: el checkout mandaba ítems obsoletos (productos borrados → "Producto no encontrado"). Fix: enviar solo ítems válidos y purgar los slugs obsoletos del carrito.
- `components/header-nav.tsx`: el buscador con ancho fijo generaba scroll horizontal en el header. Fix: ajustar el ancho.

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

- **12/08/2026 — Envío real por Correo Argentino (UI checkout)**: cotización en el carrito — el cliente ingresa su CP, `quoteShippingAction` llama a MiCorreo (`lib/correoargentino.ts`) y elige entre envío a domicilio o retiro en sucursal (precio + días hábiles). `checkoutAction` pasa `p_shipping` al nuevo `place_order`, el total del pedido incluye el envío (y el precio de MP se escala para cubrirlo). Barra de progreso de envío gratis en el carrito (umbral configurable `shipping_free_from`). Configuración en `/admin/configuracion` (sección Envíos + Envío gratis): credenciales de MiCorreo (customerId, user tokens, CP origen, peso, entorno PROD/TEST) y umbral de envío gratis. **Importante**: hay que correr el nuevo `place_order` (con `p_shipping`) de `supabase/schema.sql` en Supabase antes de probar el checkout, y configurar las credenciales de MiCorreo en el admin. Falta: campo de tracking + email al marcar "enviado".
- **12/08/2026 — Dashboard admin + webhook MP seguro**: `app/admin/page.tsx` pasó a ser dashboard con KPIs (ingresos y pedidos de 30 días, pendientes de pago, avisos de reposición, drops activos, valor de inventario), últimos pedidos, pedidos por estado y top productos. El listado de productos se movió a `/admin/productos` (`app/admin/productos/page.tsx`) con revalidaciones nuevas en `actions.ts` y navegación actualizada en `admin-shell.tsx`. Webhook de MercadoPago: verificación de firma HMAC (`verifyWebhookSignature` en `lib/mercadopago.ts`, `MERCADOPAGO_WEBHOOK_SECRET` en `.env.example`) + validación de monto pagado vs. esperado (seña o total). **Pendiente para el usuario**: configurar `MERCADOPAGO_WEBHOOK_SECRET` en Vercel.
- **12/08/2026 — Fixes checkout y header**: `components/cart-view.tsx` ya no envía ítems obsoletos del carrito (purga slugs que ya no existen, evitando "Producto no encontrado" en checkout) y `components/header-nav.tsx` corrige el scroll horizontal del header por el buscador de ancho fijo. Commiteado y pusheado (`67b09c5`, `e18602b`).
- **11/08/2026 — Canje de monedas + cupones**: cierra el loop arcade. Tablas `coupons` y `coin_redemptions`, columnas `orders.discount`/`orders.coupon_code`, RPC `redeem_coins` (1 moneda = $20, mínimo 100, código CRAFT-XXXXXX válido 90 días) y `apply_coupon` (valida código, descuento no puede cubrir el total). `place_order` ahora acepta `p_coupon_code` (descuento atómico, consume el cupón y marca el canje "usado"). UI: input de cupón en el carrito con validación server (`validateCouponAction`), fila de descuento, y sección de canje en /cuenta (`coin-redemption.tsx`, `app/cuenta/actions.ts`). MP escala los ítems según descuento. Fix de seguridad en `redeem_coins` (comparación con auth.uid() nulo). El usuario corrió el SQL en dos pasos.
- **11/08/2026 — Gamificación arcade (perfil + monedas)**: nuevo `lib/gamification.ts` (niveles PLAYER 1-5 según total pagado, insignias, `awardPurchase` idempotente vía `orders.rewards_awarded`). Monedas al pagar: 1 por cada $1.000. Se acredita al marcar "pagado" (webhook MP o admin). `components/player-card.tsx` con nivel, barra de progreso, monedas, stats e insignias en /cuenta; hint de monedas en el carrito. Estados de impresión por pedido: descartados por el usuario. **Falta correr el SQL** (tablas + columna, ya en schema.sql) para que funcione.
- **11/08/2026 — verificación y fixes**: recargué el server dev (estaba corrupto). Verifiqué rutas (todas 200), arreglé `share-buttons` (window en SSR) y el OG image (display flex). El usuario creó la tabla `wishlists` en Supabase vía SQL Editor (workflow: yo doy el SQL, él lo corre). Verifiqué que las 3 tablas existen. **Commiteé y pusheé todo en 7 commits** (wishlist, restock, waitlist, admin, catálogo, OG image, mejoras globales). Repo: https://github.com/Nruiz88/craft3d. Deploy: https://craft3d.vercel.app. Armé lista de recomendaciones (sección abajo).
- **11/08/2026 — WishlistBadge**: agregué el link a /favoritos en el header con corazón + contador (recomendación #2). Commit + push.
- **11/08/2026 — SEO**: `app/sitemap.ts` dinámico (home/catálogo/drops/productos), `app/robots.ts` (disallow de zonas privadas + sitemap), JSON-LD Product+BreadcrumbList en `/productos/[slug]`, Organization+WebSite con SearchAction en la home, y canonical en productos/catálogo/drops. Verificado local (robots.txt, sitemap.xml, JSON-LD y canonical OK). Commit + push.
- **Sesión anterior**: implementé wishlist + restock + waitlist + catálogo con búsqueda/orden + WhatsApp float + OG image + tablas de DB. La conexión se cortó antes de terminar de atar pendientes y commitear.

## Recomendaciones de mejoras (11/08/2026)

### Ideas diferenciadoras (nuevas, para negocio 3D + arcade + drops)
- **Configurador de color/material** por producto (se imprime a pedido): el cliente elige color de filamento antes de comprar.
- **Estados de impresión por pedido** (encaja con "a pedido"): pendiente de imprimir → imprimiendo → post-procesado → listo para enviar. El cliente ve el avance en su cuenta. Killer feature para negocio 3D.
- **Gamificación arcade**: niveles de cliente (PLAYER 1, PLAYER 2…), monedas por compra canjeables por descuentos, insignias (primer drop, 5 compras), high-score de drops.
- **Mystery box / cajas sorpresa**: unidad aleatoria de la categoría; muy bueno para liquidar stock y como regalo.
- **Elegir número de edición** en drops numerados si sigue disponible.
- **Módulo de personalización**: upload de STL/imagen y cotización por WhatsApp con datos prellenados.
- **Programa de referidos** con código propio y recompensa.
- **Newsletter estilo arcade**: "INSERT COIN → suscribite y enterate del próximo drop" (junto con emails reales).
- **Feed de Instagram** integrado en la home (social proof).
- **Videos** cortos por producto en la galería (además de fotos).
- **PWA instalable**: el usuario la instala como app en el celular con splash arcade.
- **QR de seguimiento** por pedido que el cliente escanea del packaging.

### Tienda (páginas públicas)
1. **Emails reales**: avisar al cliente cuando repongan (restock) y confirmación de pedido/pago. Hoy los forms solo guardan en DB. Requiere un servicio (Resend es gratuito y simple).
2. **Cupones de descuento** (código, % o monto, vigencia y límite de usos) aplicables en el carrito.
3. **Envío real por provincia** (hoy parece costo fijo) + tracking del envío (campo nº de seguimiento) y email al marcar "enviado".
4. **Reseñas/valoraciones** de productos (estrellas + texto) — ayudan a conversión.
5. **Barra de progreso de envío gratis** en el carrito (ya existe `freeShippingFrom` = $80.000; mostrarlo como upsell).
6. **Analytics**: GA4 o Vercel Analytics / Plausible (después de fijar dominio definitivo).
7. ~~**Páginas legales**~~ — HECHO 11/08/2026: `/terminos`, `/envios` y `/privacidad` + links en footer. Pendiente: **banner de aviso de cookies**.

### Panel admin
8. ~~**Dashboard con métricas**~~ — HECHO 12/08/2026: ingresos/pedidos 30 días, pedidos por estado, top productos, drops activos, avisos de reposición, últimos pedidos.
9. **Exportar pedidos y clientes a CSV**.
10. **Badges de "sin revisar"** en el sidebar para reposición/lista de espera/ventas nuevas.
11. **Stock directo desde el listado** (+/−) y toggle de destacado sin abrir el editor.
12. **Filtros/búsqueda en ventas** (estado, fecha, cliente) y en clientes.
13. **Log de actividad** (quién cambió qué en productos/ventas).
14. **2FA o mejor auth del admin** (hoy solo `ADMIN_PASSWORD`).

### Técnico / robustez
15. **Rate limiting** en forms y `/api/wishlist` (hoy se puede spamear la lista de espera).
16. **CI en GitHub Actions**: lint + build en cada push (evita deploy roto en Vercel).
21. **Monitoreo de errores** (Sentry) — sobre todo el webhook de MercadoPago.
22. ~~**Webhook MP: firma/idempotencia**~~ — HECHO 12/08/2026: firma HMAC + validación de monto. Pendiente configurar el secret en Vercel.
23. **Pruebas e2e** (Playwright): smoke de checkout y drops.
24. **PWA/instalable** con manifest + service worker.
25. **Verificar galería multi-foto** con productos que no tienen columna `images` (seed viejo) — no debe romper.
26. **Accesibilidad**: contrastes, focus visible, labels en forms.

---
*Última actualización: 12/08/2026 — Dashboard admin + webhook MP seguro.*
