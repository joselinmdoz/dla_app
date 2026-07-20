export interface HeaderNavButton {
  id: string
  text: string
  url: string
  isVisible: boolean
  position: number
}

export interface LandingContent {
  business: {
    brandName: string
    brandTagline: string
    cityLabel: string
    address: string
    phoneDisplay: string
    whatsappUrl: string
    email: string
    trackingUrl: string
    mapUrl: string
    facebookUrl: string
    instagramUrl: string
    tiktokUrl: string
    logoUrl: string
    logoAlt: string
    headerLogoHeightMobile: string
    headerLogoHeightDesktop: string
    footerLogoHeight: string
    supportImageUrl: string
    supportImageAlt: string
    supportImageCompactHeight: string
    supportImageFeaturedHeight: string
  }
  header: {
    trackingButtonText: string
    loginButtonText: string
    loginUrl: string
    navButtons: HeaderNavButton[]
  }
  hero: {
    titlePrimary: string
    titleSecondary: string
    subtitle: string
    scheduleTitle: string
    weekSchedule: string
    saturdaySchedule: string
    fallbackImageUrl: string
    fallbackImageAlt: string
    addressPrefix: string
    imageHeightMobile: string
    imageHeightDesktop: string
  }
  featureCards: {
    badgeText: string
    titleLine1: string
    titleLine2: string
    iconName: string
    ctaText: string
    ctaUrl: string
  }
  officeGallery: {
    badgeText: string
    title: string
    iconName: string
  }
  menu: {
    title: string
    allCategoryLabel: string
    categorySelectLabel: string
    categorySelectPlaceholder: string
    allCategoryIconName: string
    defaultCategoryIconName: string
    errorText: string
    emptyAllText: string
    emptyCategoryText: string
  }
  location: {
    sectionTitle: string
    subtitle: string
    cityTitle: string
    visitTitle: string
    scheduleTitle: string
    scheduleDescription: string
    weekSchedule: string
    saturdaySchedule: string
    appointmentNote: string
    bannerTitle: string
    bannerDescription: string
    mapImageUrl: string
    mapImageAlt: string
    mapImageHeightMobile: string
    mapImageHeightDesktop: string
    mapLinkLabel: string
    visitIconName: string
    scheduleIconName: string
  }
  contact: {
    sectionTitle: string
    subtitle: string
    phoneLabel: string
    phoneHelp: string
    emailLabel: string
    emailHelp: string
    whatsappLabel: string
    whatsappHelp: string
    phoneIconName: string
    emailIconName: string
    whatsappIconName: string
  }
  footer: {
    linksTitle: string
    menuLinkText: string
    menuLinkUrl: string
    locationLinkText: string
    locationLinkUrl: string
    contactLinkText: string
    contactLinkUrl: string
    contactTitle: string
    transportBadgeText: string
    rightsText: string
    privacyLinkText: string
    privacyLinkUrl: string
    termsLinkText: string
    termsLinkUrl: string
  }
  stickyCta: {
    findUsText: string
    buttonText: string
    buttonUrl: string
  }
  seo: {
    siteUrl: string
    canonicalUrl: string
    siteName: string
    defaultTitle: string
    titleTemplate: string
    description: string
    keywords: string
    locale: string
    siteLanguage: string
    themeColor: string
    ogImageUrl: string
    ogImageAlt: string
    twitterImageUrl: string
    faviconUrl: string
    shortcutIconUrl: string
    appleIconUrl: string
    manifestUrl: string
    structuredDataJson: string
  }
}

