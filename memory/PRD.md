# Express Banners - Product Requirements Document

## Original Problem Statement
Fix the gallery page that was NOT loading Cloudinary media correctly. The gallery should load assets by Cloudinary TAGS and display "1 row per category" with a clean preview modal.

## Architecture
- **Frontend**: Vanilla HTML/CSS/JS static site
- **Backend**: Node.js + Express server
- **CDN**: Cloudinary for image/video hosting
- **API**: Secure backend endpoint for Cloudinary Search API

## User Personas
1. **Jamaican Business Owners** - Looking for print, signage, embroidery services
2. **Event Planners** - Need banners, promotional materials
3. **Marketing Teams** - Require branded merchandise and print materials

## Core Requirements (Static)
1. Fetch Cloudinary media by TAG using Search API
2. One horizontal row per category (Netflix-style)
3. Modal preview on thumbnail click
4. Lazy loading and responsive images
5. No API secrets exposed to frontend

## What's Been Implemented

### January 2026 - Initial Fix
- **Gallery tag-based loading**: Backend `/api/gallery?tag=<tag>` endpoint using Cloudinary Search API
- **Two categories working**: promoprints (65 assets), embroidery (17 assets)
- **Horizontal scrolling rows**: Netflix-style per-category rows with smooth scroll snap
- **Modal preview**: Opens on click, closes via Close/ESC/click-outside, shows metadata
- **Responsive design**: Mobile-first horizontal scroll works on touch devices
- **Cloudinary transforms**: Thumbnails use `f_auto,q_auto,c_fill,w_360,h_240,g_auto`
- **Lazy loading**: `loading="lazy"` on all thumbnail images

### January 2026 - Feature Enhancement
- **Added Feather Banners category** (tag: `featherbanners`)
- **Prev/Next navigation arrows** in modal with visual disabled state
- **Image counter** showing position (e.g., "4 / 24")
- **Keyboard navigation**: ArrowLeft/ArrowRight keys navigate in modal
- **Load More button**: Infinite scrolling at end of each row
  - Initial load: 12 items per category
  - Load More: 12 additional items per click
  - Auto-hides when no more items available

## Cloudinary Tags Required

| Tag | Category Title | Description |
|-----|---------------|-------------|
| `promoprints` | Promotional Printing | Flyers, cards, labels & more |
| `embroidery` | Embroidery | Premium stitching for uniforms & merch |
| `featherbanners` | Feather Banners | Eye-catching graphics for business doors & storefronts |

**To add a new category:**
1. Create the tag in Cloudinary Media Library
2. Assign the tag to relevant assets
3. Add entry to `categories` array in `/app/js/gallery.js`

## Files Changed
- `/app/js/gallery.js` - Full rewrite with new features
- `/app/portfolio/index.html` - Updated modal with nav arrows
- `/app/css/styles.css` - Styles for Load More button, nav arrows, counter
- `/app/README.md` - Enhanced documentation

## Prioritized Backlog

### P0 (Critical) - DONE
- [x] Gallery loads assets by Cloudinary tag
- [x] One row per category with horizontal scroll
- [x] Modal preview functionality
- [x] ESC/close/overlay-click closes modal
- [x] Prev/Next navigation arrows
- [x] Keyboard arrow navigation
- [x] Load More infinite scrolling

### P1 (High Priority)
- [ ] Add `featherbanners` tag to Cloudinary assets (USER ACTION REQUIRED)
- [ ] Video play button overlay on thumbnails

### P2 (Medium Priority)
- [ ] Admin diagnostic page for viewing all tags/assets
- [ ] Category configuration via env vars (JSON)
- [ ] Swipe gestures in modal for mobile

### P3 (Low Priority)
- [ ] Share button for individual assets
- [ ] Download button in modal

## Testing Status
- Frontend: 100% pass (15/15 features tested)
- All modal navigation features verified
- Load More functionality verified (12 -> 24 items)

## Environment Variables Required
```
CLOUDINARY_CLOUD_NAME=dopxnugqn
CLOUDINARY_API_KEY=237931425784416
CLOUDINARY_API_SECRET=aO7DS8dXMpR_c_Jv3fqgShNxKDU
PORT=8001
```
