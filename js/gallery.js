(() => {
  /**
   * ============================================================
   * GALLERY CATEGORIES - Add new tags here
   * ============================================================
   * To add a new category:
   * 1. Create the tag in Cloudinary and assign it to assets
   * 2. Add a new entry below with: key (tag name), title, subtitle
   * 
   * REQUIRED CLOUDINARY TAGS:
   * - promoprints    → Promotional Printing assets
   * - embroidery     → Embroidery assets
   * - featherbanners → Feather Banners / Business door graphics
   * ============================================================
   */
  const categories = [
    {
      key: "promoprints",
      title: "Promotional Printing",
      subtitle: "Flyers, cards, labels & more",
    },
    {
      key: "embroidery",
      title: "Embroidery",
      subtitle: "Premium stitching for uniforms & merch",
    },
    {
      key: "featherbanners",
      title: "Feather Banners",
      subtitle: "Eye-catching graphics for business doors & storefronts",
    },
  ];

  const INITIAL_LOAD = 12;
  const LOAD_MORE_COUNT = 12;

  const state = {
    categories: {},
    cursors: {},
    hasMore: {},
    modalItems: [],
    modalIndex: 0,
    currentCategory: null,
  };

  const pageRoot = document.querySelector("[data-gallery-categories]");
  const toast = document.querySelector("[data-toast]");
  const modal = document.querySelector("[data-gallery-modal]");
  const modalBody = document.querySelector("[data-gallery-modal-body]");
  const modalTitle = document.querySelector("[data-gallery-modal-title]");
  const modalMeta = document.querySelector("[data-gallery-modal-meta]");
  const modalClose = document.querySelector("[data-gallery-modal-close]");
  const modalPrev = document.querySelector("[data-gallery-modal-prev]");
  const modalNext = document.querySelector("[data-gallery-modal-next]");
  const modalCounter = document.querySelector("[data-gallery-modal-counter]");

  if (!pageRoot) return;

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2600);
  };

  const toCloudinaryThumb = (url) => {
    if (!url || !url.includes("/upload/")) return url;
    return url.replace("/upload/", "/upload/f_auto,q_auto,c_fill,w_360,h_240,g_auto/");
  };

  const toCloudinaryPreview = (url, resourceType = "image") => {
    if (!url || !url.includes("/upload/")) return url;
    if (resourceType === "video") {
      return url.replace("/upload/", "/upload/f_auto,q_auto,w_1280,h_720,c_limit/");
    }
    return url.replace("/upload/", "/upload/f_auto,q_auto,w_1600,h_1200,c_limit/");
  };

  const getSection = (key) => document.querySelector(`[data-gallery-section="${key}"]`);

  const renderSkeletons = (rowEl, count = 6) => {
    rowEl.innerHTML = "";
    for (let i = 0; i < count; i += 1) {
      const skeleton = document.createElement("div");
      skeleton.className = "gallery-row-skeleton";
      rowEl.appendChild(skeleton);
    }
  };

  const createCard = (asset, index, categoryKey) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "gallery-card";
    btn.setAttribute("aria-label", `Preview ${asset.public_id}`);
    btn.setAttribute("data-testid", `gallery-card-${categoryKey}-${index}`);

    const thumb = asset.resource_type === "video"
      ? `<video src="${toCloudinaryThumb(asset.secure_url)}" muted playsinline preload="metadata"></video><span class="gallery-video-pill">Video</span>`
      : `<img src="${toCloudinaryThumb(asset.secure_url)}" alt="${asset.public_id}" loading="lazy" decoding="async" />`;

    btn.innerHTML = `<span class="gallery-card-media">${thumb}</span>`;
    btn.addEventListener("click", () => {
      state.currentCategory = categoryKey;
      openModal(state.categories[categoryKey], index);
    });

    return btn;
  };

  const createLoadMoreButton = (categoryKey) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "gallery-load-more";
    btn.setAttribute("data-testid", `gallery-load-more-${categoryKey}`);
    btn.setAttribute("data-load-more", categoryKey);
    btn.innerHTML = `
      <span class="load-more-icon">+</span>
      <span class="load-more-text">Load More</span>
    `;
    btn.addEventListener("click", () => loadMore(categoryKey));
    return btn;
  };

  const renderCategory = (category, assets, error = "") => {
    const section = getSection(category.key);
    if (!section) return;

    const row = section.querySelector("[data-gallery-row]");
    const empty = section.querySelector("[data-gallery-empty]");
    row.innerHTML = "";
    empty.textContent = "";
    empty.hidden = true;

    // Remove existing load more button
    const existingLoadMore = section.querySelector("[data-load-more]");
    if (existingLoadMore) existingLoadMore.remove();

    if (error) {
      empty.hidden = false;
      empty.textContent = "Unable to load gallery.";
      showToast("Unable to load gallery");
      return;
    }

    if (!assets.length) {
      empty.hidden = false;
      empty.textContent = "No assets found for this category yet.";
      return;
    }

    assets.forEach((asset, index) => {
      row.appendChild(createCard(asset, index, category.key));
    });

    // Add Load More button if there are more assets
    if (state.hasMore[category.key]) {
      row.appendChild(createLoadMoreButton(category.key));
    }
  };

  const appendAssets = (categoryKey, newAssets) => {
    const section = getSection(categoryKey);
    if (!section) return;

    const row = section.querySelector("[data-gallery-row]");
    
    // Remove existing load more button
    const existingLoadMore = row.querySelector("[data-load-more]");
    if (existingLoadMore) existingLoadMore.remove();

    const startIndex = state.categories[categoryKey].length;
    newAssets.forEach((asset, i) => {
      row.appendChild(createCard(asset, startIndex + i, categoryKey));
    });

    // Add Load More button if there are still more assets
    if (state.hasMore[categoryKey]) {
      row.appendChild(createLoadMoreButton(categoryKey));
    }
  };

  const fetchByTag = async (tag, limit = INITIAL_LOAD, cursor = "") => {
    const params = new URLSearchParams({ tag, limit: String(limit) });
    if (cursor) params.set("cursor", cursor);

    const resp = await fetch(`/api/gallery?${params.toString()}`);
    if (!resp.ok) {
      throw new Error(`Failed ${resp.status} for tag ${tag}`);
    }

    return resp.json();
  };

  const loadMore = async (categoryKey) => {
    const section = getSection(categoryKey);
    const loadMoreBtn = section?.querySelector("[data-load-more]");
    
    if (loadMoreBtn) {
      loadMoreBtn.classList.add("is-loading");
      loadMoreBtn.querySelector(".load-more-text").textContent = "Loading...";
    }

    try {
      const cursor = state.cursors[categoryKey] || "";
      const data = await fetchByTag(categoryKey, LOAD_MORE_COUNT, cursor);
      
      const newAssets = data.assets || [];
      state.categories[categoryKey].push(...newAssets);
      state.cursors[categoryKey] = data.next_cursor || "";
      state.hasMore[categoryKey] = !!data.next_cursor;

      appendAssets(categoryKey, newAssets);
    } catch (error) {
      console.error("Load more failed", { categoryKey, message: error.message });
      showToast("Failed to load more items");
      
      if (loadMoreBtn) {
        loadMoreBtn.classList.remove("is-loading");
        loadMoreBtn.querySelector(".load-more-text").textContent = "Load More";
      }
    }
  };

  const updateModalNav = () => {
    const total = state.modalItems.length;
    const current = state.modalIndex + 1;
    
    if (modalCounter) {
      modalCounter.textContent = `${current} / ${total}`;
    }
    
    if (modalPrev) {
      modalPrev.disabled = state.modalIndex === 0;
      modalPrev.style.opacity = state.modalIndex === 0 ? "0.3" : "1";
    }
    
    if (modalNext) {
      modalNext.disabled = state.modalIndex >= total - 1;
      modalNext.style.opacity = state.modalIndex >= total - 1 ? "0.3" : "1";
    }
  };

  const openModal = (items, index) => {
    if (!modal || !modalBody || !modalTitle || !modalMeta) return;

    state.modalItems = items;
    state.modalIndex = index;
    const asset = items[index];
    if (!asset) return;

    modalBody.innerHTML = "";

    if (asset.resource_type === "video") {
      const video = document.createElement("video");
      video.src = toCloudinaryPreview(asset.secure_url, "video");
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      modalBody.appendChild(video);
    } else {
      const image = document.createElement("img");
      image.src = toCloudinaryPreview(asset.secure_url, "image");
      image.alt = asset.public_id;
      image.loading = "eager";
      modalBody.appendChild(image);
    }

    modalTitle.textContent = asset.public_id;
    modalMeta.textContent = `${asset.resource_type} • ${asset.format || "unknown"}`;
    modal.classList.add("is-open");
    document.body.classList.add("nav-open");
    
    updateModalNav();
    modalClose?.focus();
  };

  const navigateModal = (direction) => {
    const newIndex = state.modalIndex + direction;
    if (newIndex < 0 || newIndex >= state.modalItems.length) return;
    
    state.modalIndex = newIndex;
    const asset = state.modalItems[newIndex];
    if (!asset) return;

    modalBody.innerHTML = "";

    if (asset.resource_type === "video") {
      const video = document.createElement("video");
      video.src = toCloudinaryPreview(asset.secure_url, "video");
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      modalBody.appendChild(video);
    } else {
      const image = document.createElement("img");
      image.src = toCloudinaryPreview(asset.secure_url, "image");
      image.alt = asset.public_id;
      image.loading = "eager";
      modalBody.appendChild(image);
    }

    modalTitle.textContent = asset.public_id;
    modalMeta.textContent = `${asset.resource_type} • ${asset.format || "unknown"}`;
    
    updateModalNav();
  };

  const closeModal = () => {
    modal?.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    state.currentCategory = null;
  };

  const renderShell = () => {
    pageRoot.innerHTML = categories.map((category) => `
      <article class="gallery-category" data-gallery-section="${category.key}" data-testid="gallery-section-${category.key}">
        <header class="gallery-category-head">
          <h3>${category.title}</h3>
          <p>${category.subtitle}</p>
        </header>
        <div class="gallery-row" data-gallery-row data-testid="gallery-row-${category.key}"></div>
        <p class="gallery-empty" data-gallery-empty hidden data-testid="gallery-empty-${category.key}"></p>
      </article>
    `).join("");

    categories.forEach((category) => {
      const row = getSection(category.key)?.querySelector("[data-gallery-row]");
      if (row) renderSkeletons(row, 6);
    });
  };

  const init = async () => {
    renderShell();
    await Promise.all(categories.map(async (category) => {
      try {
        const data = await fetchByTag(category.key, INITIAL_LOAD);
        const assets = data.assets || [];
        
        state.categories[category.key] = assets;
        state.cursors[category.key] = data.next_cursor || "";
        state.hasMore[category.key] = !!data.next_cursor;
        
        renderCategory(category, assets);
      } catch (error) {
        console.error("Gallery category load failed", {
          category: category.key,
          message: error.message,
        });
        state.categories[category.key] = [];
        state.hasMore[category.key] = false;
        renderCategory(category, [], error.message);
      }
    }));
  };

  // Event listeners
  modalClose?.addEventListener("click", closeModal);
  
  modalPrev?.addEventListener("click", () => navigateModal(-1));
  modalNext?.addEventListener("click", () => navigateModal(1));
  
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  
  document.addEventListener("keydown", (event) => {
    if (!modal?.classList.contains("is-open")) return;
    
    switch (event.key) {
      case "Escape":
        closeModal();
        break;
      case "ArrowLeft":
        event.preventDefault();
        navigateModal(-1);
        break;
      case "ArrowRight":
        event.preventDefault();
        navigateModal(1);
        break;
    }
  });

  init();
})();
