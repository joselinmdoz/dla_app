import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { FeatureCards } from "@/components/feature-cards"
import { AboutSection } from "@/components/about-section"
import { MenuSection } from "@/components/menu-section"
import { OfficeGallery } from "@/components/office-gallery"
import { LocationSection } from "@/components/location-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { StickyCTA } from "@/components/sticky-cta"
import { getLandingContentServer, getStructuredDataFromContent } from "@/lib/site-settings"

export default async function Home() {
  const content = await getLandingContentServer()
  const structuredData = getStructuredDataFromContent(content.seo.structuredDataJson)

  return (
    <>
      {structuredData ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      ) : null}
      <main className="min-h-screen bg-background">
        <Header />
        <Hero />
        <FeatureCards />
        <MenuSection />
        <OfficeGallery />
        <LocationSection />
        <AboutSection />
        <ContactSection />
        <Footer />
        <StickyCTA />
      </main>
    </>
  )
}