const defaultStructuredData = JSON.stringify(
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://dlaenvios.com/#organization",
        name: "DLA Viajes y envios",
        url: "https://dlaenvios.com",
        logo: "https://dlaenvios.com/graphics/logo.svg",
        email: "info@dlaenvios.com",
        telephone: "+1 (407) 639-4011",
        sameAs: [
          "https://www.facebook.com/share/17so3zSUeL/?mibextid=wwXIfr",
          "https://www.instagram.com/dlaviajesyenvios?igsh=MWZzeWRmaTljYTYyZg==&utm_source=ig_contact_invite",
          "https://www.tiktok.com/@dla.viajes.y.envi?_r=1&_t=ZP-93ff0dcsaTu",
        ],
      },
      {
        "@type": "LocalBusiness",
        "@id": "https://dlaenvios.com/#localbusiness",
        name: "DLA Viajes y envios",
        description: "Agencia de viajes y envios en Orlando, Florida.",
        url: "https://dlaenvios.com",
        image: "https://dlaenvios.com/graphics/slide1.svg",
        address: {
          "@type": "PostalAddress",
          streetAddress: "4913 S Orange ave",
          addressLocality: "Orlando",
          addressRegion: "FL",
          postalCode: "32806",
          addressCountry: "US",
        },
        contactPoint: [
          {
            "@type": "ContactPoint",
            telephone: "+1 (407) 639-4011",
            contactType: "customer support",
            email: "info@dlaenvios.com",
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://dlaenvios.com/#website",
        url: "https://dlaenvios.com",
        name: "DLA Viajes y envios",
        description: "Sitio oficial de DLA Viajes y envios.",
        inLanguage: "es",
      },
    ],
  },
  null,
  2
)

