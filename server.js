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
      const images = await searchAll({
        expression: `resource_type:image AND public_id:${GALLERY_ROOT_FOLDER}/*`,
        resourceType: "image",
      });

      const items = images.map((asset) => ({
        public_id: asset.public_id,
        secure_url: cloudinary.url(asset.public_id, {
          secure: true,
          format: asset.format,
          fetch_format: "auto",
          quality: "auto",
        }),
        width: asset.width,
        height: asset.height,
        format: asset.format,
        folder: folderFromPublicId(asset.public_id, GALLERY_ROOT_FOLDER),
      }));

      return {
        updatedAt: new Date().toISOString(),
        items,
      };
    });

    res.json(payload);
  } catch (error) {
    res.status(500).json({
      updatedAt: new Date().toISOString(),
      items: [],
      error: "Unable to load gallery media.",
    });
  }
});

app.get("/api/services-media", async (req, res) => {
  setResponseCacheHeaders(res);
  try {
    ensureCloudinaryConfig();
    const payload = await withCache("services", async () => {
      const [videos, posters] = await Promise.all([
        searchAll({
          expression: `resource_type:video AND public_id:${SERVICES_ROOT_FOLDER}/*`,
          resourceType: "video",
        }),
        searchAll({
          expression: `resource_type:image AND public_id:${SERVICES_ROOT_FOLDER}/*`,
          resourceType: "image",
        }),
      ]);

      const pickPreferred = (assets) => {
        if (!assets?.length) return null;
        const featured = assets.filter((asset) => (asset.tags || []).includes("featured"));
        return (featured[0] || assets[0]) ?? null;
      };

      const bySlug = {};
      videos.forEach((asset) => {
        const slug = folderFromPublicId(asset.public_id, SERVICES_ROOT_FOLDER);
        bySlug[slug] = bySlug[slug] || { videos: [], posters: [] };
        bySlug[slug].videos.push(asset);
      });

      posters.forEach((asset) => {
        const slug = folderFromPublicId(asset.public_id, SERVICES_ROOT_FOLDER);
        bySlug[slug] = bySlug[slug] || { videos: [], posters: [] };
        bySlug[slug].posters.push(asset);
      });

      const services = Object.entries(bySlug).reduce((acc, [slug, media]) => {
        const pickedVideo = pickPreferred(media.videos);
        const pickedPoster = pickPreferred(media.posters);

        if (pickedVideo) {
          acc[slug] = {
            type: "video",
            public_id: pickedVideo.public_id,
            secure_url: pickedVideo.secure_url,
            poster_url: pickedPoster
              ? cloudinary.url(pickedPoster.public_id, {
                  secure: true,
                  format: pickedPoster.format,
                  fetch_format: "auto",
                  quality: "auto",
                })
              : undefined,
          };
        } else if (pickedPoster) {
          acc[slug] = {
            type: "image",
            public_id: pickedPoster.public_id,
            secure_url: cloudinary.url(pickedPoster.public_id, {
              secure: true,
              format: pickedPoster.format,
              fetch_format: "auto",
              quality: "auto",
            }),
          };
        }

        return acc;
      }, {});

      return {
        updatedAt: new Date().toISOString(),
        services,
      };
    });

    res.json(payload);
  } catch (error) {
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

      const items = resources.map((asset) => ({
        public_id: asset.public_id,
        secure_url: asset.secure_url,
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
