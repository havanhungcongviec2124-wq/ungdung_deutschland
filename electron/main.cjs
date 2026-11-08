const { app, BrowserWindow, protocol, shell } = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");

protocol.registerSchemesAsPrivileged([
  {
    scheme: "app",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
]);

const appOrigin = "app://wortkarte";
const distDirectory = path.join(app.getAppPath(), "dist");
const contentTypes = {
  ".css": "text/css",
  ".html": "text/html",
  ".ico": "image/x-icon",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".wasm": "application/wasm",
  ".webmanifest": "application/manifest+json",
};

async function serveAppFile(request) {
  const requestUrl = new URL(request.url);
  if (
    requestUrl.protocol !== "app:" ||
    requestUrl.hostname !== "wortkarte" ||
    requestUrl.port
  ) {
    return new Response("Not found", { status: 404 });
  }

  let pathname;
  try {
    pathname = decodeURIComponent(requestUrl.pathname);
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const relativePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.resolve(distDirectory, `.${relativePath}`);
  if (
    filePath !== distDirectory &&
    !filePath.startsWith(`${distDirectory}${path.sep}`)
  ) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const content = await fs.readFile(filePath);
    const contentType =
      contentTypes[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
    return new Response(content, {
      headers: {
        "content-type": contentType,
        "cache-control": "no-cache",
        "x-content-type-options": "nosniff",
      },
    });
  } catch (error) {
    if (error.code === "ENOENT") {
      return new Response("Not found", { status: 404 });
    }
    console.error("Could not load the WortKarte app file:", error);
    return new Response("Unable to load the app file", { status: 500 });
  }
}

function openExternalUrl(url) {
  if (url.startsWith("https://") || url.startsWith("http://")) {
    shell.openExternal(url);
  }
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 760,
    minHeight: 600,
    title: "WortKarte",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    openExternalUrl(url);
    return { action: "deny" };
  });
  window.webContents.on("will-navigate", (event, url) => {
    if (url !== `${appOrigin}/` && !url.startsWith(`${appOrigin}/`)) {
      event.preventDefault();
      openExternalUrl(url);
    }
  });

  window.loadURL(`${appOrigin}/`);
}

app.whenReady().then(() => {
  protocol.handle("app", serveAppFile);
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
