import { app, BrowserWindow, dialog, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { spawn } from "child_process";
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

  mainWindow.webContents.on("did-finish-load", () => {
    logEvent("Renderer loaded.", "INFO");
  });
}

function createConsoleWindow() {
  const consoleWindow = new BrowserWindow({
    width: 900,
    height: 520,
    minWidth: 700,
    minHeight: 400,
    backgroundColor: "#0f1114",
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  const consolePath = path.join(__dirname, "console.html");
  consoleWindow.loadFile(consolePath);
  consoleWindow.setTitle("DayZ Tools Console");
}

app.whenReady().then(() => {
  app.setAppUserModelId("com.dayztools.app");
  logEvent("App starting.", "INFO");
  createWindow();
  createConsoleWindow();

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
  logEvent(`Types/SpawnableTypes folder selected: ${result.filePaths[0]}`, "DIR");
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
  logEvent(`Mod path selected: ${result.filePaths[0]}`, "DIR");
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
  logEvent(`Base types.xml selected: ${result.filePaths[0]}`, "DIR");
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
    return { ok: false, error: "Missing mod path or output folder." };
  }

  const outputPath = path.join(missionFolder, "types.xml");
  if (fs.existsSync(outputPath) && !allowOverwrite) {
    return { ok: false, error: "types.xml already exists. Confirm overwrite.", requiresConfirm: true };
  }

  logEvent(`Generating types.xml from ${modPath}`, "INFO");

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
    logEvent(`Merged ${merged.added} type(s) into ${outputPath}`, "INFO");
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
  logEvent(`Wrote ${classNames.length} type(s) to ${outputPath}`, "INFO");

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

  logEvent(`Generating preview from ${modPath}`, "INFO");

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

ipcMain.handle("cli:run", async (_event, command) => {
  const trimmed = String(command || "").trim();
  if (!trimmed) {
    return { ok: false, error: "Command is empty." };
  }

  logEvent(`CLI run: ${trimmed}`, "CMD");

  return new Promise((resolve) => {
    const proc = spawn("cmd.exe", ["/d", "/s", "/c", trimmed], {
      cwd: path.resolve(__dirname, "..", ".."),
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => {
      const text = data.toString();
      stdout += text;
      logEvent(text.trimEnd(), "OUT");
    });

    proc.stderr.on("data", (data) => {
      const text = data.toString();
      stderr += text;
      logEvent(text.trimEnd(), "ERR");
    });

    proc.on("close", (code) => {
      logEvent(`CLI exit code: ${code}`, "CMD");
      resolve({ ok: code === 0, code, stdout, stderr });
    });
  });
});

ipcMain.handle("log:custom", async (_event, message) => {
  if (typeof message === "object" && message !== null) {
    logEvent(message.message, message.type);
  } else {
    logEvent(message, "INFO");
  }
  return true;
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

function logEvent(message, type = "INFO") {
  let text = "";
  if (typeof message === "string") {
    text = message;
  } else if (message instanceof Error) {
    text = message.stack || message.message;
  } else if (message && typeof message === "object") {
    try {
      text = JSON.stringify(message);
    } catch {
      text = String(message);
    }
  } else {
    text = String(message || "");
  }
  text = text.trim();
  if (!text) return;
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send("log:event", {
      time: new Date().toISOString(),
      type,
      message: text,
    });
  }
}
