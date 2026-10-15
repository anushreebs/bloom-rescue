// Offline-install fallback when the Playwright browser CDN is unavailable.
// @sparticuz/chromium is pinned in package-lock.json and carries Chromium's binary.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import { pipeline } from "node:stream/promises";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const packageRoot = path.resolve(
  path.dirname(require.resolve("@sparticuz/chromium")),
  "..",
);
const output = path.join(os.tmpdir(), "bloom-chromium");
await pipeline(
  fs.createReadStream(path.join(packageRoot, "bin/chromium.br")),
  zlib.createBrotliDecompress(),
  fs.createWriteStream(output),
);
fs.chmodSync(output, 0o755);
console.log(`Chromium extracted to ${output}`);
console.log(`Run: PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=${output} npm run e2e`);
