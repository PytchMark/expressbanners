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

const elements = {
  businessName: document.querySelectorAll("[data-business-name]"),
  tagline: document.querySelectorAll("[data-tagline]"),
  heroTitle: document.querySelector("[data-hero-title]"),
  heroImage: document.querySelector("[data-hero-image]"),
  whatsappLinks: document.querySelectorAll("[data-whatsapp]"),
  uploadLink: document.querySelector("[data-upload-link]"),
  mapLink: document.querySelector("[data-map-link]"),
  address: document.querySelector("[data-address]"),
  hours: document.querySelector("[data-hours]"),
  year: document.querySelector("[data-year]"),
  instagram: document.querySelector("[data-instagram]"),
  facebook: document.querySelector("[data-facebook]"),
  tiktok: document.querySelector("[data-tiktok]"),
  logo: document.querySelector("[data-logo]") || document.querySelector("[data-logo-src]"),
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
  portfolioFeatured: document.querySelector("[data-portfolio-featured]") || document.querySelector("[data-portfolio-grid]"),
  portfolioGrid: document.querySelector("[data-portfolio-grid]"),
  portfolioFilter: document.querySelector("[data-filter-controls]"),
  lightbox: document.querySelector("[data-lightbox]"),
  lightboxImage: document.querySelector("[data-lightbox-image]"),
  lightboxCaption: document.querySelector("[data-lightbox-caption]"),
  lightboxClose: document.querySelector("[data-lightbox-close]"),
  lightboxNext: document.querySelector("[data-lightbox-next]"),
  lightboxPrev: document.querySelector("[data-lightbox-prev]"),
  contactSuccess: document.querySelector("[data-contact-success]"),
};

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isCoarsePointer = () => window.matchMedia("(hover: none) and (pointer: coarse)").matches;

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
};

