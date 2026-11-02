import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { getServicePage, SERVICE_PAGE_SLUGS } from "@/lib/service-pages"

type PageProps = { params: Promise<{ slug: string }> }

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await getServicePage((await params).slug)
  if (!page || !page.published) return {}
  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription,
    alternates: { canonical: `/${page.slug}` },
    openGraph: { title: page.seoTitle || page.title, description: page.seoDescription, type: "website" },
  }
}

export function generateStaticParams() {
  return SERVICE_PAGE_SLUGS.map((slug) => ({ slug }))
}

function hasText(value: string) {
  return value.trim().length > 0
}

export default async function ServicePage({ params }: PageProps) {
  const page = await getServicePage((await params).slug)
  if (!page || !page.published) notFound()
  const { sections } = page
  const faqSchema = sections.faq.enabled && sections.faq.items.length > 0
    ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: sections.faq.items.filter((item) => hasText(item.question) && hasText(item.answer)).map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) }
    : null

  return (
    <main className="min-h-screen bg-background text-foreground">
      {faqSchema ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} /> : null}
      <header className="border-b border-border bg-background">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5" aria-label="Navegación principal">
          <Link href="/" className="font-bold text-primary">DLA Viajes y Envíos</Link>
          <div className="flex flex-wrap gap-4 text-sm font-medium">
            <Link href="/precios-envios-cuba">Precios</Link>
            <Link href="/tiempos-de-entrega-cuba">Tiempos de entrega</Link>
            <Link href="/envios-a-cuba-desde-orlando">Envíos desde Orlando</Link>
          </div>
        </nav>
      </header>
      <article className="mx-auto max-w-4xl px-6 py-14 md:py-20">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">DLA Viajes y Envíos</p>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{page.title}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">{page.intro}</p>
        {hasText(page.lastUpdated) ? <p className="mt-4 text-sm text-muted-foreground">Última actualización: <time>{page.lastUpdated}</time></p> : null}

        {sections.shipping.enabled && (hasText(sections.shipping.description) || sections.shipping.rows.length > 0) ? <section className="mt-14" aria-labelledby="shipping-title">
          <h2 id="shipping-title" className="text-2xl font-bold">{sections.shipping.title}</h2>
          {hasText(sections.shipping.description) ? <p className="mt-3 leading-7 text-muted-foreground">{sections.shipping.description}</p> : null}
          {sections.shipping.rows.length > 0 ? <InfoCards rows={sections.shipping.rows} valueLabel="Precio" /> : null}
        </section> : null}

        {sections.pricing.enabled && (hasText(sections.pricing.description) || sections.pricing.rows.length > 0) ? <section className="mt-14" aria-labelledby="pricing-title">
          <h2 id="pricing-title" className="text-2xl font-bold">{sections.pricing.title}</h2>
          {hasText(sections.pricing.description) ? <p className="mt-3 leading-7 text-muted-foreground">{sections.pricing.description}</p> : null}
          {sections.pricing.rows.length > 0 ? <InfoCards rows={sections.pricing.rows} valueLabel="Precio" /> : null}
        </section> : null}

        {sections.delivery.enabled && (hasText(sections.delivery.description) || sections.delivery.rows.length > 0) ? <section className="mt-14" aria-labelledby="delivery-title">
          <h2 id="delivery-title" className="text-2xl font-bold">{sections.delivery.title}</h2>
          {hasText(sections.delivery.description) ? <p className="mt-3 leading-7 text-muted-foreground">{sections.delivery.description}</p> : null}
          {sections.delivery.rows.length > 0 ? <InfoCards rows={sections.delivery.rows} valueLabel="Plazo estimado" /> : null}
        </section> : null}

        {sections.details.enabled && sections.details.items.filter(hasText).length > 0 ? <ListSection title={sections.details.title} items={sections.details.items} /> : null}
        {sections.coverage.enabled && (hasText(sections.coverage.description) || sections.coverage.items.filter(hasText).length > 0) ? <section className="mt-14"><h2 className="text-2xl font-bold">{sections.coverage.title}</h2>{hasText(sections.coverage.description) ? <p className="mt-3 leading-7 text-muted-foreground">{sections.coverage.description}</p> : null}<ul className="mt-5 list-disc space-y-2 pl-6 leading-7">{sections.coverage.items.filter(hasText).map((item, index) => <li key={index}>{item}</li>)}</ul></section> : null}
        {sections.faq.enabled && sections.faq.items.filter((item) => hasText(item.question) && hasText(item.answer)).length > 0 ? <section className="mt-14"><h2 className="text-2xl font-bold">{sections.faq.title}</h2><div className="mt-5 space-y-4">{sections.faq.items.filter((item) => hasText(item.question) && hasText(item.answer)).map((item, index) => <details key={index} className="rounded-lg border border-border p-5"><summary className="cursor-pointer font-semibold">{item.question}</summary><p className="mt-3 leading-7 text-muted-foreground">{item.answer}</p></details>)}</div></section> : null}
        {sections.cta.enabled ? <section className="mt-14 rounded-xl bg-muted p-8"><h2 className="text-2xl font-bold">{sections.cta.title}</h2><p className="mt-3 leading-7 text-muted-foreground">{sections.cta.description}</p>{hasText(sections.cta.buttonUrl) && hasText(sections.cta.buttonText) ? <a className="mt-6 inline-flex rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground" href={sections.cta.buttonUrl}>{sections.cta.buttonText}</a> : null}</section> : null}
      </article>
    </main>
  )
}

function InfoCards({ rows, valueLabel }: { rows: Array<{ name: string; price: string; description: string }>; valueLabel: string }) {
  return <div className="mt-6 grid gap-4 sm:grid-cols-2">{rows.map((row, index) => <section key={index} className="rounded-xl border border-border bg-card p-6 shadow-sm"><div className="flex items-start justify-between gap-4"><h3 className="text-lg font-bold">{row.name}</h3><div className="shrink-0 text-right"><p className="text-xs font-medium text-muted-foreground">{valueLabel}</p><p className="text-2xl font-bold text-primary">{row.price}</p></div></div>{hasText(row.description) ? <p className="mt-4 leading-7 text-muted-foreground">{row.description}</p> : null}</section>)}</div>
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  return <section className="mt-14"><h2 className="text-2xl font-bold">{title}</h2><ul className="mt-5 list-disc space-y-2 pl-6 leading-7">{items.filter(hasText).map((item, index) => <li key={index}>{item}</li>)}</ul></section>
}
