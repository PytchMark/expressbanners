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

### January 2026
- **Gallery tag-based loading**: Backend `/api/gallery?tag=<tag>` endpoint using Cloudinary Search API
- **Two categories working**:
  - `promoprints` (65 assets) - Promotional Printing
  - `embroidery` (17 assets) - Embroidery
- **Horizontal scrolling rows**: Netflix-style per-category rows with smooth scroll snap
- **Modal preview**: 
  - Opens on thumbnail click
  - Shows large image/video preview
  - Displays public_id and format metadata
  - Closes via: Close button, ESC key, click-outside
- **Responsive design**: Mobile-first horizontal scroll works on touch devices
- **Cloudinary transforms**: Thumbnails use `f_auto,q_auto,c_fill,w_360,h_240,g_auto`
- **Lazy loading**: `loading="lazy"` on all thumbnail images
- **Test IDs added**: data-testid attributes on gallery elements for testing

## Files Changed
- `/app/js/gallery.js` - Added data-testid attributes
- `/app/portfolio/index.html` - Added data-testid to modal elements
- `/app/README.md` - Updated gallery API documentation
- `/app/.env` - Created with Cloudinary credentials for local dev

## Prioritized Backlog

### P0 (Critical) - DONE
- [x] Gallery loads assets by Cloudinary tag
- [x] One row per category
- [x] Modal preview functionality
- [x] ESC/close/overlay-click closes modal

### P1 (High Priority)
- [ ] Add more categories as tags are created in Cloudinary
- [ ] Implement prev/next arrows in modal for navigation
- [ ] Add video support polish (play button overlay)

### P2 (Medium Priority)
- [ ] Admin diagnostic page for viewing all tags/assets
- [ ] Category configuration via env vars (JSON)
- [ ] Loading state improvements

### P3 (Low Priority)
- [ ] Swipe gestures in modal for mobile
- [ ] Keyboard arrow navigation in modal
- [ ] Share button for individual assets

## Testing Status
- Backend API: 100% pass
- Frontend UI: 95% pass
- Overall: 97% pass

## Environment Variables Required
```
CLOUDINARY_CLOUD_NAME=dopxnugqn
CLOUDINARY_API_KEY=237931425784416
CLOUDINARY_API_SECRET=aO7DS8dXMpR_c_Jv3fqgShNxKDU
PORT=8001
```
