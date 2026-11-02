import "server-only"

import { cache } from "react"
import { getSiteSettings } from "@/lib/site-settings"

export const SERVICE_PAGE_SLUGS = [
  "precios-envios-cuba",
  "tiempos-de-entrega-cuba",
  "envios-a-cuba-desde-orlando",
] as const

export type ServicePageSlug = (typeof SERVICE_PAGE_SLUGS)[number]

export type ContentRow = { name: string; price: string; description: string }
export type FaqItem = { question: string; answer: string }

export type ServicePage = {
  slug: ServicePageSlug
  published: boolean
  title: string
  seoTitle: string
  seoDescription: string
  intro: string
  lastUpdated: string
  sections: {
    shipping: { enabled: boolean; title: string; description: string; rows: ContentRow[] }
    pricing: { enabled: boolean; title: string; description: string; rows: ContentRow[] }
    delivery: { enabled: boolean; title: string; description: string; rows: ContentRow[] }
    details: { enabled: boolean; title: string; items: string[] }
    coverage: { enabled: boolean; title: string; description: string; items: string[] }
    faq: { enabled: boolean; title: string; items: FaqItem[] }
    cta: { enabled: boolean; title: string; description: string; buttonText: string; buttonUrl: string }
  }
}

const baseSections: ServicePage["sections"] = {
  shipping: { enabled: true, title: "Opciones de envío", description: "", rows: [] },
  pricing: { enabled: true, title: "Precios", description: "", rows: [] },
  delivery: { enabled: true, title: "Tiempos de entrega", description: "", rows: [] },
  details: { enabled: true, title: "Información del servicio", items: [] },
  coverage: { enabled: true, title: "Cobertura", description: "", items: [] },
  faq: { enabled: true, title: "Preguntas frecuentes", items: [] },
  cta: { enabled: true, title: "¿Necesitas ayuda con tu envío?", description: "Contáctanos para confirmar los detalles de tu envío.", buttonText: "Contactar por WhatsApp", buttonUrl: "https://wa.me/14076394011" },
}

export const defaultServicePages: ServicePage[] = [
  {
    slug: "precios-envios-cuba",
    published: true,
    title: "Precios de envíos a Cuba",
    seoTitle: "Precios de envíos a Cuba | DLA",
    seoDescription: "Consulta precios, modalidades, mínimos y condiciones para enviar a Cuba desde Orlando.",
    intro: "Consulta aquí las tarifas y condiciones vigentes para tus envíos a Cuba. Confirma siempre los detalles antes de realizar tu envío.",
    lastUpdated: "",
    sections: { ...baseSections, pricing: { ...baseSections.pricing, title: "Tarifas y modalidades" }, details: { ...baseSections.details, title: "Mínimos, cajas, recogida y descuentos" } },
  },
  {
    slug: "tiempos-de-entrega-cuba",
    published: true,
    title: "Tiempos de entrega de envíos a Cuba",
    seoTitle: "Tiempos de entrega de envíos a Cuba | DLA",
    seoDescription: "Conoce los plazos estimados, frecuencia de salidas y factores que influyen en las entregas a Cuba.",
    intro: "Los plazos publicados son estimados y pueden variar por modalidad, provincia y procesos de terceros.",
    lastUpdated: "",
    sections: { ...baseSections, delivery: { ...baseSections.delivery, title: "Plazos estimados y frecuencia de salidas", description: "Los tiempos deben expresarse como rangos aproximados." }, details: { ...baseSections.details, title: "Factores que pueden afectar la entrega" } },
  },
  {
    slug: "envios-a-cuba-desde-orlando",
    published: true,
    title: "Envíos a Cuba desde Orlando",
    seoTitle: "Envíos a Cuba desde Orlando | DLA",
    seoDescription: "Dirección, modalidades, precios, tiempos, recogida, seguimiento y cobertura para envíos a Cuba desde Orlando.",
    intro: "Organiza tu envío a Cuba desde Orlando con información sobre entrega, recogida, seguimiento y zonas atendidas.",
    lastUpdated: "",
    sections: { ...baseSections, shipping: { ...baseSections.shipping, title: "Opciones de envío desde Orlando" }, details: { ...baseSections.details, title: "Servicio de envíos desde Orlando" }, coverage: { ...baseSections.coverage, title: "Zonas de Cuba atendidas" } },
  },
]

function isSlug(value: unknown): value is ServicePageSlug {
  return typeof value === "string" && SERVICE_PAGE_SLUGS.includes(value as ServicePageSlug)
}

function normalizeRows(value: unknown): ContentRow[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((row) => {
    if (!row || typeof row !== "object") return []
    const legacy = row as { label?: unknown; value?: unknown; note?: unknown }
    const current = row as Partial<ContentRow>
    const name = typeof current.name === "string" ? current.name : legacy.label
    const price = typeof current.price === "string" ? current.price : legacy.value
    const description = typeof current.description === "string" ? current.description : legacy.note
    return typeof name === "string" && typeof price === "string" && typeof description === "string"
      ? [{ name, price, description }]
      : []
  })
}

function normalizeFaq(value: unknown): FaqItem[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is FaqItem =>
    !!item && typeof item === "object" && typeof item.question === "string" && typeof item.answer === "string"
  )
}

function normalizeItems(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
}

function normalizePage(value: unknown, fallback: ServicePage): ServicePage {
  if (!value || typeof value !== "object") return fallback
  const raw = value as Partial<ServicePage>
  const sections = raw.sections as Partial<ServicePage["sections"]> | undefined
  return {
    ...fallback,
    ...raw,
    slug: fallback.slug,
    published: typeof raw.published === "boolean" ? raw.published : fallback.published,
    title: typeof raw.title === "string" ? raw.title : fallback.title,
    seoTitle: typeof raw.seoTitle === "string" ? raw.seoTitle : fallback.seoTitle,
    seoDescription: typeof raw.seoDescription === "string" ? raw.seoDescription : fallback.seoDescription,
    intro: typeof raw.intro === "string" ? raw.intro : fallback.intro,
    lastUpdated: typeof raw.lastUpdated === "string" ? raw.lastUpdated : fallback.lastUpdated,
    sections: {
      shipping: { ...fallback.sections.shipping, ...sections?.shipping, rows: normalizeRows(sections?.shipping?.rows) },
      pricing: { ...fallback.sections.pricing, ...sections?.pricing, rows: normalizeRows(sections?.pricing?.rows) },
      delivery: { ...fallback.sections.delivery, ...sections?.delivery, rows: normalizeRows(sections?.delivery?.rows) },
      details: { ...fallback.sections.details, ...sections?.details, items: normalizeItems(sections?.details?.items) },
      coverage: { ...fallback.sections.coverage, ...sections?.coverage, items: normalizeItems(sections?.coverage?.items) },
      faq: { ...fallback.sections.faq, ...sections?.faq, items: normalizeFaq(sections?.faq?.items) },
      cta: { ...fallback.sections.cta, ...sections?.cta },
    },
  }
}

export function parseServicePages(raw?: string): ServicePage[] {
  if (!raw) return defaultServicePages
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return defaultServicePages
    return defaultServicePages.map((page) => normalizePage(parsed.find((item) => isSlug(item?.slug) && item.slug === page.slug), page))
  } catch {
    return defaultServicePages
  }
}

export const getServicePages = cache(async () => parseServicePages((await getSiteSettings()).servicePages))

export const getServicePage = cache(async (slug: string) => {
  if (!isSlug(slug)) return null
  return (await getServicePages()).find((page) => page.slug === slug) ?? null
})
