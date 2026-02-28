/**
 * Express Banners - Premium Static Site
 * Client-side JavaScript for GitHub Pages deployment
 */

const state = {
  settings: null,
  portfolio: [],
  currentIndex: 0,
  order: {
    service: "",
    options: {
      size: "",
      finish: "Standard",
    },
    quantity: 1,
    notes: "",
    timestamp: new Date().toISOString(),
  },
};

const NEUTRAL_IMAGE_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='480' viewBox='0 0 640 480'%3E%3Crect fill='%23d1d5db' width='640' height='480'/%3E%3Ctext fill='%234b5563' font-family='sans-serif' font-size='24' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EImage unavailable%3C/text%3E%3C/svg%3E";

/**
 * Cloudinary folder mapping
 */
const FOLDER_MAP = {
  portfolio: "expressbanners/catalogue",
  Signs: "expressbanners/SignsandBanners",
  Banners: "expressbanners/SignsandBanners",
  Embroidery: "expressbanners/Embroidery",
  "Screen Printing": "expressbanners/Promotional Printing",
  "Graphic Designing": "expressbanners/catalogue",
};

const MEDIA_CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours
const PORTFOLIO_TAGS = ["promoprints", "embroidery"];

/**
 * MediaLoader: fetch from /media endpoint with localStorage cache
 */
const fetchMedia = async (folder, max = 50) => {
  const cacheKey = `media_cache:${folder}:${max}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.expiresAt > Date.now() && parsed.data?.items?.length) {
        return parsed.data;
      }
      localStorage.removeItem(cacheKey);
    }
  } catch (e) {
    // ignore corrupt cache
  }

  try {
    const resp = await fetch(`/media?folder=${encodeURIComponent(folder)}&max=${max}`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const contentType = resp.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error("Response is not JSON (likely HTML fallback)");
    }
    const data = await resp.json();
    if (data.items?.length) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          data,
          expiresAt: Date.now() + MEDIA_CACHE_TTL,
        }));
      } catch (e) {
        // localStorage full, ignore
      }
    }
    return data;
  } catch (error) {
    console.warn(`fetchMedia(${folder}) failed:`, error.message);
    return { folder, count: 0, items: [] };
  }
};

/**
 * Convert Cloudinary items to portfolio-compatible objects
 */

const fetchGallery = async (tags = []) => {
  const normalizedTags = [...new Set((tags || []).map((tag) => String(tag || "").trim().toLowerCase()).filter(Boolean))];
  const cacheKey = `gallery_cache:${normalizedTags.join("|") || "all"}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.expiresAt > Date.now() && parsed.data?.items?.length) {
        return parsed.data;
      }
      localStorage.removeItem(cacheKey);
    }
  } catch (e) {
    // ignore corrupt cache
  }

  try {
    const query = normalizedTags.length ? `?tags=${encodeURIComponent(normalizedTags.join(","))}` : "";
    const resp = await fetch(`/api/gallery${query}`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const contentType = resp.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error("Response is not JSON (likely HTML fallback)");
    }
    const data = await resp.json();
    if (data.items?.length) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          data,
          expiresAt: Date.now() + MEDIA_CACHE_TTL,
        }));
      } catch (e) {
        // localStorage full, ignore
      }
    }
    return data;
  } catch (error) {
    console.warn("fetchGallery() failed:", error.message);
    return { updatedAt: new Date().toISOString(), items: [] };
  }
};
const mediaItemsToPortfolio = (items, category = "Portfolio") => {
  return items.map((item, idx) => ({
    id: `cloud-${item.public_id.replace(/[^a-zA-Z0-9]/g, "-")}-${idx}`,
    title: (item.public_id.split("/").pop() || "Image").replace(/[-_]/g, " "),
    category,
    src: item.secure_url,
    alt: `${category} work by Express Banners`,
    featured: idx < 6,
    blurb: category,
    width: item.width,
    height: item.height,
  }));
};

