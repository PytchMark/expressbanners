# Express Banners Website - PRD

## Original Problem Statement
Finalize the Express Banners static website (GitHub Pages) to be brand-ready, scroll-stopping, mobile-first, and fully functional with Cloudinary media.

## User Personas
- **Small Business Owners** - Need quick turnaround on banners/signs for storefronts
- **Event Planners** - Need event displays, promotional materials
- **Corporate Teams** - Need branded apparel, uniforms with embroidery
- **Marketing Teams** - Need design services and campaign materials

## Core Requirements (Static)
1. **3-Way Motion Gallery Wall** - Reusable component with parallax motion
2. **Cloudinary Integration** - All images served from Cloudinary CDN
3. **Premium UI/UX** - Glass-morphism nav, skeleton loaders, smooth animations
4. **Mobile-First** - Responsive design with touch-friendly interactions
5. **Accessibility** - Keyboard navigation, focus indicators, reduced motion support
6. **WhatsApp Integration** - Direct order flow and catalogue request

## What's Been Implemented (Jan 2026)

### Completed Features
- [x] **Restored 3-way motion wall component** (`renderMotionWall`) on:
  - Homepage (`data-home-motion-wall`)
  - About page (`data-about-gallery-wall`)
  - Order page (`data-order-motion-wall`)
  - Portfolio page (`data-gallery-wall`)
- [x] **Fixed Cloudinary URLs** - Cloud name: `dopxnugqn`
  - Logo loads correctly
  - Hero images load
  - Portfolio images load
  - Service images load
- [x] **Fixed selective emphasis** - `.em` class for blue accent on key words only
  - "fast", "quality", "premium", "trust", "reliable"
  - Removed pattern of coloring last word of every phrase
- [x] **Added contrast fixes** - Theme tokens for light/dark sections
- [x] **Added skeleton loaders** - While JSON data loads
- [x] **Added catalogue WhatsApp CTA** - Green button linking to WhatsApp
- [x] **Premium navigation** - Glass-morphism, sticky, separators
- [x] **Services images** - Each service shows image with alternating layout
- [x] **Accessibility** - Reduced motion support, keyboard navigation, focus indicators
- [x] **QA checklist** added to README

### Technical Details
- **Cloudinary Cloud Name**: `dopxnugqn`
- **Working URL Pattern**: `https://res.cloudinary.com/dopxnugqn/image/upload/v1771041274/[filename]`
- **Motion Wall Animation**: 3 rows with alternating directions, varying speeds (55-75s)

## Backlog / Future Work

### P0 (Critical)
- [ ] Add more variety of actual portfolio images from Cloudinary
- [ ] Configure actual WhatsApp number (currently placeholder)

### P1 (Important)
- [ ] NCB payment integration (currently disabled placeholder)
- [ ] Add actual logo image to Cloudinary
- [ ] Contact form validation

### P2 (Nice to Have)
- [ ] Add video backgrounds for order hero
- [ ] Image lazy loading optimization
- [ ] Service-specific portfolio filtering
- [ ] Client testimonials section

## Next Tasks
1. Upload actual portfolio images to Cloudinary and update portfolio.json
2. Configure real WhatsApp business number
3. Design and upload official logo
4. Test contact form submission (FormSubmit)
