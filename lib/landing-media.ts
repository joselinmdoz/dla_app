export function getSafePixelValue(
  rawValue: string | null | undefined,
  fallback: number,
  min: number,
  max: number
): string {
  const parsed = Number.parseInt((rawValue ?? "").trim(), 10)
  const safeValue = Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback
  return `${safeValue}px`
}
