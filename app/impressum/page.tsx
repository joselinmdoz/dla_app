import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ArrowLeft } from "iconoir-react"

export const metadata = {
  title: "Aviso legal | DLA Viajes y Envíos",
  description: "Información legal y de contacto de DLA Viajes y Envíos.",
}

export default function ImpressumPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </Link>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Aviso legal</h1>
            <p className="text-muted-foreground">
              Información legal y de contacto del sitio web.
            </p>
          </div>

          <div className="prose prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary max-w-none space-y-8">
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">Entidad</h2>
              <div className="space-y-2 text-muted-foreground">
                <p><strong className="text-foreground">Nombre comercial:</strong> DLA Viajes y Envíos</p>
                <p><strong className="text-foreground">Entidad legal:</strong> DLA Viajes y Envíos LLC</p>
                <p><strong className="text-foreground">Actividad:</strong> Coordinación de viajes, envíos y servicios logísticos.</p>
                <p><strong className="text-foreground">Jurisdicción:</strong> Florida, Estados Unidos.</p>
              </div>
            </section>

            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">Domicilio comercial</h2>
              <div className="space-y-1 text-muted-foreground">
                <p>DLA Viajes y Envíos LLC</p>
                <p>4913 S Orange Ave</p>
                <p>Orlando, FL 32806</p>
                <p>United States</p>
              </div>
            </section>

            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">Contacto</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Teléfono:</strong>{" "}
                  <a href="https://wa.me/14076394011" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    +1 (407) 639-4011
                  </a>
                </p>
                <p>
                  <strong className="text-foreground">E-Mail:</strong>{" "}
                  <a href="mailto:info@dlaenvios.com" className="text-primary hover:underline">
                    info@dlaenvios.com
                  </a>
                </p>
                <p>
                  <strong className="text-foreground">Sitio web:</strong>{" "}
                  <a href="https://dlaenvios.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    https://dlaenvios.com
                  </a>
                </p>
              </div>
            </section>

            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">Alcance del servicio</h2>
              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  DLA Viajes y Envíos ofrece servicios de coordinación, gestión y apoyo operativo
                  relacionados con viajes, envíos y logística.
                </p>
                <p>
                  La información publicada en este sitio tiene carácter informativo y comercial.
                </p>
              </div>
            </section>

            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">Responsabilidad</h2>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Contenidos</h3>
                  <p className="text-sm">
                    Hacemos esfuerzos razonables para mantener la información de este sitio actualizada
                    y correcta, pero no garantizamos la ausencia de errores u omisiones.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Enlaces externos</h3>
                  <p className="text-sm">
                    Este sitio puede incluir enlaces a páginas de terceros. No controlamos sus contenidos
                    ni asumimos responsabilidad por ellos.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Propiedad intelectual</h3>
                  <p className="text-sm">
                    Los textos, imágenes, marcas y demás contenidos de este sitio están protegidos por las
                    normas aplicables de propiedad intelectual y no pueden reutilizarse sin autorización.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-secondary/30 p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">Más información</h2>
              <div className="space-y-2">
                <Link href="/datenschutz" className="block text-primary hover:underline">
                  → Privacy Policy
                </Link>
                <Link href="/agb" className="block text-primary hover:underline">
                  → Terms and Conditions
                </Link>
              </div>
            </section>

            <div className="text-sm text-muted-foreground text-center pt-8 border-t border-border">
              <p>Actualizado: 9 de julio de 2026</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
