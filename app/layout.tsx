import type React from "react"
import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import { getLandingContentServer } from "@/lib/site-settings"
import "./globals.css"

function parseKeywords(raw: string) {
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

function getSafeUrl(value: string, fallback: string) {
  try {
    return new URL(value)
  } catch {
    return new URL(fallback)
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const content = await getLandingContentServer()
  const baseUrl = getSafeUrl(content.seo.siteUrl, defaultFallbackUrl)

  return {
    metadataBase: baseUrl,
    title: {
      default: content.seo.defaultTitle,
      template: content.seo.titleTemplate,
    },
    description: content.seo.description,
    keywords: parseKeywords(content.seo.keywords),
    authors: [{ name: content.business.brandName }],
    creator: content.business.brandName,
    publisher: content.business.brandName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical: content.seo.canonicalUrl || content.seo.siteUrl,
    },
    openGraph: {
      title: content.seo.defaultTitle,
      description: content.seo.description,
      url: content.seo.canonicalUrl || content.seo.siteUrl,
      siteName: content.seo.siteName,
      locale: content.seo.locale,
      type: "website",
      images: [
        {
          url: content.seo.ogImageUrl,
          alt: content.seo.ogImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: content.seo.defaultTitle,
      description: content.seo.description,
      images: [content.seo.twitterImageUrl || content.seo.ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: content.seo.faviconUrl,
      shortcut: content.seo.shortcutIconUrl,
      apple: content.seo.appleIconUrl,
    },
    manifest: content.seo.manifestUrl,
    generator: "v0.app",
  }
}

export async function generateViewport(): Promise<Viewport> {
  const content = await getLandingContentServer()

  return {
    themeColor: content.seo.themeColor || "#1a1a1a",
  }
}

const defaultFallbackUrl = "https://dlaenvios.com"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const content = await getLandingContentServer()
  const shouldLoadVercelAnalytics = process.env.VERCEL === "1"

  return (
    <html lang={content.seo.siteLanguage || "es"}>
      <body className="font-sans antialiased">
        {children}
        {shouldLoadVercelAnalytics ? <Analytics /> : null}
      </body>
    </html>
  )
}