export const defaultLandingContent: LandingContent = {
  business: {
    brandName: "Viajes y envios",
    brandTagline: "Donde conectamos con tu destino",
    cityLabel: "Orlando",
    address: "4913 S Orange ave Orlando FL 32806",
    phoneDisplay: "+1 (407) 639-4011",
    whatsappUrl: "https://wa.me/14076394011",
    email: "info@dlaenvios.com",
    trackingUrl: "https://www.solvebigtech.com/solvedc/tracking/dayready/",
    mapUrl: "https://share.google/6E5rfOKnE4ZSqUA36",
    facebookUrl: "https://www.facebook.com/share/17so3zSUeL/?mibextid=wwXIfr",
    instagramUrl:
      "https://www.instagram.com/dlaviajesyenvios?igsh=MWZzeWRmaTljYTYyZg==&utm_source=ig_contact_invite",
    tiktokUrl: "https://www.tiktok.com/@dla.viajes.y.envi?_r=1&_t=ZP-93ff0dcsaTu",
    logoUrl: "/graphics/logo.svg",
    logoAlt: "DLA Viajes y Envios",
    headerLogoHeightMobile: "40",
    headerLogoHeightDesktop: "48",
    footerLogoHeight: "48",
    supportImageUrl: "/graphics/truck.svg",
    supportImageAlt: "Camion de DLA",
    supportImageCompactHeight: "32",
    supportImageFeaturedHeight: "80",
  },
  header: {
    trackingButtonText: "Rastrear envio",
    loginButtonText: "Iniciar Sesion",
    loginUrl: "/login",
    navButtons: [
      {
        id: "header-nav-shipments",
        text: "Envios",
        url: "#menu",
        isVisible: true,
        position: 1,
      },
      {
        id: "header-nav-boxes",
        text: "Cajas Super Express",
        url: "#menu",
        isVisible: true,
        position: 2,
      },
      {
        id: "header-nav-electronics",
        text: "Electronicos",
        url: "#menu",
        isVisible: true,
        position: 3,
      },
    ],
  },
  hero: {
    titlePrimary: "DLA",
    titleSecondary: "Viajes y Envios",
    subtitle: "Donde conectamos con tu destino",
    scheduleTitle: "De Lunes a Sabado",
    weekSchedule: "Lunes a Viernes: 10:00 a.m. - 6:00 p.m.",
    saturdaySchedule: "Sabados: 10:00 a.m. - 2:00 p.m.",
    fallbackImageUrl: "/graphics/slide1.svg",
    fallbackImageAlt: "Imagen principal de DLA",
    addressPrefix: "En",
    imageHeightMobile: "400",
    imageHeightDesktop: "600",
  },
  featureCards: {
    badgeText: "Ofertas de servicio",
    titleLine1: "Descubre Nuestros",
    titleLine2: "Servicios",
    iconName: "Car",
    ctaText: "Ver todas las ofertas",
    ctaUrl: "#menu",
  },
  officeGallery: {
    badgeText: "Nuestras oficinas",
    title: "Conoce Nuestros Espacios",
    iconName: "Building2",
  },
  menu: {
    title: "Nuestras ofertas",
    allCategoryLabel: "Todos",
    categorySelectLabel: "Categoria",
    categorySelectPlaceholder: "Selecciona una categoría",
    allCategoryIconName: "BoxIcon",
    defaultCategoryIconName: "BoxIcon",
    errorText: "Error al cargar productos:",
    emptyAllText: "No hay productos disponibles",
    emptyCategoryText: "No hay productos disponibles en esta categoría",
  },
  location: {
    sectionTitle: "ORLANDO",
    subtitle: "Donde tus envios y suenos de viaje estan en las mejores manos",
    cityTitle: "Orlando",
    visitTitle: "De Lunes a Sabado!",
    scheduleTitle: "Horario",
    scheduleDescription:
      "Visitenos con frecuencia para que tu destino y tu paquete encuentren el mejor camino.",
    weekSchedule: "Lunes a Viernes: 10:00 a.m. - 6:00 p.m.",
    saturdaySchedule: "Sabados: 10:00 a.m. - 2:00 p.m.",
    appointmentNote:
      "Para su mayor comodidad, ofrecemos atencion fuera de horario con cita previa hasta las 9:00",
    bannerTitle: "Recogemos su paquete en la puerta de su casa",
    bannerDescription:
      "Obtenga servicio de recogida para sus envios y disfrute de la comodidad de enviar desde su hogar.",
    mapImageUrl: "/placeholder.svg",
    mapImageAlt: "Mapa de ubicacion de DLA",
    mapImageHeightMobile: "320",
    mapImageHeightDesktop: "560",
    mapLinkLabel: "Abrir mapa",
    visitIconName: "Calendar",
    scheduleIconName: "Clock",
  },
  contact: {
    sectionTitle: "Contactenos",
    subtitle:
      "Tienes alguna pregunta o quieres contratarnos para un viaje o envio? Contactanos.",
    phoneLabel: "Telefono",
    phoneHelp: "Llamanos directamente",
    emailLabel: "E-Mail",
    emailHelp: "Escribenos un correo electronico",
    whatsappLabel: "WhatsApp",
    whatsappHelp: "Escribenos por WhatsApp",
    phoneIconName: "Phone",
    emailIconName: "Mail",
    whatsappIconName: "Whatsapp",
  },
  footer: {
    linksTitle: "LINKS",
    menuLinkText: "Nuestras ofertas",
    menuLinkUrl: "#menu",
    locationLinkText: "Ubicacion",
    locationLinkUrl: "#location",
    contactLinkText: "Contactenos",
    contactLinkUrl: "#contact",
    contactTitle: "Contactenos",
    transportBadgeText: "Transporte seguro",
    rightsText: "Todos los derechos reservados.",
    privacyLinkText: "Politica de privacidad",
    privacyLinkUrl: "/datenschutz",
    termsLinkText: "Terminos y condiciones",
    termsLinkUrl: "/agb",
  },
  stickyCta: {
    findUsText: "Encuentranos en",
    buttonText: "WhatsApp",
    buttonUrl: "https://wa.me/14076394011",
  },
  seo: {
    siteUrl: "https://dlaenvios.com",
    canonicalUrl: "https://dlaenvios.com",
    siteName: "DLA Viajes y Envios",
    defaultTitle: "DLA Viajes y Envios",
    titleTemplate: "%s | DLA Viajes y Envios",
    description: "DLA Viajes y Envios. Agencia de viajes, envios y servicios en Orlando.",
    keywords: "dla envios, viajes, envios, orlando, agencia de viajes, paqueteria",
    locale: "es_US",
    siteLanguage: "es",
    themeColor: "#1a1a1a",
    ogImageUrl: "/graphics/slide1.svg",
    ogImageAlt: "DLA Viajes y Envios",
    twitterImageUrl: "/graphics/slide1.svg",
    faviconUrl: "/icon.svg",
    shortcutIconUrl: "/icon-light-32x32.png",
    appleIconUrl: "/apple-icon.png",
    manifestUrl: "/site.webmanifest",
    structuredDataJson: defaultStructuredData,
  },
}

