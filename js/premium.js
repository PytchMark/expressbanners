/**
 * EXPRESS BANNERS — PREMIUM INTERACTIONS
 * Scroll progress bar · Back-to-top · 3D card tilt
 * Counter animation · Stagger delays
 */
(() => {
  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- SCROLL PROGRESS BAR ---------------------------------- */
  const progressBar = document.querySelector(".page-progress-bar");
  if (progressBar) {
    let rafId;
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = `${Math.min(pct, 100)}%`;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
          updateProgress();
          rafId = null;
        });
      },
      { passive: true }
    );
    updateProgress();
  }

  /* ---- BACK TO TOP BUTTON ----------------------------------- */
  const backToTop = document.querySelector(".back-to-top");
  if (backToTop) {
    const toggleVisibility = () => {
      backToTop.classList.toggle("is-visible", window.scrollY > 420);
    };
    window.addEventListener("scroll", toggleVisibility, { passive: true });
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    toggleVisibility();
  }

  /* ---- 3D CARD TILT ----------------------------------------- */
  if (!prefersReducedMotion()) {
    const TILT_MAX = 5; // degrees
    const TILT_SCALE = "perspective(700px)";
    const RESTORE_TRANSITION = "transform 0.42s cubic-bezier(0.34, 1.56, 0.64, 1)";
    const ACTIVE_TRANSITION = "transform 0.08s ease";

    const applyTilt = (card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const tiltX = ((y - cy) / cy) * TILT_MAX;
        const tiltY = ((x - cx) / cx) * TILT_MAX;
        card.style.transition = ACTIVE_TRANSITION;
        card.style.transform = `${TILT_SCALE} rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transition = RESTORE_TRANSITION;
        card.style.transform = "";
      });
    };

    const initCardTilt = () => {
      document
        .querySelectorAll(".card:not([data-tilt-init]), .media-card:not([data-tilt-init])")
        .forEach((card) => {
          card.setAttribute("data-tilt-init", "1");
          applyTilt(card);
        });
    };

    // Initial pass after paint settles
    setTimeout(initCardTilt, 350);

    // Re-apply when portfolio or gallery re-renders
    document.addEventListener("portfolioRendered", initCardTilt);
    document.addEventListener("galleryRendered", initCardTilt);
  }

  /* ---- COUNTER ANIMATION ON STAT CHIPS ---------------------- */
  const initCounters = () => {
    if (prefersReducedMotion()) return;
    const stats = document.querySelectorAll(".stat-chip .stat");
    if (!stats.length) return;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const animateCounter = (el, finalText) => {
      const match = finalText.replace(/,/g, "").match(/[\d.]+/);
      if (!match) return;
      const rawNum = parseFloat(match[0]);
      if (isNaN(rawNum)) return;
      // Skip "24/7" style strings — contains slash
      if (finalText.includes("/")) return;

      const isK = finalText.toUpperCase().includes("K");
      const target = isK ? rawNum * 1000 : rawNum;
      const duration = 1800;
      const start = performance.now();

      const tick = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const value = target * easeOutCubic(progress);

        if (isK) {
          el.textContent = `${(value / 1000).toFixed(value >= 1000 ? 0 : 1)}K+`;
        } else if (finalText.includes("%")) {
          el.textContent = `${Math.round(value)}%`;
        } else if (finalText.includes("-")) {
          // Range like "2-5 days" — just display as-is
          el.textContent = finalText;
          return;
        } else {
          el.textContent = String(Math.round(value));
        }

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = finalText;
        }
      };

      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const original = el.dataset.counterTarget || el.textContent.trim();
          if (!el.dataset.counterTarget) {
            el.dataset.counterTarget = original;
          }
          animateCounter(el, original);
          observer.unobserve(el);
        });
      },
      { threshold: 0.7 }
    );

    stats.forEach((el) => observer.observe(el));
  };

  initCounters();

  /* ---- STAGGER GRID ITEM DELAYS ----------------------------- */
  const initStagger = () => {
    if (prefersReducedMotion()) return;
    const grids = document.querySelectorAll(
      ".services-grid, .info-grid, .why-grid, .proof-grid, .contact-grid"
    );
    grids.forEach((grid) => {
      Array.from(grid.querySelectorAll(".reveal")).forEach((item, i) => {
        // Only set if not already manually set
        if (!item.style.transitionDelay) {
          item.style.transitionDelay = `${i * 75}ms`;
        }
      });
    });
  };

  // Run once DOM is stable
  setTimeout(initStagger, 80);
  document.addEventListener("portfolioRendered", initStagger);

  /* ---- SCROLL INDICATOR CLICK ------------------------------- */
  const scrollIndicator = document.querySelector(".scroll-indicator");
  if (scrollIndicator) {
    scrollIndicator.addEventListener("click", () => {
      const hero = document.querySelector(".hero");
      if (!hero) return;
      const target = hero.nextElementSibling || hero.parentElement?.nextElementSibling;
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  }
})();