const elements = {
  businessName: document.querySelectorAll("[data-business-name]"),
  tagline: document.querySelectorAll("[data-tagline]"),
  heroTitle: document.querySelector("[data-hero-title]"),
  homeHeroImage: document.querySelector("#homeHeroImg"),
  heroMedia: document.querySelector("#heroMedia"),
  whatsappLinks: document.querySelectorAll("[data-whatsapp]"),
  catalogueLinks: document.querySelectorAll("[data-catalogue]"),
  uploadLink: document.querySelector("[data-upload-link]"),
  mapLink: document.querySelector("[data-map-link]"),
  address: document.querySelector("[data-address]"),
  hours: document.querySelector("[data-hours]"),
  year: document.querySelector("[data-year]"),
  instagram: document.querySelector("[data-instagram]"),
  facebook: document.querySelector("[data-facebook]"),
  tiktok: document.querySelector("[data-tiktok]"),
  logo: document.querySelector("#siteLogo"),
  ogImage: document.querySelector("[data-og-image]"),
  navToggle: document.querySelector(".nav-toggle"),
  navMenu: document.querySelector(".nav-links"),
  navLinks: document.querySelectorAll(".nav-links a"),
  navScrim: document.querySelector("[data-nav-scrim]"),
  header: document.querySelector(".site-header"),
  serviceSelect: document.querySelector("#service-select"),
  servicePills: document.querySelectorAll("[data-service-pill]"),
  sizePills: document.querySelectorAll("[data-size-pill]"),
  customSizeWrap: document.querySelector("[data-custom-size]"),
  customWidthInput: document.querySelector("#custom-width"),
  customHeightInput: document.querySelector("#custom-height"),
  customUnitSelect: document.querySelector("#custom-unit"),
  quantityInput: document.querySelector("#quantity-input"),
  qtyMinus: document.querySelector("[data-qty-minus]"),
  qtyPlus: document.querySelector("[data-qty-plus]"),
  finishSelect: document.querySelector("#finish-select"),
  notesInput: document.querySelector("#notes-input"),
  helperTurnaround: document.querySelector("[data-helper-turnaround]"),
  helperFiles: document.querySelector("[data-helper-files]"),
  helperRush: document.querySelector("[data-helper-rush]"),
  summaryService: document.querySelector("[data-summary-service]"),
  summarySize: document.querySelector("[data-summary-size]"),
  summaryQuantity: document.querySelector("[data-summary-quantity]"),
  summaryFinish: document.querySelector("[data-summary-finish]"),
  summaryNotes: document.querySelector("[data-summary-notes]"),
  summaryTimestamp: document.querySelector("[data-summary-timestamp]"),
  paymentButton: document.querySelector("[data-payment-button]"),
  paymentNotice: document.querySelector("[data-payment-notice]"),
  toast: document.querySelector("[data-toast]"),
  portfolioFeatured: document.querySelector("[data-portfolio-featured]"),
  portfolioGrid: document.querySelector("[data-portfolio-grid]"),
  portfolioFilter: document.querySelector("[data-filter-controls]"),
  lightbox: document.querySelector("[data-lightbox]"),
  lightboxImage: document.querySelector("[data-lightbox-image]"),
  lightboxCaption: document.querySelector("[data-lightbox-caption]"),
  lightboxClose: document.querySelector("[data-lightbox-close]"),
  lightboxNext: document.querySelector("[data-lightbox-next]"),
  lightboxPrev: document.querySelector("[data-lightbox-prev]"),
  contactSuccess: document.querySelector("[data-contact-success]"),
  contactForm: document.querySelector("[data-contact-form]"),
  contactNext: document.querySelector("[data-contact-next]"),
  serviceImages: document.querySelectorAll("[data-service-image]"),
  serviceMediaBlocks: document.querySelectorAll("[data-service-media]"),
  orderVideo: document.querySelector("[data-order-video]"),
  workWall: document.querySelector("[data-work-wall]"),
  galleryWall: document.querySelector("[data-gallery-wall]"),
  aboutGalleryWall: document.querySelector("[data-about-gallery-wall]"),
  motionWalls: document.querySelectorAll("[data-motion-wall]"),
  homeMotionWall: document.querySelector("[data-home-motion-wall]"),
  orderMotionWall: document.querySelector("[data-order-motion-wall]"),
};

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const serviceHelpers = {
  Signs: {
    turnaround: "3-5 days",
    files: "PDF, AI, EPS, PNG",
    rush: "Yes",
  },
  Banners: {
    turnaround: "2-4 days",
    files: "PDF, AI, EPS, PNG",
    rush: "Yes",
  },
  Embroidery: {
    turnaround: "4-6 days",
    files: "AI, EPS, PDF",
    rush: "Limited",
  },
  "Graphic Designing": {
    turnaround: "2-3 days",
    files: "Brief + brand assets",
    rush: "Yes",
  },
  "Screen Printing": {
    turnaround: "5-7 days",
    files: "AI, EPS, PDF",
    rush: "Limited",
  },
};

const setText = (nodes, value) => {
  nodes.forEach((node) => {
    node.textContent = value;
  });
};

const clampNumber = (value, min, max) => Math.min(Math.max(value, min), max);

const getBasePath = () => {
  const path = window.location.pathname;
  const nestedSections = ["/about/", "/services/", "/portfolio/", "/order/", "/contact/", "/terms/"];
  return nestedSections.some((section) => path.includes(section)) ? "../" : "./";
};

const getPortfolioItemSrc = (item) => item?.src || NEUTRAL_IMAGE_PLACEHOLDER;

const setActivePill = (pills, value) => {
  pills.forEach((pill) => {
    const isActive = pill.dataset.value === value;
    pill.classList.toggle("is-active", isActive);
    pill.setAttribute("aria-pressed", String(isActive));
  });
};

const updateHelperChips = (service) => {
  const helper = serviceHelpers[service] || {
    turnaround: "2-5 days",
    files: "PDF, AI, EPS, PNG",
    rush: "Yes",
  };
  if (elements.helperTurnaround) {
    elements.helperTurnaround.textContent = `Typical turnaround: ${helper.turnaround}`;
  }
  if (elements.helperFiles) {
    elements.helperFiles.textContent = `Best files: ${helper.files}`;
  }
  if (elements.helperRush) {
    elements.helperRush.textContent = `Rush available: ${helper.rush}`;
  }
};

const getCustomSizeValue = () => {
  const width = elements.customWidthInput?.value;
  const height = elements.customHeightInput?.value;
  const unit = elements.customUnitSelect?.value;
  if (width && height) {
    return `${width} x ${height} ${unit}`;
  }
  return "Custom size";
};

const updateSummary = () => {
  if (elements.summaryService) {
    elements.summaryService.textContent = state.order.service || "Not selected";
  }
  if (elements.summarySize) {
    elements.summarySize.textContent = state.order.options.size || "Not set";
  }
  if (elements.summaryQuantity) {
    elements.summaryQuantity.textContent = state.order.quantity;
  }
  if (elements.summaryFinish) {
    elements.summaryFinish.textContent = state.order.options.finish || "Standard";
  }
  if (elements.summaryNotes) {
    elements.summaryNotes.textContent = state.order.notes || "None";
  }
  if (elements.summaryTimestamp) {
    elements.summaryTimestamp.textContent = new Date(state.order.timestamp).toLocaleString();
  }
};

