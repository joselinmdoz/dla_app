"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, Xmark, MapPin, FastArrowRight, User, Facebook, Instagram, Tiktok } from "iconoir-react"
import { useLandingContent } from "@/hooks/use-landing-content"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { content, isSectionEnabled } = useLandingContent()
  const { business, header } = content
  const headerEnabled = isSectionEnabled("headerSectionEnabled")

  if (!headerEnabled) {
    return null
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/graphics/logo.svg"
              alt="DLA"
              className="h-12 md:h-16 w-auto"
            />
            <div className="hidden sm:block">
              <h1 className="text-primary font-bold text-xl md:text-2xl tracking-wider uppercase">{business.brandName}</h1>
              <p className="text-muted-foreground text-xs tracking-widest">{business.brandTagline}</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href={business.trackingUrl}
              className="group flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary font-bold tracking-wider rounded-lg hover:bg-primary hover:text-primary-foreground transition-all"
            >
              {header.trackingButtonText}
              <FastArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#menu"
              className="text-foreground hover:text-primary transition-colors font-medium tracking-wide"
            >
              {header.navShipmentsText}
            </Link>
            <Link
              href="#menu"
              className="text-foreground hover:text-primary transition-colors font-medium tracking-wide"
            >
              {header.navBoxesText}
            </Link>
            <Link
              href="#menu"
              className="text-foreground hover:text-primary transition-colors font-medium tracking-wide"
            >
              {header.navElectronicsText}
            </Link>
            <div className="flex items-center gap-2 text-accent">
              <MapPin className="w-5 h-5" />
              <span className="text-sm font-medium">{business.cityLabel}</span>
            </div>
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <User className="w-4 h-4" />
              {header.loginButtonText}
            </Link>
          </nav>

          {/* Halal Badge */}
          {/* <div className="hidden lg:flex items-center gap-4">
            <img
              src="/graphics/halal logo.svg"
              alt="100% Halal"
              className="h-12 w-auto"
            />
          </div> */}

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
              <Link
                href="#menu"
                className="text-foreground hover:text-primary transition-colors font-medium tracking-wide py-2"
                onClick={() => setIsOpen(false)}
              >
              {header.navShipmentsText}
              </Link>
              <Link
                href="#location"
                className="text-foreground hover:text-primary transition-colors font-medium tracking-wide py-2"
                onClick={() => setIsOpen(false)}
              >
                 {header.navBoxesText}
              </Link>
              <Link
                href="#contact"
                className="text-foreground hover:text-primary transition-colors font-medium tracking-wide py-2"
                onClick={() => setIsOpen(false)}
              >
                  {header.navElectronicsText}
              </Link>
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
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
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
