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
2. **SEO** — HECHO 11/08/2026: `app/sitemap.ts`, `app/robots.ts`, JSON-LD (Product+Breadcrumb en productos, Organization+WebSite en home), canonical en productos/catálogo/drops. Verificar en Google Search Console.
3. **Verificar deploy en Vercel** tras este push (debe tomar los commits nuevos).
4. **Revisar el aviso de reposición**: los productos en la DB (seed via migrate.mjs) no tienen la columna `images`; verificar que la galería multi-foto no rompa para productos sin imágenes.
5. ~~**GAMIFICACIÓN — correr el SQL**~~ — HECHO 11/08/2026: tablas `player_profiles`, `player_badges`, columna `orders.rewards_awarded` y políticas RLS.
6. ~~**Gamificación v2: canje de monedas por cupones**~~ — HECHO 11/08/2026: tablas `coupons` + `coin_redemptions`, RPC `redeem_coins`/`apply_coupon`, `place_order` con cupón (descuento atómico), input de cupón en el carrito y canje en /cuenta. SQL corrido por el usuario.
7. **Recomendaciones pendientes de implementar** (lista en sección abajo): emails, envío real, reseñas, dashboard admin, CSV, rate limiting, CI, Sentry. (Estados de impresión por pedido: descartados por el usuario como innecesarios.)

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
7. **Páginas legales**: términos, envíos y devoluciones + aviso de privacidad/cookies.

### Panel admin
8. **Dashboard con métricas**: ingresos del mes, pedidos por estado, top productos, drops activos, avisos de reposición sin responder, últimos pedidos.
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
22. **Webhook MP**: verificar firma/índice de idempotencia para evitar duplicar pedidos.
23. **Pruebas e2e** (Playwright): smoke de checkout y drops.
24. **PWA/instalable** con manifest + service worker.
25. **Verificar galería multi-foto** con productos que no tienen columna `images` (seed viejo) — no debe romper.
26. **Accesibilidad**: contrastes, focus visible, labels en forms.

---
*Última actualización: 11/08/2026 — Canje de monedas por cupones (cierra la gamificación).*
