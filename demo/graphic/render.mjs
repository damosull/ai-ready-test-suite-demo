// Renders the results graphic and the social card to PNG with the repo's Playwright.
// Usage: node demo/graphic/render.mjs
import { chromium } from "playwright";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import process from "node:process";

const dir = path.dirname(fileURLToPath(import.meta.url));
const outputs = [
  { src: "graphic.html", out: "results.png", scale: 2 },
  { src: "social.html", out: "social-card.png", scale: 1 },
];

const browser = await chromium.launch();
let failed = false;
for (const { src, out, scale } of outputs) {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 640 },
    deviceScaleFactor: scale,
  });
  await page.goto(pathToFileURL(path.join(dir, src)).href);
  await page.waitForSelector("body[data-ready]", { state: "attached" });
  // Anything taller than the frame would be cut off by the clip below.
  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  if (scrollHeight !== 640) {
    console.error(`${src}: scrollHeight ${scrollHeight}, expected 640`);
    failed = true;
  }
  await page.screenshot({
    path: path.join(dir, out),
    clip: { x: 0, y: 0, width: 1280, height: 640 },
  });
  process.stdout.write(`${out}: ${1280 * scale}x${640 * scale}, scrollHeight ${scrollHeight}\n`);
  await page.close();
}
await browser.close();
process.exit(failed ? 1 : 0);
