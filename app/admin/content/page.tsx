"use client"

import { useCallback, useEffect, useState } from "react"
import { Save, RefreshCw, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { defaultLandingContent, HeaderNavButton, LandingContent, parseLandingContent } from "@/lib/landing-content"
import { ImageUploadField } from "@/components/admin/content/image-upload-field"
import { IconSelectField } from "@/components/admin/content/icon-select-field"

type SectionKey = keyof LandingContent
type ImageFieldKey =
  | "business.logoUrl"
  | "business.supportImageUrl"
  | "hero.fallbackImageUrl"
  | "location.mapImageUrl"
  | "seo.ogImageUrl"
  | "seo.twitterImageUrl"
  | "seo.faviconUrl"
  | "seo.shortcutIconUrl"
  | "seo.appleIconUrl"

const imageFieldConfigs: Record<ImageFieldKey, { section: SectionKey; field: string }> = {
  "business.logoUrl": { section: "business", field: "logoUrl" },
  "business.supportImageUrl": { section: "business", field: "supportImageUrl" },
  "hero.fallbackImageUrl": { section: "hero", field: "fallbackImageUrl" },
  "location.mapImageUrl": { section: "location", field: "mapImageUrl" },
  "seo.ogImageUrl": { section: "seo", field: "ogImageUrl" },
  "seo.twitterImageUrl": { section: "seo", field: "twitterImageUrl" },
  "seo.faviconUrl": { section: "seo", field: "faviconUrl" },
  "seo.shortcutIconUrl": { section: "seo", field: "shortcutIconUrl" },
  "seo.appleIconUrl": { section: "seo", field: "appleIconUrl" },
}

const visibilityDefaults = {
  headerSectionEnabled: true,
  heroSectionEnabled: true,
  heroSlidesEnabled: true,
  featureCardsEnabled: true,
  officeGalleryEnabled: true,
  menuSectionEnabled: true,
  locationSectionEnabled: true,
  contactSectionEnabled: true,
  footerSectionEnabled: true,
  stickyCtaEnabled: true,
  productDetailBreadcrumbEnabled: true,
  productDetailImageEnabled: true,
  productDetailRatingEnabled: true,
  productDetailDescriptionEnabled: true,
  productDetailFeaturesEnabled: true,
  productDetailIncludesEnabled: true,
  productDetailBoxContentEnabled: true,
  productDetailDeliveryEnabled: true,
  productDetailTrackingEnabled: true,
} as const

type VisibilityKey = keyof typeof visibilityDefaults
type VisibilitySettings = Record<VisibilityKey, boolean>

function createHeaderNavButton(order: number): HeaderNavButton {
  return {
    id: `header-nav-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text: `Boton ${order}`,
    url: "#menu",
    isVisible: true,
    position: order,
  }
}

const visibilityFields: Array<{
  key: VisibilityKey
  label: string
  description: string
  section: "landing" | "product"
}> = [
  { key: "headerSectionEnabled", label: "Header", description: "Mostrar barra superior", section: "landing" },
  { key: "heroSectionEnabled", label: "Hero", description: "Mostrar sección principal", section: "landing" },
  { key: "heroSlidesEnabled", label: "Slides del hero", description: "Mostrar carrusel de imágenes del hero", section: "landing" },
  { key: "featureCardsEnabled", label: "Tarjetas info", description: "Mostrar tarjetas de servicios/ofertas", section: "landing" },
  { key: "officeGalleryEnabled", label: "Oficinas", description: "Mostrar galería de oficinas", section: "landing" },
  { key: "menuSectionEnabled", label: "Menú", description: "Mostrar sección de productos", section: "landing" },
  { key: "locationSectionEnabled", label: "Ubicación", description: "Mostrar sección de ubicación", section: "landing" },
  { key: "contactSectionEnabled", label: "Contacto", description: "Mostrar sección de contacto", section: "landing" },
  { key: "footerSectionEnabled", label: "Footer", description: "Mostrar pie de página", section: "landing" },
  { key: "stickyCtaEnabled", label: "Sticky CTA", description: "Mostrar barra fija inferior", section: "landing" },
  { key: "productDetailBreadcrumbEnabled", label: "Breadcrumb", description: "Mostrar botón volver a productos", section: "product" },
  { key: "productDetailImageEnabled", label: "Imagen y precio", description: "Mostrar imagen principal y badges", section: "product" },
  { key: "productDetailRatingEnabled", label: "Rating", description: "Mostrar estrellas, rating y reseñas", section: "product" },
  { key: "productDetailDescriptionEnabled", label: "Descripción", description: "Mostrar descripción del producto", section: "product" },
  { key: "productDetailFeaturesEnabled", label: "Características", description: "Mostrar bloque de características", section: "product" },
  { key: "productDetailIncludesEnabled", label: "Incluye", description: "Mostrar bloque de contenido general", section: "product" },
  { key: "productDetailBoxContentEnabled", label: "Contenido de la caja", description: "Mostrar bloque de contenido de caja", section: "product" },
  { key: "productDetailDeliveryEnabled", label: "Entrega y disponibilidad", description: "Mostrar información de entrega/disponibilidad", section: "product" },
  { key: "productDetailTrackingEnabled", label: "Botón tracking", description: "Mostrar CTA para rastrear envío", section: "product" },
]

function parseVisibilitySettings(settings: Record<string, string>): VisibilitySettings {
  return (Object.keys(visibilityDefaults) as VisibilityKey[]).reduce((acc, key) => {
    const raw = settings[key]
    acc[key] = raw === undefined ? visibilityDefaults[key] : raw !== "false"
    return acc
  }, {} as VisibilitySettings)
}

export default function AdminContentPage() {
  const { toast } = useToast()
  const [formData, setFormData] = useState<LandingContent>(defaultLandingContent)
  const [visibility, setVisibility] = useState<VisibilitySettings>(visibilityDefaults)
  const [pendingUploads, setPendingUploads] = useState<Partial<Record<ImageFieldKey, File | null>>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const updateField = useCallback(
    (section: SectionKey, field: string, value: string) => {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...(prev[section] as Record<string, string>),
          [field]: value,
        },
      }))
    },
    []
  )

  const fetchContent = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/site-settings", {
        cache: "no-store",
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        setFormData(defaultLandingContent)
        toast({
          title: "Contenido no disponible",
          description: payload?.error || "Se cargaron valores por defecto del landing",
          variant: "destructive",
        })
        return
      }
      const settings = (await response.json()) as Record<string, string>
      setFormData(parseLandingContent(settings.landingContent))
      setVisibility(parseVisibilitySettings(settings))
      setPendingUploads({})
    } catch (error) {
      setFormData(defaultLandingContent)
      setVisibility(visibilityDefaults)
      setPendingUploads({})
      toast({
        title: "Contenido no disponible",
        description: "Se cargaron valores por defecto del landing",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  const setPendingImage = useCallback((key: ImageFieldKey, file: File | null) => {
    setPendingUploads((prev) => ({
      ...prev,
      [key]: file,
    }))
  }, [])

  const clearPendingImage = useCallback(
    (key: ImageFieldKey) => {
      const { section, field } = imageFieldConfigs[key]
      setPendingImage(key, null)
      updateField(section, field, "")
    },
    [setPendingImage, updateField]
  )

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    const formDataUpload = new FormData()
    formDataUpload.append("file", file)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formDataUpload,
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => null)
      throw new Error(payload?.error || "No se pudo subir la imagen")
    }

    const data = await response.json()
    return data.url as string
  }, [])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const nextFormData: LandingContent = JSON.parse(JSON.stringify(formData))

      for (const [key, file] of Object.entries(pendingUploads) as Array<[ImageFieldKey, File | null | undefined]>) {
        if (!file) continue

        const uploadedUrl = await uploadImage(file)
        const { section, field } = imageFieldConfigs[key]
        ;(nextFormData[section] as Record<string, string>)[field] = uploadedUrl
      }

      const payload: Record<string, string> = {
        landingContent: JSON.stringify(nextFormData),
      }

      for (const [key, value] of Object.entries(visibility) as Array<[VisibilityKey, boolean]>) {
        payload[key] = value.toString()
      }

      const response = await fetch("/api/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || "No se pudo guardar")
      }

      toast({
        title: "Contenido guardado",
        description: "Los cambios del landing fueron guardados correctamente",
      })
      setFormData(nextFormData)
      setPendingUploads({})
      await fetchContent()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo guardar el contenido del landing",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const updateVisibility = (key: VisibilityKey, checked: boolean) => {
    setVisibility((prev) => ({ ...prev, [key]: checked }))
  }

  const updateHeaderButton = useCallback(
    (id: string, field: "text" | "url", value: string) => {
      setFormData((prev) => ({
        ...prev,
        header: {
          ...prev.header,
          navButtons: prev.header.navButtons.map((button) =>
            button.id === id ? { ...button, [field]: value } : button
          ),
        },
      }))
    },
    []
  )

  const updateHeaderButtonVisibility = useCallback((id: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        navButtons: prev.header.navButtons.map((button) =>
          button.id === id ? { ...button, isVisible: checked } : button
        ),
      },
    }))
  }, [])

  const addHeaderButton = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        navButtons: [
          ...prev.header.navButtons,
          createHeaderNavButton(
            prev.header.navButtons.length > 0
              ? Math.max(...prev.header.navButtons.map((button) => button.position || 0)) + 1
              : 1
          ),
        ],
      },
    }))
  }, [])

  const removeHeaderButton = useCallback((id: string) => {
    setFormData((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        navButtons: prev.header.navButtons.filter((button) => button.id !== id),
      },
    }))
  }, [])

  const updateHeaderButtonPosition = useCallback((id: string, value: string) => {
    const parsed = Number(value)
    const safePosition = Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1

    setFormData((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        navButtons: prev.header.navButtons.map((button) =>
          button.id === id ? { ...button, position: safePosition } : button
        ),
      },
    }))
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contenido del Landing</h1>
          <p className="text-muted-foreground mt-1">
            Edita textos, enlaces, assets e informacion SEO de la pagina principal.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchContent}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Recargar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visibilidad de Secciones</CardTitle>
          <CardDescription>
            Activa u oculta cualquier sección del landing y del detalle de producto.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Landing</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {visibilityFields
                .filter((field) => field.section === "landing")
                .map((field) => (
                  <div key={field.key} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="pr-4">
                      <Label className="font-medium">{field.label}</Label>
                      <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
                    </div>
                    <Switch
                      checked={visibility[field.key]}
                      onCheckedChange={(checked) => updateVisibility(field.key, checked)}
                    />
                  </div>
                ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Detalle de Producto</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {visibilityFields
                .filter((field) => field.section === "product")
                .map((field) => (
                  <div key={field.key} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="pr-4">
                      <Label className="font-medium">{field.label}</Label>
                      <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
                    </div>
                    <Switch
                      checked={visibility[field.key]}
                      onCheckedChange={(checked) => updateVisibility(field.key, checked)}
                    />
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Negocio y enlaces globales</CardTitle>
          <CardDescription>
            Estos valores se reutilizan en Header, Hero, Contacto, Footer y Sticky CTA.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Nombre de marca</Label>
            <Input
              value={formData.business.brandName}
              onChange={(e) => updateField("business", "brandName", e.target.value)}
            />
          </div>
          <div>
            <Label>Tagline</Label>
            <Input
              value={formData.business.brandTagline}
              onChange={(e) => updateField("business", "brandTagline", e.target.value)}
            />
          </div>
          <div>
            <Label>Ciudad (etiqueta)</Label>
            <Input
              value={formData.business.cityLabel}
              onChange={(e) => updateField("business", "cityLabel", e.target.value)}
            />
          </div>
          <div>
            <Label>Direccion</Label>
            <Input
              value={formData.business.address}
              onChange={(e) => updateField("business", "address", e.target.value)}
            />
          </div>
          <div>
            <Label>Telefono (texto visible)</Label>
            <Input
              value={formData.business.phoneDisplay}
              onChange={(e) => updateField("business", "phoneDisplay", e.target.value)}
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              value={formData.business.email}
              onChange={(e) => updateField("business", "email", e.target.value)}
            />
          </div>
          <div>
            <Label>URL WhatsApp</Label>
            <Input
              value={formData.business.whatsappUrl}
              onChange={(e) => updateField("business", "whatsappUrl", e.target.value)}
            />
          </div>
          <div>
            <Label>URL Tracking</Label>
            <Input
              value={formData.business.trackingUrl}
              onChange={(e) => updateField("business", "trackingUrl", e.target.value)}
            />
          </div>
          <div>
            <Label>URL Mapa</Label>
            <Input
              value={formData.business.mapUrl}
              onChange={(e) => updateField("business", "mapUrl", e.target.value)}
            />
          </div>
          <div>
            <Label>Facebook URL</Label>
            <Input
              value={formData.business.facebookUrl}
              onChange={(e) => updateField("business", "facebookUrl", e.target.value)}
            />
          </div>
          <ImageUploadField
            label="Logo del sitio"
            value={formData.business.logoUrl}
            pendingFile={pendingUploads["business.logoUrl"] ?? null}
            onFileSelect={(file) => setPendingImage("business.logoUrl", file)}
            onClear={() => clearPendingImage("business.logoUrl")}
            helperText="Selecciona el logo desde tu equipo o móvil."
          />
          <div>
            <Label>Alto logo header móvil (px)</Label>
            <Input
              type="number"
              min="24"
              max="120"
              value={formData.business.headerLogoHeightMobile}
              onChange={(e) => updateField("business", "headerLogoHeightMobile", e.target.value)}
            />
          </div>
          <div>
            <Label>Alto logo header desktop (px)</Label>
            <Input
              type="number"
              min="24"
              max="160"
              value={formData.business.headerLogoHeightDesktop}
              onChange={(e) => updateField("business", "headerLogoHeightDesktop", e.target.value)}
            />
          </div>
          <div>
            <Label>Logo alt</Label>
            <Input
              value={formData.business.logoAlt}
              onChange={(e) => updateField("business", "logoAlt", e.target.value)}
            />
          </div>
          <div>
            <Label>Instagram URL</Label>
            <Input
              value={formData.business.instagramUrl}
              onChange={(e) => updateField("business", "instagramUrl", e.target.value)}
            />
          </div>
          <div>
            <Label>TikTok URL</Label>
            <Input
              value={formData.business.tiktokUrl}
              onChange={(e) => updateField("business", "tiktokUrl", e.target.value)}
            />
          </div>
          <ImageUploadField
            label="Imagen de apoyo / truck"
            value={formData.business.supportImageUrl}
            pendingFile={pendingUploads["business.supportImageUrl"] ?? null}
            onFileSelect={(file) => setPendingImage("business.supportImageUrl", file)}
            onClear={() => clearPendingImage("business.supportImageUrl")}
            helperText="Usa esta imagen en hero, ubicación, footer y barra sticky."
          />
          <div>
            <Label>Alto logo footer (px)</Label>
            <Input
              type="number"
              min="24"
              max="180"
              value={formData.business.footerLogoHeight}
              onChange={(e) => updateField("business", "footerLogoHeight", e.target.value)}
            />
          </div>
          <div>
            <Label>Alt imagen de apoyo</Label>
            <Input
              value={formData.business.supportImageAlt}
              onChange={(e) => updateField("business", "supportImageAlt", e.target.value)}
            />
          </div>
          <div>
            <Label>Alto imagen apoyo compacta (px)</Label>
            <Input
              type="number"
              min="16"
              max="120"
              value={formData.business.supportImageCompactHeight}
              onChange={(e) => updateField("business", "supportImageCompactHeight", e.target.value)}
            />
          </div>
          <div>
            <Label>Alto imagen apoyo destacada (px)</Label>
            <Input
              type="number"
              min="24"
              max="220"
              value={formData.business.supportImageFeaturedHeight}
              onChange={(e) => updateField("business", "supportImageFeaturedHeight", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Header</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Texto boton tracking</Label>
              <Input
                value={formData.header.trackingButtonText}
                onChange={(e) => updateField("header", "trackingButtonText", e.target.value)}
              />
            </div>
            <div>
              <Label>Texto boton login</Label>
              <Input
                value={formData.header.loginButtonText}
                onChange={(e) => updateField("header", "loginButtonText", e.target.value)}
              />
            </div>
            <div>
              <Label>URL login</Label>
              <Input
                value={formData.header.loginUrl}
                onChange={(e) => updateField("header", "loginUrl", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <Label className="text-base font-semibold">Botones del menu</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Configura texto, URL y visibilidad. Puedes agregar los que necesites.
                </p>
              </div>
              <Button type="button" variant="outline" onClick={addHeaderButton}>
                <Plus className="w-4 h-4 mr-2" />
                Anadir boton
              </Button>
            </div>

            <div className="space-y-3">
              {formData.header.navButtons
                .slice()
                .sort((a, b) => a.position - b.position)
                .map((button, index) => (
                <div key={button.id} className="rounded-lg border border-border p-4 space-y-3">
                  <div className="grid gap-3 md:grid-cols-[1fr_1fr_120px_auto] md:items-end">
                    <div>
                      <Label>Texto</Label>
                      <Input
                        value={button.text}
                        onChange={(e) => updateHeaderButton(button.id, "text", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>URL</Label>
                      <Input
                        placeholder="#menu o https://..."
                        value={button.url}
                        onChange={(e) => updateHeaderButton(button.id, "url", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Posicion</Label>
                      <Input
                        type="number"
                        min={1}
                        value={button.position}
                        onChange={(e) => updateHeaderButtonPosition(button.id, e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeHeaderButton(button.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Boton #{index + 1} · Posicion {button.position}</p>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`header-button-visible-${button.id}`} className="text-sm">
                        Mostrar
                      </Label>
                      <Switch
                        id={`header-button-visible-${button.id}`}
                        checked={button.isVisible}
                        onCheckedChange={(checked) => updateHeaderButtonVisibility(button.id, checked)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hero</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Titulo principal (linea 1)</Label>
            <Input
              value={formData.hero.titlePrimary}
              onChange={(e) => updateField("hero", "titlePrimary", e.target.value)}
            />
          </div>
          <div>
            <Label>Titulo secundario (linea 2)</Label>
            <Input
              value={formData.hero.titleSecondary}
              onChange={(e) => updateField("hero", "titleSecondary", e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Subtitulo</Label>
            <Input
              value={formData.hero.subtitle}
              onChange={(e) => updateField("hero", "subtitle", e.target.value)}
            />
          </div>
          <div>
            <Label>Titulo horario</Label>
            <Input
              value={formData.hero.scheduleTitle}
              onChange={(e) => updateField("hero", "scheduleTitle", e.target.value)}
            />
          </div>
          <div>
            <Label>Horario semana</Label>
            <Input
              value={formData.hero.weekSchedule}
              onChange={(e) => updateField("hero", "weekSchedule", e.target.value)}
            />
          </div>
          <div>
            <Label>Horario sabado</Label>
            <Input
              value={formData.hero.saturdaySchedule}
              onChange={(e) => updateField("hero", "saturdaySchedule", e.target.value)}
            />
          </div>
          <ImageUploadField
            label="Imagen fallback del hero"
            value={formData.hero.fallbackImageUrl}
            pendingFile={pendingUploads["hero.fallbackImageUrl"] ?? null}
            onFileSelect={(file) => setPendingImage("hero.fallbackImageUrl", file)}
            onClear={() => clearPendingImage("hero.fallbackImageUrl")}
            helperText="Se usa cuando no hay slides activas o como imagen principal de respaldo."
          />
          <div>
            <Label>Alt imagen fallback</Label>
            <Input
              value={formData.hero.fallbackImageAlt}
              onChange={(e) => updateField("hero", "fallbackImageAlt", e.target.value)}
            />
          </div>
          <div>
            <Label>Prefijo dirección</Label>
            <Input
              value={formData.hero.addressPrefix}
              onChange={(e) => updateField("hero", "addressPrefix", e.target.value)}
            />
          </div>
          <div>
            <Label>Alto visual hero móvil (px)</Label>
            <Input
              type="number"
              min="240"
              max="900"
              value={formData.hero.imageHeightMobile}
              onChange={(e) => updateField("hero", "imageHeightMobile", e.target.value)}
            />
          </div>
          <div>
            <Label>Alto visual hero desktop (px)</Label>
            <Input
              type="number"
              min="320"
              max="1200"
              value={formData.hero.imageHeightDesktop}
              onChange={(e) => updateField("hero", "imageHeightDesktop", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature Cards y Menu</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Badge feature cards</Label>
            <Input
              value={formData.featureCards.badgeText}
              onChange={(e) => updateField("featureCards", "badgeText", e.target.value)}
            />
          </div>
          <div>
            <Label>Titulo feature (linea 1)</Label>
            <Input
              value={formData.featureCards.titleLine1}
              onChange={(e) => updateField("featureCards", "titleLine1", e.target.value)}
            />
          </div>
          <div>
            <Label>Titulo feature (linea 2)</Label>
            <Input
              value={formData.featureCards.titleLine2}
              onChange={(e) => updateField("featureCards", "titleLine2", e.target.value)}
            />
          </div>
          <IconSelectField
            label="Icono feature cards"
            value={formData.featureCards.iconName}
            onChange={(value) => updateField("featureCards", "iconName", value)}
          />
          <div>
            <Label>Texto CTA feature cards</Label>
            <Input
              value={formData.featureCards.ctaText}
              onChange={(e) => updateField("featureCards", "ctaText", e.target.value)}
            />
          </div>
          <div>
            <Label>URL CTA feature cards</Label>
            <Input
              value={formData.featureCards.ctaUrl}
              onChange={(e) => updateField("featureCards", "ctaUrl", e.target.value)}
            />
          </div>
          <div>
            <Label>Titulo seccion menu</Label>
            <Input
              value={formData.menu.title}
              onChange={(e) => updateField("menu", "title", e.target.value)}
            />
          </div>
          <div>
            <Label>Texto categoría "todos"</Label>
            <Input
              value={formData.menu.allCategoryLabel}
              onChange={(e) => updateField("menu", "allCategoryLabel", e.target.value)}
            />
          </div>
          <div>
            <Label>Etiqueta selector mobile</Label>
            <Input
              value={formData.menu.categorySelectLabel}
              onChange={(e) => updateField("menu", "categorySelectLabel", e.target.value)}
            />
          </div>
          <div>
            <Label>Placeholder selector mobile</Label>
            <Input
              value={formData.menu.categorySelectPlaceholder}
              onChange={(e) => updateField("menu", "categorySelectPlaceholder", e.target.value)}
            />
          </div>
          <IconSelectField
            label='Icono categoría "todos"'
            value={formData.menu.allCategoryIconName}
            onChange={(value) => updateField("menu", "allCategoryIconName", value)}
          />
          <IconSelectField
            label="Icono por defecto categorías"
            value={formData.menu.defaultCategoryIconName}
            onChange={(value) => updateField("menu", "defaultCategoryIconName", value)}
          />
          <div>
            <Label>Texto error menú</Label>
            <Input
              value={formData.menu.errorText}
              onChange={(e) => updateField("menu", "errorText", e.target.value)}
            />
          </div>
          <div>
            <Label>Texto vacío menú general</Label>
            <Input
              value={formData.menu.emptyAllText}
              onChange={(e) => updateField("menu", "emptyAllText", e.target.value)}
            />
          </div>
          <div>
            <Label>Texto vacío menú por categoría</Label>
            <Input
              value={formData.menu.emptyCategoryText}
              onChange={(e) => updateField("menu", "emptyCategoryText", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Galería de Oficinas</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Badge galería oficinas</Label>
            <Input
              value={formData.officeGallery.badgeText}
              onChange={(e) => updateField("officeGallery", "badgeText", e.target.value)}
            />
          </div>
          <div>
            <Label>Título galería oficinas</Label>
            <Input
              value={formData.officeGallery.title}
              onChange={(e) => updateField("officeGallery", "title", e.target.value)}
            />
          </div>
          <IconSelectField
            label="Icono galería oficinas"
            value={formData.officeGallery.iconName}
            onChange={(value) => updateField("officeGallery", "iconName", value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ubicacion</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Titulo seccion</Label>
            <Input
              value={formData.location.sectionTitle}
              onChange={(e) => updateField("location", "sectionTitle", e.target.value)}
            />
          </div>
          <div>
            <Label>Subtitulo</Label>
            <Input
              value={formData.location.subtitle}
              onChange={(e) => updateField("location", "subtitle", e.target.value)}
            />
          </div>
          <div>
            <Label>Titulo ciudad</Label>
            <Input
              value={formData.location.cityTitle}
              onChange={(e) => updateField("location", "cityTitle", e.target.value)}
            />
          </div>
          <div>
            <Label>Titulo bloque de visita</Label>
            <Input
              value={formData.location.visitTitle}
              onChange={(e) => updateField("location", "visitTitle", e.target.value)}
            />
          </div>
          <div>
            <Label>Titulo horario</Label>
            <Input
              value={formData.location.scheduleTitle}
              onChange={(e) => updateField("location", "scheduleTitle", e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Descripcion horario</Label>
            <Textarea
              value={formData.location.scheduleDescription}
              onChange={(e) => updateField("location", "scheduleDescription", e.target.value)}
            />
          </div>
          <div>
            <Label>Horario semana</Label>
            <Input
              value={formData.location.weekSchedule}
              onChange={(e) => updateField("location", "weekSchedule", e.target.value)}
            />
          </div>
          <div>
            <Label>Horario sabado</Label>
            <Input
              value={formData.location.saturdaySchedule}
              onChange={(e) => updateField("location", "saturdaySchedule", e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Nota de cita previa</Label>
            <Textarea
              value={formData.location.appointmentNote}
              onChange={(e) => updateField("location", "appointmentNote", e.target.value)}
            />
          </div>
          <div>
            <Label>Titulo banner inferior</Label>
            <Input
              value={formData.location.bannerTitle}
              onChange={(e) => updateField("location", "bannerTitle", e.target.value)}
            />
          </div>
          <div>
            <Label>Descripcion banner inferior</Label>
            <Input
              value={formData.location.bannerDescription}
              onChange={(e) => updateField("location", "bannerDescription", e.target.value)}
            />
          </div>
          <ImageUploadField
            label="Imagen de mapa"
            value={formData.location.mapImageUrl}
            pendingFile={pendingUploads["location.mapImageUrl"] ?? null}
            onFileSelect={(file) => setPendingImage("location.mapImageUrl", file)}
            onClear={() => clearPendingImage("location.mapImageUrl")}
            helperText="Puedes subir una captura, mapa o imagen ilustrativa de la ubicación."
          />
          <div>
            <Label>Alt de imagen de mapa</Label>
            <Input
              value={formData.location.mapImageAlt}
              onChange={(e) => updateField("location", "mapImageAlt", e.target.value)}
            />
          </div>
          <div>
            <Label>Alto mapa móvil (px)</Label>
            <Input
              type="number"
              min="180"
              max="720"
              value={formData.location.mapImageHeightMobile}
              onChange={(e) => updateField("location", "mapImageHeightMobile", e.target.value)}
            />
          </div>
          <div>
            <Label>Alto mapa desktop (px)</Label>
            <Input
              type="number"
              min="240"
              max="900"
              value={formData.location.mapImageHeightDesktop}
              onChange={(e) => updateField("location", "mapImageHeightDesktop", e.target.value)}
            />
          </div>
          <div>
            <Label>Aria label enlace mapa</Label>
            <Input
              value={formData.location.mapLinkLabel}
              onChange={(e) => updateField("location", "mapLinkLabel", e.target.value)}
            />
          </div>
          <IconSelectField
            label="Icono bloque visita"
            value={formData.location.visitIconName}
            onChange={(value) => updateField("location", "visitIconName", value)}
          />
          <IconSelectField
            label="Icono bloque horario"
            value={formData.location.scheduleIconName}
            onChange={(value) => updateField("location", "scheduleIconName", value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contacto</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Titulo seccion</Label>
            <Input
              value={formData.contact.sectionTitle}
              onChange={(e) => updateField("contact", "sectionTitle", e.target.value)}
            />
          </div>
          <div>
            <Label>Subtitulo</Label>
            <Input
              value={formData.contact.subtitle}
              onChange={(e) => updateField("contact", "subtitle", e.target.value)}
            />
          </div>
          <div>
            <Label>Etiqueta telefono</Label>
            <Input
              value={formData.contact.phoneLabel}
              onChange={(e) => updateField("contact", "phoneLabel", e.target.value)}
            />
          </div>
          <div>
            <Label>Texto ayuda telefono</Label>
            <Input
              value={formData.contact.phoneHelp}
              onChange={(e) => updateField("contact", "phoneHelp", e.target.value)}
            />
          </div>
          <div>
            <Label>Etiqueta email</Label>
            <Input
              value={formData.contact.emailLabel}
              onChange={(e) => updateField("contact", "emailLabel", e.target.value)}
            />
          </div>
          <div>
            <Label>Texto ayuda email</Label>
            <Input
              value={formData.contact.emailHelp}
              onChange={(e) => updateField("contact", "emailHelp", e.target.value)}
            />
          </div>
          <div>
            <Label>Etiqueta WhatsApp</Label>
            <Input
              value={formData.contact.whatsappLabel}
              onChange={(e) => updateField("contact", "whatsappLabel", e.target.value)}
            />
          </div>
          <div>
            <Label>Texto ayuda WhatsApp</Label>
            <Input
              value={formData.contact.whatsappHelp}
              onChange={(e) => updateField("contact", "whatsappHelp", e.target.value)}
            />
          </div>
          <IconSelectField
            label="Icono teléfono"
            value={formData.contact.phoneIconName}
            onChange={(value) => updateField("contact", "phoneIconName", value)}
          />
          <IconSelectField
            label="Icono email"
            value={formData.contact.emailIconName}
            onChange={(value) => updateField("contact", "emailIconName", value)}
          />
          <IconSelectField
            label="Icono WhatsApp"
            value={formData.contact.whatsappIconName}
            onChange={(value) => updateField("contact", "whatsappIconName", value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Footer y Sticky CTA</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Titulo links footer</Label>
            <Input
              value={formData.footer.linksTitle}
              onChange={(e) => updateField("footer", "linksTitle", e.target.value)}
            />
          </div>
          <div>
            <Label>Titulo contacto footer</Label>
            <Input
              value={formData.footer.contactTitle}
              onChange={(e) => updateField("footer", "contactTitle", e.target.value)}
            />
          </div>
          <div>
            <Label>Texto link menu</Label>
            <Input
              value={formData.footer.menuLinkText}
              onChange={(e) => updateField("footer", "menuLinkText", e.target.value)}
            />
          </div>
          <div>
            <Label>URL link menu</Label>
            <Input
              value={formData.footer.menuLinkUrl}
              onChange={(e) => updateField("footer", "menuLinkUrl", e.target.value)}
            />
          </div>
          <div>
            <Label>Texto link ubicacion</Label>
            <Input
              value={formData.footer.locationLinkText}
              onChange={(e) => updateField("footer", "locationLinkText", e.target.value)}
            />
          </div>
          <div>
            <Label>URL link ubicación</Label>
            <Input
              value={formData.footer.locationLinkUrl}
              onChange={(e) => updateField("footer", "locationLinkUrl", e.target.value)}
            />
          </div>
          <div>
            <Label>Texto link contacto</Label>
            <Input
              value={formData.footer.contactLinkText}
              onChange={(e) => updateField("footer", "contactLinkText", e.target.value)}
            />
          </div>
          <div>
            <Label>URL link contacto</Label>
            <Input
              value={formData.footer.contactLinkUrl}
              onChange={(e) => updateField("footer", "contactLinkUrl", e.target.value)}
            />
          </div>
          <div>
            <Label>Texto badge transporte</Label>
            <Input
              value={formData.footer.transportBadgeText}
              onChange={(e) => updateField("footer", "transportBadgeText", e.target.value)}
            />
          </div>
          <div>
            <Label>Texto derechos reservados</Label>
            <Input
              value={formData.footer.rightsText}
              onChange={(e) => updateField("footer", "rightsText", e.target.value)}
            />
          </div>
          <div>
            <Label>Texto enlace privacidad</Label>
            <Input
              value={formData.footer.privacyLinkText}
              onChange={(e) => updateField("footer", "privacyLinkText", e.target.value)}
            />
          </div>
          <div>
            <Label>URL enlace privacidad</Label>
            <Input
              value={formData.footer.privacyLinkUrl}
              onChange={(e) => updateField("footer", "privacyLinkUrl", e.target.value)}
            />
          </div>
          <div>
            <Label>Texto enlace terminos</Label>
            <Input
              value={formData.footer.termsLinkText}
              onChange={(e) => updateField("footer", "termsLinkText", e.target.value)}
            />
          </div>
          <div>
            <Label>URL enlace términos</Label>
            <Input
              value={formData.footer.termsLinkUrl}
              onChange={(e) => updateField("footer", "termsLinkUrl", e.target.value)}
            />
          </div>
          <div>
            <Label>Texto sticky "encuentranos"</Label>
            <Input
              value={formData.stickyCta.findUsText}
              onChange={(e) => updateField("stickyCta", "findUsText", e.target.value)}
            />
          </div>
          <div>
            <Label>Texto boton sticky</Label>
            <Input
              value={formData.stickyCta.buttonText}
              onChange={(e) => updateField("stickyCta", "buttonText", e.target.value)}
            />
          </div>
          <div>
            <Label>URL botón sticky</Label>
            <Input
              value={formData.stickyCta.buttonUrl}
              onChange={(e) => updateField("stickyCta", "buttonUrl", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO y Metadatos</CardTitle>
          <CardDescription>
            Controla titulo, descripcion, favicon, Open Graph y JSON-LD del landing.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>URL base del sitio</Label>
            <Input
              value={formData.seo.siteUrl}
              onChange={(e) => updateField("seo", "siteUrl", e.target.value)}
            />
          </div>
          <div>
            <Label>URL canónica</Label>
            <Input
              value={formData.seo.canonicalUrl}
              onChange={(e) => updateField("seo", "canonicalUrl", e.target.value)}
            />
          </div>
          <div>
            <Label>Nombre del sitio</Label>
            <Input
              value={formData.seo.siteName}
              onChange={(e) => updateField("seo", "siteName", e.target.value)}
            />
          </div>
          <div>
            <Label>Titulo por defecto</Label>
            <Input
              value={formData.seo.defaultTitle}
              onChange={(e) => updateField("seo", "defaultTitle", e.target.value)}
            />
          </div>
          <div>
            <Label>Plantilla de título</Label>
            <Input
              value={formData.seo.titleTemplate}
              onChange={(e) => updateField("seo", "titleTemplate", e.target.value)}
              placeholder="%s | DLA Viajes y Envios"
            />
          </div>
          <div>
            <Label>Locale Open Graph</Label>
            <Input
              value={formData.seo.locale}
              onChange={(e) => updateField("seo", "locale", e.target.value)}
              placeholder="es_US"
            />
          </div>
          <div>
            <Label>Idioma del sitio</Label>
            <Input
              value={formData.seo.siteLanguage}
              onChange={(e) => updateField("seo", "siteLanguage", e.target.value)}
              placeholder="es"
            />
          </div>
          <div>
            <Label>Color del tema</Label>
            <Input
              value={formData.seo.themeColor}
              onChange={(e) => updateField("seo", "themeColor", e.target.value)}
              placeholder="#1a1a1a"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Descripcion SEO</Label>
            <Textarea
              value={formData.seo.description}
              onChange={(e) => updateField("seo", "description", e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Keywords</Label>
            <Textarea
              value={formData.seo.keywords}
              onChange={(e) => updateField("seo", "keywords", e.target.value)}
              placeholder="separa por comas"
            />
          </div>
          <ImageUploadField
            label="Imagen Open Graph"
            value={formData.seo.ogImageUrl}
            pendingFile={pendingUploads["seo.ogImageUrl"] ?? null}
            onFileSelect={(file) => setPendingImage("seo.ogImageUrl", file)}
            onClear={() => clearPendingImage("seo.ogImageUrl")}
            helperText="Es la imagen que se comparte en redes sociales y WhatsApp."
          />
          <div>
            <Label>Alt imagen Open Graph</Label>
            <Input
              value={formData.seo.ogImageAlt}
              onChange={(e) => updateField("seo", "ogImageAlt", e.target.value)}
            />
          </div>
          <ImageUploadField
            label="Imagen Twitter"
            value={formData.seo.twitterImageUrl}
            pendingFile={pendingUploads["seo.twitterImageUrl"] ?? null}
            onFileSelect={(file) => setPendingImage("seo.twitterImageUrl", file)}
            onClear={() => clearPendingImage("seo.twitterImageUrl")}
          />
          <ImageUploadField
            label="Favicon"
            value={formData.seo.faviconUrl}
            pendingFile={pendingUploads["seo.faviconUrl"] ?? null}
            onFileSelect={(file) => setPendingImage("seo.faviconUrl", file)}
            onClear={() => clearPendingImage("seo.faviconUrl")}
            accept="image/*,.ico"
            helperText="Icono principal del navegador."
          />
          <ImageUploadField
            label="Shortcut icon"
            value={formData.seo.shortcutIconUrl}
            pendingFile={pendingUploads["seo.shortcutIconUrl"] ?? null}
            onFileSelect={(file) => setPendingImage("seo.shortcutIconUrl", file)}
            onClear={() => clearPendingImage("seo.shortcutIconUrl")}
            accept="image/*,.ico"
          />
          <ImageUploadField
            label="Apple touch icon"
            value={formData.seo.appleIconUrl}
            pendingFile={pendingUploads["seo.appleIconUrl"] ?? null}
            onFileSelect={(file) => setPendingImage("seo.appleIconUrl", file)}
            onClear={() => clearPendingImage("seo.appleIconUrl")}
            accept="image/*"
          />
          <div>
            <Label>Manifest</Label>
            <Input
              value={formData.seo.manifestUrl}
              onChange={(e) => updateField("seo", "manifestUrl", e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Structured data JSON-LD</Label>
            <Textarea
              value={formData.seo.structuredDataJson}
              onChange={(e) => updateField("seo", "structuredDataJson", e.target.value)}
              className="min-h-[320px] font-mono text-xs"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