function mergeSection<T extends Record<string, string>>(defaults: T, source: unknown): T {
  if (!source || typeof source !== "object") return defaults
  const output = { ...defaults }

  for (const key of Object.keys(defaults) as Array<keyof T>) {
    const value = (source as Record<string, unknown>)[key as string]
    if (typeof value === "string") {
      output[key] = value as T[keyof T]
    }
  }

  return output
}

function parseHeaderNavButtons(source: unknown): HeaderNavButton[] {
  if (!source || typeof source !== "object") {
    return defaultLandingContent.header.navButtons
  }

  const record = source as Record<string, unknown>
  const rawButtons = record.navButtons

  if (Array.isArray(rawButtons)) {
    const parsedButtons = rawButtons
      .map((item, index) => {
        if (!item || typeof item !== "object") return null
        const button = item as Record<string, unknown>
        const text = typeof button.text === "string" ? button.text.trim() : ""
        if (!text) return null

        const id =
          typeof button.id === "string" && button.id.trim().length > 0
            ? button.id
            : `header-nav-${index + 1}`
        const url = typeof button.url === "string" && button.url.trim().length > 0 ? button.url : "#menu"
        const isVisible = typeof button.isVisible === "boolean" ? button.isVisible : true
        const rawPosition = typeof button.position === "number" ? button.position : Number(button.position)
        const position = Number.isFinite(rawPosition) && rawPosition > 0 ? Math.floor(rawPosition) : index + 1

        return { id, text, url, isVisible, position }
      })
      .filter((button): button is HeaderNavButton => button !== null)

    return parsedButtons
  }

  const legacyButtons: HeaderNavButton[] = []
  const legacyFieldMapping = [
    { key: "navShipmentsText", fallback: "Envios" },
    { key: "navBoxesText", fallback: "Cajas Super Express" },
    { key: "navElectronicsText", fallback: "Electronicos" },
  ]

  legacyFieldMapping.forEach((legacyField, index) => {
    const value = record[legacyField.key]
    const text = typeof value === "string" && value.trim().length > 0 ? value : legacyField.fallback
    legacyButtons.push({
      id: `header-nav-legacy-${index + 1}`,
      text,
      url: "#menu",
      isVisible: true,
      position: index + 1,
    })
  })

  return legacyButtons.length > 0 ? legacyButtons : defaultLandingContent.header.navButtons
}

function mergeHeaderSection(source: unknown): LandingContent["header"] {
  const defaults = defaultLandingContent.header
  if (!source || typeof source !== "object") {
    return defaults
  }

  const record = source as Record<string, unknown>

  return {
    trackingButtonText:
      typeof record.trackingButtonText === "string" ? record.trackingButtonText : defaults.trackingButtonText,
    loginButtonText: typeof record.loginButtonText === "string" ? record.loginButtonText : defaults.loginButtonText,
    loginUrl: typeof record.loginUrl === "string" ? record.loginUrl : defaults.loginUrl,
    navButtons: parseHeaderNavButtons(record),
  }
}

export function parseLandingContent(raw: string | null | undefined): LandingContent {
  if (!raw) return defaultLandingContent

  try {
    const parsed = JSON.parse(raw) as Partial<LandingContent>
    return {
      business: mergeSection(defaultLandingContent.business, parsed.business),
      header: mergeHeaderSection(parsed.header),
      hero: mergeSection(defaultLandingContent.hero, parsed.hero),
      featureCards: mergeSection(defaultLandingContent.featureCards, parsed.featureCards),
      officeGallery: mergeSection(defaultLandingContent.officeGallery, parsed.officeGallery),
      menu: mergeSection(defaultLandingContent.menu, parsed.menu),
      location: mergeSection(defaultLandingContent.location, parsed.location),
      contact: mergeSection(defaultLandingContent.contact, parsed.contact),
      footer: mergeSection(defaultLandingContent.footer, parsed.footer),
      stickyCta: mergeSection(defaultLandingContent.stickyCta, parsed.stickyCta),
      seo: mergeSection(defaultLandingContent.seo, parsed.seo),
    }
  } catch {
    return defaultLandingContent
  }
}
