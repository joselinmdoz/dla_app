export const ADMIN_PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard.view",
  HERO_SLIDES_MANAGE: "heroSlides.manage",
  FEATURE_CARDS_MANAGE: "featureCards.manage",
  OFFICE_IMAGES_MANAGE: "officeImages.manage",
  LANDING_CONTENT_MANAGE: "landingContent.manage",
  SHIPMENTS_MANAGE: "shipments.manage",
  DATA_MANAGE: "data.manage",
  IMPORT_EXPORT_MANAGE: "importExport.manage",
  PRODUCTS_MANAGE: "products.manage",
  CATEGORIES_MANAGE: "categories.manage",
  CLIENTS_MANAGE: "clients.manage",
  USERS_MANAGE: "users.manage",
  SETTINGS_MANAGE: "settings.manage",
  PROMOTIONS_ISSUE: "promotions.issue",
  PROMOTIONS_REDEEM: "promotions.redeem",
  PROMOTIONS_AUDIT: "promotions.audit",
  PROMOTIONS_MANAGE: "promotions.manage",
} as const

export type AdminPermission =
  (typeof ADMIN_PERMISSIONS)[keyof typeof ADMIN_PERMISSIONS]

type AdminPermissionDefinition = {
  key: AdminPermission
  label: string
  description: string
  href: string
}

export const ADMIN_PERMISSION_DEFINITIONS: AdminPermissionDefinition[] = [
  {
    key: ADMIN_PERMISSIONS.DASHBOARD_VIEW,
    label: "Dashboard",
    description: "Acceso al panel principal",
    href: "/admin",
  },
  {
    key: ADMIN_PERMISSIONS.HERO_SLIDES_MANAGE,
    label: "Slides Carrusel",
    description: "Gestionar slides del hero",
    href: "/admin/hero-slides",
  },
  {
    key: ADMIN_PERMISSIONS.FEATURE_CARDS_MANAGE,
    label: "Tarjetas Info",
    description: "Gestionar feature cards",
    href: "/admin/feature-cards",
  },
  {
    key: ADMIN_PERMISSIONS.OFFICE_IMAGES_MANAGE,
    label: "Oficinas",
    description: "Gestionar imágenes de oficinas",
    href: "/admin/office-images",
  },
  {
    key: ADMIN_PERMISSIONS.LANDING_CONTENT_MANAGE,
    label: "Contenido Landing",
    description: "Editar textos/sections del landing",
    href: "/admin/content",
  },
  {
    key: ADMIN_PERMISSIONS.SHIPMENTS_MANAGE,
    label: "Envíos",
    description: "Gestionar envíos y su estado",
    href: "/admin/shipments",
  },
  {
    key: ADMIN_PERMISSIONS.DATA_MANAGE,
    label: "Gestión Datos",
    description: "Gestión general de entidades",
    href: "/admin/data",
  },
  {
    key: ADMIN_PERMISSIONS.IMPORT_EXPORT_MANAGE,
    label: "Importar/Exportar",
    description: "Importación y exportación de datos",
    href: "/admin/import",
  },
  {
    key: ADMIN_PERMISSIONS.PRODUCTS_MANAGE,
    label: "Productos",
    description: "Gestionar catálogo de productos",
    href: "/admin/products",
  },
  {
    key: ADMIN_PERMISSIONS.CATEGORIES_MANAGE,
    label: "Categorías",
    description: "Gestionar categorías",
    href: "/admin/categories",
  },
  {
    key: ADMIN_PERMISSIONS.CLIENTS_MANAGE,
    label: "Clientes",
    description: "Gestionar clientes",
    href: "/admin/clients",
  },
  {
    key: ADMIN_PERMISSIONS.USERS_MANAGE,
    label: "Usuarios",
    description: "Gestionar usuarios y permisos",
    href: "/admin/users",
  },
  {
    key: ADMIN_PERMISSIONS.SETTINGS_MANAGE,
    label: "Configuración",
    description: "Configuraciones globales del sitio",
    href: "/admin/settings",
  },
  {
    key: ADMIN_PERMISSIONS.PROMOTIONS_ISSUE,
    label: "Promociones QR: Emitir",
    description: "Generar y compartir códigos QR de promoción",
    href: "/admin/promotions",
  },
  {
    key: ADMIN_PERMISSIONS.PROMOTIONS_REDEEM,
    label: "Promociones QR: Canjear",
    description: "Validar/canjear códigos QR o manuales",
    href: "/admin/promotions",
  },
  {
    key: ADMIN_PERMISSIONS.PROMOTIONS_AUDIT,
    label: "Promociones QR: Historial",
    description: "Ver auditoría y estado de códigos promocionales",
    href: "/admin/promotions",
  },
  {
    key: ADMIN_PERMISSIONS.PROMOTIONS_MANAGE,
    label: "Promociones QR: Administrar",
    description: "Cancelar códigos y administrar campañas/códigos",
    href: "/admin/promotions",
  },
]

type AdminRoutePermissionRequirement = {
  href: string
  permissions: AdminPermission[]
}

