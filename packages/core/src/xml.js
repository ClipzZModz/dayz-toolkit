const DEFAULT_TYPE = {
  nominal: 0,
  lifetime: 7800,
  restock: 3600,
  min: 0,
  quantmin: -1,
  quantmax: -1,
  cost: 100,
  flags: {
    count_in_cargo: 0,
    count_in_hoarder: 0,
    count_in_map: 1,
    count_in_player: 0,
    crafted: 0,
    deloot: 0,
  },
  categories: [],
  usages: [],
};

function generateTypesXml(classNames, overrides = {}) {
  const lines = [];
  lines.push("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>");
  lines.push("<types>");
  lines.push(...generateTypeBlocks(classNames, overrides));
  lines.push("</types>");
  lines.push("");
  return lines.join("\n");
}

function generateTypeBlocks(classNames, overrides = {}) {
  const typeDefaults = { ...DEFAULT_TYPE, ...overrides };
  const lines = [];

  for (const name of classNames) {
    lines.push(`  <type name=\"${escapeXml(name)}\">`);
    lines.push(`    <nominal>${typeDefaults.nominal}</nominal>`);
    lines.push(`    <lifetime>${typeDefaults.lifetime}</lifetime>`);
    lines.push(`    <restock>${typeDefaults.restock}</restock>`);
    lines.push(`    <min>${typeDefaults.min}</min>`);
    lines.push(`    <quantmin>${typeDefaults.quantmin}</quantmin>`);
    lines.push(`    <quantmax>${typeDefaults.quantmax}</quantmax>`);
    lines.push(`    <cost>${typeDefaults.cost}</cost>`);
    lines.push(
      `    <flags count_in_cargo=\"${typeDefaults.flags.count_in_cargo}\" count_in_hoarder=\"${typeDefaults.flags.count_in_hoarder}\" count_in_map=\"${typeDefaults.flags.count_in_map}\" count_in_player=\"${typeDefaults.flags.count_in_player}\" crafted=\"${typeDefaults.flags.crafted}\" deloot=\"${typeDefaults.flags.deloot}\"/>`
    );
    for (const category of typeDefaults.categories || []) {
      lines.push(`    <category name=\"${escapeXml(category)}\"/>`);
    }
    for (const usage of typeDefaults.usages || []) {
      lines.push(`    <usage name=\"${escapeXml(usage)}\"/>`);
    }
    lines.push("  </type>");
  }

  return lines;
}

function mergeTypesXml(existingXml, classNames, overrides = {}) {
  const existingNames = new Set();
  const nameRegex = /<type\s+name=\"([^\"]+)\"/g;
  let match;
  while ((match = nameRegex.exec(existingXml)) !== null) {
    existingNames.add(match[1]);
  }

  const missing = classNames.filter((name) => !existingNames.has(name));
  if (missing.length === 0) return { xml: existingXml, added: 0 };

  const blocks = generateTypeBlocks(missing, overrides).join("\n");
  const closingIndex = existingXml.lastIndexOf("</types>");
  if (closingIndex === -1) {
    return {
      xml: `${existingXml}\n${generateTypesXml(missing, overrides)}`,
      added: missing.length,
    };
  }

  const before = existingXml.slice(0, closingIndex).replace(/\s*$/, "");
  const after = existingXml.slice(closingIndex);
  const nextXml = `${before}\n${blocks}\n${after}`;
  return { xml: nextXml, added: missing.length };
}

function generateSpawnableTypesXml(classNames) {
  const lines = [];
  lines.push("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>");
  lines.push("<spawnabletypes>");

  for (const name of classNames) {
    lines.push(`  <type name=\"${escapeXml(name)}\">`);
    lines.push("  </type>");
  }

  lines.push("</spawnabletypes>");
  lines.push("");
  return lines.join("\n");
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

module.exports = {
  DEFAULT_TYPE,
  generateTypesXml,
  generateTypeBlocks,
  mergeTypesXml,
  generateSpawnableTypesXml,
};
