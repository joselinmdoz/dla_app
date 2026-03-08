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
  }
  header: {
    trackingButtonText: string
    navShipmentsText: string
    navBoxesText: string
    navElectronicsText: string
    loginButtonText: string
  }
  hero: {
    titlePrimary: string
    titleSecondary: string
    subtitle: string
    scheduleTitle: string
    weekSchedule: string
    saturdaySchedule: string
    fallbackImageUrl: string
  }
  featureCards: {
    badgeText: string
    titleLine1: string
    titleLine2: string
  }
  menu: {
    title: string
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
  }
  footer: {
    linksTitle: string
    menuLinkText: string
    locationLinkText: string
    contactLinkText: string
    contactTitle: string
    transportBadgeText: string
    rightsText: string
    privacyLinkText: string
    termsLinkText: string
  }
  stickyCta: {
    findUsText: string
    buttonText: string
  }
}

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
  },
  header: {
    trackingButtonText: "Rastrear envio",
    navShipmentsText: "Envios",
    navBoxesText: "Cajas Super Express",
    navElectronicsText: "Electronicos",
    loginButtonText: "Iniciar Sesion",
  },
  hero: {
    titlePrimary: "DLA",
    titleSecondary: "Viajes y Envios",
    subtitle: "Donde conectamos con tu destino",
    scheduleTitle: "De Lunes a Sabado",
    weekSchedule: "Lunes a Viernes: 10:00 a.m. - 6:00 p.m.",
    saturdaySchedule: "Sabados: 10:00 a.m. - 2:00 p.m.",
    fallbackImageUrl: "/graphics/slide1.svg",
  },
  featureCards: {
    badgeText: "Ofertas de servicio",
    titleLine1: "Descubre Nuestros",
    titleLine2: "Servicios",
  },
  menu: {
    title: "Nuestras ofertas",
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
    mapImageUrl: "/map-of-ingolstadt-germany-westpark-area-street-map.jpg",
    mapImageAlt: "Mapa de ubicacion",
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
  },
  footer: {
    linksTitle: "LINKS",
    menuLinkText: "Nuestras ofertas",
    locationLinkText: "Ubicacion",
    contactLinkText: "Contactenos",
    contactTitle: "Contactenos",
    transportBadgeText: "Transporte seguro",
    rightsText: "Todos los derechos reservados.",
    privacyLinkText: "Politica de privacidad",
    termsLinkText: "Terminos y condiciones",
  },
  stickyCta: {
    findUsText: "Encuentranos en",
    buttonText: "WhatsApp",
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

export function parseLandingContent(raw: string | null | undefined): LandingContent {
  if (!raw) return defaultLandingContent

  try {
    const parsed = JSON.parse(raw) as Partial<LandingContent>
    return {
      business: mergeSection(defaultLandingContent.business, parsed.business),
      header: mergeSection(defaultLandingContent.header, parsed.header),
      hero: mergeSection(defaultLandingContent.hero, parsed.hero),
      featureCards: mergeSection(defaultLandingContent.featureCards, parsed.featureCards),
      menu: mergeSection(defaultLandingContent.menu, parsed.menu),
      location: mergeSection(defaultLandingContent.location, parsed.location),
      contact: mergeSection(defaultLandingContent.contact, parsed.contact),
      footer: mergeSection(defaultLandingContent.footer, parsed.footer),
      stickyCta: mergeSection(defaultLandingContent.stickyCta, parsed.stickyCta),
    }
  } catch {
    return defaultLandingContent
  }
}
