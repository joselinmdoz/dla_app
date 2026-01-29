import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ArrowLeft } from "iconoir-react"

export const metadata = {
  title: "Terms and Conditions | DLA Viajes y Envíos",
  description: "Terms and Conditions of DLA Viajes y Envíos LLC - Logistics services terms",
}

export default function AGBPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </Link>

          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              TERMS AND CONDITIONS
            </h1>
            <p className="text-muted-foreground">
              DLA Viajes y Envíos LLC
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary max-w-none space-y-8">

            {/* Section 1 */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>

              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  By using the services of DLA Viajes y Envíos LLC, the customer agrees to these Terms and Conditions in full.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">2. Nature of Services</h2>

              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  DLA Viajes y Envíos LLC provides logistics facilitation, coordination, and package consolidation services. The company does not operate as a carrier and does not perform international transportation services directly.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Third-Party Providers</h2>

              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  All transportation, customs clearance, and final delivery services are performed by independent third-party providers. DLA Viajes y Envíos LLC does not control or operate such services.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Limitation of Liability</h2>

              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  DLA Viajes y Envíos LLC shall not be liable for:
                </p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Delays</li>
                  <li>Losses</li>
                  <li>Damages</li>
                  <li>Customs holds</li>
                  <li>Government decisions</li>
                  <li>Acts or omissions of third parties</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Payments</h2>

              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  All payments received represent fees for logistics and coordination services only. The company does not transmit money, hold customer funds, or act as a financial intermediary.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">6. Prohibited Items</h2>

              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  Customers are responsible for ensuring compliance with applicable laws regarding prohibited or restricted items. The company reserves the right to refuse any service request.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">7. Cancellations and Refunds</h2>

              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  Once logistics coordination services have commenced, fees are non-refundable unless otherwise stated in writing.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">8. Modifications</h2>

              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  DLA Viajes y Envíos LLC may modify these Terms at any time. Updated terms will be effective upon publication.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">9. Governing Law</h2>

              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  These Terms shall be governed by the laws of the State of Florida, United States.
                </p>
              </div>
            </section>

            {/* Contact for Questions */}
            <section className="bg-secondary/30 p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">Questions about these Terms?</h2>
              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  For questions regarding these Terms and Conditions, please contact us:
                </p>
                <div className="mt-4 space-y-1">
                  <p>
                    <strong className="text-foreground">Phone:</strong>{" "}
                    <a href="https://wa.me/14076394011" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      +1 (407) 639-4011
                    </a>
                  </p>
                  <p>
                    <strong className="text-foreground">Email:</strong>{" "}
                    <a href="mailto:info@dlaenvios.com" className="text-primary hover:underline">
                      info@dlaenvios.com
                    </a>
                  </p>
                </div>
              </div>
            </section>

            {/* Additional Links */}
            <section className="bg-secondary/30 p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">Additional Information</h2>
              <div className="space-y-2">
                <Link
                  href="/impressum"
                  className="block text-primary hover:underline"
                >
                  → Legal Notice
                </Link>
                <Link
                  href="/datenschutz"
                  className="block text-primary hover:underline"
                >
                  → Privacy Policy
                </Link>
              </div>
            </section>

            {/* Last Updated */}
            <div className="text-sm text-muted-foreground text-center pt-8 border-t border-border">
              <p>Last Updated: 05/01/2026</p>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
