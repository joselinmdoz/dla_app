import Link from "next/link"
import { Instagram, Phone, Mail, MapPin, Whatsapp } from "iconoir-react"

export function Footer() {
  return (
    <footer className="py-12 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/graphics/logo.svg"
                alt="DLA Viajes y Envíos"
                className="h-12 w-12 object-contain"
              />
              <div>
                <h3 className="text-primary font-bold text-lg tracking-wider uppercase">Viajes y envíos</h3>
                <p className="text-muted-foreground text-xs tracking-widest">Donde conectamos con tu destino</p>
              </div>
            </div>
            {/* <p className="text-muted-foreground text-sm mb-3">
              Premium Halal Street Food in Ingolstadt. Burger, Fried Chicken, Currywurst und mehr.
            </p> */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <img
                src="/graphics/truck.svg"
                alt="Food Truck"
                className="h-8 w-8 object-contain"
              />
              <span className="text-xs font-medium">Transporte seguro</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-foreground font-bold mb-4 tracking-wide">LINKS</h4>
            <nav className="space-y-2">
              <Link href="#menu" className="block text-muted-foreground hover:text-primary transition-colors">
                Nuestras ofertas
              </Link>
              <Link href="#location" className="block text-muted-foreground hover:text-primary transition-colors">
                Ubicación
              </Link>
              <Link href="#contact" className="block text-muted-foreground hover:text-primary transition-colors">
                Contáctenos
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-foreground font-bold mb-4 tracking-wide">Contáctenos</h4>
            <div className="space-y-3">
              <a
                href="https://wa.me/14076394011" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4" />
                +1 (407) 639-4011
              </a>
              <a
                href="mailto:info@dlaenvios.com"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
                info@dlaenvios.com
              </a>
              <p className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                4913 S Orange ave Orlando FL 32806
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-muted-foreground text-sm">
              <p>© {new Date().getFullYear()} Todos los derechos reservados.</p>
              {/* <span className="hidden md:inline">•</span>
              <Link href="/impressum" className="hover:text-primary transition-colors">
                Impressum
              </Link> */}
              <span>•</span>
              <Link href="/datenschutz" className="hover:text-primary transition-colors">
                Política de privacidad
              </Link>
              <span>•</span>
              <Link href="/agb" className="hover:text-primary transition-colors">
                Términos y condiciones
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {/* <img
                src="/graphics/halal logo.svg"
                alt="100% Halal Certified"
                className="h-10 md:h-12 w-auto"
              /> */}
              <a
                href="https://www.instagram.com/thefoodiewagon"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-foreground hover:text-primary hover:bg-secondary/80 transition-all"
                aria-label="Whatsapp"
              >
                <Whatsapp className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
