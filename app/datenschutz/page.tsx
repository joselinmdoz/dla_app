import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ArrowLeft } from "iconoir-react"

export const metadata = {
  title: "Privacy Policy | DLA Viajes y Envíos",
  description: "Privacy Policy of DLA Viajes y Envíos LLC - Information about the protection of your personal data",
}

export default function DatenschutzPage() {
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
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">PRIVACY POLICY</h1>
            <p className="text-muted-foreground">
              Information about the protection of your personal data
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary max-w-none space-y-8">

            {/* Introduction */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Company Information</h2>

              <div className="space-y-4 text-muted-foreground">
                <p className="text-sm">
                  DLA Viajes y Envíos LLC is a limited liability company organized under the laws of the State of Florida, United States, providing logistics facilitation, coordination, and package consolidation services.
                </p>
                <p className="text-sm">
                  The company does not operate as a carrier, does not perform international transportation directly, and does not act as a financial institution.
                </p>
              </div>
            </section>

            {/* Scope */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">2. Scope of This Policy</h2>

              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  This Privacy Policy explains how DLA Viajes y Envíos LLC collects, uses, protects, and shares personal information.
                </p>
                <p className="mt-2">
                  By using our services or platforms, you agree to the practices described herein.
                </p>
              </div>
            </section>

            {/* Information We Collect */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Information We Collect</h2>

              <div className="space-y-4 text-muted-foreground">
                <p className="text-sm">
                  We may collect personal and business information, including:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                  <li>Full name</li>
                  <li>Physical and contact address</li>
                  <li>Phone number and email address</li>
                  <li>Billing and payment information</li>
                  <li>Information required for logistics coordination</li>
                </ul>
                <p className="text-sm mt-4">
                  We do not intentionally collect sensitive personal data beyond what is necessary.
                </p>
              </div>
            </section>

            {/* Use of Information */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Use of Information</h2>

              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  Information collected is used solely to:
                </p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Provide requested services</li>
                  <li>Coordinate services with third-party providers</li>
                  <li>Process payments and billing</li>
                  <li>Comply with legal and regulatory obligations</li>
                  <li>Prevent fraud or misuse</li>
                </ul>
              </div>
            </section>

            {/* Information Sharing */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Information Sharing</h2>

              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  Information may be shared only with:
                </p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Independent logistics providers and carriers</li>
                  <li>Payment processors and technology providers</li>
                  <li>Government authorities when legally required</li>
                </ul>
                <p className="mt-4">
                  DLA Viajes y Envíos LLC does not sell or rent personal data.
                </p>
              </div>
            </section>

            {/* Legal Compliance */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">6. Legal Compliance</h2>

              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  The company operates under U.S. jurisdiction and complies with all applicable federal and state laws, including those related to international trade and economic sanctions.
                </p>
              </div>
            </section>

            {/* Data Security */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">7. Data Security</h2>

              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  We implement reasonable administrative, technical, and organizational safeguards to protect personal information against unauthorized access or misuse.
                </p>
              </div>
            </section>

            {/* Data Retention */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">8. Data Retention</h2>

              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  Personal information is retained only for as long as necessary to fulfill its intended purpose or as required by law.
                </p>
              </div>
            </section>

            {/* User Rights */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">9. User Rights</h2>

              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  Users may request access, correction, or deletion of their personal information by contacting:
                </p>
                <div className="bg-secondary/30 p-4 rounded mt-2">
                  <p>
                    Email: <a href="mailto:info@dlaenvios.com" className="text-primary hover:underline">info@dlaenvios.com</a>
                  </p>
                </div>
              </div>
            </section>

            {/* Policy Updates */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">10. Policy Updates</h2>

              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  DLA Viajes y Envíos LLC may update this Privacy Policy at any time. Updates become effective upon publication.
                </p>
              </div>
            </section>

            {/* Governing Law */}
            <section className="bg-card p-6 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">11. Governing Law</h2>

              <div className="space-y-2 text-muted-foreground text-sm">
                <p>
                  This Privacy Policy is governed by the laws of the State of Florida, United States.
                </p>
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
