# Express Banners Production Update Plan (No-Code Planning Document)

## Objective
Prepare a production-ready implementation plan to:
1. Fix portfolio/gallery completeness and reliability.
2. Improve gallery UI/UX (thumbnail grid + closable lightbox popup behavior).
3. Remove internal/designer-style copy and keep customer-facing direct copy.
4. Add one configurable service image per service via Cloud Run environment variables.
5. Center-align services section presentation.
6. Upgrade visual polish (especially navigation) to premium brand quality.

---

## Scope of Planned Changes

### A) Portfolio/Gallery Reliability (Cloudinary completeness)
**Problem observed:** Current gallery categories are hardcoded and may not cover all available Cloudinary images/tags/folders. Asset retrieval also depends on existing tag strategy.

**Planned implementation:**
- Add a server-side gallery source-of-truth strategy:
  - Prefer a configurable category map (env var driven JSON) to decouple code from hardcoded categories.
  - Support both tag-based and folder-based query mode per category.
- Add stronger pagination and duplicate protection when traversing `next_cursor`.
- Add diagnostics mode (admin/debug route) to show:
  - per-category total assets found,
  - mode used (tag/folder),
  - missing/empty categories.
- Add fallback behavior:
  - if a category is empty, do not silently fail; show meaningful customer-safe empty-state text.

**Acceptance criteria:**
- Each configured category shows all expected assets from Cloudinary.
- No category truncates unexpectedly when more than one page of assets exists.
- Portfolio featured/gallery sections still render when one category errors.

---

### B) Gallery UI/UX Refresh (Closable Popup + Selection Experience)
**Problem observed:** Current modal experience is functional but needs production-level UX polish.

**Planned implementation:**
- Improve thumbnail browsing:
  - tighter card consistency,
  - clearer hover/focus states,
  - visible media-type indicator for video/image.
- Improve popup/lightbox:
  - smoother open/close transitions,
  - keyboard support (Esc close, arrow nav for next/previous),
  - swipe support for touch devices,
  - clear close affordance in top-right,
  - optional caption area with readable formatting.
- Improve accessibility:
  - proper focus trap while modal is open,
  - return focus to origin thumbnail on close,
  - ARIA roles/labels for modal navigation controls.

**Acceptance criteria:**
- Clicking a thumbnail always opens correct item.
- Modal can be closed by close button, overlay click, and Esc.
- Modal navigation works with keyboard and touch.
- No page scroll bleed while modal is open.

---

### C) Production Copy Cleanup (Remove designer/internal instruction tone)
**Problem observed:** Some content feels process/internal or “design direction” oriented instead of direct customer conversion copy.

**Planned implementation:**
- Copy audit by page (`/`, `/services`, `/portfolio`, `/about`, `/order`, `/contact`).
- Replace ambiguous/internal tone with:
  - benefit-first customer language,
  - clear CTA-driven statements,
  - concise production-ready trust messaging.
- Standardize CTA language set:
  - “Start Order”,
  - “Get a Quote”,
  - “Message on WhatsApp”,
  - “View Portfolio”.

**Acceptance criteria:**
- No internal/designer-facing instructions in visible UI.
- Messaging reads consistently premium, direct, and customer-facing.

---

### D) Service Images via Cloud Run Env Vars
You requested env-var labels so you can supply Cloudinary URLs per service.

## Recommended Environment Variable Labels
Use these exact labels:
- `SERVICE_IMAGE_SIGNS_URL`
- `SERVICE_IMAGE_BANNERS_URL`
- `SERVICE_IMAGE_EMBROIDERY_URL`
- `SERVICE_IMAGE_GRAPHIC_DESIGN_URL`
- `SERVICE_IMAGE_SCREEN_PRINTING_URL`

### Optional fallback/default labels
- `SERVICE_IMAGE_DEFAULT_URL`

### Notes for implementation
- Frontend binds each service card to corresponding env-backed value served through backend config endpoint.
- If one service URL is missing, use `SERVICE_IMAGE_DEFAULT_URL` or keep current image.
- Validate URL format and only allow secure `https://` assets.

**Acceptance criteria:**
- Each service card can display a different image without code edits.
- Updating Cloud Run env vars and redeploying changes service visuals correctly.

---

### E) Services Layout Center Alignment
**Planned implementation:**
- Center-align service section headings, supporting copy, and action area.
- For desktop: preserve balanced media/content composition while aligning text blocks for premium symmetry.
- For mobile: stack cards with centered text and consistent spacing rhythm.

**Acceptance criteria:**
- Services section reads centered and visually balanced across breakpoints.
- No broken layout regressions in card media aspect ratios.

---

### F) Premium UI Upgrade (Navigation + overall polish)
**Problem observed:** Navigation and overall visual system still feel non-premium.

**Planned implementation:**
- Navigation redesign (without changing IA):
  - cleaner spacing, refined typography scale,
  - improved contrast and active-state clarity,
  - reduced visual clutter,
  - premium interaction states.
- Design token pass:
  - spacing normalization,
  - border radius consistency,
  - elevated but subtle shadows,
  - stronger hierarchy for section headings and CTAs.
- Performance-aware polish:
  - keep animations subtle and GPU-friendly,
  - ensure no jank on lower-end devices.

**Acceptance criteria:**
- Header/nav feels premium and cohesive with brand.
- Key conversion paths (Order/WhatsApp/Contact) are visually prominent.
- Lighthouse accessibility/UX signals improve or remain strong.

---

## Execution Order (Implementation Sequence)
1. **Data reliability first** (gallery source + pagination + diagnostics).
2. **Gallery UX refresh** (modal controls + accessibility).
3. **Services env-var image plumbing** (backend config + frontend binding).
4. **Copy cleanup pass** (all pages).
5. **UI polish pass** (nav, spacing, typography, CTA hierarchy).
6. **QA & regression checks** (desktop/mobile + keyboard + touch).

---

## QA Plan (when coding begins)
- Functional:
  - Gallery loads all categories and counts match Cloudinary expectations.
  - Modal open/close/nav behavior on desktop and mobile.
  - Service cards show env-var images correctly.
- Accessibility:
  - Keyboard-only modal and nav interactions.
  - Focus order and visible focus states.
- Visual regression:
  - Home, Services, Portfolio before/after screenshots.
- Performance:
  - Ensure no major CLS from late-loading service images.

---

## Risks & Mitigations
- **Risk:** Mixed Cloudinary organization (tags inconsistent).
  - **Mitigation:** allow category mode per source (tag/folder) via config.
- **Risk:** Missing env vars causing broken images.
  - **Mitigation:** default URL fallback and graceful placeholder.
- **Risk:** Over-polish causing slower paint.
  - **Mitigation:** constrain animation and avoid heavy effects.

---

## Deliverables for the upcoming coding phase
- Updated backend gallery/config endpoints.
- Updated frontend gallery modal UX.
- Services section env-driven images + center alignment.
- Revised customer-facing copy across pages.
- Premium nav/UI refinement pass.
- Validation report with screenshots and test checklist.

