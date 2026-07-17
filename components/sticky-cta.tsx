"use client"

import { useState, useEffect } from "react"
import { Phone, MapPin } from "iconoir-react"
import { useLandingContent } from "@/hooks/use-landing-content"
import { resolvePublicAssetUrl } from "@/lib/public-asset-url"

export function StickyCTA() {
  const { content, isSectionEnabled } = useLandingContent()
  const [isVisible, setIsVisible] = useState(false)
  const stickyEnabled = isSectionEnabled("stickyCtaEnabled")

  useEffect(() => {
    const handleScroll = () => {
      // Show CTA after scrolling 300px
      setIsVisible(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!stickyEnabled || !isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-primary border-t-4 border-amber-600 shadow-2xl animate-in slide-in-from-bottom duration-300">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Location Info with Truck */}
          <div className="flex items-center gap-2 text-primary-foreground">
            <img
              src={resolvePublicAssetUrl(content.business.supportImageUrl)}
              alt={content.business.supportImageAlt}
              className="h-8 w-8 object-contain hidden md:block"
            />
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4" />
              <span className="font-bold">{content.stickyCta.findUsText}</span>
              <span className="hidden sm:inline">• {content.business.address}</span>
            </div>
          </div>

          {/* Call to Action */}
          <a
            href={content.stickyCta.buttonUrl} target="_blank" rel="noopener noreferrer"
            className="group flex items-center gap-2 px-6 py-2.5 bg-primary-foreground text-primary font-black tracking-wider rounded-lg hover:scale-105 transition-transform shadow-lg"
          >
            <Phone className="w-5 h-5 animate-pulse" />
            <span>{content.stickyCta.buttonText}</span>
          </a>
        </div>
      </div>
    </div>
  )
}
