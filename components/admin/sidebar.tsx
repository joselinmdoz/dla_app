"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingCart,
  Folder,
  Users,
  UserCog,
  Settings,
  Menu,
  X,
  Truck,
  LogOut,
  FileSpreadsheet,
  Database,
  Image,
  Building2,
  CreditCard,
  FileText,
  QrCode,
  UserPlus,
} from "lucide-react"
import {
  AdminPermission,
  ADMIN_PERMISSIONS,
  hasAnyPermission,
} from "@/lib/admin-permissions"

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    permissions: [ADMIN_PERMISSIONS.DASHBOARD_VIEW],
  },
  {
    label: "Slides Carrusel",
    href: "/admin/hero-slides",
    icon: Image,
    permissions: [ADMIN_PERMISSIONS.HERO_SLIDES_MANAGE],
  },
  {
    label: "Tarjetas Info",
    href: "/admin/feature-cards",
    icon: CreditCard,
    permissions: [ADMIN_PERMISSIONS.FEATURE_CARDS_MANAGE],
  },
  {
    label: "Oficinas",
    href: "/admin/office-images",
    icon: Building2,
    permissions: [ADMIN_PERMISSIONS.OFFICE_IMAGES_MANAGE],
  },
  {
    label: "Contenido Landing",
    href: "/admin/content",
    icon: FileText,
    permissions: [ADMIN_PERMISSIONS.LANDING_CONTENT_MANAGE],
  },
  {
    label: "Envíos",
    href: "/admin/shipments",
    icon: Truck,
    permissions: [ADMIN_PERMISSIONS.SHIPMENTS_MANAGE],
  },
  {
    label: "Gestión Datos",
    href: "/admin/data",
    icon: Database,
    permissions: [ADMIN_PERMISSIONS.DATA_MANAGE],
  },
  {
    label: "Importar/Exportar",
    href: "/admin/import",
    icon: FileSpreadsheet,
    permissions: [ADMIN_PERMISSIONS.IMPORT_EXPORT_MANAGE],
  },
  {
    label: "Productos",
    href: "/admin/products",
    icon: ShoppingCart,
    permissions: [ADMIN_PERMISSIONS.PRODUCTS_MANAGE],
  },
  {
    label: "Categorías",
    href: "/admin/categories",
    icon: Folder,
    permissions: [ADMIN_PERMISSIONS.CATEGORIES_MANAGE],
  },
  {
    label: "Clientes",
    href: "/admin/clients",
    icon: Users,
    permissions: [ADMIN_PERMISSIONS.CLIENTS_MANAGE],
  },
  {
    label: "Referidos",
    href: "/admin/referrals",
    icon: UserPlus,
    permissions: [ADMIN_PERMISSIONS.CLIENTS_MANAGE],
  },
  {
    label: "Usuarios",
    href: "/admin/users",
    icon: UserCog,
    permissions: [ADMIN_PERMISSIONS.USERS_MANAGE],
  },
  {
    label: "Promociones QR",
    href: "/admin/promotions",
    icon: QrCode,
    permissions: [
      ADMIN_PERMISSIONS.PROMOTIONS_ISSUE,
      ADMIN_PERMISSIONS.PROMOTIONS_REDEEM,
      ADMIN_PERMISSIONS.PROMOTIONS_AUDIT,
      ADMIN_PERMISSIONS.PROMOTIONS_MANAGE,
    ],
  },
  {
    label: "Configuración",
    href: "/admin/settings",
    icon: Settings,
    permissions: [ADMIN_PERMISSIONS.SETTINGS_MANAGE],
  },
]

export function AdminSidebar({
  user,
}: {
  user: {
    name: string | null
    email: string
    role: string
    permissions: AdminPermission[]
  }
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const pathname = usePathname()
  const visibleNavItems = navItems.filter((item) =>
    hasAnyPermission(user.role, user.permissions, item.permissions)
  )
  const initials = (user.name || user.email || "A").trim().charAt(0).toUpperCase()

  async function handleLogout() {
    if (isLoggingOut) return

    try {
      setIsLoggingOut(true)
      await fetch("/api/auth/logout", { method: "POST" })
    } finally {
      window.location.href = "/login"
    }
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary text-primary-foreground rounded-md"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar backdrop for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:fixed inset-y-0 left-0 z-40
          w-64 bg-card border-r border-border
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <Link href="/admin" className="flex items-center gap-3">
              <img
                src="/graphics/logo.svg"
                alt="DLA"
                className="w-10 h-10"
              />
              <div>
                <h1 className="text-primary font-bold text-lg">DLA</h1>
                <p className="text-muted-foreground text-xs">Panel Admin</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {visibleNavItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-colors duration-200
                    ${isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
            {visibleNavItems.length === 0 && (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                Sin módulos asignados para esta cuenta.
              </div>
            )}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-accent/50">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name || "Usuario"}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
