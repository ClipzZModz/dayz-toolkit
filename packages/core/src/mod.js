const fs = require("fs");
const path = require("path");
const { collectConfigFiles } = require("./resolveIncludes");
const { parseCfgVehiclesClasses } = require("./parseCfgVehicles");
const { readText } = require("./fs");

function findConfigEntry(modPath) {
  const stat = fs.existsSync(modPath) ? fs.statSync(modPath) : null;
  if (!stat) return null;
  if (stat.isFile()) return modPath;

  const direct = path.join(modPath, "config.cpp");
  if (fs.existsSync(direct)) return direct;

  return null;
}

function loadCfgVehiclesClasses(modPath) {
  const entry = findConfigEntry(modPath);
  if (!entry) {
    return {
      ok: false,
      error: "config.cpp not found in mod path",
      classes: [],
      files: [],
    };
  }

  const files = collectConfigFiles(entry);
  const classes = [];

  for (const filePath of files) {
    const text = readText(filePath);
    classes.push(...parseCfgVehiclesClasses(text));
  }

  return { ok: true, entry, files, classes };
}

function filterClassesByScope(classes, scope) {
  if (scope === null || scope === undefined) return classes;
  return classes.filter((item) => item.scope === scope);
}

module.exports = {
  findConfigEntry,
  loadCfgVehiclesClasses,
  filterClassesByScope,
};
