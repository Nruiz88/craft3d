import type { NavItem } from "./admin-icons";
import { icons } from "./admin-icons";

export const navSections: { label: string; items: NavItem[] }[] = [
  {
    label: "Inicio",
    items: [{ href: "/admin", label: "Dashboard", icon: icons.dashboard, exact: true }],
  },
  {
    label: "Catálogo",
    items: [
      { href: "/admin/productos", label: "Productos", icon: icons.products, exact: false },
      { href: "/admin/nuevo", label: "Nuevo producto", icon: icons.plus, exact: true },
      { href: "/admin/restock", label: "Reposición", icon: icons.restock, exact: false, badgeKey: "restock" },
    ],
  },
  {
    label: "Drops",
    items: [
      { href: "/admin/drops", label: "Ver drops", icon: icons.drops, exact: false },
      { href: "/admin/drops/nuevo", label: "Nuevo drop", icon: icons.plus, exact: true },
      { href: "/admin/waitlist", label: "Lista de espera", icon: icons.waitlist, exact: false, badgeKey: "waitlist" },
    ],
  },
  {
    label: "Mystery box",
    items: [
      { href: "/admin/mysterybox", label: "Ver cajas", icon: icons.mystery, exact: false },
      { href: "/admin/mysterybox/nuevo", label: "Nueva caja", icon: icons.plus, exact: true },
      { href: "/admin/mysterybox/revelaciones", label: "Revelaciones", icon: icons.reveal, exact: false },
    ],
  },
  {
    label: "Gestión",
    items: [
      { href: "/admin/ventas", label: "Ventas", icon: icons.sales, exact: false, badgeKey: "ventas" },
      { href: "/admin/clientes", label: "Clientes", icon: icons.clients, exact: false },
      { href: "/admin/cupones", label: "Cupones", icon: icons.sales, exact: false },
      { href: "/admin/actividad", label: "Actividad", icon: icons.dashboard, exact: false },
      { href: "/admin/paginas", label: "Páginas", icon: icons.dashboard, exact: false },
      { href: "/admin/configuracion", label: "Configuración", icon: icons.settings, exact: true },
    ],
  },
];

