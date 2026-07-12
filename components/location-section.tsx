"use client"

import { useLandingContent } from "@/hooks/use-landing-content"
import { resolveLandingIcon } from "@/lib/landing-icons"

export function LocationSection() {
  const { content, isSectionEnabled } = useLandingContent()
  const MapIcon = resolveLandingIcon("MapPin", "MapPin")
  const VisitIcon = resolveLandingIcon(content.location.visitIconName, "Calendar")
  const ScheduleIcon = resolveLandingIcon(content.location.scheduleIconName, "Clock")
  const locationEnabled = isSectionEnabled("locationSectionEnabled")

  if (!locationEnabled) {
    return null
  }

  return (
    <section id="location" className="py-20 md:py-32 bg-background">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Truck Icon */}
        <div className="text-center mb-12 md:mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <img
              src={content.business.supportImageUrl}
              alt={content.business.supportImageAlt}
              className="h-16 w-16 object-contain"
            />
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary tracking-tight">{content.location.sectionTitle}</h2>
            <img
              src={content.business.supportImageUrl}
              alt={content.business.supportImageAlt}
              className="h-16 w-16 object-contain transform scale-x-[-1]"
            />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {content.location.subtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Map Placeholder */}
          <div className="relative aspect-video lg:aspect-square rounded-2xl overflow-hidden bg-secondary">
            <img src={content.location.mapImageUrl} alt={content.location.mapImageAlt} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-background/40" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="absolute -inset-4 bg-accent/30 rounded-full animate-ping" />
                <div className="relative w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                 <a
                href={content.business.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
             
                aria-label={content.location.mapLinkLabel}
                 >
                  <MapIcon className="w-6 h-6 text-accent-foreground" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Location Info */}
          <div className="space-y-8">
            {/* Main Location Card */}
            <div className="p-8 bg-card border border-border rounded-2xl">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                <a
                href={content.business.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
             
                aria-label={content.location.mapLinkLabel}
                 >
                  <MapIcon className="w-6 h-6 text-accent-foreground" />
                </a>  
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">{content.location.cityTitle}</h3>
                  <p className="text-lg text-muted-foreground">
                   {content.business.address}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <VisitIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{content.location.visitTitle}</h3>
                  <p className="text-muted-foreground">{content.location.scheduleDescription}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <ScheduleIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
              <h3 className="text-xl font-bold text-foreground mb-2">{content.location.scheduleTitle}</h3>
              <p className="text-muted-foreground">🗓 {content.location.weekSchedule}</p>
              <p className="text-muted-foreground">🗓 {content.location.saturdaySchedule}</p>
              <p className="text-muted-foreground mt-2 text-sm">📌 {content.location.appointmentNote}</p>
            </div>
              </div>
            </div>

            {/* Events Banner */}
            <div className="p-6 bg-primary/10 border border-primary/30 rounded-xl">
              <h4 className="text-xl font-bold text-primary mb-2">{content.location.bannerTitle}</h4>
              <p className="text-foreground">
               {content.location.bannerDescription}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
