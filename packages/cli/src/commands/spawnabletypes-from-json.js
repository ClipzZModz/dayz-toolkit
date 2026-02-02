const fs = require("fs");
const path = require("path");
const {
  generateSpawnableTypesFromSpec,
  validateVehicleSpec,
} = require("@dayztools/core");

function runSpawnableTypesFromJson(jsonPath, options) {
  let raw;
  try {
    raw = fs.readFileSync(jsonPath, "utf8");
  } catch (error) {
    respondError(options, `Failed to read JSON: ${error.message}`);
    return;
  }

  let spec;
  try {
    spec = JSON.parse(raw);
  } catch (error) {
    respondError(options, `Invalid JSON: ${error.message}`);
    return;
  }

  const validation = validateVehicleSpec(spec);
  if (!validation.ok) {
    respondError(options, validation.errors.join(" "));
    return;
  }

  const xml = generateSpawnableTypesFromSpec(spec);
  const outputPath = options.out || path.resolve(process.cwd(), "spawnabletypes_output.xml");
  fs.writeFileSync(outputPath, xml, "utf8");

  if (options.format === "json") {
    console.log(JSON.stringify({ outputPath, vehicles: spec.vehicles.length }, null, 2));
  } else {
    console.log(`Wrote spawnabletypes for ${spec.vehicles.length} vehicle(s) to ${outputPath}`);
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

module.exports = {
  runSpawnableTypesFromJson,
};
