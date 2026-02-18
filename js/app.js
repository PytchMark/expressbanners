const state = {
  settings: null,
  portfolio: [],
  gallery: [],
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
  logo: document.querySelector("#siteLogo") || document.querySelector("[data-logo]"),
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


const SERVICE_FOLDER_BY_SLUG = {
  catalogue: "catalogue",
  embroidery: "Embroidery",
  "promotional-printing": "Promotional Printing",
  "signs-and-banners": "SignsandBanners",
  signs: "SignsandBanners",
  banners: "SignsandBanners",
  "graphic-designing": "Promotional Printing",
  "screen-printing": "catalogue",
};

const isExplicitImageUrl = (url) => {
  if (!url) return false;
  return !url.includes("YOUR_CLOUD_NAME");
};

const pickRepresentativeImage = (items, folder) => {
  const inFolder = (items || []).filter((item) => item.folder === folder);
  return inFolder[0] || null;
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

const renderSkeletons = (target, count = 6) => {
  if (!target) return;
  target.innerHTML = "";
  Array.from({ length: count }).forEach(() => {
    const skeleton = document.createElement("div");
    skeleton.className = "skeleton";
    target.appendChild(skeleton);
  });
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
    featuredItems.forEach((item) => {
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
  if (!elements.lightbox || !elements.lightboxImage || !elements.lightboxCaption) return;
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
  if (!state.portfolio.length || !elements.lightboxImage || !elements.lightboxCaption) return;
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
  if (elements.logo && state.settings.images?.logo) {
    elements.logo.src = state.settings.images.logo;
  }
  if (elements.heroImage && state.settings.images?.homeHero) {
    elements.heroImage.src = state.settings.images.homeHero;
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

  elements.serviceImages?.forEach((img) => {
    const key = img.dataset.serviceImage;
    if (key && state.settings.servicesMedia?.[key]) {
      img.src = state.settings.servicesMedia[key];
    }
  });

  if (elements.orderVideo && state.settings.orderHero?.videoMp4) {
    elements.orderVideo.src = state.settings.orderHero.videoMp4;
  }
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


const getCloudinaryTileSrc = (sourceUrl, width = 480) => {
  if (!sourceUrl || !sourceUrl.includes("/upload/")) return sourceUrl;
  return sourceUrl.replace("/upload/", `/upload/f_auto,q_auto,c_fill,g_auto,ar_4:3,w_${width}/`);
};

const splitIntoRows = (items, rowCount) => {
  const rows = Array.from({ length: rowCount }, () => []);
  items.forEach((item, index) => {
    rows[index % rowCount].push(item);
  });
  return rows;
};

const createGalleryTile = (item) => {
  const tile = document.createElement("article");
  tile.className = "gallery-wall-tile";

  const img = document.createElement("img");
  img.alt = item.folder ? `${item.folder} portfolio image` : "Portfolio image";
  img.loading = "lazy";
  img.decoding = "async";
  img.src = getCloudinaryTileSrc(item.secure_url, 480);
  img.srcset = [
    `${getCloudinaryTileSrc(item.secure_url, 320)} 320w`,
    `${getCloudinaryTileSrc(item.secure_url, 480)} 480w`,
    `${getCloudinaryTileSrc(item.secure_url, 640)} 640w`,
  ].join(", ");
  img.sizes = "(max-width: 640px) 42vw, (max-width: 1024px) 24vw, 16vw";

  tile.appendChild(img);
  return tile;
};

const bindRowPause = (rowTrack) => {
  const setPaused = (paused) => rowTrack.classList.toggle("is-paused", paused);

  rowTrack.addEventListener("mouseenter", () => setPaused(true));
  rowTrack.addEventListener("mouseleave", () => setPaused(false));
  rowTrack.addEventListener("focusin", () => setPaused(true));
  rowTrack.addEventListener("focusout", () => setPaused(false));
  rowTrack.addEventListener("touchstart", () => setPaused(true), { passive: true });
  rowTrack.addEventListener("touchend", () => setPaused(false));

  let pointerDown = false;
  let startX = 0;
  let startScrollLeft = 0;

  rowTrack.addEventListener("pointerdown", (event) => {
    pointerDown = true;
    setPaused(true);
    startX = event.clientX;
    startScrollLeft = rowTrack.scrollLeft;
    rowTrack.setPointerCapture(event.pointerId);
  });

  rowTrack.addEventListener("pointermove", (event) => {
    if (!pointerDown) return;
    const delta = event.clientX - startX;
    rowTrack.scrollLeft = startScrollLeft - delta;
  });

  const stopPointer = (event) => {
    if (!pointerDown) return;
    pointerDown = false;
    rowTrack.releasePointerCapture(event.pointerId);
  };

  rowTrack.addEventListener("pointerup", stopPointer);
  rowTrack.addEventListener("pointercancel", stopPointer);
};

const renderGalleryWall = (target, items) => {
  if (!target) return;
  target.innerHTML = "";

  if (!items?.length) {
    renderSkeletons(target, 6);
    return;
  }

  const rows = splitIntoRows(items, 3);

  rows.forEach((rowItems, index) => {
    const row = document.createElement("div");
    row.className = "gallery-wall-row";

    const track = document.createElement("div");
    track.className = "gallery-wall-track";
    track.style.setProperty("--wall-direction", index % 2 === 0 ? "normal" : "reverse");
    track.style.setProperty("--wall-duration", `${80 + index * 12}s`);

    const repeated = rowItems.concat(rowItems);
    repeated.forEach((item) => {
      track.appendChild(createGalleryTile(item));
    });

    bindRowPause(track);
    row.appendChild(track);
    target.appendChild(row);
  });
};

const fetchGalleryItems = async () => {
  if (state.gallery?.length) return state.gallery;

  const response = await fetch("/api/gallery");
  if (!response.ok) throw new Error("gallery request failed");
  const payload = await response.json();
  state.gallery = payload.items || [];
  return state.gallery;
};

const initGalleryWall = async () => {
  if (!elements.galleryWall) return;
  renderSkeletons(elements.galleryWall, 6);

  try {
    const items = await fetchGalleryItems();
    renderGalleryWall(elements.galleryWall, items);
  } catch (error) {
    // Keep skeleton fallback when gallery API is unavailable.
  }
};

const initAboutGalleryWall = async () => {
  if (!elements.aboutGalleryWall) return;
  renderSkeletons(elements.aboutGalleryWall, 6);

  try {
    const items = await fetchGalleryItems();
    renderGalleryWall(elements.aboutGalleryWall, items);
  } catch (error) {
    if (!state.portfolio?.length) {
      elements.aboutGalleryWall.innerHTML = "";
      return;
    }

    renderGalleryWall(
      elements.aboutGalleryWall,
      state.portfolio.map((item) => ({
        secure_url: item.src,
        folder: item.category || "portfolio",
      }))
    );
  }
};

const initServicesMedia = async () => {
  if (!elements.serviceMediaBlocks?.length) return;

  let galleryItems = [];
  try {
    galleryItems = await fetchGalleryItems();
  } catch (error) {
    galleryItems = [];
  }

  elements.serviceMediaBlocks.forEach((block) => {
    const slug = block.dataset.serviceMedia;
    const folder = SERVICE_FOLDER_BY_SLUG[slug];
    const image = block.querySelector("img");
    if (!image) return;

    if (isExplicitImageUrl(image.getAttribute("src"))) {
      return;
    }

    const representative = pickRepresentativeImage(galleryItems, folder);
    if (representative?.secure_url) {
      image.src = getCloudinaryTileSrc(representative.secure_url, 900);
    }
  });
};

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
    card.innerHTML = `<img src="${item.src}" alt="${item.alt}" loading="lazy" />`;
    elements.workWall.appendChild(card);
  });
  bindPortfolioClicks();
};

const initSettings = async () => {
  const basePath = document.body.dataset.base || "./";
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
    renderSkeletons(elements.aboutGalleryWall, 6);
  }
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

  applySettings();
  updateWhatsAppLinks();
  renderPortfolio();
  initPortfolioFilters();
  initLightbox();
  initOrderForm();
  initWorkWall();
  await initGalleryWall();
  await initAboutGalleryWall();
  await initServicesMedia();
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
