-- ============================================================
-- Script completo para MariaDB / phpMyAdmin
-- Copiar todo este bloque y pegar en la pestaña SQL
-- Base recomendada: craft3d_db (utf8mb4)
-- ============================================================

CREATE DATABASE IF NOT EXISTS `default` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `default`;
SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

-- ============================================================
-- Productos
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'figuras',
  price DECIMAL(12,2) NOT NULL DEFAULT '0.00',
  emoji VARCHAR(10) NOT NULL DEFAULT '🎁',
  image TEXT,
  description LONGTEXT DEFAULT '',
  details LONGTEXT DEFAULT '[]',
  stock INT NOT NULL DEFAULT 0,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  tags LONGTEXT DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  drop_starts_at TIMESTAMP NULL,
  drop_ends_at TIMESTAMP NULL,
  drop_units INT NULL,
  images LONGTEXT DEFAULT '[]',
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Perfiles de usuarios
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'customer',
  full_name VARCHAR(255) NOT NULL DEFAULT '',
  phone VARCHAR(50) NOT NULL DEFAULT '',
  city VARCHAR(100) NOT NULL DEFAULT '',
  address VARCHAR(500) NOT NULL DEFAULT '',
  postal_code VARCHAR(20) NOT NULL DEFAULT '',
  province VARCHAR(100) NOT NULL DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Configuración del panel
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  `key` VARCHAR(100) PRIMARY KEY,
  `value` LONGTEXT DEFAULT '',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Pedidos / Ventas
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36),
  customer_name VARCHAR(255) NOT NULL DEFAULT '',
  customer_email VARCHAR(255) NOT NULL DEFAULT '',
  status VARCHAR(50) NOT NULL DEFAULT 'pendiente',
  payment_method VARCHAR(50) NOT NULL DEFAULT 'transferencia',
  payment_id VARCHAR(255) NOT NULL DEFAULT '',
  mp_preference_id VARCHAR(255) NOT NULL DEFAULT '',
  shipping_phone VARCHAR(50) NOT NULL DEFAULT '',
  shipping_address VARCHAR(500) NOT NULL DEFAULT '',
  shipping_city VARCHAR(100) NOT NULL DEFAULT '',
  shipping_province VARCHAR(100) NOT NULL DEFAULT '',
  shipping_postal_code VARCHAR(20) NOT NULL DEFAULT '',
  subtotal DECIMAL(12,2) NOT NULL DEFAULT '0.00',
  shipping DECIMAL(12,2) NOT NULL DEFAULT '0.00',
  total DECIMAL(12,2) NOT NULL DEFAULT '0.00',
  items LONGTEXT DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_reservation TINYINT(1) NOT NULL DEFAULT 0,
  deposit_paid DECIMAL(12,2) NOT NULL DEFAULT '0.00',
  rewards_awarded TINYINT(1) NOT NULL DEFAULT 0,
  discount DECIMAL(12,2) NOT NULL DEFAULT '0.00',
  coupon_code VARCHAR(100),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Lista de espera de drops
-- ============================================================
CREATE TABLE IF NOT EXISTS drop_waitlist (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_slug VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(50) NOT NULL DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_product (product_slug),
  UNIQUE INDEX idx_product_email (product_slug, email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Avisos de reposición
-- ============================================================
CREATE TABLE IF NOT EXISTS restock_requests (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_slug VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(50) NOT NULL DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_product (product_slug),
  UNIQUE INDEX idx_product_email (product_slug, email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Wishlist / Favoritos
-- ============================================================
CREATE TABLE IF NOT EXISTS wishlists (
  user_id VARCHAR(36) NOT NULL,
  product_slug VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, product_slug),
  INDEX idx_user_id (user_id),
  INDEX idx_product_slug (product_slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Gamificación: perfil del jugador
-- ============================================================
CREATE TABLE IF NOT EXISTS player_profiles (
  user_id VARCHAR(36) PRIMARY KEY,
  coins INT NOT NULL DEFAULT 0,
  total_paid DECIMAL(12,2) NOT NULL DEFAULT '0.00',
  order_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS player_badges (
  user_id VARCHAR(36) NOT NULL,
  badge_id VARCHAR(100) NOT NULL,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, badge_id),
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Cupones de descuento + canje de monedas
-- ============================================================
CREATE TABLE IF NOT EXISTS coupons (
  code VARCHAR(100) PRIMARY KEY,
  kind VARCHAR(20) NOT NULL DEFAULT 'fixed',
  value DECIMAL(12,2) NOT NULL,
  min_subtotal DECIMAL(12,2) NOT NULL DEFAULT '0.00',
  max_uses INT NOT NULL DEFAULT 1,
  times_used INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMP NULL,
  user_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS coin_redemptions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  coins INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  coupon_code VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  INDEX idx_user (user_id),
  INDEX idx_coupon (coupon_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Carrito de compras
-- ============================================================
CREATE TABLE IF NOT EXISTS cart_items (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  product_slug VARCHAR(255) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_cart (user_id, product_slug),
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Direcciones guardadas
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_addresses (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  label VARCHAR(100) NOT NULL DEFAULT 'Mi dirección',
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  address VARCHAR(500) NOT NULL,
  city VARCHAR(100) NOT NULL,
  province VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Log de actividad del admin
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  action VARCHAR(255) NOT NULL,
  detail LONGTEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Notificaciones in-app
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message LONGTEXT DEFAULT NULL,
  link VARCHAR(500),
  `read` TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_read (user_id, `read`),
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Páginas editables desde el admin
-- ============================================================
CREATE TABLE IF NOT EXISTS editable_pages (
  slug VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255) NOT NULL DEFAULT '',
  content LONGTEXT DEFAULT '[]',
  published TINYINT(1) NOT NULL DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
