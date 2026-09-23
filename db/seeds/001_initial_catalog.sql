-- ═══════════════════════════════════════════════════════════════════════
-- 001_initial_catalog.sql — Seed inicial de la tienda Craft3d
-- ═══════════════════════════════════════════════════════════════════════
-- Aplica el catálogo base, cupones generales y páginas editables
-- precargadas. Pensado para bases nuevas o para rellenar huecos.
--
-- SEGURIDAD DE DATOS:
--   * Usa INSERT IGNORE: si una fila ya existe (slug/code), NO se pisa.
--   * No toca pedidos, usuarios, settings ni productos creados por el
--     panel admin (incluido el producto de prueba con pedidos reales).
--   * Re-ejecutar es seguro: solo inserta lo que falte.
--
-- Categorías válidas (src/lib/products/index.ts):
--   anime | gaming | cine-series | accesorios | drops | mundial-2026
--
-- Cupones: kind ∈ {fixed, percent}; max_uses = usos TOTALES;
--          user_id NULL = cupón general.
--
-- Uso:
--   docker exec -i <mariadb> mariadb -uroot -p"$PW" default < db/seeds/001_initial_catalog.sql
-- ═══════════════════════════════════════════════════════════════════════

-- ─────────────────────────── PRODUCTOS ───────────────────────────

INSERT IGNORE INTO products
  (slug, name, category, price, emoji, image, description, details, stock, featured, tags, images)
VALUES
  ('cuadro-hueforge-goku-ultra-instinto',
   'Cuadro Hueforge Goku Ultra Instinto',
   'anime', 25000.00, '🍥', NULL,
   'Cuadro en filamento técnica Hueforge de Goku en Ultra Instinto. Las capas de color crean el efecto de profundidad y brillo característico de Hueforge, impreso a mano capa a capa.',
   JSON_ARRAY('Incluye marco negro mate', 'Tamaño: 20 x 20 cm', 'Pieza numerada y firmada', 'Hecho a mano en Neuquén'),
   6, 1, JSON_ARRAY('hueforge', 'dragon ball', 'cuadro', 'wall art'), JSON_ARRAY()),

  ('figura-naruto-modo-sabio',
   'Figura Naruto Modo Sabio',
   'anime', 28000.00, '🍥', NULL,
   'Figura articulada de Naruto en Modo Sabio, impresa en PLA de alta calidad. Ideal para escritorio o vitrina de colección.',
   JSON_ARRAY('Altura: 18 cm', 'PLA color natural', 'Base incluida', 'Impresa en piezas ensamblables'),
   4, 0, JSON_ARRAY('naruto', 'figura', 'coleccionable'), JSON_ARRAY()),

  ('lampara-porter-one-piece',
   'Lámpara Porter One Piece',
   'anime', 32000.00, '🏮', NULL,
   'Lámpara de mesa con silueta del barco Porter de One Piece. La luz atraviesa el filamento translúcido y proyecta la silueta en la pared.',
   JSON_ARRAY('Cable USB incluido', 'Bombillo LED cálido', 'Altura: 22 cm', 'Filamento translúcido'),
   3, 0, JSON_ARRAY('lampara', 'one piece', 'decoracion'), JSON_ARRAY()),

  ('soporte-headset-league-of-legends',
   'Soporte Headset League of Legends',
   'gaming', 12000.00, '🎮', NULL,
   'Soporte de auriculares temático de League of Legends. Mantiene tu headset a mano y le da personalidad al setup.',
   JSON_ARRAY('Base antideslizante', 'Resiste hasta 600 g', 'Altura: 26 cm', 'Dos piezas encastrables'),
   8, 0, JSON_ARRAY('soporte', 'headset', 'gaming', 'league of legends'), JSON_ARRAY()),

  ('maceta-pixel-corazon',
   'Maceta Pixel Corazón',
   'gaming', 9500.00, '🪴', NULL,
   'Maceta con diseño pixel-art estilo videojuego retro. Ideal para suculentas y cactus chicos, con plato de goteo incluido.',
   JSON_ARRAY('Con plato de goteo', 'Diámetro: 9 cm', 'Impermeabilizada por dentro', 'Colores a elección'),
   10, 0, JSON_ARRAY('maceta', 'pixel', 'retro', 'decoracion'), JSON_ARRAY()),

  ('cuadro-hueforge-darth-vader',
   'Cuadro Hueforge Darth Vader',
   'cine-series', 27000.00, '🎬', NULL,
   'Cuadro Hueforge de Darth Vader con efecto de profundidad multicapa. El lado oscuro impreso capa a capa con silueta y sable en relieve.',
   JSON_ARRAY('Incluye marco negro mate', 'Tamaño: 20 x 20 cm', 'Pieza numerada y firmada', 'Hecho a mano en Neuquén'),
   5, 1, JSON_ARRAY('hueforge', 'star wars', 'cuadro', 'wall art'), JSON_ARRAY()),

  ('posavasos-set-star-wars',
   'Posavasos Set Star Wars x4',
   'cine-series', 8500.00, '☕', NULL,
   'Set de 4 posavasos con emblemas de Star Wars: Alianza Rebelde, Imperio Galáctico, Mandolorio y Sable de Luz.',
   JSON_ARRAY('Set de 4 unidades', 'Diámetro: 9 cm', 'Filamento bicolor', 'Aptos para vasos y tazas'),
   12, 0, JSON_ARRAY('posavasos', 'star wars', 'set'), JSON_ARRAY()),

  ('clicker-fidget-articulado',
   'Clicker Fidget Articulado',
   'accesorios', 6000.00, '🔑', NULL,
   'Fidget articulado impreso en una sola pieza, sin ensamblado. Se mueve, hace click y no se desarma. Antiestrés de escritorio.',
   JSON_ARRAY('Pieza única articulada', 'Largo: 12 cm', 'Colores surtidos', 'Impreso en una pasada'),
   15, 0, JSON_ARRAY('fidget', 'antiestres', 'accesorio'), JSON_ARRAY()),

  ('bookmark-marcador-dragon-ball',
   'Bookmark Marcador Dragon Ball',
   'accesorios', 4500.00, '📖', NULL,
   'Marcador de páginas con esfera del dragón en relieve. Plano, liviano y no daña las hojas.',
   JSON_ARRAY('Diseño plano 2 mm', 'Esferas en relieve', 'Colores surtidos', 'Ideal para regalo'),
   20, 0, JSON_ARRAY('bookmark', 'dragon ball', 'lectura'), JSON_ARRAY()),

  ('mate-fanatico-seleccion-argentina',
   'Mate Fanático Selección Argentina',
   'mundial-2026', 14000.00, '🏆', NULL,
   'Mate imprimido en 3D con diseño de fanático de la Selección para el Mundial 2026. Interior impermeabilizado y base antideslizante.',
   JSON_ARRAY('Capacidad: 250 ml', 'Interior impermeabilizado', 'Base antideslizante', 'Edición Mundial 2026'),
   8, 1, JSON_ARRAY('mate', 'mundial 2026', 'seleccion', 'regalo'), JSON_ARRAY());

