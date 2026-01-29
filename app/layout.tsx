import type React from "react"
import type { Metadata, Viewport } from "next"
import { Oswald, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  metadataBase: new URL('https://foodiewagon.de'),
  title: {
    default: 'DLA VIAJES Y ENVÍOS',
    template: '%s | The Foodie Wagon'
  },
  description:
    "Entdecke The Foodie Wagon - Dein Food Truck für premium hausgemachte Halal Burger, knuspriges Fried Chicken, Currywurst und authentisches Street Food in Ingolstadt. 100% Halal zertifiziert. Jetzt bestellen!",
  keywords: [
    "foodie wagon",
    "food truck ingolstadt",
    "halal burger ingolstadt",
    "fried chicken ingolstadt",
    "halal street food",
    "burger food truck",
    "currywurst halal",
    "beef burger halal",
    "chicken burger halal",
    "pommes ingolstadt",
    "halal fast food",
    "street food ingolstadt",
    "food truck bayern",
    "halal restaurant ingolstadt",
    "burger lieferung ingolstadt",
    "chicken wings halal",
    "onion rings",
    "chili cheese nuggets",
    "halal zertifiziert",
    "hausgemachte burger"
  ],
  authors: [{ name: 'The Foodie Wagon' }],
  creator: 'The Foodie Wagon',
  publisher: 'The Foodie Wagon',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'The Foodie Wagon | Premium Halal Burgers & Fried Chicken',
    description: 'Premium hausgemachte Halal Burger, knuspriges Fried Chicken & authentisches Street Food in Ingolstadt. 100% Halal zertifiziert.',
    url: 'https://foodiewagon.de',
    siteName: 'The Foodie Wagon',
    locale: 'de_DE',
    type: 'website',
    images: [
      {
        url: '/graphics/tasty burger.svg',
        width: 1200,
        height: 630,
        alt: 'The Foodie Wagon - Premium Halal Burgers',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Foodie Wagon | Premium Halal Burgers',
    description: 'Premium hausgemachte Halal Burger & Fried Chicken in Ingolstadt. 100% Halal zertifiziert.',
    images: ['/graphics/tasty burger.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: "#1a1a1a",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de">
      <head>
        <link rel="canonical" href="https://foodiewagon.de" />
      </head>
      <body className={`${oswald.variable} ${playfair.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