const setService = (service) => {
  state.order.service = service;
  if (elements.serviceSelect) {
    elements.serviceSelect.value = service;
  }
  setActivePill(elements.servicePills, service);
  updateHelperChips(service);
  updateSummary();
  updateWhatsAppLinks();
};

const setSize = (size) => {
  state.order.options.size = size;
  updateSummary();
  updateWhatsAppLinks();
};

const showToast = (message) => {
  if (!elements.toast) return;
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => {
    elements.toast.classList.remove("is-visible");
  }, 2400);
};

const buildWhatsAppLink = (message) => {
  if (!state.settings?.whatsappNumber) return "#";
  const text = encodeURIComponent(message);
  return `https://wa.me/${state.settings.whatsappNumber}?text=${text}`;
};

const buildOrderMessage = (order, settings) => {
  const service = order?.service || "Not selected";
  const size = order?.options?.size || "Not set";
  const quantity = order?.quantity || "Not set";
  const finish = order?.options?.finish || "Standard";
  const notes = order?.notes || "None";
  const helper = serviceHelpers[service] || {};
  const lines = [
    `Hello ${settings?.businessName || "Express Banners"} team,`,
    "",
    "Order Request",
    `Service: ${service}`,
    `Size: ${size}`,
    `Quantity: ${quantity}`,
    `Finish: ${finish}`,
    `Notes: ${notes}`,
    `Typical turnaround: ${helper.turnaround || "2-5 days"}`,
    `Best files: ${helper.files || "PDF, AI, EPS, PNG"}`,
    `Rush available: ${helper.rush || "Yes"}`,
  ];
  if (settings?.orderLinks?.artworkUploadUrl) {
    lines.push(`Artwork upload link: ${settings.orderLinks.artworkUploadUrl}`);
  }
  lines.push("", "Thanks!");
  return lines.join("\n");
};

const updateWhatsAppLinks = () => {
  if (!state.settings) return;
  const baseMessage = state.settings.whatsappDefaultMessage || "Hi Express Banners!";
  const orderMessage = buildOrderMessage(state.order, state.settings);
  const message = `${baseMessage}\n\n${orderMessage}`;
  const link = buildWhatsAppLink(message);
  elements.whatsappLinks.forEach((linkEl) => {
    linkEl.href = link;
    linkEl.target = "_blank";
    linkEl.rel = "noopener";
  });
};

const updateCatalogueLinks = () => {
  if (!state.settings) return;
  const message = state.settings.catalogueMessage || "Hi Express Banners! I'd like to see your full catalogue.";
  const link = buildWhatsAppLink(message);
  elements.catalogueLinks.forEach((linkEl) => {
    linkEl.href = link;
    linkEl.target = "_blank";
    linkEl.rel = "noopener";
  });
};

