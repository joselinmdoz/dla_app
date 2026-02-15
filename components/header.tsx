"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, Xmark, MapPin, FastArrowRight, User, Facebook, Instagram, Tiktok } from "iconoir-react"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

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
              <h1 className="text-primary font-bold text-xl md:text-2xl tracking-wider uppercase">Viajes y envíos</h1>
              <p className="text-muted-foreground text-xs tracking-widest">Donde conectamos con tu destino</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="https://www.solvebigtech.com/solvedc/tracking/dayready/"
              className="group flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary font-bold tracking-wider rounded-lg hover:bg-primary hover:text-primary-foreground transition-all"
            >
              Rastrear envío
              <FastArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#menu"
              className="text-foreground hover:text-primary transition-colors font-medium tracking-wide"
            >
              Envíos
            </Link>
            <Link
              href="#menu"
              className="text-foreground hover:text-primary transition-colors font-medium tracking-wide"
            >
              Cajas Super Express
            </Link>
            <Link
              href="#menu"
              className="text-foreground hover:text-primary transition-colors font-medium tracking-wide"
            >
              Electrónicos
            </Link>
            <div className="flex items-center gap-2 text-accent">
              <MapPin className="w-5 h-5" />
              <span className="text-sm font-medium">Orlando</span>
            </div>
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <User className="w-4 h-4" />
              Iniciar Sesión
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
              href="https://www.solvebigtech.com/solvedc/tracking/dayready/"
              className="md:hidden group flex items-center gap-2 px-4 py-2 border-2 border-primary text-primary font-bold tracking-wider rounded-lg hover:bg-primary hover:text-primary-foreground transition-all text-sm"
            >
              Rastrear envío
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
              Envíos
              </Link>
              <Link
                href="#location"
                className="text-foreground hover:text-primary transition-colors font-medium tracking-wide py-2"
                onClick={() => setIsOpen(false)}
              >
                 Cajas Super Express
              </Link>
              <Link
                href="#contact"
                className="text-foreground hover:text-primary transition-colors font-medium tracking-wide py-2"
                onClick={() => setIsOpen(false)}
              >
                  Electrónicos
              </Link>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-accent">
                  <MapPin className="w-5 h-5" />
                  <span className="text-sm font-medium">Orlando</span>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href="https://www.facebook.com/share/17so3zSUeL/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-foreground hover:text-primary transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a
                    href="https://www.instagram.com/dlaviajesyenvios?igsh=MWZzeWRmaTljYTYyZg==&utm_source=ig_contact_invite"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-foreground hover:text-primary transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="https://www.tiktok.com/@dla.viajes.y.envi?_r=1&_t=ZP-93ff0dcsaTu"
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
                  Iniciar Sesión
                </Link>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
