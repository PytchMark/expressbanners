const express = require("express");
const path = require("path");
const {
  cloudinary,
  ensureCloudinaryConfig,
  withCache,
  searchAll,
  listAllByPrefix,
  folderFromPublicId,
  CACHE_TTL_SECONDS,
} = require("./server/lib/cloudinary");

// Cloudinary folder roots: set these to match your media organization.
const GALLERY_ROOT_PREFIX = "expressbanners/";
const SERVICES_ROOT_FOLDER = "expressbanners/services";

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
      const images = await listAllByPrefix({
        resourceType: "image",
        type: "upload",
        prefix: GALLERY_ROOT_PREFIX,
      });

      const items = images
        .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
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
          folder: folderFromPublicId(asset.public_id, "expressbanners"),
        }));

      console.log(`[gallery] prefix=${GALLERY_ROOT_PREFIX} count=${items.length}`);

      return {
        updatedAt: new Date().toISOString(),
        items,
      };
    });

    res.json(payload);
  } catch (error) {
    console.error("[gallery] Failed to load Cloudinary media", {
      prefix: GALLERY_ROOT_PREFIX,
      message: error?.message,
    });
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