const initNav = () => {
  if (!elements.navToggle || !elements.navMenu || !elements.header) return;
  const focusableSelector = "a, button";
  let lastActive = null;

  const setExpanded = (isOpen) => {
    elements.navMenu.classList.toggle("is-open", isOpen);
    elements.navToggle.setAttribute("aria-expanded", String(isOpen));
    elements.navMenu.setAttribute("aria-hidden", String(!isOpen));
    document.body.classList.toggle("nav-open", isOpen);
    elements.navScrim?.classList.toggle("is-visible", isOpen);
    if (isOpen) {
      lastActive = document.activeElement;
      const first = elements.navMenu.querySelector(focusableSelector);
      first?.focus();
    } else {
      lastActive?.focus();
    }
  };

  const toggleMenu = () => {
    const isOpen = elements.navMenu.classList.contains("is-open");
    setExpanded(!isOpen);
  };

  const closeMenu = () => setExpanded(false);

  elements.navToggle.addEventListener("click", toggleMenu);
  elements.navScrim?.addEventListener("click", closeMenu);
  elements.navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
    if (event.key === "Tab" && elements.navMenu.classList.contains("is-open")) {
      const focusables = Array.from(elements.navMenu.querySelectorAll(focusableSelector));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
};

const initHeaderScroll = () => {
  if (!elements.header) return;
  let isTicking = false;
  const update = () => {
    const isScrolled = window.scrollY > 8;
    elements.header.classList.toggle("is-scrolled", isScrolled);
    isTicking = false;
  };
  window.addEventListener(
    "scroll",
    () => {
      if (!isTicking) {
        window.requestAnimationFrame(update);
        isTicking = true;
      }
    },
    { passive: true }
  );
  update();
};

const initReveal = () => {
  const revealEls = document.querySelectorAll(".reveal");
  if (!revealEls.length) return;
  if (prefersReducedMotion()) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  revealEls.forEach((el) => observer.observe(el));
};

const renderSkeletons = (target, count = 6, className = "skeleton") => {
  if (!target) return;
  target.innerHTML = "";
  Array.from({ length: count }).forEach(() => {
    const skeleton = document.createElement("div");
    skeleton.className = className;
    target.appendChild(skeleton);
  });
};

const renderMotionWallSkeletons = (target, rowCount = 3) => {
  if (!target) return;
  target.innerHTML = "";
  target.classList.add("motion-wall");
  Array.from({ length: rowCount }).forEach(() => {
    const row = document.createElement("div");
    row.className = "motion-wall-row";
    const track = document.createElement("div");
    track.className = "motion-wall-track";
    Array.from({ length: 6 }).forEach(() => {
      const skeleton = document.createElement("div");
      skeleton.className = "motion-wall-tile skeleton-tile";
      track.appendChild(skeleton);
    });
    row.appendChild(track);
    target.appendChild(row);
  });
};

const renderPortfolioItem = (item, index, isFeatured = false) => {
  const article = document.createElement("article");
  article.className = "card portfolio-card reveal";
  article.setAttribute("data-testid", `portfolio-item-${item.id}`);

  const tileSrc = getPortfolioItemSrc(item);

  article.innerHTML = `
    <button type="button" class="portfolio-thumb" data-portfolio-index="${index}" aria-label="Open ${item.title}" data-testid="portfolio-thumb-${item.id}">
      <img src="${tileSrc}" alt="${item.alt}" loading="lazy" onerror="this.onerror=null;this.src='${NEUTRAL_IMAGE_PLACEHOLDER}'" />
    </button>
    <div class="meta">
      <strong>${item.title}</strong>
      <span class="muted">${item.category}</span>
      <span class="muted">${item.blurb || ""}</span>
    </div>
  `;
  if (isFeatured) {
    article.classList.add("is-featured");
  }
  return article;
};

const renderPortfolioGrid = (container, items) => {
  if (!container) return;
  container.innerHTML = "";
  items.forEach((item) => {
    const index = state.portfolio.findIndex((entry) => entry.id === item.id);
    container.appendChild(renderPortfolioItem(item, index));
  });
};

const runPortfolioSanityCheck = () => {
  const renderedImages = Array.from(
    document.querySelectorAll("[data-portfolio-grid] img, [data-portfolio-featured] img, [data-motion-wall] img, [data-gallery-wall] img, [data-home-motion-wall] img, [data-about-gallery-wall] img, [data-order-motion-wall] img")
  )
    .map((img) => img.getAttribute("src"))
    .filter(Boolean);
  const uniqueCount = new Set(renderedImages).size;
  if (renderedImages.length && uniqueCount < 3) {
    console.warn("Portfolio rendering may be using a single image; check portfolio.json/src mapping.");
  }
};

const renderPortfolio = () => {
  if (!elements.portfolioGrid && !elements.portfolioFeatured) return;
  const featuredItems = state.portfolio.filter((item) => item.featured);
  const allItems = state.portfolio;

  if (elements.portfolioFeatured) {
    elements.portfolioFeatured.innerHTML = "";
    featuredItems.forEach((item) => {
      const itemIndex = allItems.findIndex((entry) => entry.id === item.id);
      elements.portfolioFeatured.appendChild(renderPortfolioItem(item, itemIndex, true));
    });
  }

  if (elements.portfolioGrid) {
    renderPortfolioGrid(elements.portfolioGrid, allItems);
  }

  bindPortfolioClicks();
};

const filterPortfolio = (category) => {
  if (!elements.portfolioGrid) return;
  const items = category === "All" ? state.portfolio : state.portfolio.filter((item) => item.category === category);
  renderPortfolioGrid(elements.portfolioGrid, items);
  bindPortfolioClicks();
};

const bindPortfolioClicks = () => {
  const buttons = document.querySelectorAll("[data-portfolio-index]");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.portfolioIndex);
      openLightbox(index);
    });
  });
  initReveal();
};

const openLightbox = (index) => {
  if (!elements.lightbox || !elements.lightboxImage || !elements.lightboxCaption) return;
  openLightbox.lastFocus = document.activeElement;
  state.currentIndex = index;
  const item = state.portfolio[index];
  if (!item) return;
  elements.lightboxImage.src = getPortfolioItemSrc(item);
  elements.lightboxImage.alt = item.alt;
  elements.lightboxCaption.textContent = `${item.title} — ${item.blurb || item.category}`;
  elements.lightbox.classList.add("is-open");
  document.body.classList.add("nav-open");
  elements.lightboxClose?.focus();
};

const closeLightbox = () => {
  elements.lightbox?.classList.remove("is-open");
  document.body.classList.remove("nav-open");
  openLightbox.lastFocus?.focus();
};

const showLightboxItem = (direction) => {
  if (!state.portfolio.length || !elements.lightboxImage || !elements.lightboxCaption) return;
  const total = state.portfolio.length;
  state.currentIndex = (state.currentIndex + direction + total) % total;
  const item = state.portfolio[state.currentIndex];
  elements.lightboxImage.src = getPortfolioItemSrc(item);
  elements.lightboxImage.alt = item.alt;
  elements.lightboxCaption.textContent = `${item.title} — ${item.blurb || item.category}`;
};

const initLightbox = () => {
  if (!elements.lightbox) return;
  const focusableSelector = "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])";
  elements.lightboxClose?.addEventListener("click", closeLightbox);
  elements.lightboxNext?.addEventListener("click", () => showLightboxItem(1));
  elements.lightboxPrev?.addEventListener("click", () => showLightboxItem(-1));

  elements.lightbox.addEventListener("click", (event) => {
    if (event.target === elements.lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!elements.lightbox.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      closeLightbox();
    }
    if (event.key === "ArrowRight") {
      showLightboxItem(1);
    }
    if (event.key === "ArrowLeft") {
      showLightboxItem(-1);
    }
    if (event.key === "Tab") {
      const focusables = Array.from(elements.lightbox.querySelectorAll(focusableSelector));
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
};

const initPortfolioFilters = () => {
  if (!elements.portfolioFilter) return;
  const buttons = elements.portfolioFilter.querySelectorAll("button");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.dataset.filter;
      buttons.forEach((btn) => btn.classList.toggle("is-active", btn === button));
      buttons.forEach((btn) => btn.setAttribute("aria-pressed", String(btn === button)));
      filterPortfolio(value);
    });
  });
};

