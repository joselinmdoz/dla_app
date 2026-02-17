"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
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
  CreditCard,
} from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Slides Carrusel", href: "/admin/hero-slides", icon: Image },
  { label: "Tarjetas Info", href: "/admin/feature-cards", icon: CreditCard },
  { label: "Envíos", href: "/admin/shipments", icon: Truck },
  { label: "Gestión Datos", href: "/admin/data", icon: Database },
  { label: "Importar/Exportar", href: "/admin/import", icon: FileSpreadsheet },
  { label: "Productos", href: "/admin/products", icon: ShoppingCart },
  { label: "Categorías", href: "/admin/categories", icon: Folder },
  { label: "Clientes", href: "/admin/clients", icon: Users },
  { label: "Usuarios", href: "/admin/users", icon: UserCog },
  { label: "Configuración", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

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
            {navItems.map((item) => {
              const isActive = pathname === item.href
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
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-accent/50">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Admin</p>
                <p className="text-xs text-muted-foreground truncate">admin@dla.com</p>
              </div>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
