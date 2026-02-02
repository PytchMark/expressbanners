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
    quantity: "",
    notes: "",
    timestamp: new Date().toISOString(),
  },
};

const elements = {
  businessName: document.querySelectorAll("[data-business-name]"),
  heroTitle: document.querySelector("[data-hero-title]"),
  tagline: document.querySelector("[data-tagline]"),
  whatsappLinks: document.querySelectorAll("[data-whatsapp]"),
  uploadLink: document.querySelector("[data-upload-link]"),
  mapLink: document.querySelector("[data-map-link]"),
  address: document.querySelector("[data-address]"),
  hours: document.querySelector("[data-hours]"),
  year: document.querySelector("[data-year]"),
  instagram: document.querySelector("[data-instagram]"),
  facebook: document.querySelector("[data-facebook]"),
  tiktok: document.querySelector("[data-tiktok]"),
  serviceSelect: document.querySelector("#service-select"),
  sizeInput: document.querySelector("#size-input"),
  quantityInput: document.querySelector("#quantity-input"),
  finishSelect: document.querySelector("#finish-select"),
  notesInput: document.querySelector("#notes-input"),
  summaryService: document.querySelector("[data-summary-service]"),
  summarySize: document.querySelector("[data-summary-size]"),
  summaryQuantity: document.querySelector("[data-summary-quantity]"),
  summaryFinish: document.querySelector("[data-summary-finish]"),
  summaryNotes: document.querySelector("[data-summary-notes]"),
  paymentButton: document.querySelector("[data-payment-button]"),
  paymentNotice: document.querySelector("[data-payment-notice]"),
  whatsappAlt: document.querySelector("[data-whatsapp-alt]"),
  portfolioGrid: document.querySelector("[data-portfolio-grid]"),
  lightbox: document.querySelector("[data-lightbox]"),
  lightboxImage: document.querySelector(".lightbox-content img"),
  lightboxCaption: document.querySelector(".lightbox-caption"),
  lightboxClose: document.querySelector(".lightbox-close"),
  lightboxNext: document.querySelector(".lightbox-next"),
  lightboxPrev: document.querySelector(".lightbox-prev"),
  bottomCta: document.querySelector("[data-bottom-cta]"),
  navToggle: document.querySelector(".nav-toggle"),
  navMenu: document.querySelector(".nav-links"),
  navLinks: document.querySelectorAll("[data-nav-link]"),
};

const setText = (nodes, value) => {
  nodes.forEach((node) => {
    node.textContent = value;
  });
};

const buildWhatsAppLink = (message) => {
  if (!state.settings?.whatsappNumber) return "#";
  const text = encodeURIComponent(message);
  return `https://wa.me/${state.settings.whatsappNumber}?text=${text}`;
};

const buildOrderMessage = () => {
  const { service, options, quantity, notes } = state.order;
  const lines = [
    `Service: ${service || "Not selected"}`,
    `Size: ${options.size || "Not set"}`,
    `Quantity: ${quantity || "Not set"}`,
    `Finish: ${options.finish || "Standard"}`,
    `Notes: ${notes || "None"}`,
  ];
  if (state.settings?.orderLinks?.artworkUploadUrl) {
    lines.push(`Artwork upload link: ${state.settings.orderLinks.artworkUploadUrl}`);
  }
  return lines.join("\n");
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

const updateSummary = () => {
  elements.summaryService.textContent = state.order.service || "Not selected";
  elements.summarySize.textContent = state.order.options.size || "Not set";
  elements.summaryQuantity.textContent = state.order.quantity || "Not set";
  elements.summaryFinish.textContent = state.order.options.finish || "Standard";
  elements.summaryNotes.textContent = state.order.notes || "None";
  updateWhatsAppLinks();
};

const handleOrderInput = () => {
  state.order.service = elements.serviceSelect.value;
  state.order.options.size = elements.sizeInput.value.trim();
  state.order.quantity = elements.quantityInput.value.trim();
  state.order.options.finish = elements.finishSelect.value;
  state.order.notes = elements.notesInput.value.trim();
  state.order.timestamp = new Date().toISOString();
  updateSummary();
};

const bindOrderInputs = () => {
  [
    elements.serviceSelect,
    elements.sizeInput,
    elements.quantityInput,
    elements.finishSelect,
    elements.notesInput,
  ].forEach((input) => {
    input.addEventListener("input", handleOrderInput);
    input.addEventListener("change", handleOrderInput);
  });
};

const bindServiceCards = () => {
  document.querySelectorAll("[data-service-order]").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest("[data-service]");
      if (!card) return;
      const service = card.dataset.service;
      elements.serviceSelect.value = service;
      state.order.service = service;
      updateSummary();
      document.querySelector("#order").scrollIntoView({ behavior: "smooth" });
    });
  });
};