const setSize = (size) => {
  state.order.options.size = size;
  updateSummary();
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

const buildOrderMessage = () => {
  const { service, options, quantity, notes } = state.order;
  const helper = serviceHelpers[service] || {};
  const lines = [
    `Hello ${state.settings?.businessName || "Express Banners"} team,`,
    "",
    "Order Request",
    `Service: ${service || "Not selected"}`,
    `Size: ${options.size || "Not set"}`,
    `Quantity: ${quantity || "Not set"}`,
    `Finish: ${options.finish || "Standard"}`,
    `Notes: ${notes || "None"}`,
    `Typical turnaround: ${helper.turnaround || "2-5 days"}`,
    `Best files: ${helper.files || "PDF, AI, EPS, PNG"}`,
    `Rush available: ${helper.rush || "Yes"}`,
  ];
  if (state.settings?.orderLinks?.artworkUploadUrl) {
    lines.push(`Artwork upload link: ${state.settings.orderLinks.artworkUploadUrl}`);
  }
  lines.push("", "Thanks!");
  return lines.join("\n");
};

const buildWhatsAppMessage = (order, settings) => {
  const service = order?.service || "Not selected";
  const size = order?.options?.size || "Not set";
  const quantity = order?.quantity || "Not set";
  const finish = order?.options?.finish || "Standard";
  const notes = order?.notes || "None";
  const helper = serviceHelpers[service] || {};
  return [
    `Hello ${settings?.businessName || "Express Banners"} team,`,
    "",
    "Order Request",
    `Service: ${service}`,
    `Size: ${size}`,
    `Quantity: ${quantity}`,
    `Finish: ${finish}`,
    `Notes: ${notes}`,
    `Typical turnaround: ${helper.turnaround || "2-5 days"}`,
  ].join("\n");
};

const updateWhatsAppLinks = () => {
  const message = state.settings?.whatsappDefaultMessage
    ? `${state.settings.whatsappDefaultMessage}\n\n${buildOrderMessage()}`
    : buildOrderMessage();
  const link = buildWhatsAppLink(message);
  elements.whatsappLinks.forEach((linkEl) => {
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

  elements.navToggle.addEventListener("click", toggleMenu);
  elements.navScrim?.addEventListener("click", () => setExpanded(false));
  elements.navLinks.forEach((link) => {
    link.addEventListener("click", () => setExpanded(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setExpanded(false);
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
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && elements.navToggle.getAttribute("aria-expanded") === "true") {
      closeMenu();
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

const renderPortfolioItem = (item, index, isFeatured = false) => {
  const article = document.createElement("article");
  article.className = "card portfolio-card reveal";
  article.innerHTML = `
    <button type="button" class="portfolio-thumb" data-portfolio-index="${index}" aria-label="Open ${item.title}">
      <img src="${item.src}" alt="${item.alt}" loading="lazy" />
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

const renderPortfolio = () => {
  if (!elements.portfolioGrid && !elements.portfolioFeatured) return;
  const featuredWrap = elements.portfolioFeatured && elements.portfolioFeatured !== elements.portfolioGrid
    ? elements.portfolioFeatured
    : elements.portfolioFeatured;
  const featuredItems = state.portfolio.filter((item) => item.featured);
  const allItems = state.portfolio;

  if (featuredWrap) {
    featuredWrap.innerHTML = "";
    featuredItems.forEach((item, index) => {
      const itemIndex = allItems.findIndex((entry) => entry.id === item.id);
      featuredWrap.appendChild(renderPortfolioItem(item, itemIndex, true));
    });
  }

  if (elements.portfolioGrid) {
    elements.portfolioGrid.innerHTML = "";
    allItems.forEach((item, index) => {
      elements.portfolioGrid.appendChild(renderPortfolioItem(item, index));
    });
  }

  bindPortfolioClicks();
};

const filterPortfolio = (category) => {
  if (!elements.portfolioGrid) return;
  const items = category === "All"
    ? state.portfolio
    : state.portfolio.filter((item) => item.category === category);
  elements.portfolioGrid.innerHTML = "";
  items.forEach((item) => {
    const index = state.portfolio.findIndex((entry) => entry.id === item.id);
    elements.portfolioGrid.appendChild(renderPortfolioItem(item, index));
  });
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
  if (!elements.lightbox) return;
  openLightbox.lastFocus = document.activeElement;
  state.currentIndex = index;
  const item = state.portfolio[index];
  if (!item) return;
  elements.lightboxImage.src = item.src;
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
  if (!state.portfolio.length) return;
  const total = state.portfolio.length;
  state.currentIndex = (state.currentIndex + direction + total) % total;
  const item = state.portfolio[state.currentIndex];
  elements.lightboxImage.src = item.src;
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
    elements.quantityInput.value = state.order.quantity;
    updateSummary();
  });

  elements.qtyPlus?.addEventListener("click", () => {
    state.order.quantity = clampNumber(state.order.quantity + 1, 1, 999);
    elements.quantityInput.value = state.order.quantity;
    updateSummary();
  });

  elements.quantityInput?.addEventListener("input", (event) => {
    state.order.quantity = clampNumber(Number(event.target.value || 1), 1, 999);
    updateSummary();
  });

  elements.finishSelect?.addEventListener("change", (event) => {
    state.order.options.finish = event.target.value;
    updateSummary();
  });

  elements.notesInput?.addEventListener("input", (event) => {
    state.order.notes = event.target.value;
    updateSummary();
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
  showToast("Secure payments are launching soon. We'll guide you during confirmation.");
  console.log("Payment placeholder:", orderData);
};

const initContactSuccess = () => {
  if (!elements.contactSuccess) return;
  const params = new URLSearchParams(window.location.search);
  if (params.get("sent") === "1") {
    elements.contactSuccess.classList.remove("sr-only");
  }
};

const initSettings = async () => {
  const basePath = document.body.dataset.base || "./";
  try {
    const [settingsResponse, portfolioResponse] = await Promise.all([
      fetch(`${basePath}data/settings.json`),
      fetch(`${basePath}data/portfolio.json`),
    ]);
    state.settings = await settingsResponse.json();
    state.portfolio = await portfolioResponse.json();
  } catch (error) {
    console.error("Failed to load settings:", error);
    return;
  }

  if (elements.businessName.length) {
    setText(elements.businessName, state.settings.businessName);
  }
  if (elements.tagline.length) {
    setText(elements.tagline, state.settings.tagline);
  }
  if (elements.heroTitle && state.settings.heroTitle) {
    elements.heroTitle.textContent = state.settings.heroTitle;
  }
  if (elements.logo && state.settings.images?.logo) {
    elements.logo.src = state.settings.images.logo;
  }
  if (elements.heroImage && state.settings.images?.hero) {
    elements.heroImage.src = state.settings.images.hero;
  }
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
  if (elements.uploadLink && state.settings.orderLinks?.artworkUploadUrl) {
    elements.uploadLink.href = state.settings.orderLinks.artworkUploadUrl;
  }
  if (elements.paymentNotice && state.settings.orderLinks?.paymentEnabled === false) {
    elements.paymentNotice.textContent = "Secure card payments via NCB are coming soon.";
  }

  const seoKey = document.body.dataset.seoPage;
  if (seoKey && state.settings.seo?.[seoKey]) {
    const { title, description } = state.settings.seo[seoKey];
    if (title) document.title = title;
    const metaDescription = document.querySelector("meta[name='description']");
    if (metaDescription && description) {
      metaDescription.setAttribute("content", description);
    }
  }

  updateWhatsAppLinks();
  renderPortfolio();
  initPortfolioFilters();
  initLightbox();
  initOrderForm();
};

const initActiveNav = () => {
  const path = window.location.pathname;
  elements.navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;
    if (path.endsWith(href) || (href.endsWith("/") && path.endsWith(href))) {
      link.classList.add("active");
    }
  });
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
