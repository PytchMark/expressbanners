const express = require("express");
const path = require("path");
const {
  cloudinary,
  ensureCloudinaryConfig,
  withCache,
  searchAll,
  listByFolder,
  listByPrefix,
  folderFromPublicId,
  CACHE_TTL_SECONDS,
} = require("./server/lib/cloudinary");

// Cloudinary folder roots: set these to match your media organization.
const CATALOGUE_FOLDER = "expressbanners/catalogue";
const GALLERY_MAX_RESULTS = Math.min(Math.max(Number.parseInt(process.env.GALLERY_MAX_RESULTS || "200", 10) || 200, 1), 500);

const app = express();
const port = Number.parseInt(process.env.PORT || "8080", 10);

app.use(express.static(path.resolve(__dirname)));

const setResponseCacheHeaders = (res) => {
  res.set("Cache-Control", `public, max-age=300, s-maxage=${CACHE_TTL_SECONDS}`);
};

app.get("/api/gallery", async (req, res) => {
  setResponseCacheHeaders(res);
  try {
    ensureCloudinaryConfig();
    const payload = await withCache("gallery", async () => {
      const images = await listByFolder(CATALOGUE_FOLDER, GALLERY_MAX_RESULTS);

      const items = images
        .filter((asset) => asset.resource_type === "image")
        .map((asset) => ({
          public_id: asset.public_id,
          secure_url: asset.secure_url || cloudinary.url(asset.public_id, {
            secure: true,
            format: asset.format,
            fetch_format: "auto",
            quality: "auto",
          }),
          width: asset.width,
          height: asset.height,
          format: asset.format,
          folder: asset.asset_folder || CATALOGUE_FOLDER,
        }));

      return {
        updatedAt: new Date().toISOString(),
        items,
      };
    });

    res.json(payload);
  } catch (error) {
    console.error("/api/gallery error:", error.message || error);
    res.status(500).json({
      updatedAt: new Date().toISOString(),
      items: [],
      error: "Unable to load gallery media.",
    });
  }
});

const SERVICES_FOLDER_MAP = {
  "Signs": "expressbanners/SignsandBanners",
  "Banners": "expressbanners/SignsandBanners",
  "Embroidery": "expressbanners/Embroidery",
  "Screen Printing": "expressbanners/Promotional Printing",
  "Graphic Designing": "expressbanners/catalogue",
};

app.get("/api/services-media", async (req, res) => {
  setResponseCacheHeaders(res);
  try {
    ensureCloudinaryConfig();
    const payload = await withCache("services", async () => {
      const uniqueFolders = [...new Set(Object.values(SERVICES_FOLDER_MAP))];

      // Fetch each folder in parallel
      const folderResults = {};
      await Promise.all(
        uniqueFolders.map(async (folder) => {
          const items = await listByFolder(folder, 10);
          folderResults[folder] = items.filter((a) => a.resource_type === "image");
        })
      );

      const services = {};
      Object.entries(SERVICES_FOLDER_MAP).forEach(([service, folder]) => {
        const items = folderResults[folder] || [];
        if (items.length) {
          const pick = items[0];
          services[service] = {
            type: "image",
            public_id: pick.public_id,
            secure_url: pick.secure_url,
          };
        }
      });

      return {
        updatedAt: new Date().toISOString(),
        services,
      };
    });

    res.json(payload);
  } catch (error) {
    console.error("/api/services-media error:", error.message || error);
    res.status(500).json({
      updatedAt: new Date().toISOString(),
      services: {},
      error: "Unable to load service media.",
    });
  }
});

app.get("/media/debug", async (req, res) => {
  res.set("Content-Type", "application/json");
  const info = {
    hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
    hasApiKey: !!process.env.CLOUDINARY_API_KEY,
    hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "(not set)",
  };

  try {
    ensureCloudinaryConfig();
    // Try listing root folders to verify credentials work
    const result = await cloudinary.api.root_folders();
    info.connected = true;
    info.rootFolders = (result.folders || []).map((f) => f.name);
  } catch (error) {
    info.connected = false;
    info.error = error.message || String(error);
  }

  res.json(info);
});

app.get("/media/folders", async (req, res) => {
  res.set("Content-Type", "application/json");
  const parent = req.query.folder || "expressbanners";

  try {
    ensureCloudinaryConfig();
    const result = await cloudinary.api.sub_folders(parent);
    res.json({
      parent,
      folders: (result.folders || []).map((f) => ({ name: f.name, path: f.path })),
    });
  } catch (error) {
    res.status(500).json({ parent, folders: [], error: error.message });
  }
});

app.get("/media", async (req, res) => {
  const folder = req.query.folder;
  const max = Math.min(Math.max(Number.parseInt(req.query.max, 10) || 50, 1), 200);

  if (!folder) {
    return res.status(400).json({ error: "folder query parameter is required" });
  }

  const cacheKey = `media:${folder}:${max}`;
  setResponseCacheHeaders(res);
  res.set("Content-Type", "application/json");

  try {
    ensureCloudinaryConfig();
    const payload = await withCache(cacheKey, async () => {
      const resources = await listByFolder(folder, max);

      const items = resources
        .filter((asset) => asset.resource_type === "image")
        .map((asset) => ({
          public_id: asset.public_id,
          secure_url: asset.secure_url || cloudinary.url(asset.public_id, {
            secure: true,
            format: asset.format,
            fetch_format: "auto",
            quality: "auto",
          }),
          width: asset.width,
          height: asset.height,
          format: asset.format,
          created_at: asset.created_at,
          resource_type: asset.resource_type,
        }));

      return {
        folder,
        count: items.length,
        items,
      };
    });

    res.json(payload);
  } catch (error) {
    console.error(`/media error for folder="${folder}":`, error.message || error);
    res.status(500).json({
      folder,
      count: 0,
      items: [],
      error: error.message || "Unable to load media.",
    });
  }
});

app.get("*", (req, res) => {
  const requestPath = req.path === "/" ? "/index.html" : req.path;
  const fullPath = path.resolve(__dirname, `.${requestPath}`);
  res.sendFile(fullPath, (error) => {
    if (error) {
      res.status(404).sendFile(path.resolve(__dirname, "index.html"));
    }
  });
});

app.listen(port);
