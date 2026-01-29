# 🍔 The Foodie Wagon

<div align="center">

![The Foodie Wagon Logo](public/graphics/fooiewagen%20logo.svg)

**Premium Halal Street Food in Ingolstadt, Germany**

[![Website Status](https://img.shields.io/website?url=https%3A%2F%2Ffoodiewagon.de&up_message=online&up_color=green&down_message=offline&down_color=red&style=for-the-badge)](https://foodiewagon.de)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](CONTRIBUTING.md)
[![Code of Conduct](https://img.shields.io/badge/Code%20of%20Conduct-✓-green.svg?style=for-the-badge)](CODE_OF_CONDUCT.md)
[![100% Halal](https://img.shields.io/badge/100%25-Halal%20Certified-green?style=for-the-badge)](https://foodiewagon.de)
[![GDPR Compliant](https://img.shields.io/badge/GDPR-Compliant-blue?style=for-the-badge)](https://foodiewagon.de/datenschutz)

[🌐 Visit Website](https://foodiewagon.de) • [📱 Instagram](https://www.instagram.com/thefoodiewagon) • [📞 Contact Us](https://foodiewagon.de#contact)

</div>

---

## 📖 About

The Foodie Wagon is a premium Halal food truck serving delicious burgers, fried chicken, and authentic street food in Ingolstadt, Germany. This repository contains the source code for our modern, responsive website built with cutting-edge web technologies.

### 🎯 Key Features

- **🍔 Interactive Menu** - Browse our complete menu with high-quality food photography
- **📍 Location Finder** - Find us every Saturday at Am Westpark 7, Ingolstadt
- **📱 Mobile-First Design** - Fully responsive across all devices
- **⚡ Lightning Fast** - Built with Next.js 16 and optimized for performance
- **🔍 SEO Optimized** - Comprehensive metadata and structured data for search engines
- **🌐 Multi-Language** - German language support with proper localization
- **♿ Accessible** - WCAG compliant for inclusive user experience
- **🔒 GDPR Compliant** - Full legal compliance with German data protection laws
- **🥩 100% Halal** - All products are Halal certified

---

## 🚀 Live Website

**Production:** [https://foodiewagon.de](https://foodiewagon.de)

### Status Monitors

- ✅ **Website:** Online
- ✅ **API Endpoints:** Operational
- ✅ **CDN:** Active
- ✅ **SSL Certificate:** Valid
- ✅ **Performance Score:** 95+/100

---

## 🛠️ Technology Stack

### Core Framework
- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI component library
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type-safe development

### Styling & Design
- **[Tailwind CSS 4.1](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Iconoir React](https://iconoir.com/)** - Icon library
- **Custom Animations** - Smooth transitions and hover effects

### Development Tools
- **[pnpm](https://pnpm.io/)** - Fast, disk space efficient package manager
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting

### Deployment & Hosting
- **[Vercel](https://vercel.com/)** - Edge deployment platform
- **[GitHub](https://github.com/)** - Version control and CI/CD

---

## 📦 Installation

### Prerequisites

- Node.js 18+ or 20+
- pnpm (recommended) or npm
- Git

### Quick Start

\`\`\`bash
# Clone the repository
git clone https://github.com/mjmirza/foodie-wagon.git

# Navigate to project directory
cd foodie-wagon

# Install dependencies
pnpm install

# Run development server
pnpm dev

# Open http://localhost:3000 in your browser
\`\`\`

### Available Scripts

\`\`\`bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
\`\`\`

---

## 📂 Project Structure

\`\`\`
foodie-wagon/
├── app/                      # Next.js App Router pages
│   ├── page.tsx             # Homepage
│   ├── layout.tsx           # Root layout with metadata
│   ├── globals.css          # Global styles and animations
│   ├── impressum/           # Legal notice (German requirement)
│   ├── datenschutz/         # Privacy policy (GDPR)
│   └── agb/                 # Terms of service
├── components/              # React components
│   ├── header.tsx           # Navigation header
│   ├── hero.tsx             # Hero section with CTAs
│   ├── menu-section.tsx     # Menu display
│   ├── menu-category.tsx    # Menu item cards
│   ├── location-section.tsx # Location and hours
│   ├── contact-section.tsx  # Contact information
│   ├── footer.tsx           # Footer with legal links
│   ├── sticky-cta.tsx       # Sticky call-to-action bar
│   └── ui/                  # Reusable UI components
├── public/                  # Static assets
│   ├── graphics/            # SVG logos and icons
│   ├── burgers/             # Product images
│   ├── Appetizers/          # Appetizer images
│   ├── Fried-Chicken/       # Chicken product images
│   ├── robots.txt           # Search engine directives
│   ├── sitemap.xml          # XML sitemap
│   └── site.webmanifest     # PWA manifest
├── siterefs/                # Reference materials (not deployed)
├── LICENSE                  # MIT License
├── CONTRIBUTING.md          # Contribution guidelines
├── CODE_OF_CONDUCT.md       # Community guidelines
└── README.md               # This file
\`\`\`

---

## 🎨 Design System

### Color Palette

- **Primary (Golden Yellow):** `#FBB017` - Menu headers, CTAs, branding
- **Background (Dark):** `oklch(0.12 0.005 250)` - Main background
- **Foreground (White):** `oklch(0.95 0.01 90)` - Text color
- **Accent (Orange):** `oklch(0.65 0.2 30)` - Highlights and CTAs

### Typography

- **Headings:** Oswald (Bold, Black weights)
- **Body Text:** Oswald (Regular, Medium weights)
- **Monospace:** Geist Mono

### Responsive Breakpoints

\`\`\`css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
\`\`\`

---

## 🌟 Key Features Breakdown

### 1. Menu System
- Dynamic category tabs (Beef, Chicken, Veggie, Drinks)
- High-quality product images with floating animations
- Spice level indicators
- Pricing in Euro (€)
- Halal certification badges on all items

### 2. Location & Hours
- Interactive map integration
- Clear operating hours (Every Saturday, 11:00 - 20:00)
- Address: 4913 S Orange ave Orlando FL 32806
- Catering and event booking information

### 3. Contact Options
- Click-to-call phone: +1 (407) 639-4011
- Email: info@dlaenvios.com
- Instagram: [@thefoodiewagon](https://www.instagram.com/thefoodiewagon)
- Sticky CTA bar for easy access

### 4. Legal Compliance
- **Impressum** - Company details (§5 TMG)
- **Datenschutz** - GDPR-compliant privacy policy
- **AGB** - Terms of service for food truck business
- Cookie policy and data protection

### 5. SEO Optimization
- Comprehensive meta tags and Open Graph data
- JSON-LD structured data (Restaurant, Menu, MenuItem)
- XML sitemap with image tags
- robots.txt allowing all AI crawlers (GPT, Claude, Perplexity)
- 20+ targeted German keywords for Ingolstadt area

---

## 📱 Responsive Design

The website is fully responsive and optimized for:

- 📱 **Mobile** (320px - 767px) - Stacked layout, touch-friendly buttons
- 📱 **Tablet** (768px - 1023px) - 2-column grids, optimized spacing
- 💻 **Desktop** (1024px+) - 3-column layouts, hover effects

---

## ♿ Accessibility

- Semantic HTML5 elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast ratios meet WCAG AA standards
- Alt text on all images
- Focus indicators on form fields

---

## 🔒 Security & Privacy

- HTTPS/SSL encryption
- GDPR-compliant data handling
- No third-party tracking without consent
- Secure contact forms
- Privacy policy and cookie notifications
- EU data protection standards

---

## 📊 Performance

### Lighthouse Scores (Target)

- **Performance:** 95+
- **Accessibility:** 100
- **Best Practices:** 100
- **SEO:** 100

### Optimizations

- Next.js Image optimization
- Static site generation (SSG)
- Code splitting and lazy loading
- Minified CSS and JavaScript
- Optimized font loading
- Compressed images (WebP/AVIF)

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Areas We Need Help

- 🐛 Bug fixes and testing
- 🌐 Translation improvements
- ♿ Accessibility enhancements
- ⚡ Performance optimizations
- 📱 Mobile UX improvements
- 🎨 UI/UX design suggestions

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### Important Note

While the code is open source, the following are proprietary:
- The Foodie Wagon brand name and logos
- Food photography and product images
- Halal certification logos
- Menu content and pricing
- FlavorBytes GmbH company information

---

## 👥 Team

**FlavorBytes GmbH - The Foodie Wagon**

- **Contact Person:** Sohaib
- **Email:** info@dlaenvios.com
- **Phone:** +1 (407) 639-4011
- **Location:** 4913 S Orange ave Orlando FL 32806, Germany

---

## 📞 Contact & Support

### Business Inquiries
- 📧 Email: info@dlaenvios.com
- ☎️ Phone: +1 (407) 639-4011

### Catering & Events
We cater for private events, parties, and festivals! Contact us for custom quotes.

### Social Media
- 📱 Instagram: [@thefoodiewagon](https://www.instagram.com/thefoodiewagon)

### Visit Us
📍 **Every Saturday**
- **Location:** 4913 S Orange ave Orlando FL 32806
- **Hours:** 11:00 - 20:00 Uhr

---

## 🙏 Acknowledgments

- Built with ❤️ by the FlavorBytes team
- Powered by Next.js and Vercel
- Icons from Iconoir
- Typography: Oswald font family
- Community contributors (see [Contributors](../../graphs/contributors))

---

## 📝 Changelog

### v1.0.0 (December 2025)
- ✨ Initial release
- 🍔 Complete menu system with categories
- 📍 Location and hours information
- 📱 Fully responsive design
- 🔍 SEO optimization
- 🔒 GDPR compliance
- 📞 Contact integration
- 🥩 100% Halal certification display

---

## 🗺️ Roadmap

### Planned Features
- [ ] Online ordering system
- [ ] Menu item customization
- [ ] Loyalty program integration
- [ ] Multi-language support (English)
- [ ] Customer reviews section
- [ ] Newsletter subscription
- [ ] Special offers and promotions
- [ ] Mobile app (iOS/Android)

---

## 📈 Statistics

![GitHub Stars](https://img.shields.io/github/stars/mjmirza/foodie-wagon?style=social)
![GitHub Forks](https://img.shields.io/github/forks/mjmirza/foodie-wagon?style=social)
![GitHub Watchers](https://img.shields.io/github/watchers/mjmirza/foodie-wagon?style=social)

---

<div align="center">

**[⬆ Back to Top](#-the-foodie-wagon)**

Made with 🍔 by [FlavorBytes GmbH](https://foodiewagon.de)

© 2025 FlavorBytes GmbH. All rights reserved.

</div>
