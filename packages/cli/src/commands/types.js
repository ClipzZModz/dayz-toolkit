const path = require("path");
const fs = require("fs");
const {
  loadCfgVehiclesClasses,
  filterClassesByScope,
  generateTypesXml,
  mergeTypesXml,
} = require("@dayztools/core");

function runTypes(modPath, options) {
  const result = loadCfgVehiclesClasses(modPath);
  if (!result.ok) {
    respondError(options, result.error);
    return;
  }

  const scopeValue = Number.parseInt(options.scope, 10);
  const filtered = Number.isNaN(scopeValue)
    ? result.classes
    : filterClassesByScope(result.classes, scopeValue);

  const classNames = dedupe(filtered.map((item) => item.name));
  const categories = parseList(options.category);
  const usages = parseList(options.usage);
  const overrides = cleanOverrides({
    categories,
    usages,
    nominal: parseNumber(options.nominal),
    min: parseNumber(options.min),
    lifetime: parseNumber(options.lifetime),
    restock: parseNumber(options.restock),
  });
  const xml = generateTypesXml(classNames, overrides);

  const outputPath = options.out || path.resolve(process.cwd(), "types.xml");
  if (fs.existsSync(outputPath) && !options.overwrite) {
    respondError(options, "types.xml already exists. Use --overwrite to replace.");
    return;
  }

  if (options.base) {
    const baseXml = fs.readFileSync(options.base, "utf8");
    const merged = mergeTypesXml(baseXml, classNames, overrides);
    fs.writeFileSync(outputPath, merged.xml, "utf8");
  } else {
    fs.writeFileSync(outputPath, xml, "utf8");
  }

  const payload = {
    outputPath,
    totalClasses: result.classes.length,
    included: classNames.length,
  };

  if (options.format === "json") {
    console.log(JSON.stringify(payload, null, 2));
  } else {
    console.log(`Wrote ${classNames.length} types to ${outputPath}`);
  }
}

function respondError(options, message) {
  if (options.format === "json") {
    console.log(JSON.stringify({ ok: false, error: message }, null, 2));
  } else {
    console.error(message);
  }
  process.exitCode = 1;
}

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

function parseList(value) {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseNumber(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const num = Number.parseInt(value, 10);
  return Number.isNaN(num) ? undefined : num;
}

function cleanOverrides(overrides) {
  const output = { ...overrides };
  Object.keys(output).forEach((key) => {
    if (output[key] === undefined) delete output[key];
  });
  return output;
}

module.exports = {
  runTypes,
};
