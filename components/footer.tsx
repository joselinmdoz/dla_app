"use client"

import type { CSSProperties } from "react"
import Link from "next/link"
import { Phone, Mail, MapPin } from "iconoir-react"
import { useLandingContent } from "@/hooks/use-landing-content"
import { getSafePixelValue } from "@/lib/landing-media"

export function Footer() {
  const { content, isSectionEnabled } = useLandingContent()
  const footerEnabled = isSectionEnabled("footerSectionEnabled")
  const imageStyles = {
    "--footer-logo-height": getSafePixelValue(content.business.footerLogoHeight, 48, 24, 180),
    "--support-image-compact-height": getSafePixelValue(content.business.supportImageCompactHeight, 32, 16, 120),
  } as CSSProperties

  if (!footerEnabled) {
    return null
  }

  return (
    <footer className="py-12 pb-24 md:pb-12 bg-background border-t border-border">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/api/site-settings/assets/logo"
                alt={content.business.logoAlt}
                className="h-[var(--footer-logo-height)] w-auto max-w-[220px] object-contain shrink-0"
                style={imageStyles}
              />
              <div>
                <h3 className="text-primary font-bold text-lg tracking-wider uppercase">{content.business.brandName}</h3>
                <p className="text-muted-foreground text-xs tracking-widest">{content.business.brandTagline}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <img
                src="/api/site-settings/assets/support-image"
                alt={content.business.supportImageAlt}
                className="h-[var(--support-image-compact-height)] w-auto object-contain shrink-0"
                style={imageStyles}
              />
              <span className="text-xs font-medium">{content.footer.transportBadgeText}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-foreground font-bold mb-4 tracking-wide">{content.footer.linksTitle}</h4>
            <nav className="space-y-2">
              <Link href={content.footer.menuLinkUrl} className="block text-muted-foreground hover:text-primary transition-colors">
                {content.footer.menuLinkText}
              </Link>
              <Link href={content.footer.locationLinkUrl} className="block text-muted-foreground hover:text-primary transition-colors">
                {content.footer.locationLinkText}
              </Link>
              <Link href={content.footer.contactLinkUrl} className="block text-muted-foreground hover:text-primary transition-colors">
                {content.footer.contactLinkText}
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-foreground font-bold mb-4 tracking-wide">{content.footer.contactTitle}</h4>
            <div className="space-y-3">
              <a
                href={content.business.whatsappUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4" />
                {content.business.phoneDisplay}
              </a>
              <a
                href={`mailto:${content.business.email}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
                {content.business.email}
              </a>
              <p className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                {content.business.address}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-muted-foreground text-sm">
              <p>© {new Date().getFullYear()} {content.footer.rightsText}</p>
              {/* <span className="hidden md:inline">•</span>
              <Link href="/impressum" className="hover:text-primary transition-colors">
                Impressum
              </Link> */}
              <span>•</span>
              <Link href={content.footer.privacyLinkUrl} className="hover:text-primary transition-colors">
                {content.footer.privacyLinkText}
              </Link>
              <span>•</span>
              <Link href={content.footer.termsLinkUrl} className="hover:text-primary transition-colors">
                {content.footer.termsLinkText}
              </Link>
            </div>
            <div className="flex items-center justify-center md:justify-end gap-4 mt-4 md:mt-0">
              <a
                href={content.business.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-foreground hover:text-primary hover:bg-secondary/80 transition-all"
                aria-label="Facebook - DLA"
              >
                <svg width="1.5em" height="1.5em" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor" className="w-5 h-5">
                  <path d="M17 2H14C12.6739 2 11.4021 2.52678 10.4645 3.46447C9.52678 4.40215 9 5.67392 9 7V10H6V14H9V22H13V14H16L17 10H13V7C13 6.73478 13.1054 6.48043 13.2929 6.29289C13.4804 6.10536 13.7348 6 14 6H17V2Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </a>
              <a
                href={content.business.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-foreground hover:text-primary hover:bg-secondary/80 transition-all"
                aria-label="Instagram - DLA"
              >
                <svg width="1.5em" height="1.5em" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor" className="w-5 h-5">
                  <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"></path>
                  <path d="M3 16V8C3 5.23858 5.23858 3 8 3H16C18.7614 3 21 5.23858 21 8V16C21 18.7614 18.7614 21 16 21H8C5.23858 21 3 18.7614 3 16Z" stroke="currentColor"></path>
                  <path d="M17.5 6.51L17.51 6.49889" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </a>
              <a
                href={content.business.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-foreground hover:text-primary hover:bg-secondary/80 transition-all"
                aria-label="TikTok - DLA"
              >
                <svg width="1.5em" height="1.5em" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor" className="w-5 h-5">
                  <path d="M21 8V16C21 18.7614 18.7614 21 16 21H8C5.23858 21 3 18.7614 3 16V8C3 5.23858 5.23858 3 8 3H16C18.7614 3 21 5.23858 21 8Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"></path>
                  <path d="M10 12C8.34315 12 7 13.3431 7 15C7 16.6569 8.34315 18 10 18C11.6569 18 13 16.6569 13 15V6C13.3333 7 14.6 9 17 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
