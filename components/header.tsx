"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, Xmark, MapPin, FastArrowRight, User, Facebook, Instagram, Tiktok } from "iconoir-react"
import { useLandingContent } from "@/hooks/use-landing-content"
import { resolvePublicAssetUrl } from "@/lib/public-asset-url"

function isExternalUrl(url: string) {
  return /^https?:\/\//i.test(url)
}

function normalizeHref(url: string) {
  const trimmed = url.trim()
  return trimmed.length > 0 ? trimmed : "#"
}

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { content, isSectionEnabled } = useLandingContent()
  const { business, header } = content
  const headerEnabled = isSectionEnabled("headerSectionEnabled")
  const visibleNavButtons = [...header.navButtons]
    .filter((button) => button.isVisible && button.text.trim().length > 0)
    .sort((a, b) => a.position - b.position)

  if (!headerEnabled) {
    return null
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-[80px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <img
              src={resolvePublicAssetUrl(business.logoUrl)}
              alt={business.logoAlt}
              className="h-10 md:h-12 w-auto"
            />
            <div className="hidden sm:block">
              <h1 className="text-primary font-bold text-2xl md:text-[2.15rem] tracking-wide uppercase leading-none">
                {business.brandName}
              </h1>
              <p className="text-muted-foreground text-xs tracking-[0.18em] mt-1">{business.brandTagline}</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex flex-1 min-w-0 items-center justify-end gap-3 lg:gap-4 pl-6">
            <Link
              href={business.trackingUrl}
              className="group shrink-0 whitespace-nowrap flex items-center gap-2 px-4 lg:px-6 py-2.5 border-2 border-primary text-primary font-bold text-[1rem] tracking-wide rounded-lg hover:bg-primary hover:text-primary-foreground transition-all"
            >
              {header.trackingButtonText}
              <FastArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="flex min-w-0 max-w-full items-center gap-4 lg:gap-5 overflow-x-auto px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {visibleNavButtons.map((button) => {
                const href = normalizeHref(button.url)
                const className =
                  "shrink-0 whitespace-nowrap text-foreground hover:text-primary transition-colors font-medium tracking-wide text-[1.06rem]"

                if (isExternalUrl(href)) {
                  return (
                    <a key={button.id} href={href} target="_blank" rel="noopener noreferrer" className={className}>
                      {button.text}
                    </a>
                  )
                }

                return (
                  <Link key={button.id} href={href} className={className}>
                    {button.text}
                  </Link>
                )
              })}
            </div>
            <div className="shrink-0 whitespace-nowrap flex items-center gap-1.5 text-accent">
              <MapPin className="w-[18px] h-[18px]" />
              <span className="text-[1rem] font-medium">{business.cityLabel}</span>
            </div>
            <Link
              href={header.loginUrl}
              className="shrink-0 whitespace-nowrap flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-[1rem]"
            >
              <User className="w-4 h-4" />
              {header.loginButtonText}
            </Link>
          </nav>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2">
            <Link
              href={business.trackingUrl}
              className="md:hidden group flex items-center gap-2 px-4 py-2 border-2 border-primary text-primary font-bold tracking-wider rounded-lg hover:bg-primary hover:text-primary-foreground transition-all text-sm"
            >
              {header.trackingButtonText}
              <FastArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <Xmark className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <nav className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {visibleNavButtons.map((button) => {
                const href = normalizeHref(button.url)
                const className = "text-foreground hover:text-primary transition-colors font-medium tracking-wide py-2"

                if (isExternalUrl(href)) {
                  return (
                    <a
                      key={button.id}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={className}
                      onClick={() => setIsOpen(false)}
                    >
                      {button.text}
                    </a>
                  )
                }

                return (
                  <Link key={button.id} href={href} className={className} onClick={() => setIsOpen(false)}>
                    {button.text}
                  </Link>
                )
              })}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-accent">
                  <MapPin className="w-5 h-5" />
                  <span className="text-sm font-medium">{business.cityLabel}</span>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={business.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-foreground hover:text-primary transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a
                    href={business.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-foreground hover:text-primary transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href={business.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-foreground hover:text-primary transition-colors"
                    aria-label="TikTok"
                  >
                    <Tiktok className="w-5 h-5" />
                  </a>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div></div>
                <Link
                  href={header.loginUrl}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-4 h-4" />
                  {header.loginButtonText}
                </Link>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
