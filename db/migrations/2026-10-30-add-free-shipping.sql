-- Envío gratis por producto: agrega la columna free_shipping a products.
-- Ejecutar una vez en la base de datos (MariaDB/MySQL).
-- Boolean de Drizzle = TINYINT(1). Default 0 (sin envío gratis).

ALTER TABLE products
  ADD COLUMN free_shipping TINYINT(1) NOT NULL DEFAULT 0 AFTER featured;