const initOrderForm = () => {
  if (!elements.serviceSelect) return;
  const urlParams = new URLSearchParams(window.location.search);
  const defaultService = urlParams.get("service");

  elements.serviceSelect.addEventListener("change", (event) => {
    setService(event.target.value);
  });

  elements.servicePills.forEach((pill) => {
    pill.addEventListener("click", () => {
      setService(pill.dataset.value);
    });
  });

  elements.sizePills.forEach((pill) => {
    pill.addEventListener("click", () => {
      setActivePill(elements.sizePills, pill.dataset.value);
      if (pill.dataset.value === "Custom") {
        elements.customSizeWrap?.classList.remove("is-hidden");
        setSize(getCustomSizeValue());
      } else {
        elements.customSizeWrap?.classList.add("is-hidden");
        setSize(pill.dataset.value);
      }
    });
  });

  [elements.customWidthInput, elements.customHeightInput, elements.customUnitSelect].forEach((input) => {
    input?.addEventListener("input", () => {
      if (elements.customSizeWrap && !elements.customSizeWrap.classList.contains("is-hidden")) {
        setSize(getCustomSizeValue());
      }
    });
  });

  elements.qtyMinus?.addEventListener("click", () => {
    state.order.quantity = clampNumber(state.order.quantity - 1, 1, 999);
    if (elements.quantityInput) {
      elements.quantityInput.value = state.order.quantity;
    }
    updateSummary();
    updateWhatsAppLinks();
  });

  elements.qtyPlus?.addEventListener("click", () => {
    state.order.quantity = clampNumber(state.order.quantity + 1, 1, 999);
    if (elements.quantityInput) {
      elements.quantityInput.value = state.order.quantity;
    }
    updateSummary();
    updateWhatsAppLinks();
  });

  elements.quantityInput?.addEventListener("input", (event) => {
    state.order.quantity = clampNumber(Number(event.target.value || 1), 1, 999);
    updateSummary();
    updateWhatsAppLinks();
  });

  elements.finishSelect?.addEventListener("change", (event) => {
    state.order.options.finish = event.target.value;
    updateSummary();
    updateWhatsAppLinks();
  });

  elements.notesInput?.addEventListener("input", (event) => {
    state.order.notes = event.target.value;
    updateSummary();
    updateWhatsAppLinks();
  });

  if (defaultService) {
    setService(defaultService);
  }

  if (!state.order.service) {
    setService(elements.serviceSelect.value || "Banners");
  }

  elements.paymentButton?.addEventListener("click", () => {
    initPayment(state.order);
  });

  updateSummary();
};

const initPayment = (orderData) => {
  showToast("Card payments are launching soon. We'll guide you during confirmation.");
  console.log("Payment placeholder:", orderData);
};

const initContactSuccess = () => {
  if (!elements.contactSuccess) return;
  const params = new URLSearchParams(window.location.search);
  if (params.get("sent") === "1") {
    elements.contactSuccess.classList.remove("sr-only");
  }
};

const initActiveNav = () => {
  const path = window.location.pathname;
  elements.navLinks.forEach((link) => {
    const href = link.getAttribute("href") || "";
    if (href.includes("services") && path.includes("/services")) {
      link.classList.add("active");
    } else if (href.includes("portfolio") && path.includes("/portfolio")) {
      link.classList.add("active");
    } else if (href.includes("about") && path.includes("/about")) {
      link.classList.add("active");
    } else if (href.includes("order") && path.includes("/order")) {
      link.classList.add("active");
    } else if (href.includes("contact") && path.includes("/contact")) {
      link.classList.add("active");
    } else if ((href === "./" || href === "../" || href.includes("index")) && path.endsWith("/")) {
      if (!path.includes("/services") && !path.includes("/portfolio") && !path.includes("/about") && !path.includes("/order") && !path.includes("/contact") && !path.includes("/terms")) {
        link.classList.add("active");
      }
    }
  });
};

const applyBrandMedia = (settings) => {
  if (!settings) return;
  if (elements.logo && settings.images?.logo) {
    elements.logo.src = settings.images.logo;
    elements.logo.onerror = () => {
      elements.logo.style.display = "none";
    };
  }

  if (elements.homeHeroImage && settings.images?.homeHero) {
    elements.homeHeroImage.src = settings.images.homeHero;
    elements.homeHeroImage.onerror = () => {
      elements.homeHeroImage.src = NEUTRAL_IMAGE_PLACEHOLDER;
    };
  } else if (elements.heroMedia && settings.images?.homeHero) {
    elements.heroMedia.style.backgroundImage = `url("${settings.images.homeHero}")`;
  }
};

const applyServicesMedia = (settings) => {
  if (!settings?.servicesMedia) return;
  elements.serviceMediaBlocks.forEach((block) => {
    const serviceName = block.dataset.service;
    if (!serviceName) return;
    const serviceImageUrl = settings.servicesMedia[serviceName];
    if (!serviceImageUrl) return;
    const img = block.querySelector("img[data-service-image]");
    if (!img) return;
    img.src = serviceImageUrl;
    img.onerror = () => {
      img.onerror = null;
      img.src = NEUTRAL_IMAGE_PLACEHOLDER;
    };
  });
};

