type PromoClaimPageProps = {
  searchParams: Promise<{
    code?: string | string[]
  }>
}

export default async function PromoClaimPage({
  searchParams,
}: PromoClaimPageProps) {
  const resolvedSearchParams = await searchParams
  const rawCode = resolvedSearchParams.code
  const code = Array.isArray(rawCode)
    ? rawCode[0]?.toUpperCase() || null
    : rawCode?.toUpperCase() || null

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-8 space-y-4 text-center">
        <h1 className="text-3xl font-bold">Código Promocional</h1>
        <p className="text-muted-foreground">
          Muestra este código al personal autorizado para validar tu promoción.
        </p>
        <div className="rounded-xl border border-border bg-muted/40 p-6">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
            Código
          </p>
          <p className="text-3xl font-semibold">{code || "No disponible"}</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Este código puede ser usado una sola vez.
        </p>
      </div>
    </main>
  )
}