const ADMIN_ROUTE_REQUIREMENTS: AdminRoutePermissionRequirement[] = [
  { href: "/admin", permissions: [ADMIN_PERMISSIONS.DASHBOARD_VIEW] },
  {
    href: "/admin/hero-slides",
    permissions: [ADMIN_PERMISSIONS.HERO_SLIDES_MANAGE],
  },
  {
    href: "/admin/feature-cards",
    permissions: [ADMIN_PERMISSIONS.FEATURE_CARDS_MANAGE],
  },
  {
    href: "/admin/office-images",
    permissions: [ADMIN_PERMISSIONS.OFFICE_IMAGES_MANAGE],
  },
  {
    href: "/admin/content",
    permissions: [ADMIN_PERMISSIONS.LANDING_CONTENT_MANAGE],
  },
  {
    href: "/admin/shipments",
    permissions: [ADMIN_PERMISSIONS.SHIPMENTS_MANAGE],
  },
  { href: "/admin/data", permissions: [ADMIN_PERMISSIONS.DATA_MANAGE] },
  {
    href: "/admin/import",
    permissions: [ADMIN_PERMISSIONS.IMPORT_EXPORT_MANAGE],
  },
  {
    href: "/admin/products",
    permissions: [ADMIN_PERMISSIONS.PRODUCTS_MANAGE],
  },
  {
    href: "/admin/categories",
    permissions: [ADMIN_PERMISSIONS.CATEGORIES_MANAGE],
  },
  { href: "/admin/clients", permissions: [ADMIN_PERMISSIONS.CLIENTS_MANAGE] },
  { href: "/admin/users", permissions: [ADMIN_PERMISSIONS.USERS_MANAGE] },
  { href: "/admin/settings", permissions: [ADMIN_PERMISSIONS.SETTINGS_MANAGE] },
  {
    href: "/admin/promotions",
    permissions: [
      ADMIN_PERMISSIONS.PROMOTIONS_ISSUE,
      ADMIN_PERMISSIONS.PROMOTIONS_REDEEM,
      ADMIN_PERMISSIONS.PROMOTIONS_AUDIT,
      ADMIN_PERMISSIONS.PROMOTIONS_MANAGE,
    ],
  },
]

export const ALL_ADMIN_PERMISSIONS = ADMIN_PERMISSION_DEFINITIONS.map(
  (item) => item.key
)

export function normalizePermissions(value: unknown): AdminPermission[] {
  if (!Array.isArray(value)) return []
  const allowed = new Set(ALL_ADMIN_PERMISSIONS)
  return value.filter(
    (item): item is AdminPermission =>
      typeof item === "string" && allowed.has(item as AdminPermission)
  )
}

export function getEffectivePermissions(
  role: string,
  rawPermissions: unknown
): AdminPermission[] {
  if (role === "ADMIN") return ALL_ADMIN_PERMISSIONS
  return normalizePermissions(rawPermissions)
}

export function hasPermission(
  role: string,
  rawPermissions: unknown,
  permission: AdminPermission
): boolean {
  const permissions = getEffectivePermissions(role, rawPermissions)
  return permissions.includes(permission)
}

export function hasAnyPermission(
  role: string,
  rawPermissions: unknown,
  requiredPermissions: AdminPermission[]
): boolean {
  if (requiredPermissions.length === 0) return true
  const permissions = getEffectivePermissions(role, rawPermissions)
  return requiredPermissions.some((permission) =>
    permissions.includes(permission)
  )
}

export function canAccessAdminPanel(
  role: string,
  rawPermissions: unknown
): boolean {
  return getEffectivePermissions(role, rawPermissions).length > 0
}

export function getRequiredPermissionsForAdminPath(
  pathname: string
): AdminPermission[] | null {
  if (!pathname.startsWith("/admin")) return null

  if (pathname === "/admin" || pathname === "/admin/") {
    return [ADMIN_PERMISSIONS.DASHBOARD_VIEW]
  }

  const candidates = ADMIN_ROUTE_REQUIREMENTS.filter((definition) =>
    pathname === definition.href || pathname.startsWith(`${definition.href}/`)
  )

  if (candidates.length === 0) return null

  candidates.sort((a, b) => b.href.length - a.href.length)
  return candidates[0].permissions
}

export function canAccessAdminPath(
  pathname: string,
  role: string,
  rawPermissions: unknown
): boolean {
  const requiredPermissions = getRequiredPermissionsForAdminPath(pathname)
  if (!requiredPermissions) return false
  return hasAnyPermission(role, rawPermissions, requiredPermissions)
}

export function getFirstAccessibleAdminPath(
  role: string,
  rawPermissions: unknown
): string {
  if (hasPermission(role, rawPermissions, ADMIN_PERMISSIONS.DASHBOARD_VIEW)) {
    return "/admin"
  }

  const firstMatch = ADMIN_ROUTE_REQUIREMENTS.find((definition) =>
    hasAnyPermission(role, rawPermissions, definition.permissions)
  )

  return firstMatch?.href || "/"
}
