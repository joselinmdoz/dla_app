const PUBLIC_ASSET_API_PREFIX = "/api/public-assets"

function isExternalOrSpecialUrl(value: string) {
  return (
    /^(https?:)?\/\//i.test(value) ||
    /^(data:|blob:|mailto:|tel:|#)/i.test(value) ||
    value.startsWith(PUBLIC_ASSET_API_PREFIX)
  )
}

export function resolvePublicAssetUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed || isExternalOrSpecialUrl(trimmed) || !trimmed.startsWith("/")) {
    return trimmed
  }

  const segments = trimmed
    .replace(/^\/+/, "")
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))

  if (segments.length === 0) {
    return trimmed
  }

  return `${PUBLIC_ASSET_API_PREFIX}/${segments.join("/")}`
}
