"use client"

import {
  BadgeCheck,
  Building2,
  ChevronDown,
  Eye,
  MessageSquare,
  Package,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react"
import { useLandingContent } from "@/hooks/use-landing-content"

type CompactCardProps = {
  title: string
  description: string
  icon: typeof Building2
  label: string
}

function CompactCard({ title, description, icon: Icon, label }: CompactCardProps) {
  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/40">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-start gap-3 [&::-webkit-details-marker]:hidden">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1 pt-0.5">
            <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
            <span className="block text-lg font-bold leading-6 text-foreground">{title}</span>
          </span>
          <ChevronDown className="mt-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
        </summary>
        <p className="ml-[52px] pt-3 text-sm leading-6 text-muted-foreground">{description}</p>
      </details>
    </article>
  )
}

export function AboutSection() {
  const { content, isSectionEnabled } = useLandingContent()

  if (!isSectionEnabled("aboutSectionEnabled")) return null

  const principles = [
    { title: content.about.visionTitle, description: content.about.visionDescription, icon: Eye, label: "Nuestra visión" },
    { title: content.about.missionTitle, description: content.about.missionDescription, icon: Target, label: "Nuestra misión" },
  ]

  const values = [
    { title: content.about.commitmentTitle, description: content.about.commitmentDescription, icon: Target },
    { title: content.about.responsibilityTitle, description: content.about.responsibilityDescription, icon: Package },
    { title: content.about.trustTitle, description: content.about.trustDescription, icon: ShieldCheck },
    { title: content.about.qualityTitle, description: content.about.qualityDescription, icon: BadgeCheck },
    { title: content.about.respectTitle, description: content.about.respectDescription, icon: Users },
    { title: content.about.personalizedAttentionTitle, description: content.about.personalizedAttentionDescription, icon: MessageSquare },
  ]

  return (
    <section id="nosotros" className="bg-muted/20 py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-3 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Building2 className="h-4 w-4" />
              {content.about.badgeText}
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">{content.about.sectionTitle}</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground md:text-base">{content.about.subtitle}</p>
        </header>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </span>
              <h3 className="text-xl font-bold text-foreground md:text-2xl">{content.about.introTitle}</h3>
            </div>
            <p className="text-sm leading-6 text-muted-foreground md:text-base">{content.about.introParagraph1}</p>
            <details className="group mt-3 border-t border-border pt-3">
              <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-primary [&::-webkit-details-marker]:hidden">
                Conoce más sobre DLA
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="space-y-3 pt-3 text-sm leading-6 text-muted-foreground">
                <p>{content.about.introParagraph2}</p>
                <p>{content.about.introParagraph3}</p>
              </div>
            </details>
          </article>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {principles.map((item) => <CompactCard key={item.label} {...item} />)}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-primary">
                <ShieldCheck className="h-4 w-4" />
                {content.about.valuesBadgeText}
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">{content.about.valuesTitle}</h3>
            </div>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">{content.about.valuesSubtitle}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {values.map((item) => <CompactCard key={item.title} label="Valor" {...item} />)}
          </div>
        </div>
      </div>
    </section>
  )
}
