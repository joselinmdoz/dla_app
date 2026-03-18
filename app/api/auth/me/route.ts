import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import {
  canAccessAdminPanel,
  getFirstAccessibleAdminPath,
} from "@/lib/admin-permissions"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        permissions: user.permissions,
        canAccessAdmin: canAccessAdminPanel(user.role, user.permissions),
        adminEntryPath: getFirstAccessibleAdminPath(user.role, user.permissions),
      },
    })
  } catch (error) {
    console.error("Me error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
