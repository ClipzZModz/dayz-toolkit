const { generateSpawnableTypesXml } = require("./xml");

function generateSpawnableTypesFromSpec(spec) {
  const vehicles = Array.isArray(spec?.vehicles) ? spec.vehicles : [];
  const lines = [];

  lines.push("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>");
  lines.push("<spawnabletypes>");

  for (const vehicle of vehicles) {
    if (!vehicle || !vehicle.name) continue;
    lines.push(`  <type name=\"${escapeXml(vehicle.name)}\">`);

    const attachments = Array.isArray(vehicle.attachments) ? vehicle.attachments : [];
    for (const attachment of attachments) {
      if (!attachment || !attachment.name) continue;
      const chance = normalizeChance(attachment.chance);
      lines.push(`    <attachments chance=\"${chance}\">`);
      lines.push(`      <item name=\"${escapeXml(attachment.name)}\" chance=\"${chance}\" />`);
      lines.push("    </attachments>");
    }

    lines.push("  </type>");
  }

  lines.push("</spawnabletypes>");
  lines.push("");
  return lines.join("\n");
}

function normalizeChance(value) {
  if (value === null || value === undefined) return "1.00";
  const num = Number.parseFloat(value);
  if (Number.isNaN(num)) return "1.00";
  return num.toFixed(2);
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function validateVehicleSpec(spec) {
  const errors = [];
  if (!spec || typeof spec !== "object") {
    errors.push("Spec must be a JSON object.");
    return { ok: false, errors };
  }

  if (!Array.isArray(spec.vehicles)) {
    errors.push("Spec.vehicles must be an array.");
    return { ok: false, errors };
  }

  spec.vehicles.forEach((vehicle, index) => {
    if (!vehicle || typeof vehicle !== "object") {
      errors.push(`vehicles[${index}] must be an object.`);
      return;
    }
    if (!vehicle.name) {
      errors.push(`vehicles[${index}].name is required.`);
    }
    if (vehicle.attachments && !Array.isArray(vehicle.attachments)) {
      errors.push(`vehicles[${index}].attachments must be an array.`);
    }
  });

  return { ok: errors.length === 0, errors };
}

module.exports = {
  generateSpawnableTypesFromSpec,
  validateVehicleSpec,
};
