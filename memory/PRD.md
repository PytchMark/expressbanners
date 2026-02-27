# Express Banners - PRD

## Original Problem Statement
Express Banners site hosted on Cloud Run. /media endpoint returning 0 items because Cloudinary account uses Dynamic Folder Mode. Frontend showing single image everywhere or dummy placeholders. Need real Cloudinary media loading from specific folders.

## Architecture
- **Backend**: Node.js/Express (server.js) on Cloud Run, port 8080
- **Frontend**: Vanilla HTML/CSS/JS, multi-page static site
- **Media**: Cloudinary Admin API (Dynamic Folder Mode) accessed server-side
- **Deployment**: Docker → Cloud Run via cloudbuild.yaml
- **Cloud Name**: dopxnugqn

## Root Cause Analysis
The Cloudinary account uses **Dynamic Folder Mode**. The original code used `cloudinary.api.resources({ prefix: 'folder/' })` which only works in **Fixed Folder Mode**. The fix was switching to `cloudinary.api.resources_by_asset_folder()` which correctly lists assets by their folder path in Dynamic Folder Mode.

## Cloudinary Folder Structure (from user's dashboard)
- `expressbanners/` (44 assets directly here)
  - `catalogue/` (portfolio images)
  - `Embroidery/` (embroidery service images)
  - `Promotional Printing/` (screen printing images)
  - `SignsandBanners/` (signs and banners images)

## What's Been Implemented (Jan-Feb 2026)
- [x] Backend: `/media?folder=<folder>&max=<n>` endpoint using `resources_by_asset_folder` (Dynamic Folder Mode)
- [x] Backend: Recursive subfolder listing (gets images from nested subfolders)
- [x] Backend: Fallback to prefix-based listing for Fixed Folder Mode accounts
- [x] Backend: `/media/debug` diagnostic endpoint (verifies Cloudinary connection)
- [x] Backend: `/media/folders` endpoint (lists subfolders)
- [x] Backend: Fixed `/api/gallery` to use `listByFolder` with `expressbanners/catalogue`
- [x] Backend: Fixed `/api/services-media` with correct service→folder mapping
- [x] Backend: All routes registered BEFORE `*` SPA fallback
- [x] Frontend: `fetchMedia()` with localStorage cache (12h TTL)
- [x] Frontend: `FOLDER_MAP` with correct Cloudinary folder mappings
- [x] Frontend: `loadCloudinaryMedia()` loads catalogue for portfolio/motion walls
- [x] Frontend: `loadServiceMedia()` loads folder-specific images for each service
- [x] Frontend: Sequential index for shared folders (Signs/Banners get different images)
- [x] README updated with Dynamic Folder Mode docs, debug endpoints, deployment guidance
- [x] All code validation tests passed (100%)

## Deployment Status
- Code is ready in this repo
- User needs to deploy to Cloud Run for changes to take effect
- Current production has OLD code (prefix-based, returns 0 items)

## Required Cloud Run Environment Variables
- CLOUDINARY_CLOUD_NAME (dopxnugqn)
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

## Verification Steps After Deployment
1. Visit `/media/debug` → should show `connected: true`
2. Visit `/media/folders?folder=expressbanners` → should list catalogue, Embroidery, etc.
3. Visit `/media?folder=expressbanners/catalogue&max=5` → should show items with secure_url

## Next Tasks
- [ ] User deploys updated code to Cloud Run
- [ ] Verify /media endpoint returns images on production
- [ ] UX polish: contrast fixes, emphasis cleanup, skeleton animations
