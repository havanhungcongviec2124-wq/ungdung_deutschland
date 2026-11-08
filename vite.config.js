import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const ocrAssets = new Map([
  ["/ocr/worker.min.js", resolve(root, "node_modules/tesseract.js/dist/worker.min.js")],
  ["/ocr/tesseract-core-simd-lstm.wasm.js", resolve(root, "node_modules/tesseract.js-core/tesseract-core-simd-lstm.wasm.js")],
  ["/ocr/tesseract-core-simd-lstm.wasm", resolve(root, "node_modules/tesseract.js-core/tesseract-core-simd-lstm.wasm")],
  ["/ocr/deu.traineddata", resolve(root, "deu.traineddata")],
  ["/ocr/eng.traineddata", resolve(root, "eng.traineddata")],
  ["/ocr/vie.traineddata", resolve(root, "vie.traineddata")],
]);

function localOcrAssets() {
  return {
    name: "local-ocr-assets",
    async buildStart() {
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

export default defineConfig({ plugins: [react(), tailwindcss(), localOcrAssets(), cloudflare()] });