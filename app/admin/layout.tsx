import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import { AdminPermissionGuard } from "@/components/admin/permission-guard"
import { getCurrentUser } from "@/lib/auth"
import { canAccessAdminPanel } from "@/lib/admin-permissions"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (!canAccessAdminPanel(user.role, user.permissions)) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar
        user={{
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
        }}
      />
      <div className="lg:pl-64">
        <AdminHeader
          user={{
            name: user.name,
            email: user.email,
            role: user.role,
          }}
        />
        <main className="pt-4 px-6 pb-6">
          <AdminPermissionGuard
            user={{
              role: user.role,
              permissions: user.permissions,
            }}
          >
            {children}
          </AdminPermissionGuard>
        </main>
      </div>
    </div>
  )
}
