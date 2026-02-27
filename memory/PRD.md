# Express Banners - Product Requirements Document

## Original Problem Statement
Fix a regression on Express Banners GitHub Pages static site where ONE Cloudinary image was loading everywhere (gallery wall, tiles, portfolio). The goal was to restore correct image sourcing for all components.

## Architecture
- **Frontend**: Static HTML/CSS/JS site served via Express.js
- **Backend**: Node.js/Express static file server with Cloudinary API integration
- **Data**: JSON files (portfolio.json, settings.json) for content management
- **Deployment**: Google Cloud Run

## User Personas
- **Business Owners**: Jamaican brands needing print services
- **Marketing Teams**: Companies requiring banners, signs, apparel
- **Event Planners**: Clients needing roll-up banners and event materials

## Core Requirements (Static)
1. Logo uses settings.images.logo (only applied to #siteLogo)
2. Home hero uses settings.images.homeHero (only applied to #homeHeroImg)
3. Portfolio gallery + motion walls use /data/portfolio.json src per item
4. Services page uses settings.servicesMedia per service (unique images)
5. Motion wall must show varied images across 3 lanes
6. Lightbox functionality for portfolio viewing

## What's Been Implemented

### January 2026 - Image Regression Fix
**Root Cause Identified**: `portfolio.json` had identical Cloudinary URLs for all 12 portfolio items

**Fix Applied**:
- Updated `/app/data/portfolio.json` with 12 unique Unsplash image URLs matching each portfolio category (Banners, Embroidery, Screen Printing, Signs, Graphic Designing)
- Updated `/app/data/settings.json` servicesMedia with unique images per service type

**Verification**:
- Motion wall displays varied images across 3 animated rows
- Featured Portfolio section shows unique thumbnails
- Portfolio page grid renders 12 distinct items
- Hero image and logo remain correctly sourced from settings
- Console sanity check warning no longer appears

### Files Modified
- `/app/data/portfolio.json` - 12 unique item src URLs
- `/app/data/settings.json` - 5 unique servicesMedia URLs

## Prioritized Backlog

### P0 (Critical) - Completed
- [x] Fix image duplication regression

### P1 (High Priority)
- [ ] Replace Unsplash placeholder images with actual client portfolio images
- [ ] Upload real portfolio images to Cloudinary

### P2 (Medium Priority)
- [ ] Implement Cloudinary API gallery sync (currently static JSON)
- [ ] Add image optimization with Cloudinary transformations

### P3 (Future)
- [ ] CMS integration for content management
- [ ] Analytics tracking for portfolio views
- [ ] A/B testing for conversion optimization

## Next Tasks
1. Obtain real portfolio images from client
2. Upload images to Cloudinary folder structure
3. Update portfolio.json with actual Cloudinary URLs
4. Test production deployment on Google Cloud Run
