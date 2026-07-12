import type { ComponentType } from "react"
import {
  ArrowDown,
  Calendar,
  Clock,
  Cycling,
  ElectronicsChip,
  Facebook,
  FastArrowRight,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Tiktok,
  User,
  Whatsapp,
} from "iconoir-react"
import {
  BoxIcon,
  Building2,
  Car,
  ChevronLeft,
  ChevronRight,
  Mail as LucideMail,
  MapPin as LucideMapPin,
  Phone as LucidePhone,
} from "lucide-react"

export type LandingIconComponent = ComponentType<{ className?: string }>

export const landingIconMap: Record<string, LandingIconComponent> = {
  ArrowDown,
  BoxIcon,
  Building2,
  Calendar,
  Car,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cycling,
  ElectronicsChip,
  Facebook,
  FastArrowRight,
  Instagram,
  LucideMail,
  LucideMapPin,
  LucidePhone,
  Mail,
  MapPin,
  Phone,
  Tiktok,
  User,
  Whatsapp,
}

export const landingIconOptions = Object.keys(landingIconMap).sort()

export function resolveLandingIcon(
  name: string | null | undefined,
  fallback = "BoxIcon"
): LandingIconComponent {
  if (name && landingIconMap[name]) {
    return landingIconMap[name]
  }

  return landingIconMap[fallback] || BoxIcon
}