const applySettings = () => {
  if (!state.settings) return;
  if (elements.businessName.length) {
    setText(elements.businessName, state.settings.businessName);
  }
  if (elements.tagline.length) {
    setText(elements.tagline, state.settings.tagline);
  }
  if (elements.heroTitle && state.settings.heroTitle) {
    elements.heroTitle.textContent = state.settings.heroTitle;
  }
  applyBrandMedia(state.settings);
  if (elements.ogImage && state.settings.images?.og) {
    elements.ogImage.setAttribute("content", state.settings.images.og);
  }
  if (elements.mapLink && state.settings.mapLinkUrl) {
    elements.mapLink.href = state.settings.mapLinkUrl;
  }
  if (elements.address && state.settings.addressLine) {
    elements.address.textContent = state.settings.addressLine;
  }
  if (elements.hours && state.settings.hours) {
    elements.hours.textContent = state.settings.hours;
  }
  if (elements.instagram && state.settings.social?.instagram) {
    elements.instagram.href = state.settings.social.instagram;
  }
  if (elements.facebook && state.settings.social?.facebook) {
    elements.facebook.href = state.settings.social.facebook;
  }
  if (elements.tiktok && state.settings.social?.tiktok) {
    elements.tiktok.href = state.settings.social.tiktok;
  }
  if (elements.uploadLink) {
    if (state.settings.orderLinks?.artworkUploadUrl) {
      elements.uploadLink.href = state.settings.orderLinks.artworkUploadUrl;
    } else {
      elements.uploadLink.classList.add("is-hidden");
    }
  }
  if (elements.paymentNotice && state.settings.orderLinks?.paymentEnabled === false) {
    elements.paymentNotice.textContent = "Card payments (NCB) launching soon…";
  }
  if (elements.paymentButton) {
    const enabled = state.settings.orderLinks?.paymentEnabled === true;
    elements.paymentButton.disabled = !enabled;
    elements.paymentButton.setAttribute("aria-disabled", String(!enabled));
  }
  if (elements.contactForm && state.settings.contact?.formEndpoint) {
    elements.contactForm.action = state.settings.contact.formEndpoint;
  }
  if (elements.contactNext) {
    elements.contactNext.value = "./?sent=1";
  }

  applyServicesMedia(state.settings);

  if (elements.orderVideo && state.settings.orderHero?.poster) {
    elements.orderVideo.setAttribute("poster", state.settings.orderHero.poster);
  }

  if (prefersReducedMotion() && elements.orderVideo) {
    elements.orderVideo.pause();
    elements.orderVideo.removeAttribute("autoplay");
  }

  const metaDescription = document.querySelector("meta[name='description']");
  if (state.settings.seo?.title) {
    document.title = state.settings.seo.title;
  }
  if (state.settings.seo?.description && metaDescription) {
    metaDescription.setAttribute("content", state.settings.seo.description);
  }

  const seoKey = document.body.dataset.seoPage;
  if (seoKey && state.settings.seo?.[seoKey]) {
    const { title, description } = state.settings.seo[seoKey];
    if (title) document.title = title;
    if (metaDescription && description) {
      metaDescription.setAttribute("content", description);
    }
  }
};

/**
 * Cloudinary URL transformation helper
 */
const getCloudinaryTileSrc = (sourceUrl, width = 480) => {
  if (!sourceUrl) return "";
  if (sourceUrl.includes("/upload/") && !sourceUrl.includes("/upload/f_auto")) {
    return sourceUrl.replace("/upload/", `/upload/f_auto,q_auto,c_fill,g_auto,ar_4:3,w_${width}/`);
  }
  return sourceUrl;
};

/**
 * Split items into rows for motion wall
 */
const shuffleItems = (items) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const splitIntoRows = (items, rowCount) => {
  const shuffled = shuffleItems(items);
  const rows = Array.from({ length: rowCount }, (_, rowIndex) => []);
  rows.forEach((_, rowIndex) => {
    const rotated = shuffled.slice(rowIndex).concat(shuffled.slice(0, rowIndex));
    rows[rowIndex] = rotated.filter((__, index) => index % rowCount === 0);
  });
  return rows;
};

/**
 * Create a single gallery tile element
 */
const createMotionTile = (item, onClickIndex) => {
  const tile = document.createElement("button");
  tile.type = "button";
  tile.className = "motion-wall-tile";
  tile.setAttribute("aria-label", `View ${item.title || item.category || "portfolio item"}`);
  if (typeof onClickIndex === "number") {
    tile.setAttribute("data-portfolio-index", String(onClickIndex));
  }

  const img = document.createElement("img");
  img.alt = item.alt || item.title || "Portfolio image";
  img.loading = "lazy";
  img.decoding = "async";
  img.src = getCloudinaryTileSrc(getPortfolioItemSrc(item), 480);

  img.onerror = () => {
    img.onerror = null;
    img.src = NEUTRAL_IMAGE_PLACEHOLDER;
  };

  tile.appendChild(img);
  return tile;
};

/**
 * Bind pause/drag events to motion track
 */
const bindTrackInteraction = (track) => {
  const setPaused = (paused) => track.classList.toggle("is-paused", paused);

  track.addEventListener("mouseenter", () => setPaused(true));
  track.addEventListener("mouseleave", () => setPaused(false));
  track.addEventListener("focusin", () => setPaused(true));
  track.addEventListener("focusout", () => setPaused(false));
  track.addEventListener("touchstart", () => setPaused(true), { passive: true });
  track.addEventListener("touchend", () => setPaused(false));

  let pointerDown = false;
  let startX = 0;
  let startScrollLeft = 0;

  track.addEventListener("pointerdown", (event) => {
    pointerDown = true;
    setPaused(true);
    startX = event.clientX;
    startScrollLeft = track.scrollLeft;
    track.setPointerCapture(event.pointerId);
  });

  track.addEventListener("pointermove", (event) => {
    if (!pointerDown) return;
    const delta = event.clientX - startX;
    track.scrollLeft = startScrollLeft - delta;
  });

  const stopPointer = (event) => {
    if (!pointerDown) return;
    pointerDown = false;
    track.releasePointerCapture(event.pointerId);
  };

  track.addEventListener("pointerup", stopPointer);
  track.addEventListener("pointercancel", stopPointer);
};

