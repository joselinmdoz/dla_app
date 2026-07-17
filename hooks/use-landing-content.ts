"use client"

import { useCallback, useEffect, useState } from "react"
import { defaultLandingContent, LandingContent, parseLandingContent } from "@/lib/landing-content"

interface SiteSettings {
  [key: string]: string
}

export function useLandingContent() {
  const [content, setContent] = useState<LandingContent>(defaultLandingContent)
  const [settings, setSettings] = useState<SiteSettings>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/site-settings", {
        cache: "no-store",
      })
      if (!response.ok) throw new Error("No se pudo cargar el contenido del sitio")
      const data = (await response.json()) as SiteSettings

      setSettings(data)
      setContent(parseLandingContent(data.landingContent))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
      setContent(defaultLandingContent)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const isSectionEnabled = useCallback(
    (key: string, defaultValue = true) => {
      const value = settings[key]
      if (value === undefined) return defaultValue
      return value !== "false"
    },
    [settings]
  )

  return {
    content,
    settings,
    isLoading,
    error,
    refetch: fetchSettings,
    isSectionEnabled,
  }
}
