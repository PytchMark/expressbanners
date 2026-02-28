(() => {
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
  ];

  const state = {
    categories: {},
    modalItems: [],
    modalIndex: 0,
  };

  const pageRoot = document.querySelector("[data-gallery-categories]");
  const toast = document.querySelector("[data-toast]");
  const modal = document.querySelector("[data-gallery-modal]");
  const modalBody = document.querySelector("[data-gallery-modal-body]");
  const modalTitle = document.querySelector("[data-gallery-modal-title]");
  const modalMeta = document.querySelector("[data-gallery-modal-meta]");
  const modalClose = document.querySelector("[data-gallery-modal-close]");

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

  const createCard = (asset, index, items) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "gallery-card";
    btn.setAttribute("aria-label", `Preview ${asset.public_id}`);

    const thumb = asset.resource_type === "video"
      ? `<video src="${toCloudinaryThumb(asset.secure_url)}" muted playsinline preload="metadata"></video><span class="gallery-video-pill">Video</span>`
      : `<img src="${toCloudinaryThumb(asset.secure_url)}" alt="${asset.public_id}" loading="lazy" decoding="async" />`;

    btn.innerHTML = `<span class="gallery-card-media">${thumb}</span>`;
    btn.addEventListener("click", () => openModal(items, index));

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
      row.appendChild(createCard(asset, index, assets));
    });
  };

  const fetchAllByTag = async (tag, limit = 24) => {
    const assets = [];
    let cursor = "";

    do {
      const params = new URLSearchParams({ tag, limit: String(limit) });
      if (cursor) params.set("cursor", cursor);

      const resp = await fetch(`/api/gallery?${params.toString()}`);
      if (!resp.ok) {
        throw new Error(`Failed ${resp.status} for tag ${tag}`);
      }

      const data = await resp.json();
      assets.push(...(data.assets || []));
      cursor = data.next_cursor || "";
    } while (cursor);

    return assets;
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
    modalClose?.focus();
  };

  const closeModal = () => {
    modal?.classList.remove("is-open");
    document.body.classList.remove("nav-open");
  };

  const renderShell = () => {
    pageRoot.innerHTML = categories.map((category) => `
      <article class="gallery-category" data-gallery-section="${category.key}">
        <header class="gallery-category-head">
          <h3>${category.title}</h3>
          <p>${category.subtitle}</p>
        </header>
        <div class="gallery-row" data-gallery-row></div>
        <p class="gallery-empty" data-gallery-empty hidden></p>
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
        const assets = await fetchAllByTag(category.key);
        state.categories[category.key] = assets;
        renderCategory(category, assets);
      } catch (error) {
        console.error("Gallery category load failed", {
          category: category.key,
          message: error.message,
        });
        renderCategory(category, [], error.message);
      }
    }));
  };

  modalClose?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (!modal?.classList.contains("is-open")) return;
    if (event.key === "Escape") closeModal();
  });

  init();
})();
