import { mkdir, readFile, writeFile, copyFile, rm, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import sharp from "sharp";

// Source integrity is a release gate. When approved public files change,
// update these Git blob IDs in the same reviewed PR.
const expectedBlobs = {
  "index.html": "e4be4a1dca21eedb5c96987a1dccea85132c18e8",
  "script.js": "a637d34610567cccd090551b3523501566dfffbd",
  "privacidade.html": "aa453a39b71a968120d484976308edb52d48d66d",
  "obrigado.html": "bb73dbb79f27bae84d6b4fea49a508132227eaab",
  "robots.txt": "1f53798bb4fe33c86020be7f10c44f29486fd190",
  "assets/help-logo-leao-v2-transparente.png": "bc65246de1537c55ed53cb9d5642009a55427f3f",
};
const sourceBytes = {};
for (const [file, expected] of Object.entries(expectedBlobs)) {
  const bytes = await readFile(file);
  const actual = createHash("sha1")
    .update("blob " + bytes.length + "\0")
    .update(bytes)
    .digest("hex");
  if (actual !== expected) throw new Error("SOURCE_INTEGRITY_FAIL: " + file);
  sourceBytes[file] = bytes;
}
for (const file of ["index.html", "privacidade.html", "obrigado.html"]) {
  const html = sourceBytes[file].toString("utf8");
  if (!html.includes("<body") || !html.includes("</body>") || !html.includes("</html>")) {
    throw new Error("HTML incomplete: " + file);
  }
}
execFileSync(process.execPath, ["--check", "script.js"], { stdio: "pipe" });

const dist = join(process.cwd(), "dist");
const outputAssets = join(dist, "assets");
await rm(dist, { recursive: true, force: true });
await mkdir(outputAssets, { recursive: true });

for (const file of ["index.html", "script.js", "robots.txt", "privacidade.html", "obrigado.html"]) {
  await copyFile(file, join(dist, file));
}
const source = "assets/help-logo-leao-v2-transparente.png";
const specs = [
  { name: "help-logo-leao-head-220.webp", width: 220, format: "webp", quality: 83 },
  { name: "help-logo-leao-head-440.webp", width: 440, format: "webp", quality: 83 },
  { name: "help-logo-leao-head-660.webp", width: 660, format: "webp", quality: 83 },
  { name: "help-logo-leao-footer-420.webp", width: 420, format: "webp", quality: 82 },
  { name: "help-logo-leao-footer-720.webp", width: 720, format: "webp", quality: 82 },
  { name: "help-logo-leao-hero-640.webp", width: 640, format: "webp", quality: 83 },
  { name: "help-logo-leao-hero-1200.webp", width: 1200, format: "webp", quality: 83 },
  { name: "help-logo-leao-fallback-960.png", width: 960, format: "png" },
];
for (const spec of specs) {
  const out = join(outputAssets, spec.name);
  const image = sharp(source).resize({ width: spec.width, withoutEnlargement: true });
  if (spec.format === "webp") {
    await image.webp({ quality: spec.quality, effort: 6 }).toFile(out);
  } else {
    await image.png({ palette: true, colours: 256, compressionLevel: 9, effort: 6 }).toFile(out);
  }
  const size = (await stat(out)).size;
  console.log(JSON.stringify({ asset: spec.name, bytes: size }));
  if (size >= 200_000) throw new Error("Asset above 200 KB: " + spec.name);
}
const html = await readFile(join(dist, "index.html"), "utf8");
if ((html.match(/<picture>/g) || []).length !== 3) {
  throw new Error("Expected three responsive logo uses");
}
for (const spec of specs) {
  if (!html.includes(spec.name)) throw new Error("Missing HTML asset reference: " + spec.name);
}
await writeFile(join(dist, "hw01-assets-manifest.json"), JSON.stringify({
  source, sourceBlob: expectedBlobs[source],
  assets: await Promise.all(specs.map(async ({ name }) => ({
    name, bytes: (await stat(join(outputAssets, name))).size,
  }))),
}, null, 2));
console.log("HW-01 BUILD VERIFIED: 6 source files, 3 pages, JavaScript, 8 images and file-size gate.");
