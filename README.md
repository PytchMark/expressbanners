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

### Cloud Run (Production)

This site is deployed on Google Cloud Run. The Docker container runs a Node.js/Express server that serves both static files and the `/media` API endpoint.

#### Required Environment Variables

Set these on your Cloud Run service:

| Variable | Description |
|---|---|
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name (e.g. `dopxnugqn`) |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `PORT` | (Optional) Defaults to `8080` |

#### Important: Dynamic Folder Mode

This site uses Cloudinary's **Dynamic Folder Mode**. The backend uses `resources_by_asset_folder()` API (not `prefix`-based listing) to correctly list images in your Cloudinary folders. This is the key reason images load properly.

#### Diagnostic Endpoints

After deploying, use these to verify your setup:

```bash
# Check Cloudinary connection and env vars
curl https://your-app-url/media/debug

# List subfolders under expressbanners
curl https://your-app-url/media/folders?folder=expressbanners

# Fetch catalogue images
curl "https://your-app-url/media?folder=expressbanners/catalogue&max=5"
```

#### `/media` Endpoint

The backend exposes a JSON API for fetching Cloudinary media:

```
GET /media?folder=<cloudinary-folder>&max=<n>
```

**Example:**
```bash
curl "https://expressbanners-834003823077.us-central1.run.app/media?folder=expressbanners/catalogue&max=5"
```

**Response:**
```json
{
  "folder": "expressbanners/catalogue",
  "count": 5,
  "items": [
    {
      "public_id": "expressbanners/catalogue/image1",
      "secure_url": "https://res.cloudinary.com/...",
      "width": 1200,
      "height": 800,
      "format": "jpg",
      "created_at": "2026-01-15T...",
      "resource_type": "image"
    }
  ]
}
```

#### Testing `/media`

1. Visit `/media?folder=expressbanners/catalogue&max=5` in your browser
2. If you see JSON → endpoint is working
3. If you see HTML → the SPA fallback is swallowing the route (fix route order in `server.js`)
4. If you get 500 → check that `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` env vars are set

**Common failure:** `/media` returning HTML means the `app.get("/media", ...)` route is registered AFTER the `app.get("*", ...)` SPA fallback. The `/media` route MUST come first.

#### Deploy Steps

```bash
# Build and deploy via Cloud Build
gcloud builds submit --config=cloudbuild.yaml

# Or direct deploy
gcloud run deploy expressbanners \
  --source . \
  --set-env-vars CLOUDINARY_CLOUD_NAME=xxx,CLOUDINARY_API_KEY=xxx,CLOUDINARY_API_SECRET=xxx
```

### Cloudinary Folder Mapping

| Use | Cloudinary Folder |
|---|---|
| Portfolio / Homepage motion wall | `expressbanners/catalogue` |
| Signs service | `expressbanners/SignsandBanners` |
| Banners service | `expressbanners/SignsandBanners` |
| Embroidery service | `expressbanners/Embroidery` |
| Screen Printing service | `expressbanners/Promotional Printing` |
| Graphic Designing service | `expressbanners/catalogue` |

---

## Support

Contact Express Banners:
- **WhatsApp**: +1 (876) 555-1234
- **Email**: expressbannersja@mail.com
- **Location**: Kingston, Jamaica

---

© 2026 Express Banners. All rights reserved.