const initAccordion = () => {
  document.querySelectorAll(".faq-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      document.querySelectorAll(".faq-item").forEach((item) => item.setAttribute("aria-expanded", "false"));
      btn.setAttribute("aria-expanded", expanded ? "false" : "true");
    });
  });
};

const initNav = () => {
  if (!elements.navToggle) return;
  elements.navToggle.addEventListener("click", () => {
    const isOpen = elements.navToggle.getAttribute("aria-expanded") === "true";
    elements.navToggle.setAttribute("aria-expanded", String(!isOpen));
    elements.navMenu.classList.toggle("open");
  });
  elements.navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      elements.navMenu.classList.remove("open");
      elements.navToggle.setAttribute("aria-expanded", "false");
    });
  });
};

const initActiveNav = () => {
  const sections = document.querySelectorAll("main section[id]");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = document.querySelector(`[data-nav-link][href="#${entry.target.id}"]`);
        if (link) {
          link.classList.toggle("active", entry.isIntersecting);
        }
      });
    },
    { threshold: 0.5 }
  );
  sections.forEach((section) => observer.observe(section));
};

const initReveal = () => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
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
  document.querySelectorAll(".section, .card, .stat-chip, .portfolio-tile").forEach((el) => {
    el.classList.add("reveal");
    observer.observe(el);
  });
};

const initBottomCta = () => {
  const footer = document.querySelector("footer");
  const update = () => {
    const scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    const nearFooter = footer.getBoundingClientRect().top < window.innerHeight + 80;
    if (scrollProgress > 0.2 && !nearFooter) {
      elements.bottomCta.classList.add("is-visible");
    } else {
      elements.bottomCta.classList.remove("is-visible");
    }
  };
  window.addEventListener("scroll", update);
  update();
};

const initPortfolio = async () => {
  try {
    const response = await fetch("data/portfolio.json");
    const items = await response.json();
    state.portfolio = items;
    renderPortfolio();
  } catch (error) {
    console.error("Portfolio load failed", error);
  }
};

const renderPortfolio = () => {
  elements.portfolioGrid.innerHTML = "";
  state.portfolio.forEach((item, index) => {
    const tile = document.createElement("div");
    tile.className = "portfolio-tile";
    tile.innerHTML = `
      <div class="portfolio-card" data-portfolio-card>
        <div class="portfolio-front">
          <img src="${item.src}" alt="${item.alt}" width="300" height="300" />
        </div>
        <div class="portfolio-overlay">
          <strong>${item.title}</strong>
          <span>${item.category}</span>
        </div>
      </div>
      <button class="portfolio-button" type="button" aria-label="Open ${item.title}" data-index="${index}"></button>
    `;
    elements.portfolioGrid.appendChild(tile);
  });
  document.querySelectorAll(".portfolio-button").forEach((button) => {
    button.addEventListener("click", () => openLightbox(Number(button.dataset.index)));
  });
};

const openLightbox = (index) => {
  state.currentIndex = index;
  const item = state.portfolio[index];
  if (!item) return;
  elements.lightboxImage.src = item.src;
  elements.lightboxImage.alt = item.alt;
  elements.lightboxCaption.textContent = `${item.title} · ${item.category}`;
  elements.lightbox.classList.add("is-open");
  elements.lightbox.setAttribute("aria-hidden", "false");
  elements.lightboxClose.focus();
  document.body.style.overflow = "hidden";
};

