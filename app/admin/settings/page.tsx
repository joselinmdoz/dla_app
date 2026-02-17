"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Settings, Save } from 'lucide-react'

interface SiteSettings {
  featureCardsEnabled: boolean
  heroSlidesEnabled: boolean
  menuSectionEnabled: boolean
  locationSectionEnabled: boolean
  contactSectionEnabled: boolean
}

export default function SettingsPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<SiteSettings>({
    featureCardsEnabled: true,
    heroSlidesEnabled: true,
    menuSectionEnabled: true,
    locationSectionEnabled: true,
    contactSectionEnabled: true
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/site-settings')
        if (!response.ok) throw new Error('Error al cargar configuración')
        
        const data = await response.json()
        
        // La API puede devolver un objeto o un array
        const parsed: SiteSettings = {
          featureCardsEnabled: true,
          heroSlidesEnabled: true,
          menuSectionEnabled: true,
          locationSectionEnabled: true,
          contactSectionEnabled: true
        }
        
        if (Array.isArray(data)) {
          data.forEach((setting: { key: string; value: string }) => {
            if (setting.key === 'featureCardsEnabled') {
              parsed.featureCardsEnabled = setting.value === 'true'
            } else if (setting.key === 'heroSlidesEnabled') {
              parsed.heroSlidesEnabled = setting.value === 'true'
            } else if (setting.key === 'menuSectionEnabled') {
              parsed.menuSectionEnabled = setting.value === 'true'
            } else if (setting.key === 'locationSectionEnabled') {
              parsed.locationSectionEnabled = setting.value === 'true'
            } else if (setting.key === 'contactSectionEnabled') {
              parsed.contactSectionEnabled = setting.value === 'true'
            }
          })
        } else if (typeof data === 'object') {
          // Es un objeto clave-valor
          parsed.featureCardsEnabled = data.featureCardsEnabled !== 'false'
          parsed.heroSlidesEnabled = data.heroSlidesEnabled !== 'false'
          parsed.menuSectionEnabled = data.menuSectionEnabled !== 'false'
          parsed.locationSectionEnabled = data.locationSectionEnabled !== 'false'
          parsed.contactSectionEnabled = data.contactSectionEnabled !== 'false'
        }
        
        setSettings(parsed)
      } catch (error) {
        console.error('Error fetching settings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const settingsToSave = [
        { key: 'featureCardsEnabled', value: settings.featureCardsEnabled.toString() },
        { key: 'heroSlidesEnabled', value: settings.heroSlidesEnabled.toString() },
        { key: 'menuSectionEnabled', value: settings.menuSectionEnabled.toString() },
        { key: 'locationSectionEnabled', value: settings.locationSectionEnabled.toString() },
        { key: 'contactSectionEnabled', value: settings.contactSectionEnabled.toString() }
      ]

      for (const setting of settingsToSave) {
        const response = await fetch('/api/site-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(setting)
        })
        
        if (!response.ok) {
          throw new Error('Error al guardar configuración')
        }
      }

      toast({
        title: 'Configuración guardada',
        description: 'Los cambios se han guardado correctamente',
        variant: 'default'
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: 'Error',
        description: 'No se pudo guardar la configuración',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Configuración del Sitio</h2>
          <p className="text-muted-foreground">
            Administra la visibilidad de las secciones del sitio
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Secciones del Sitio
          </CardTitle>
          <CardDescription>
            Activa o desactiva las secciones que se muestran en la página principal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="featureCards">Tarjetas de Información</Label>
              <p className="text-sm text-muted-foreground">
                Muestra las tarjetas de ofertas especiales en la página principal
              </p>
            </div>
            <Switch
              id="featureCards"
              checked={settings.featureCardsEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, featureCardsEnabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="heroSlides">Slides del Carrusel</Label>
              <p className="text-sm text-muted-foreground">
                Muestra el carrusel de imágenes en la página principal
              </p>
            </div>
            <Switch
              id="heroSlides"
              checked={settings.heroSlidesEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, heroSlidesEnabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="menuSection">Sección del Menú</Label>
              <p className="text-sm text-muted-foreground">
                Muestra la sección de productos/menú en la página principal
              </p>
            </div>
            <Switch
              id="menuSection"
              checked={settings.menuSectionEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, menuSectionEnabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="locationSection">Sección de Ubicación</Label>
              <p className="text-sm text-muted-foreground">
                Muestra la sección de ubicación en la página principal
              </p>
            </div>
            <Switch
              id="locationSection"
              checked={settings.locationSectionEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, locationSectionEnabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="contactSection">Sección de Contacto</Label>
              <p className="text-sm text-muted-foreground">
                Muestra la sección de contacto en la página principal
              </p>
            </div>
            <Switch
              id="contactSection"
              checked={settings.contactSectionEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, contactSectionEnabled: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
