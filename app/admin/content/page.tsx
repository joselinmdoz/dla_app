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

type SectionKey = keyof LandingContent

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
      const response = await fetch("/api/site-settings")
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
    } catch (error) {
      setFormData(defaultLandingContent)
      setVisibility(visibilityDefaults)
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

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const payload: Record<string, string> = {
        landingContent: JSON.stringify(formData),
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
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "No se pudo guardar el contenido del landing",
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
            Edita textos y enlaces de todas las secciones visibles de la pagina principal.
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
          <div>
            <Label>Imagen fallback del hero</Label>
            <Input
              value={formData.hero.fallbackImageUrl}
              onChange={(e) => updateField("hero", "fallbackImageUrl", e.target.value)}
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
          <div>
            <Label>Titulo seccion menu</Label>
            <Input
              value={formData.menu.title}
              onChange={(e) => updateField("menu", "title", e.target.value)}
            />
          </div>
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
          <div>
            <Label>Imagen de mapa</Label>
            <Input
              value={formData.location.mapImageUrl}
              onChange={(e) => updateField("location", "mapImageUrl", e.target.value)}
            />
          </div>
          <div>
            <Label>Alt de imagen de mapa</Label>
            <Input
              value={formData.location.mapImageAlt}
              onChange={(e) => updateField("location", "mapImageAlt", e.target.value)}
            />
          </div>
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
            <Label>Texto link ubicacion</Label>
            <Input
              value={formData.footer.locationLinkText}
              onChange={(e) => updateField("footer", "locationLinkText", e.target.value)}
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
            <Label>Texto enlace terminos</Label>
            <Input
              value={formData.footer.termsLinkText}
              onChange={(e) => updateField("footer", "termsLinkText", e.target.value)}
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
        </CardContent>
      </Card>
    </div>
  )
}