/**
 * REUSABLE 3-WAY MOTION WALL COMPONENT
 * Renders a 3-row animated gallery with parallax-like motion
 * 
 * @param {HTMLElement} containerEl - Target container element
 * @param {Array} items - Array of portfolio items with src, title, alt, category
 * @param {Object} options - Configuration options
 * @param {number} options.rowCount - Number of rows (default: 3)
 * @param {number} options.baseDuration - Base animation duration in seconds (default: 60)
 * @param {boolean} options.clickable - Enable click to open lightbox (default: true)
 */
const renderMotionWall = (containerEl, items, options = {}) => {
  if (!containerEl) return;
  
  const {
    rowCount = 3,
    baseDuration = 60,
    clickable = true,
  } = options;

  containerEl.innerHTML = "";
  containerEl.classList.add("motion-wall");

  if (!items?.length) {
    renderMotionWallSkeletons(containerEl, rowCount);
    return;
  }

  // Respect reduced motion preference
  const reduceMotion = prefersReducedMotion();

  if (reduceMotion) {
    // Static grid fallback
    containerEl.classList.add("motion-wall--static");
    const grid = document.createElement("div");
    grid.className = "motion-wall-static-grid";
    items.slice(0, 12).forEach((item, idx) => {
      const portfolioIndex = state.portfolio.findIndex((p) => p.id === item.id);
      const tile = createMotionTile(item, clickable ? portfolioIndex : null);
      grid.appendChild(tile);
    });
    containerEl.appendChild(grid);
    if (clickable) bindPortfolioClicks();
    return;
  }

  const rows = splitIntoRows(items, rowCount);

  rows.forEach((rowItems, rowIndex) => {
    const row = document.createElement("div");
    row.className = "motion-wall-row";

    const track = document.createElement("div");
    track.className = "motion-wall-track";
    
    // Alternating directions for 3-way movement
    const direction = rowIndex % 2 === 0 ? "normal" : "reverse";
    // Varying speeds for parallax effect
    const duration = baseDuration + (rowIndex * 15);
    
    track.style.setProperty("--motion-direction", direction);
    track.style.setProperty("--motion-duration", `${duration}s`);

    // Duplicate items for seamless loop
    const laneItems = rowItems.length ? rowItems : items;
    const duplicatedItems = [...laneItems, ...laneItems];
    
    duplicatedItems.forEach((item) => {
      const portfolioIndex = state.portfolio.findIndex((p) => p.id === item.id);
      const tile = createMotionTile(item, clickable ? portfolioIndex : null);
      track.appendChild(tile);
    });

    bindTrackInteraction(track);
    row.appendChild(track);
    containerEl.appendChild(row);
  });

  if (clickable) {
    bindPortfolioClicks();
  }
};

/**
 * Initialize gallery wall (portfolio page)
 */
const initGalleryWall = () => {
  if (!elements.galleryWall) return;
  renderMotionWall(elements.galleryWall, state.portfolio, {
    rowCount: 3,
    baseDuration: 70,
    clickable: true,
  });
};

/**
 * Initialize about page gallery wall
 */
const initAboutGalleryWall = () => {
  if (!elements.aboutGalleryWall || !state.portfolio?.length) return;
  renderMotionWall(elements.aboutGalleryWall, state.portfolio, {
    rowCount: 3,
    baseDuration: 65,
    clickable: true,
  });
};

/**
 * Initialize home page motion wall
 */
const initHomeMotionWall = () => {
  if (!elements.homeMotionWall || !state.portfolio?.length) return;
  const featured = state.portfolio.filter((item) => item.featured);
  const items = featured.length >= 6 ? featured : state.portfolio.slice(0, 9);
  renderMotionWall(elements.homeMotionWall, items, {
    rowCount: 3,
    baseDuration: 55,
    clickable: true,
  });
};

/**
 * Initialize order page motion wall
 */
const initOrderMotionWall = () => {
  if (!elements.orderMotionWall || !state.portfolio?.length) return;
  const shuffled = [...state.portfolio].sort(() => 0.5 - Math.random()).slice(0, 9);
  renderMotionWall(elements.orderMotionWall, shuffled, {
    rowCount: 3,
    baseDuration: 60,
    clickable: true,
  });
};

/**
 * Initialize work wall (order page legacy)
 */
const initWorkWall = () => {
  if (!elements.workWall || !state.portfolio.length) return;
  const items = [...state.portfolio].sort(() => 0.5 - Math.random()).slice(0, 8);
  elements.workWall.innerHTML = "";
  items.forEach((item) => {
    const index = state.portfolio.findIndex((entry) => entry.id === item.id);
    const card = document.createElement("button");
    card.type = "button";
    card.className = "work-card";
    card.setAttribute("data-portfolio-index", String(index));
    card.setAttribute("aria-label", `Open ${item.title}`);
    
    card.innerHTML = `<img src="${getPortfolioItemSrc(item)}" alt="${item.alt}" loading="lazy" onerror="this.onerror=null;this.src='${NEUTRAL_IMAGE_PLACEHOLDER}'" />`;
    elements.workWall.appendChild(card);
  });
  bindPortfolioClicks();
};

/**
 * Initialize all motion walls on the page
 */
const initAllMotionWalls = () => {
  initGalleryWall();
  initAboutGalleryWall();
  initHomeMotionWall();
  initOrderMotionWall();
};

/**
 * Load real Cloudinary media for portfolio grids and motion walls
 */
