const { collectConfigFiles } = require("./resolveIncludes");
const { parseCfgVehiclesClasses } = require("./parseCfgVehicles");
const { scanMissionFolder } = require("./scanMission");
const { extractPbo } = require("./extractPbo");
const { generateTypesXml, generateTypeBlocks, mergeTypesXml, generateSpawnableTypesXml } = require("./xml");
const { findConfigEntry, loadCfgVehiclesClasses, filterClassesByScope } = require("./mod");
const { generateSpawnableTypesFromSpec, validateVehicleSpec } = require("./vehicleBuilder");

module.exports = {
  collectConfigFiles,
  parseCfgVehiclesClasses,
  scanMissionFolder,
  extractPbo,
  generateTypesXml,
  generateTypeBlocks,
  mergeTypesXml,
  generateSpawnableTypesXml,
  generateSpawnableTypesFromSpec,
  findConfigEntry,
  loadCfgVehiclesClasses,
  filterClassesByScope,
  validateVehicleSpec,
};
