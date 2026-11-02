"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ExternalLink, RefreshCw, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

type ServicePage = {
  slug: string
  published: boolean
  title: string
  seoTitle: string
  seoDescription: string
  intro: string
  lastUpdated: string
  sections: unknown
}

type ContentCard = { name: string; price: string; description: string }
type EditableSections = {
  shipping?: { rows?: ContentCard[] }
  pricing?: { rows?: ContentCard[] }
  delivery?: { rows?: ContentCard[] }
  [key: string]: unknown
}

const sectionExample = `{
  "shipping": { "enabled": true, "title": "Opciones de envío", "description": "", "rows": [{ "name": "Envío marítimo", "price": "$0.00 por lb", "description": "..." }] },
  "pricing": { "enabled": true, "title": "Tarifas", "description": "", "rows": [{ "name": "Aéreo", "price": "$0.00 por lb", "description": "Mínimo ..." }] },
  "delivery": { "enabled": true, "title": "Tiempos", "description": "Estimaciones sujetas a terceros.", "rows": [] },
  "details": { "enabled": true, "title": "Información", "items": ["Recogida a domicilio..."] },
  "coverage": { "enabled": true, "title": "Cobertura", "description": "", "items": ["La Habana"] },
  "faq": { "enabled": true, "title": "Preguntas frecuentes", "items": [{ "question": "¿...?", "answer": "..." }] },
  "cta": { "enabled": true, "title": "¿Necesitas ayuda?", "description": "", "buttonText": "WhatsApp", "buttonUrl": "https://wa.me/..." }
}`

