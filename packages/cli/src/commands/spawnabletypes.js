const path = require("path");
const fs = require("fs");
const {
  loadCfgVehiclesClasses,
  generateSpawnableTypesXml,
} = require("@dayztools/core");

const VEHICLE_BASE_HINTS = [
  "Car",
  "Truck",
  "Vehicle",
  "Helicopter",
  "Boat",
];

function runSpawnableTypes(modPath, options) {
  const result = loadCfgVehiclesClasses(modPath);
  if (!result.ok) {
    respondError(options, result.error);
    return;
  }

  const vehiclesOnly = options.vehiclesOnly !== false;
  let classes = result.classes;
  if (vehiclesOnly) {
    classes = classes.filter((item) => isLikelyVehicle(item));
  }

  const classNames = dedupe(classes.map((item) => item.name));
  const xml = generateSpawnableTypesXml(classNames);
  const outputPath = options.out || path.resolve(process.cwd(), "spawnabletypes_output.xml");
  fs.writeFileSync(outputPath, xml, "utf8");

  const payload = {
    outputPath,
    totalClasses: result.classes.length,
    included: classNames.length,
  };

  if (options.format === "json") {
    console.log(JSON.stringify(payload, null, 2));
  } else {
    console.log(`Wrote ${classNames.length} spawnable types to ${outputPath}`);
  }
}

function isLikelyVehicle(item) {
  if (!item.baseClass) return false;
  return VEHICLE_BASE_HINTS.some((hint) => item.baseClass.includes(hint));
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

module.exports = {
  runSpawnableTypes,
};
