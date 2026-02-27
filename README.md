# Express Banners - Premium Static Website

A premium, mobile-first static website for Express Banners Jamaica, built for GitHub Pages deployment.

## Features

- **3-Way Motion Gallery Wall**: Reusable animated gallery component with parallax-like movement
- **Cloudinary Integration**: All images served from Cloudinary CDN with automatic optimization
- **Premium UI/UX**: Glass-morphism nav, skeleton loaders, smooth animations
- **Mobile-First**: Fully responsive design with touch-friendly interactions
- **Accessibility**: Keyboard navigation, focus indicators, reduced motion support
- **WhatsApp Integration**: Direct order flow and catalogue request via WhatsApp

## Tech Stack

- Vanilla HTML/CSS/JS (no frameworks)
- Cloudinary CDN for images
- FormSubmit for contact forms
- GitHub Pages compatible (static hosting)

## Cloudinary Configuration

- **Cloud Name**: `dopxnuqn`
- **Base URL**: `https://res.cloudinary.com/dopxnuqn/image/upload`
- **Folders**:
  - `expressbanners/` - Root folder
  - `expressbanners/catalogue/` - PDF catalogues
  - `expressbanners/Embroidery/` - Embroidery portfolio
  - `expressbanners/Promotional Printing/` - Screen printing portfolio
  - `expressbanners/SignsandBanners/` - Signs and banners portfolio

## File Structure

```
/
├── index.html          # Homepage
├── about/              # About page
├── services/           # Services page
├── portfolio/          # Portfolio page
├── order/              # Order page
├── contact/            # Contact page
├── terms/              # Terms page
├── css/
│   └── styles.css      # All styles
├── js/
│   └── app.js          # All JavaScript
├── data/
│   ├── settings.json   # Site configuration
│   └── portfolio.json  # Portfolio items
└── assets/             # Local fallback assets
```

## Key Components

### Motion Wall (`renderMotionWall`)

Reusable 3-way animated gallery component:

```javascript
renderMotionWall(containerEl, items, {
  rowCount: 3,        // Number of rows
  baseDuration: 60,   // Animation speed (seconds)
  clickable: true     // Enable lightbox on click
});
```

Used on:
- Homepage (`data-home-motion-wall`)
- About page (`data-about-gallery-wall`)
- Order page (`data-order-motion-wall`)
- Portfolio page (`data-gallery-wall`)

### Selective Emphasis

Use `.em` class for blue accent on important words only:
- "fast", "quality", "trust", "reliable", "premium"
- Maximum 1-2 words per headline

```html
<h2>Proof that <span class="em">sharp</span> print sells.</h2>
```

---

## QA Checklist

### Mobile Checks
- [ ] Hamburger menu opens/closes correctly
- [ ] Touch targets are ≥44px
- [ ] No horizontal overflow on any page
- [ ] Motion wall scrolls/drags on touch devices
- [ ] Forms are usable on mobile
- [ ] Text is readable at all viewport sizes

### Cloudinary Checks
- [ ] Logo loads in navigation
- [ ] Hero image loads on homepage
- [ ] Service images load on Services page
- [ ] Portfolio images load in grids and motion walls
- [ ] Fallback images appear if Cloudinary fails
- [ ] Images use `f_auto,q_auto` optimization

### Accessibility Checks
- [ ] Skip link works (Tab to reveal, Enter to skip)
- [ ] Keyboard navigation works for all interactive elements
- [ ] Focus indicators visible on all focusable elements
- [ ] Lightbox is keyboard accessible (Escape, arrows)
- [ ] `prefers-reduced-motion` disables animations
- [ ] Contrast ratios pass WCAG AA
- [ ] ARIA labels present on icons/buttons

### Functionality Checks
- [ ] WhatsApp links open with pre-filled message
- [ ] Catalogue CTA opens WhatsApp with catalogue message
- [ ] Order form pills toggle correctly
- [ ] Order summary updates in real-time
- [ ] Contact form submits (FormSubmit)
- [ ] Lightbox opens/closes correctly
- [ ] Nav highlights current page

### Performance Checks
- [ ] No console errors
- [ ] Images lazy load below fold
- [ ] Skeleton loaders appear while data loads
- [ ] Animations run at 60fps
- [ ] No layout shift on load

---

## Deployment

This site is designed for GitHub Pages static hosting:

1. Push to `main` branch
2. Enable GitHub Pages in repository settings
3. Site will be available at `https://username.github.io/repo-name/`

No build step required - all files are production-ready.

---

## Support

Contact Express Banners:
- **WhatsApp**: +1 (876) 555-1234
- **Email**: expressbannersja@mail.com
- **Location**: Kingston, Jamaica

---

© 2026 Express Banners. All rights reserved.
