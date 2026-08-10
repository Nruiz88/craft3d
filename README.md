<div align="center">

# 🧊 Craft3d

### Arte en filamento, impreso en 3D

Cuadros Hueforge, figuras articuladas, dummys y objetos únicos impresos en 3D, hechos a mano capa a capa.

![Next.js](https://img.shields.io/badge/Next.js%2016-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS%204-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=black)

![Status](https://img.shields.io/badge/status-en%20desarrollo-FBBF24?style=flat-square)
![Licencia](https://img.shields.io/badge/licencia-propietaria-e879f9?style=flat-square)

</div>

---

## 🕹️ De qué se trata

**Craft3d** es una tienda online de impresión 3D artesanal con estética **arcade / CRT**: píxeles, neón, scanlines y rejillas que homenajean a los viejos gabinetes de arcade.

La tienda incluye catálogo, carrito de compras, registro y login de clientes, perfil personalizado y un panel de administración completo para gestionar productos, ventas y clientes.

---

## ✨ Características

| Área | Descripción |
| --- | --- |
| 🏠 **Storefront** | Home arcade con hero CRT, drops con countdown, marquee y catálogo por categorías |
| 📦 **Productos** | Detalle con tabs, stock en vivo, badge de categoría, compartición en redes y cantidad |
| 🛒 **Carrito** | Contexto + cookie persistente, ajuste de cantidades, resumen y checkout |
| 🔐 **Auth** | Registro y login con **email/Google** (Supabase SSR), protección de rutas vía middleware (`proxy.ts`) |
| 👤 **Mi cuenta** | Perfil con datos de contacto y dirección de envío |
| 🛠️ **Admin** | Login protegido, CRUD de productos con preview en vivo, subida de fotos comprimidas, destacados, gestión de pedidos (estados) y lista de clientes |
| 🔒 **Seguridad** | RLS en Supabase, pedidos transaccionales con validación de stock y precios del servidor |

---

## 🧱 Stack

- [**Next.js 16**](https://nextjs.org) (App Router + Turbopack)
- [**React 19**](https://react.dev)
- [**TypeScript**](https://www.typescriptlang.org)
- [**Tailwind CSS 4**](https://tailwindcss.com)
- [**Supabase**](https://supabase.com) — Auth + Postgres + RLS
- [**Press Start 2P**](https://fonts.google.com/specimen/Press+Start+2P) — tipografía arcade

---

## 🚀 Puesta en marcha

### Requisitos

- Node.js 20+
- Una cuenta de [Supabase](https://supabase.com)

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Nruiz88/craft3d.git
cd craft3d

# Instalar dependencias
npm install

# Levantar el entorno de desarrollo
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) 🎮

### ⚙️ Variables de entorno

Copiá `.env.example` → `.env.local` y completá los valores de tu proyecto de Supabase:

| Variable | Descripción |
| --- | --- |
| `SUPABASE_URL` | URL del proyecto (server) |
| `SUPABASE_PUBLISHABLE_KEY` | Clave publishable / anon (server) |
| `SUPABASE_SECRET_KEY` | Clave `service_role` (solo server, **nunca** exponer) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto (pública) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anon pública |
| `ADMIN_PASSWORD` | Contraseña de acceso al panel `/admin` |
| `GOOGLE_CLIENT_ID` | OAuth de Google (opcional) |
| `GOOGLE_CLIENT_SECRET` | OAuth de Google (opcional) |

### 🗄️ Base de datos

Ejecutá el contenido de [`supabase/schema.sql`](supabase/schema.sql) en **Supabase → SQL Editor**. El script crea:

- `products` — catálogo con categorías, stock, destacados y tags (**incluye seed de ejemplo**)
- `profiles` — datos de contacto del cliente (con trigger al registrarse)
- `orders` — pedidos con snapshot de ítems
- `place_order()` — función transaccional `security definer` que valida stock, recalcula precios desde la BD y descuenta inventario
- **RLS** — cada cliente ve solo su propio perfil y sus pedidos; el catálogo es público

---

## 🎛️ Panel de administración

| Ruta | Función |
| --- | --- |
| `/admin` | Resumen y listado de productos |
| `/admin/nuevo` | Crear producto |
| `/admin/productos/[id]/editar` | Editar producto |
| `/admin/ventas` | Pedidos y estados |
| `/admin/clientes` | Clientes registrados |
| `/admin/configuracion` | Claves de Mercado Pago y datos de transferencia |

> El cliente elige **transferencia bancaria** (ve los datos para transferir) o **Mercado Pago** (pago en línea). Los pagos de Mercado Pago se confirman automáticamente vía webhook.

---

## 📁 Estructura del proyecto

```
craft3d/
├── app/                  # Rutas (App Router)
│   ├── page.tsx          # Home
│   ├── productos/        # Detalle de producto
│   ├── carrito/          # Carrito + checkout
│   ├── registrarse/      # Registro
│   ├── ingresar/         # Login
│   ├── cuenta/           # Mi cuenta
│   ├── admin/            # Panel de administración
│   └── styles/           # CSS temático arcade/CRT
├── components/           # UI reutilizable
│   ├── admin/            # Componentes del panel
│   └── auth/             # Formularios de auth
├── lib/                  # Lógica, clientes Supabase, tipos
├── supabase/
│   └── schema.sql        # Esquema + RLS + seed
└── proxy.ts              # Middleware (protección de rutas)
```

---

## 📜 Scripts

| Comando | Acción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servir el build |
| `npm run lint` | ESLint |

---

## 💬 Contacto

- 📸 [Instagram @craft3d_nqn](https://instagram.com/craft3d_nqn)
- 💬 [WhatsApp](https://wa.me/5492994382147)
- ✉️ hola@craft3d.com

---

<div align="center">

<sub>Hecho con 💛, filamento y muchas capas.</sub>

</div>
