# Express Banners Multi-Page Website

This repository contains a multi-page, mobile-first static site for Express Banners. It is designed for GitHub Pages and emphasizes a clean, Apple-inspired aesthetic with a sticky translucent navigation and a promotional marquee strip.

## Structure

```
/
  index.html
  /about/index.html
  /portfolio/index.html
  /services/index.html
  /order/index.html
  /contact/index.html
  /terms/index.html
  /assets/img/.gitkeep
  /assets/video/.gitkeep
  /css/styles.css
  /js/app.js
  /data/settings.json
  /data/portfolio.json
  README.md
```

All pages share the same header/nav and footer. Nested pages use relative paths (for example `../css/styles.css`).

## Settings

Update `/data/settings.json` to customize global content:

- `businessName`, `tagline`, `heroTitle`
- `whatsappNumber` and `whatsappDefaultMessage`
- `images.logo`, `images.hero`, `images.og`
- `contact.email`, `contact.formMode`, `contact.formEndpoint`
- `orderLinks.artworkUploadUrl`, `orderLinks.paymentEnabled`
- `seo` per page (`home`, `about`, `portfolio`, `services`, `order`, `contact`, `terms`)

### Cloudinary URLs

Use Cloudinary (or any CDN) URLs for the image fields in `settings.json` and for each portfolio item `src` in `/data/portfolio.json`.

## Portfolio Data

`/data/portfolio.json` drives the featured and full gallery sections on the portfolio page. Each item should include:

- `id`
- `title`
- `category`
- `src`
- `alt`
- `featured` (boolean)
- `blurb` (short outcome line)

## Contact Form Modes

The contact page uses FormSubmit by default for a static-safe form submission:

- **FormSubmit** (default): form action is `https://formsubmit.co/expressbannersja@mail.com`
- **Apps Script**: set `contact.formMode` to `appsscript` and place the script URL in `contact.formEndpoint` (requires custom wiring in `app.js` if you switch away from FormSubmit).
- **Mailto**: set `contact.formMode` to `mailto` (may open the visitor’s email client).

The current implementation is FormSubmit with `_next` redirect to `/contact/?sent=1`.

## GitHub Pages Deployment

1. Commit and push the repository to GitHub.
2. In GitHub, open **Settings → Pages**.
3. Select the default branch (e.g., `main`) and `/` (root) for the folder.
4. Save and wait for the deployment URL.

## Development Notes

- `js/app.js` handles:
  - Sticky nav scroll state (`.is-scrolled`)
  - Mobile menu with focus management and scroll lock
  - IntersectionObserver reveal animations
  - Portfolio loading/filtering/lightbox
  - Order flow logic
  - Contact success message on `?sent=1`
- Update navigation or footer once and replicate across all pages for consistent navigation.
