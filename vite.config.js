import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
// Đổi nội dung logo hoặc bất kỳ icon nào là mọi URL logo/favicon đổi theo,
// giúp trình duyệt và PWA tải lại ngay icon mới sau mỗi lần deploy.
const brandHash = createHash("sha1");
for (const file of [
  "img/logo.png",
  "public/logo.png",
  "public/icons/icon-192.png",
  "public/icons/icon-512.png",
  "public/icons/icon-maskable-512.png",
  "public/icons/apple-touch-icon.png",
]) {
  brandHash.update(readFileSync(resolve(root, file)));
}
const appVersion = brandHash.digest("hex").slice(0, 10);
const ocrAssets = new Map([
  ["/ocr/worker.min.js", resolve(root, "node_modules/tesseract.js/dist/worker.min.js")],
  ["/ocr/tesseract-core-simd-lstm.wasm.js", resolve(root, "node_modules/tesseract.js-core/tesseract-core-simd-lstm.wasm.js")],
  ["/ocr/tesseract-core-simd-lstm.wasm", resolve(root, "node_modules/tesseract.js-core/tesseract-core-simd-lstm.wasm")],
  ["/ocr/deu.traineddata", resolve(root, "deu.traineddata")],
  ["/ocr/eng.traineddata", resolve(root, "eng.traineddata")],
  ["/ocr/vie.traineddata", resolve(root, "vie.traineddata")],
]);

function localOcrAssets() {
  let isWorkerBuild = false;
  return {
    name: "local-ocr-assets",
    configResolved(config) {
      isWorkerBuild = Boolean(config.build.ssr);
    },
    async buildStart() {
      // The client build emits these files as static assets. The Worker build
      // must not treat them as additional Worker modules.
      if (isWorkerBuild) return;
      await Promise.all([...ocrAssets].map(async ([fileName, sourcePath]) => {
        this.emitFile({
          type: "asset",
          fileName: fileName.slice(1),
          source: await readFile(sourcePath),
        });
      }));
    },
    configureServer(server) {
      server.middlewares.use("/ocr", async (request, response, next) => {
        const fileName = `/ocr${new URL(request.url, "http://localhost").pathname}`;
        const sourcePath = ocrAssets.get(fileName);
        if (!sourcePath) return next();

        try {
          response.setHeader(
            "Content-Type",
            fileName.endsWith(".wasm")
              ? "application/wasm"
              : fileName.endsWith(".js")
                ? "application/javascript"
                : "application/octet-stream"
          );
          response.end(await readFile(sourcePath));
        } catch (error) {
          next(error);
        }
      });
    },
  };
}

function appVersionHtml() {
  return {
    name: "app-version-html",
    transformIndexHtml(html) {
      return html.replace(/__APP_VERSION__/g, appVersion);
    },
  };
}

export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify(appVersion) },
  plugins: [react(), tailwindcss(), localOcrAssets(), appVersionHtml(), cloudflare()],
});