export default function ServicePagesAdminPage() {
  const { toast } = useToast()
  const [pages, setPages] = useState<ServicePage[]>([])
  const [selectedSlug, setSelectedSlug] = useState("")
  const [sectionsJson, setSectionsJson] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const selected = useMemo(
    () => pages.find((page) => page.slug === selectedSlug) ?? pages[0],
    [pages, selectedSlug]
  )
  const parsedSections = useMemo<EditableSections | null>(() => {
    try {
      const parsed = JSON.parse(sectionsJson)
      return parsed && typeof parsed === "object" ? parsed as EditableSections : null
    } catch {
      return null
    }
  }, [sectionsJson])

  const loadPages = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/service-pages", { cache: "no-store" })
      if (!response.ok) throw new Error("No se pudieron cargar las páginas")
      const data = await response.json() as ServicePage[]
      setPages(data)
      setSelectedSlug((current) => current || data[0]?.slug || "")
    } catch (error) {
      toast({ title: "Error al cargar", description: error instanceof Error ? error.message : "Error desconocido", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => { loadPages() }, [loadPages])
  useEffect(() => { if (selected) setSectionsJson(JSON.stringify(selected.sections, null, 2)) }, [selected])

  function updateSelected(field: keyof Omit<ServicePage, "slug" | "sections">, value: string | boolean) {
    if (!selected) return
    setPages((current) => current.map((page) => page.slug === selected.slug ? { ...page, [field]: value } : page))
  }

  function updateCards(section: "shipping" | "pricing" | "delivery", cards: ContentCard[]) {
    if (!parsedSections) return
    setSectionsJson(JSON.stringify({
      ...parsedSections,
      [section]: { ...(parsedSections[section] as object ?? {}), rows: cards },
    }, null, 2))
  }

  async function save() {
    if (!selected) return
    let sections: unknown
    try {
      sections = JSON.parse(sectionsJson)
    } catch {
      toast({ title: "JSON inválido", description: "Corrige la estructura de secciones antes de guardar.", variant: "destructive" })
      return
    }
    const nextPages = pages.map((page) => page.slug === selected.slug ? { ...page, sections } : page)
    try {
      setIsSaving(true)
      const response = await fetch("/api/service-pages", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(nextPages) })
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.error || "No se pudo guardar")
      const saved = await response.json() as ServicePage[]
      setPages(saved)
      toast({ title: "Página guardada", description: "El contenido público y los metadatos se actualizaron." })
    } catch (error) {
      toast({ title: "Error al guardar", description: error instanceof Error ? error.message : "Error desconocido", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <p className="py-12 text-muted-foreground">Cargando páginas de servicios…</p>
  if (!selected) return <p className="py-12 text-muted-foreground">No hay páginas configuradas.</p>

  return <div className="mx-auto max-w-5xl space-y-6 pb-12">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-3xl font-bold">Páginas de servicios</h1><p className="mt-1 text-muted-foreground">Edita el contenido rastreable de precios, tiempos y envíos desde Orlando.</p></div>
      <div className="flex gap-2"><Button variant="outline" onClick={loadPages}><RefreshCw className="mr-2 h-4 w-4" />Recargar</Button><Button onClick={save} disabled={isSaving}><Save className="mr-2 h-4 w-4" />{isSaving ? "Guardando…" : "Guardar"}</Button></div>
    </div>
    <Card><CardHeader><CardTitle>Página a editar</CardTitle></CardHeader><CardContent><div className="flex flex-wrap gap-2">{pages.map((page) => <Button key={page.slug} variant={page.slug === selected.slug ? "default" : "outline"} onClick={() => setSelectedSlug(page.slug)}>{page.title}</Button>)}</div></CardContent></Card>
    <Card><CardHeader><CardTitle>Publicación y SEO</CardTitle><CardDescription>El título y la descripción se renderizan desde el servidor para buscadores.</CardDescription></CardHeader><CardContent className="grid gap-5">
      <div className="flex items-center justify-between rounded-md border p-4"><div><Label>Publicar página</Label><p className="text-sm text-muted-foreground">Una página no publicada responde 404.</p></div><Switch checked={selected.published} onCheckedChange={(value) => updateSelected("published", value)} /></div>
      <Field label="Título visible" value={selected.title} onChange={(value) => updateSelected("title", value)} />
      <Field label="Título SEO" value={selected.seoTitle} onChange={(value) => updateSelected("seoTitle", value)} />
      <div><Label>Descripción SEO</Label><Textarea value={selected.seoDescription} onChange={(event) => updateSelected("seoDescription", event.target.value)} /></div>
      <div><Label>Introducción</Label><Textarea value={selected.intro} onChange={(event) => updateSelected("intro", event.target.value)} /></div>
      <Field label="Fecha de última actualización" value={selected.lastUpdated} placeholder="Ej.: 20 de octubre de 2026" onChange={(value) => updateSelected("lastUpdated", value)} />
      <a href={`/${selected.slug}`} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center text-sm font-medium text-primary hover:underline"><ExternalLink className="mr-2 h-4 w-4" />Ver página pública</a>
    </CardContent></Card>
    <Card><CardHeader><CardTitle>Secciones de la página</CardTitle><CardDescription>Administra todas las secciones aquí. Precios y tiempos usan `rows`; FAQ usa objetos con `question` y `answer`. No inventes tarifas ni plazos: publica solo información comercial aprobada.</CardDescription></CardHeader><CardContent className="space-y-4"><Textarea className="min-h-[620px] font-mono text-xs" value={sectionsJson} onChange={(event) => setSectionsJson(event.target.value)} /><details><summary className="cursor-pointer text-sm font-medium">Ver estructura de ejemplo</summary><pre className="mt-3 overflow-auto rounded-md bg-muted p-4 text-xs">{sectionExample}</pre></details></CardContent></Card>
    {parsedSections ? <CardsEditor title="Tarjetas de envío" valueLabel="Precio" cards={parsedSections.shipping?.rows ?? []} onChange={(cards) => updateCards("shipping", cards)} /> : null}
    {parsedSections ? <CardsEditor title="Tarjetas de precios" valueLabel="Precio" cards={parsedSections.pricing?.rows ?? []} onChange={(cards) => updateCards("pricing", cards)} /> : null}
    {parsedSections ? <CardsEditor title="Tarjetas de tiempos de entrega" valueLabel="Plazo estimado" cards={parsedSections.delivery?.rows ?? []} onChange={(cards) => updateCards("delivery", cards)} /> : null}
  </div>
}

function Field({ label, value, placeholder, onChange }: { label: string; value: string; placeholder?: string; onChange: (value: string) => void }) {
  return <div><Label>{label}</Label><Input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></div>
}

function CardsEditor({ title, valueLabel, cards, onChange }: { title: string; valueLabel: string; cards: ContentCard[]; onChange: (cards: ContentCard[]) => void }) {
  function update(index: number, field: keyof ContentCard, value: string) {
    onChange(cards.map((card, current) => current === index ? { ...card, [field]: value } : card))
  }
  return <Card><CardHeader><CardTitle>{title}</CardTitle><CardDescription>Cada elemento se muestra como una tarjeta pública con nombre, {valueLabel.toLowerCase()} y descripción.</CardDescription></CardHeader><CardContent className="space-y-4">
    {cards.map((card, index) => <div key={index} className="grid gap-3 rounded-lg border p-4 md:grid-cols-[1fr_1fr_auto]">
      <div><Label>Nombre</Label><Input value={card.name} onChange={(event) => update(index, "name", event.target.value)} /></div>
      <div><Label>{valueLabel}</Label><Input value={card.price} onChange={(event) => update(index, "price", event.target.value)} /></div>
      <Button variant="destructive" className="self-end" onClick={() => onChange(cards.filter((_, current) => current !== index))}>Eliminar</Button>
      <div className="md:col-span-3"><Label>Descripción / condiciones</Label><Textarea value={card.description} onChange={(event) => update(index, "description", event.target.value)} /></div>
    </div>)}
    <Button type="button" variant="outline" onClick={() => onChange([...cards, { name: "", price: "", description: "" }])}>Añadir tarjeta</Button>
  </CardContent></Card>
}
