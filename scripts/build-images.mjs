import { mkdir, readFile, writeFile, copyFile, rm, stat } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const source = join(process.cwd(), "assets/help-logo-leao-v2-transparente.png");
const dist = join(process.cwd(), "dist");
const outputAssets = join(dist, "assets");
await rm(dist, { recursive: true, force: true });
await mkdir(outputAssets, { recursive: true });

for (const file of ["index.html", "script.js", "robots.txt", "privacidade.html", "obrigado.html"]) {
  await copyFile(file, join(dist, file));
}

const specs = [
  { name: "help-logo-leao-head-220.webp", width: 220, format: "webp", quality: 83 },
  { name: "help-logo-leao-footer-420.webp", width: 420, format: "webp", quality: 82 },
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
if (!html.includes("<body") || !html.includes("</body>") || !html.includes("</html>")) {
  throw new Error("HTML incomplete: block deployment");
}
if ((html.match(/<picture>/g) || []).length !== 3) {
  throw new Error("Expected three responsive logo uses");
}
for (const spec of specs) {
  if (!html.includes(spec.name)) throw new Error("Missing HTML asset reference: " + spec.name);
}
await writeFile(join(dist, "hw01-assets-manifest.json"), JSON.stringify({
  source: "assets/help-logo-leao-v2-transparente.png",
  assets: await Promise.all(specs.map(async ({ name }) => ({
    name, bytes: (await stat(join(outputAssets, name))).size,
  }))),
}, null, 2));
console.log("HW-01 BUILD VERIFIED: complete HTML, 5 images and file-size gate.");
