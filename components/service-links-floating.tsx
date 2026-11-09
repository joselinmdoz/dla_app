"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, X, Zap } from "lucide-react"
import { useLandingContent } from "@/hooks/use-landing-content"

const serviceLinks = [
  {
    href: "/precios-envios-cuba",
    title: "Precios de envío",
    description: "Tarifas y opciones para Cuba",
  },
  {
    href: "/tiempos-de-entrega-cuba",
    title: "Tiempos de entrega",
    description: "Plazos estimados por modalidad",
  },
  {
    href: "/envios-a-cuba-desde-orlando",
    title: "Envíos desde Orlando",
    description: "Todo lo que necesitas para enviar",
  },
]

export function ServiceLinksFloating() {
  const { isSectionEnabled } = useLandingContent()
  const [isOpen, setIsOpen] = useState(false)

  if (!isSectionEnabled("serviceLinksFloatingEnabled", false)) return null

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {isOpen ? (
        <div id="service-links-panel" className="w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-foreground">Servicios para Cuba</p>
              <p className="text-xs text-muted-foreground">Información clara antes de enviar</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Cerrar enlaces de servicios"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <nav className="p-2" aria-label="Páginas de servicios">
            {serviceLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-primary/10"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Zap className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-foreground">{link.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">{link.description}</span>
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            ))}
          </nav>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-14 items-center gap-2 rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground shadow-xl shadow-primary/30 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-expanded={isOpen}
        aria-controls="service-links-panel"
      >
        <Zap className="h-5 w-5" />
        Servicios
      </button>
    </div>
  )
}