const closeLightbox = () => {
  elements.lightbox.classList.remove("is-open");
  elements.lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
};

const navigateLightbox = (direction) => {
  const total = state.portfolio.length;
  state.currentIndex = (state.currentIndex + direction + total) % total;
  openLightbox(state.currentIndex);
};

const trapFocus = (event) => {
  if (!elements.lightbox.classList.contains("is-open")) return;
  const focusable = Array.from(
    elements.lightbox.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.key === "Tab") {
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
};

const bindLightbox = () => {
  elements.lightboxClose.addEventListener("click", closeLightbox);
  elements.lightboxNext.addEventListener("click", () => navigateLightbox(1));
  elements.lightboxPrev.addEventListener("click", () => navigateLightbox(-1));
  elements.lightbox.addEventListener("click", (event) => {
    if (event.target === elements.lightbox) {
      closeLightbox();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (!elements.lightbox.classList.contains("is-open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowRight") navigateLightbox(1);
    if (event.key === "ArrowLeft") navigateLightbox(-1);
    trapFocus(event);
  });
};

// PAYMENT PLACEHOLDER – NCB API INTEGRATION (FUTURE)
const initPayment = (orderData) => {
  console.log("Payment payload", orderData);
  elements.paymentNotice.textContent = "Secure online card payments coming soon.";
};

const bindPayment = () => {
  elements.paymentButton.addEventListener("click", () => {
    initPayment({
      service: state.order.service,
      options: state.order.options,
      quantity: state.order.quantity,
      notes: state.order.notes,
      timestamp: state.order.timestamp,
    });
  });
  elements.whatsappAlt.addEventListener("click", () => {
    window.open(buildWhatsAppLink(buildOrderMessage()), "_blank", "noopener");
  });
};

const applySettings = () => {
  if (!state.settings) return;
  const { businessName, tagline, addressLine, hours, social, orderLinks, seo } = state.settings;
  if (businessName) {
    setText(elements.businessName, businessName);
    if (elements.heroTitle) {
      elements.heroTitle.textContent = `${businessName} prints banners, signs & embroidery fast.`;
    }
  }
  if (tagline) {
    elements.tagline.textContent = tagline;
  }
  if (addressLine && elements.address) {
    elements.address.textContent = addressLine;
  }
  if (hours && elements.hours) {
    elements.hours.textContent = hours;
  }
  if (orderLinks?.artworkUploadUrl && elements.uploadLink) {
    elements.uploadLink.href = orderLinks.artworkUploadUrl;
    elements.uploadLink.target = "_blank";
    elements.uploadLink.rel = "noopener";
  }
  if (state.settings.mapLinkUrl && elements.mapLink) {
    elements.mapLink.href = state.settings.mapLinkUrl;
    elements.mapLink.target = "_blank";
    elements.mapLink.rel = "noopener";
  }
  if (social?.instagram && elements.instagram) elements.instagram.href = social.instagram;
  if (social?.facebook && elements.facebook) elements.facebook.href = social.facebook;
  if (social?.tiktok && elements.tiktok) elements.tiktok.href = social.tiktok;
  if (seo?.title) document.title = seo.title;
  if (seo?.description) {
    const meta = document.querySelector("meta[name='description']");
    if (meta) meta.setAttribute("content", seo.description);
  }
  updateWhatsAppLinks();
};

const loadSettings = async () => {
  try {
    const response = await fetch("data/settings.json");
    state.settings = await response.json();
    applySettings();
  } catch (error) {
    console.error("Settings load failed", error);
  }
};

const init = () => {
  elements.year.textContent = new Date().getFullYear();
  bindOrderInputs();
  bindServiceCards();
  initAccordion();
  initNav();
  initActiveNav();
  initReveal();
  initBottomCta();
  bindLightbox();
  bindPayment();
  loadSettings();
  initPortfolio();
  updateSummary();
};

document.addEventListener("DOMContentLoaded", init);
