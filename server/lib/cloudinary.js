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

const cache = {};

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

/**
 * List resources by asset folder (supports Dynamic Folder Mode).
 * Falls back to prefix-based listing for Fixed Folder Mode accounts.
 * Recursively includes subfolders.
 */
const listByFolder = async (folder, max = 50) => {
  const allResources = [];

  // Helper: list a single folder with pagination
  const listSingleFolder = async (folderPath) => {
    let nextCursor;
    do {
      const opts = {
        max_results: Math.min(max - allResources.length, 500),
      };
      if (nextCursor) opts.next_cursor = nextCursor;

      const result = await cloudinary.api.resources_by_asset_folder(folderPath, opts);
      allResources.push(...(result.resources || []));
      nextCursor = result.next_cursor;
    } while (nextCursor && allResources.length < max);
  };

  // Helper: get subfolders
  const getSubfolders = async (folderPath) => {
    try {
      const result = await cloudinary.api.sub_folders(folderPath);
      return (result.folders || []).map((f) => f.path);
    } catch (e) {
      // sub_folders may fail if folder has no subfolders
      return [];
    }
  };

  // Helper: recursively list a folder and all its subfolders (breadth-first)
  const listFolderRecursive = async (folderPath, depth = 0) => {
    if (allResources.length >= max) return;
    await listSingleFolder(folderPath);

    // Stop recursing when we have enough or have gone deep enough
    if (depth >= 4 || allResources.length >= max) return;

    const subs = await getSubfolders(folderPath);
    for (const sub of subs) {
      if (allResources.length >= max) break;
      await listFolderRecursive(sub, depth + 1);
    }
  };

  try {
    await listFolderRecursive(folder);
  } catch (firstError) {
    // Fallback: try prefix-based listing (Fixed Folder Mode)
    if (firstError.error?.message?.includes("dynamic") || allResources.length === 0) {
      const prefix = folder.endsWith("/") ? folder : `${folder}/`;
      let nextCursor;
      do {
        const opts = {
          type: "upload",
          prefix,
          max_results: Math.min(max - allResources.length, 500),
        };
        if (nextCursor) opts.next_cursor = nextCursor;

        const result = await cloudinary.api.resources(opts);
        allResources.push(...(result.resources || []));
        nextCursor = result.next_cursor;
      } while (nextCursor && allResources.length < max);
    }
  }

  // If Dynamic Folder Mode returned nothing, also try prefix-based fallback
  if (allResources.length === 0) {
    const prefix = folder.endsWith("/") ? folder : `${folder}/`;
    let nextCursor;
    do {
      const opts = {
        type: "upload",
        prefix,
        max_results: Math.min(max - allResources.length, 500),
      };
      if (nextCursor) opts.next_cursor = nextCursor;

      const result = await cloudinary.api.resources(opts);
      allResources.push(...(result.resources || []));
      nextCursor = result.next_cursor;
    } while (nextCursor && allResources.length < max);
  }

  return allResources.slice(0, max);
};

// Keep backward compat alias
const listByPrefix = listByFolder;

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
  listByPrefix,
  listByFolder,
  folderFromPublicId,
  CACHE_TTL_SECONDS,
};
