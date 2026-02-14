const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "dist");

const include = [
  "index.html",
  "about",
  "assets",
  "contact",
  "css",
  "data",
  "js",
  "order",
  "portfolio",
  "services",
  "terms",
];

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const entry of include) {
  const from = path.join(root, entry);
  const to = path.join(outDir, entry);
  if (fs.existsSync(from)) {
    fs.cpSync(from, to, { recursive: true });
  }
}

console.log(`Static build ready in ${outDir}`);
