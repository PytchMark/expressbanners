# Express Banners - PRD

## Original Problem Statement
Express Banners site hosted on Cloud Run at https://expressbanners-834003823077.us-central1.run.app. The /media endpoint was returning website HTML instead of JSON. Frontend was falling back to dummy unsplash images or repeating one image everywhere. Need to implement real Cloudinary media loading from specific folders.

## Architecture
- **Backend**: Node.js/Express (server.js) on Cloud Run, port 8080
- **Frontend**: Vanilla HTML/CSS/JS, multi-page static site
- **Media**: Cloudinary Admin API accessed server-side
- **Deployment**: Docker → Cloud Run via cloudbuild.yaml

## User Personas
- Express Banners business owner (Jamaica-based printing company)
- Customers browsing services, portfolio, placing orders via WhatsApp

## Core Requirements (Static)
1. Backend `/media` endpoint returns JSON from Cloudinary Admin API
2. Frontend loads real images from Cloudinary folders
3. Folder mapping: catalogue, SignsandBanners, Embroidery, Promotional Printing
4. 3-lane motion wall component on homepage, portfolio, order, about pages
5. Service-specific images from correct folders
6. No "one image everywhere" behavior

## What's Been Implemented (Jan 2026)
- [x] Backend: `/media?folder=<folder>&max=<n>` endpoint in server.js
- [x] Backend: `listByPrefix` function in server/lib/cloudinary.js using Cloudinary Admin API
- [x] Backend: Dynamic caching for `/media` responses
- [x] Backend: `/media` route registered BEFORE `*` SPA fallback (returns JSON, not HTML)
- [x] Frontend: `fetchMedia(folder, max)` function with localStorage cache (12h TTL)
- [x] Frontend: `FOLDER_MAP` with correct Cloudinary folder mappings
- [x] Frontend: `mediaItemsToPortfolio` converter for Cloudinary items → portfolio objects
- [x] Frontend: `loadCloudinaryMedia()` loads catalogue for portfolio/motion walls
- [x] Frontend: `loadServiceMedia()` loads folder-specific images for each service
- [x] Frontend: Sequential index distribution for shared folders (Signs/Banners get different images)
- [x] README updated with /media endpoint docs, env var requirements, deployment guidance
- [x] All 16 acceptance tests passed (100%)

## Prioritized Backlog
### P0 (Critical - Done)
- [x] /media endpoint returning JSON
- [x] Frontend media loading from Cloudinary

### P1 (Important - Next)
- [ ] Deploy to Cloud Run with CLOUDINARY env vars set
- [ ] Verify /media works on production Cloud Run
- [ ] Test all pages with real Cloudinary data

### P2 (Nice to have)
- [ ] Premium UX: contrast fixes across sections
- [ ] Remove overuse of .em class (only 1-2 words per heading)
- [ ] Add skeleton loader animations in CSS
- [ ] Add service card images on homepage

## Next Tasks
1. User deploys to Cloud Run with Cloudinary env vars
2. Verify /media endpoint on production URL
3. UX polish pass (contrast, emphasis, animations)
