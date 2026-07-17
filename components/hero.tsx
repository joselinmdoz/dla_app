"use client"

import { ArrowDown, FastArrowRight, Phone } from "iconoir-react"
import Link from "next/link"
import { useHeroSlides } from '@/hooks/use-hero-slides'
import { useLandingContent } from "@/hooks/use-landing-content"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { resolvePublicAssetUrl } from "@/lib/public-asset-url"

export function Hero() {
  const { content, isSectionEnabled } = useLandingContent()
  const { slides, currentSlide, isLoading, nextSlide, prevSlide, goToSlide } = useHeroSlides(5000)
  const heroEnabled = isSectionEnabled("heroSectionEnabled")
  const heroSlidesEnabled = isSectionEnabled("heroSlidesEnabled", true)

  if (!heroEnabled) {
    return null
  }

  return (
    <section className="relative min-h-screen flex items-center pt-20 md:pt-28 overflow-hidden bg-black">
      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-amber-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="text-center md:text-left order-2 md:order-1">
            {/* Main Title */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-4">
              <span className="text-primary">{content.hero.titlePrimary}</span>
              <br />
              <span className="text-foreground">{content.hero.titleSecondary}</span>
            </h1>

            {/* Tagline */}
            <p className="text-xl sm:text-2xl md:text-3xl text-muted-foreground font-light tracking-wide mb-8 max-w-2xl mx-auto md:mx-0">
              {content.hero.subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 mb-8">
              <a
                href={content.business.whatsappUrl} target="_blank" rel="noopener noreferrer"
                className="group flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground font-bold tracking-wider rounded-lg hover:bg-primary/90 transition-all shadow-2xl shadow-primary/50 w-full sm:w-auto justify-center"
              >
                <Phone className="w-5 h-5" />
                {content.business.phoneDisplay}
              </a>
              <Link
                href={content.business.trackingUrl}
                className="group flex items-center gap-2 px-8 py-4 border-2 border-primary text-primary font-bold tracking-wider rounded-lg hover:bg-primary hover:text-primary-foreground transition-all w-full sm:w-auto justify-center"
              >
                {content.header.trackingButtonText}
                <FastArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Location Badge */}
            <div className="max-w-xl mx-auto md:mx-0 mb-16 p-6 md:p-8 bg-primary/10 rounded-2xl border-2 border-primary/30 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-4 md:gap-6">
                <img
                  src={resolvePublicAssetUrl(content.business.supportImageUrl)}
                  alt={content.business.supportImageAlt}
                  className="h-16 w-16 md:h-20 md:w-20 object-contain flex-shrink-0"
                />
                <div className="text-left">
                  <p className="text-primary font-black text-2xl md:text-3xl lg:text-4xl mb-1">{content.hero.scheduleTitle}</p>
                  <p className="text-foreground font-bold text-base md:text-lg lg:text-xl">{content.hero.addressPrefix} {content.business.address}</p>
                 <p className="text-muted-foreground text-sm md:text-base mt-1" >🗓 {content.hero.weekSchedule}</p>
                 <p className="text-muted-foreground text-sm md:text-base mt-1">🗓 {content.hero.saturdaySchedule}</p>
                  {/* <p className="text-muted-foreground text-sm md:text-base mt-1">10:00AM - 6:00PM</p> */}
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Carousel */}
          <div className="order-1 md:order-2 relative">
            <div className="relative w-full h-[400px] md:h-[600px] flex items-center justify-center">
              {/* Glow Effects */}
              <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent animate-pulse" />

              {/* Slides Container */}
              <div className="relative w-full h-full">
                {!heroSlidesEnabled ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <img
                      src={resolvePublicAssetUrl(content.hero.fallbackImageUrl)}
                      alt={content.hero.fallbackImageAlt}
                      className="w-full h-full object-contain drop-shadow-[0_0_80px_rgba(251,191,36,0.5)] animate-float"
                    />
                  </div>
                ) : isLoading ? (
                  // Loading skeleton
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
                  </div>
                ) : slides.length === 0 ? (
                  // Fallback image when no slides
                  <div className="w-full h-full flex items-center justify-center">
                    <img
                      src={resolvePublicAssetUrl(content.hero.fallbackImageUrl)}
                      alt={content.hero.fallbackImageAlt}
                      className="w-full h-full object-contain drop-shadow-[0_0_80px_rgba(251,191,36,0.5)] animate-float"
                    />
                  </div>
                ) : (
                  // Carousel slides
                  <>
                    {slides.map((slide, index) => (
                      <div
                        key={slide.id}
                        className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                          index === currentSlide
                            ? 'opacity-100 scale-100 translate-x-0'
                            : index === (currentSlide - 1 + slides.length) % slides.length
                            ? 'opacity-0 scale-95 -translate-x-full'
                            : 'opacity-0 scale-95 translate-x-full'
                        }`}
                      >
                        {slide.linkUrl ? (
                          <a href={slide.linkUrl} target="_blank" rel="noopener noreferrer">
                            <img
                              src={`/api/hero-slides/${slide.id}/serve`}
                              alt={slide.altText}
                              className="w-full h-full object-contain drop-shadow-[0_0_80px_rgba(251,191,36,0.5)] animate-float"
                            />
                          </a>
                        ) : (
                          <img
                            src={`/api/hero-slides/${slide.id}/serve`}
                            alt={slide.altText}
                            className="w-full h-full object-contain drop-shadow-[0_0_80px_rgba(251,191,36,0.5)] animate-float"
                          />
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Carousel Controls - Only show if there are multiple slides */}
              {slides.length > 1 && heroSlidesEnabled && (
                <>
                  {/* Navigation Arrows */}
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-primary transition-colors"
                    aria-label="Slide anterior"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-primary transition-colors"
                    aria-label="Siguiente slide"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  {/* Dots Indicator */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === currentSlide
                            ? 'bg-primary scale-110'
                            : 'bg-white/50 hover:bg-white/80'
                        }`}
                        aria-label={`Ir a slide ${index + 1}`}
                      />
                    ))}
                  </div>

                  {/* Auto-play Toggle */}
                  {/* <button
                    onClick={toggleAutoPlay}
                    className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-primary transition-colors"
                    aria-label={isAutoPlaying ? 'Pausar autoplay' : 'Iniciar autoplay'}
                  >
                    {isAutoPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </button> */}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ArrowDown className="w-6 h-6 text-primary" />
        </div>
      </div>
    </section>
  )
}
