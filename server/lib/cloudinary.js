const { v2: cloudinary } = require("cloudinary");

const ensureCloudinaryConfig = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary environment variables are not fully configured.");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
};

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return parsed;
};

const CACHE_TTL_SECONDS = parsePositiveInt(process.env.GALLERY_CACHE_TTL_SECONDS, 3600);

const cache = {
  gallery: { value: null, expiresAt: 0 },
  services: { value: null, expiresAt: 0 },
};

const withCache = async (key, buildFn) => {
  const now = Date.now();
  const entry = cache[key];
  if (entry?.value && entry.expiresAt > now) {
    return entry.value;
  }

  const value = await buildFn();
  cache[key] = {
    value,
    expiresAt: now + CACHE_TTL_SECONDS * 1000,
  };
  return value;
};

const searchAll = async ({ expression, resourceType, maxResults = 100 }) => {
  const resources = [];
  let nextCursor;

  do {
    const query = cloudinary.search
      .expression(expression)
      .max_results(maxResults)
      .sort_by("created_at", "desc");

    if (resourceType) {
      query.resource_type(resourceType);
    }

    if (nextCursor) {
      query.next_cursor(nextCursor);
    }

    const result = await query.execute();
    resources.push(...(result.resources || []));
    nextCursor = result.next_cursor;
  } while (nextCursor);

  return resources;
};

const folderFromPublicId = (publicId, rootFolder) => {
  const trimmed = publicId.replace(`${rootFolder}/`, "");
  const [folder] = trimmed.split("/");
  return folder || "root";
};

module.exports = {
  cloudinary,
  ensureCloudinaryConfig,
  withCache,
  searchAll,
  folderFromPublicId,
  CACHE_TTL_SECONDS,
};
