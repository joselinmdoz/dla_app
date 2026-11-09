"use client"

import { createContext, createElement, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { defaultLandingContent, LandingContent, parseLandingContent } from "@/lib/landing-content"

interface SiteSettings {
  [key: string]: string
}

type LandingContentState = {
  content: LandingContent
  settings: SiteSettings
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  isSectionEnabled: (key: string, defaultValue?: boolean) => boolean
}

const LandingContentContext = createContext<LandingContentState | null>(null)

export function LandingContentProvider({
  initialContent,
  initialSettings,
  children,
}: {
  initialContent: LandingContent
  initialSettings: SiteSettings
  children: ReactNode
}) {
  const isSectionEnabled = useCallback(
    (key: string, defaultValue = true) => initialSettings[key] === undefined ? defaultValue : initialSettings[key] !== "false",
    [initialSettings]
  )

  const value = useMemo<LandingContentState>(() => ({
    content: initialContent,
    settings: initialSettings,
    isLoading: false,
    error: null,
    refetch: async () => undefined,
    isSectionEnabled,
  }), [initialContent, initialSettings, isSectionEnabled])

  return createElement(LandingContentContext.Provider, { value }, children)
}

export function useLandingContent() {
  const serverSnapshot = useContext(LandingContentContext)
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
    if (serverSnapshot) return
    fetchSettings()
  }, [fetchSettings, serverSnapshot])

  const isSectionEnabled = useCallback(
    (key: string, defaultValue = true) => {
      const value = settings[key]
      if (value === undefined) return defaultValue
      return value !== "false"
    },
    [settings]
  )

  const fallbackState = {
    content,
    settings,
    isLoading,
    error,
    refetch: fetchSettings,
    isSectionEnabled,
  }

  return serverSnapshot ?? fallbackState
}
