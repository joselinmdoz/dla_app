"use client"

import {
  BadgeCheck,
  Building2,
  Eye,
  MessageSquare,
  Package,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react"
import { useLandingContent } from "@/hooks/use-landing-content"

export function AboutSection() {
  const { content, isSectionEnabled } = useLandingContent()
  const aboutEnabled = isSectionEnabled("aboutSectionEnabled")

  if (!aboutEnabled) {
    return null
  }

  const principleCards = [
    {
      title: content.about.visionTitle,
      description: content.about.visionDescription,
      icon: Eye,
    },
    {
      title: content.about.missionTitle,
      description: content.about.missionDescription,
      icon: Target,
    },
  ]

  const values = [
    {
      title: content.about.commitmentTitle,
      description: content.about.commitmentDescription,
      icon: Target,
    },
    {
      title: content.about.responsibilityTitle,
      description: content.about.responsibilityDescription,
      icon: Package,
    },
    {
      title: content.about.trustTitle,
      description: content.about.trustDescription,
      icon: ShieldCheck,
    },
    {
      title: content.about.qualityTitle,
      description: content.about.qualityDescription,
      icon: BadgeCheck,
    },
    {
      title: content.about.respectTitle,
      description: content.about.respectDescription,
      icon: Users,
    },
    {
      title: content.about.personalizedAttentionTitle,
      description: content.about.personalizedAttentionDescription,
      icon: MessageSquare,
    },
  ]

  return (
    <section id="nosotros" className="py-20 md:py-32 bg-gradient-to-b from-background via-background to-muted/10">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full mb-4">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">{content.about.badgeText}</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary tracking-tight mb-4">
            {content.about.sectionTitle}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{content.about.subtitle}</p>
        </div>

        <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-8 mb-8">
          <article className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 md:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,212,59,0.16),transparent_42%)] pointer-events-none" />
            <div className="relative">
              <div className="w-16 h-16 bg-primary/15 rounded-2xl flex items-center justify-center mb-6">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-6">
                {content.about.introTitle}
              </h3>
              <div className="space-y-5 text-base md:text-lg text-muted-foreground leading-8">
                <p>{content.about.introParagraph1}</p>
                <p>{content.about.introParagraph2}</p>
                <p>{content.about.introParagraph3}</p>
              </div>
            </div>
          </article>

          <div className="grid gap-6">
            {principleCards.map(({ title, description, icon: Icon }) => (
              <article
                key={title}
                className="rounded-3xl border border-border bg-secondary/70 p-8 transition-colors hover:border-primary/40"
              >
                <div className="w-14 h-14 bg-primary/15 rounded-2xl flex items-center justify-center mb-5">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">{title}</h3>
                <p className="text-muted-foreground leading-7">{description}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full mb-4">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">{content.about.valuesBadgeText}</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                {content.about.valuesTitle}
              </h3>
            </div>
            <p className="text-muted-foreground max-w-2xl">{content.about.valuesSubtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {values.map(({ title, description, icon: Icon }) => (
              <article
                key={title}
                className="h-full rounded-2xl border border-border bg-background/70 p-6 hover:border-primary/40 transition-colors"
              >
                <div className="w-12 h-12 bg-primary/15 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-xl font-bold text-foreground mb-2">{title}</h4>
                <p className="text-muted-foreground leading-7">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
