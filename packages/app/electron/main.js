import { app, BrowserWindow, dialog, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import {
  loadCfgVehiclesClasses,
  filterClassesByScope,
  generateTypesXml,
  mergeTypesXml,
} from "@dayztools/core";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = Boolean(process.env.VITE_DEV_SERVER_URL);

function createWindow() {
  const icoPath = path.join(__dirname, "..", "assets", "icon.ico");
  const pngPath = path.join(__dirname, "..", "assets", "icon.png");
  const iconPath = fs.existsSync(icoPath) ? icoPath : pngPath;
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 900,
    minHeight: 600,
    show: false,
    backgroundColor: "#0a0e12",
    icon: iconPath,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  if (isDev) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    const indexPath = path.join(__dirname, "..", "dist", "index.html");
    mainWindow.loadFile(indexPath);
  }
}

app.whenReady().then(() => {
  app.setAppUserModelId("com.dayztools.app");
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("mission:select", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

ipcMain.handle("mod:select", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory", "openFile"],
    filters: [
      { name: "Config", extensions: ["cpp", "hpp"] },
      { name: "All Files", extensions: ["*"] },
    ],
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

ipcMain.handle("types:base-select", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [
      { name: "Types XML", extensions: ["xml"] },
      { name: "All Files", extensions: ["*"] },
    ],
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

ipcMain.handle("types:generate", async (_event, payload) => {
  const {
    modPath,
    missionFolder,
    category,
    usages,
    defaults = {},
    baseTypesPath,
    allowOverwrite,
  } = payload || {};
  if (!modPath || !missionFolder) {
    return { ok: false, error: "Missing mod path or mission folder." };
  }

  const outputPath = path.join(missionFolder, "types.xml");
  if (fs.existsSync(outputPath) && !allowOverwrite) {
    return { ok: false, error: "types.xml already exists. Confirm overwrite.", requiresConfirm: true };
  }

  const result = loadCfgVehiclesClasses(modPath);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  const filtered = filterClassesByScope(result.classes, 2);
  const classNames = dedupe(filtered.map((item) => item.name));

  const overrides = {
    categories: category ? [category] : [],
    usages: Array.isArray(usages) ? usages : [],
    nominal: toNumberOrDefault(defaults.nominal, 0),
    min: toNumberOrDefault(defaults.min, 0),
    lifetime: toNumberOrDefault(defaults.lifetime, 7800),
    restock: toNumberOrDefault(defaults.restock, 3600),
  };

  if (baseTypesPath) {
    const baseXml = fs.readFileSync(baseTypesPath, "utf8");
    const merged = mergeTypesXml(baseXml, classNames, overrides);
    fs.writeFileSync(outputPath, merged.xml, "utf8");
    return {
      ok: true,
      outputPath,
      totalClasses: result.classes.length,
      included: classNames.length,
      added: merged.added,
    };
  }

  const xml = generateTypesXml(classNames, overrides);
  fs.writeFileSync(outputPath, xml, "utf8");

  return {
    ok: true,
    outputPath,
    totalClasses: result.classes.length,
    included: classNames.length,
    added: classNames.length,
  };
});

ipcMain.handle("types:preview", async (_event, payload) => {
  const { modPath, category, usages, defaults = {}, baseTypesPath } = payload || {};
  if (!modPath) {
    return { ok: false, error: "Missing mod path." };
  }

  const result = loadCfgVehiclesClasses(modPath);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  const filtered = filterClassesByScope(result.classes, 2);
  const classNames = dedupe(filtered.map((item) => item.name));

  const overrides = {
    categories: category ? [category] : [],
    usages: Array.isArray(usages) ? usages : [],
    nominal: toNumberOrDefault(defaults.nominal, 0),
    min: toNumberOrDefault(defaults.min, 0),
    lifetime: toNumberOrDefault(defaults.lifetime, 7800),
    restock: toNumberOrDefault(defaults.restock, 3600),
  };

  if (baseTypesPath && fs.existsSync(baseTypesPath)) {
    const baseXml = fs.readFileSync(baseTypesPath, "utf8");
    const merged = mergeTypesXml(baseXml, classNames, overrides);
    return {
      ok: true,
      xml: merged.xml,
      totalClasses: result.classes.length,
      included: classNames.length,
      added: merged.added,
    };
  }

  const xml = generateTypesXml(classNames, overrides);
  return {
    ok: true,
    xml,
    totalClasses: result.classes.length,
    included: classNames.length,
    added: classNames.length,
  };
});

function dedupe(items) {
  const seen = new Set();
  const output = [];
  for (const item of items) {
    if (seen.has(item)) continue;
    seen.add(item);
    output.push(item);
  }
  return output;
}

function toNumberOrDefault(value, fallback) {
  const num = Number.parseInt(value, 10);
  return Number.isNaN(num) ? fallback : num;
}
