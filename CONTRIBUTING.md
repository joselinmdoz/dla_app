# Contributing to The Foodie Wagon Website

Thank you for your interest in contributing to The Foodie Wagon website! We appreciate your support.

## 🍔 About This Project

This is the official website for The Foodie Wagon, a premium Halal food truck operating in Ingolstadt, Germany. The site is built with Next.js 16, React 19, and Tailwind CSS.

## 📋 Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to keep our community welcoming and respectful.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or 20+
- pnpm (recommended) or npm
- Git

### Setup

1. Fork the repository
2. Clone your fork:
   \`\`\`bash
   git clone https://github.com/YOUR_USERNAME/foodie-wagon.git
   cd foodie-wagon
   \`\`\`

3. Install dependencies:
   \`\`\`bash
   pnpm install
   \`\`\`

4. Run the development server:
   \`\`\`bash
   pnpm dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000)

## 🛠️ Development Workflow

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `style/description` - UI/styling changes

### Commit Messages

Follow conventional commits:

\`\`\`
feat: add new menu item component
fix: correct pricing display on mobile
docs: update README with setup instructions
style: improve hero section spacing
refactor: optimize menu category rendering
\`\`\`

### Making Changes

1. Create a new branch:
   \`\`\`bash
   git checkout -b feature/your-feature-name
   \`\`\`

2. Make your changes

3. Test your changes:
   \`\`\`bash
   pnpm run build
   pnpm run lint
   \`\`\`

4. Commit your changes:
   \`\`\`bash
   git add .
   git commit -m "feat: your descriptive commit message"
   \`\`\`

5. Push to your fork:
   \`\`\`bash
   git push origin feature/your-feature-name
   \`\`\`

6. Open a Pull Request

## 📝 Pull Request Guidelines

### Before Submitting

- [ ] Code builds without errors (`pnpm run build`)
- [ ] All existing functionality still works
- [ ] New features are documented
- [ ] Follows existing code style
- [ ] Responsive design tested (mobile, tablet, desktop)
- [ ] Accessibility considered (WCAG guidelines)

### PR Description Should Include

- What changes were made
- Why these changes were necessary
- Screenshots (for UI changes)
- Related issue numbers (if applicable)

### Example PR Template

\`\`\`markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
How were these changes tested?

## Screenshots
(if applicable)

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have tested these changes
- [ ] I have updated documentation as needed
\`\`\`

## 🎨 Code Style Guidelines

### TypeScript/React

- Use functional components with TypeScript
- Prefer `const` over `let`
- Use arrow functions
- Implement proper TypeScript types (avoid `any`)
- Use meaningful variable names

### Tailwind CSS

- Use Tailwind utility classes
- Follow mobile-first responsive design
- Maintain consistent spacing (4, 8, 12, 16, etc.)
- Use theme colors from `globals.css`

### File Organization

\`\`\`
/app                  # Next.js app router pages
/components           # Reusable components
/public              # Static assets
  /graphics          # SVG graphics and images
  /burgers           # Product images
\`\`\`

## 🐛 Reporting Bugs

### Before Reporting

1. Check if the bug has already been reported
2. Verify the bug exists in the latest version
3. Collect information about your environment

### Bug Report Template

\`\`\`markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- Browser: [e.g. Chrome 120]
- Device: [e.g. iPhone 12, Desktop]
- OS: [e.g. iOS 17, Windows 11]

**Screenshots**
(if applicable)
\`\`\`

## 💡 Suggesting Features

We welcome feature suggestions! Please:

1. Check if the feature has already been suggested
2. Explain the use case clearly
3. Describe how it would benefit users
4. Consider implementation complexity

### Feature Request Template

\`\`\`markdown
**Feature Description**
Clear description of the proposed feature

**Problem It Solves**
What problem does this address?

**Proposed Solution**
How would this feature work?

**Alternatives Considered**
Other approaches you've thought about

**Additional Context**
Screenshots, mockups, examples
\`\`\`

## 🔍 Review Process

1. PRs are reviewed by maintainers
2. Feedback will be provided within 2-3 business days
3. Address review comments
4. Once approved, changes will be merged
5. Your contribution will be credited

## 📜 Legal

By contributing, you agree that your contributions will be licensed under the MIT License. You also confirm that you have the right to submit your contributions.

## 🙏 Recognition

All contributors will be acknowledged in the README.md file.

## 📞 Contact

For questions about contributing:
- Email: info@dlaenvios.com
- Phone: +1 (407) 639-4011

## 🎯 Areas We Need Help

- Performance optimization
- Accessibility improvements
- SEO enhancements
- German language translations/corrections
- Mobile responsiveness
- Testing and bug reports

Thank you for contributing to The Foodie Wagon! 🍔🚚
