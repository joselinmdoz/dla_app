"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  canAccessAdminPath,
  getFirstAccessibleAdminPath,
  type AdminPermission,
} from "@/lib/admin-permissions"

type AdminGuardUser = {
  role: string
  permissions: AdminPermission[]
}

export function AdminPermissionGuard({
  user,
  children,
}: {
  user: AdminGuardUser
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const hasAccess = canAccessAdminPath(pathname, user.role, user.permissions)
  const fallbackPath = getFirstAccessibleAdminPath(user.role, user.permissions)

  useEffect(() => {
    if (!hasAccess) {
      if (fallbackPath && fallbackPath !== pathname) {
        router.replace(fallbackPath)
        return
      }
      router.replace("/")
    }
  }, [hasAccess, fallbackPath, pathname, router])

  if (!hasAccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full bg-card border border-border rounded-xl p-6 text-center space-y-3">
          <h2 className="text-xl font-semibold">Sin permisos para esta vista</h2>
          <p className="text-sm text-muted-foreground">
            Tu cuenta no tiene acceso a esta sección del panel.
          </p>
          <div className="pt-2">
            <Link
              href={fallbackPath || "/"}
              className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Ir a una vista permitida
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