-- ─────────────────────────── CUPONES ───────────────────────────

-- Bienvenida: 10% off sin mínimo, 100 usos, sin vencimiento.
INSERT IGNORE INTO coupons (code, kind, value, min_subtotal, max_uses, times_used, expires_at, user_id)
VALUES ('BIENVENIDA10', 'percent', 10.00, 0.00, 100, 0, NULL, NULL);

-- Cupón fijo de temporada: $5.000 off desde $50.000, vence fin de 2026.
INSERT IGNORE INTO coupons (code, kind, value, min_subtotal, max_uses, times_used, expires_at, user_id)
VALUES ('CRAFT5000', 'fixed', 5000.00, 50000.00, 50, 0, '2026-12-31 23:59:59', NULL);

-- ─────────────────────── PÁGINAS EDITABLES ───────────────────────
-- Se sirven en /info/<slug> y se editan desde /admin > Páginas.

INSERT IGNORE INTO editable_pages (slug, title, subtitle, content, published) VALUES
('como-comprar', 'Cómo Comprar',
 'Comprá en Craft3d en 4 simples pasos',
 JSON_ARRAY(
   JSON_OBJECT('heading', '1. Elegí tu pieza',
               'body', 'Navegá el catálogo por categoría o buscá por nombre. Cada ficha tiene fotos, medidas, detalles y stock disponible. Los drops son ediciones numeradas: cuando se agotan, no se reimprimen.'),
   JSON_OBJECT('heading', '2. Agregá al carrito',
               'body', 'Sumá todo lo que quieras en un solo pedido. Si tu compra supera los $80.000, el envío es gratis. También podés aplicar cupones en el carrito.'),
   JSON_OBJECT('heading', '3. Elegí cómo pagar',
               'body', 'Transferencia bancaria (te enviamos los datos por WhatsApp o email) o Mercado Pago con tarjeta y en cuotas. Las reservas de drops se hacen con una seña del 50%.'),
   JSON_OBJECT('heading', '4. Recibilo en tu casa',
               'body', 'Despachamos por Correo Argentino a todo el país en 24-48 h desde la confirmación del pago. Te mandamos el código de seguimiento para seguir tu paquete.')
 ), 1),

('preguntas-frecuentes', 'Preguntas Frecuentes',
 'Las dudas más comunes sobre nuestras piezas',
 JSON_ARRAY(
   JSON_OBJECT('heading', '¿Las piezas son hechas a mano?',
               'body', 'Sí. Cada pieza se imprime en 3D capa a capa y termina a mano: lijado, ensamblado y control de calidad. Por eso cada pieza es única y puede tener pequeñas variaciones.'),
   JSON_OBJECT('heading', '¿Cuánto tarda el envío?',
               'body', 'Despachamos por Correo Argentino en 24-48 h desde la confirmación del pago. El demora estimado es de 3 a 7 días hábiles según la zona del país.'),
   JSON_OBJECT('heading', '¿Puedo pedir una pieza personalizada?',
               'body', 'Sí, hacemos encargos a medida. Escribinos por WhatsApp con tu idea, tamaño y referencia, y te cotizamos sin compromiso.'),
   JSON_OBJECT('heading', '¿Qué hago si llega rota?',
               'body', 'Mandanos una foto por WhatsApp dentro de las 48 h de recibido el paquete y te la reponemos sin cargo o te devolvemos el dinero.'),
   JSON_OBJECT('heading', '¿Cómo funcionan las monedas?',
               'body', 'Con cada compra acumulás monedas que podés canjear por cupones de descuento desde tu cuenta. También ganás monedas extra con cajas sorpresa.')
 ), 1);

-- ─────────────────────────── RESUMEN ───────────────────────────

SELECT 'products' AS tabla, COUNT(*) AS total FROM products
UNION ALL SELECT 'coupons', COUNT(*) FROM coupons
UNION ALL SELECT 'editable_pages', COUNT(*) FROM editable_pages
UNION ALL SELECT 'settings', COUNT(*) FROM settings;