const loadCloudinaryMedia = async () => {
  // Prefer dedicated gallery endpoint to get full Cloudinary image set
  const galleryData = await fetchGallery(PORTFOLIO_TAGS);
  if (galleryData.items.length) {
    const uniqueItems = [];
    const seen = new Set();
    galleryData.items.forEach((item) => {
      if (!item?.public_id || seen.has(item.public_id)) return;
      seen.add(item.public_id);
      uniqueItems.push(item);
    });

    const cloudItems = mediaItemsToPortfolio(uniqueItems, "Portfolio");
    state.portfolio = cloudItems;
  } else {
    // Fallback to /media endpoint for compatibility
    const catalogueData = await fetchMedia(FOLDER_MAP.portfolio, 200);
    if (catalogueData.items.length) {
      const cloudItems = mediaItemsToPortfolio(catalogueData.items, "Portfolio");
      state.portfolio = cloudItems;
    }
  }

  // Re-render everything with real Cloudinary data
  renderPortfolio();
  initPortfolioFilters();
  initLightbox();
  initWorkWall();
  initAllMotionWalls();
  runPortfolioSanityCheck();
};

/**
 * Load service-specific images from Cloudinary folders
 */
const loadServiceMedia = async () => {
  const serviceNames = ["Signs", "Banners", "Embroidery", "Screen Printing", "Graphic Designing"];
  const uniqueFolders = [...new Set(serviceNames.map((s) => FOLDER_MAP[s]))];

  // Fetch each unique folder in parallel
  const folderResults = {};
  await Promise.all(
    uniqueFolders.map(async (folder) => {
      const data = await fetchMedia(folder, 10);
      folderResults[folder] = data.items || [];
    })
  );

  // Apply to service image elements  
  // Track usage per folder to avoid duplicate images across services sharing a folder
  const folderUsedIndex = {};
  elements.serviceMediaBlocks.forEach((block) => {
    const serviceName = block.dataset.service;
    if (!serviceName) return;
    const folder = FOLDER_MAP[serviceName];
    if (!folder) return;
    const items = folderResults[folder] || [];
    if (!items.length) return;

    const img = block.querySelector("img[data-service-image]");
    if (!img) return;

    // Use sequential index so shared folders get different images
    const idx = folderUsedIndex[folder] || 0;
    folderUsedIndex[folder] = idx + 1;
    const pick = items[idx % items.length];
    if (pick?.secure_url) {
      img.src = getCloudinaryTileSrc(pick.secure_url, 600);
      img.onerror = () => {
        img.onerror = null;
        img.src = NEUTRAL_IMAGE_PLACEHOLDER;
      };
    }
  });

  // Also update service images on homepage if they exist
  elements.serviceImages.forEach((img) => {
    const serviceName = img.dataset.serviceImage;
    if (!serviceName) return;
    const folder = FOLDER_MAP[serviceName];
    if (!folder) return;
    const items = folderResults[folder] || [];
    if (!items.length) return;

    const pick = items[Math.floor(Math.random() * items.length)];
    if (pick?.secure_url) {
      img.src = getCloudinaryTileSrc(pick.secure_url, 600);
      img.onerror = () => {
        img.onerror = null;
        img.src = NEUTRAL_IMAGE_PLACEHOLDER;
      };
    }
  });
};

const loadPortfolioData = async () => {
  const basePath = getBasePath();
  const portfolioResponse = await fetch(`${basePath}data/portfolio.json`);
  if (!portfolioResponse.ok) {
    throw new Error(`Portfolio fetch failed with status ${portfolioResponse.status}`);
  }
  const portfolioItems = await portfolioResponse.json();
  return Array.isArray(portfolioItems) ? portfolioItems : [];
};

const initSettings = async () => {
  const basePath = getBasePath();

  // Show skeleton loaders
  if (elements.portfolioFeatured) {
    renderSkeletons(elements.portfolioFeatured, 6);
  }
  if (elements.portfolioGrid) {
    renderSkeletons(elements.portfolioGrid, 9);
  }
  if (elements.workWall) {
    renderSkeletons(elements.workWall, 6);
  }
  if (elements.aboutGalleryWall) {
    renderMotionWallSkeletons(elements.aboutGalleryWall, 3);
  }
  if (elements.galleryWall) {
    renderMotionWallSkeletons(elements.galleryWall, 3);
  }
  if (elements.homeMotionWall) {
    renderMotionWallSkeletons(elements.homeMotionWall, 3);
  }
  if (elements.orderMotionWall) {
    renderMotionWallSkeletons(elements.orderMotionWall, 3);
  }

  try {
    const settingsResponse = await fetch(`${basePath}data/settings.json`);
    if (!settingsResponse.ok) {
      throw new Error(`Settings fetch failed with status ${settingsResponse.status}`);
    }
    state.settings = await settingsResponse.json();
    // Load fallback portfolio data from static JSON first
    state.portfolio = await loadPortfolioData();
  } catch (error) {
    console.error("Failed to load settings:", error);
    return;
  }

  applySettings();
  updateWhatsAppLinks();
  updateCatalogueLinks();

  // Render with static fallback data immediately
  renderPortfolio();
  initPortfolioFilters();
  initLightbox();
  initOrderForm();
  initWorkWall();
  initAllMotionWalls();
  runPortfolioSanityCheck();

  // Now load real Cloudinary media (non-blocking)
  loadCloudinaryMedia();
  loadServiceMedia();
};

const init = () => {
  if (elements.year) {
    elements.year.textContent = new Date().getFullYear();
  }
  initNav();
  initHeaderScroll();
  initReveal();
  initActiveNav();
  initContactSuccess();
  initSettings();
};

init();
