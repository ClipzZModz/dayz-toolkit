const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outputBase = path.join(root, "dev-test-data");
const missionFolder = path.join(outputBase, "test.mission.map.empty");
const modFolder = path.join(outputBase, "TestMod");

fs.mkdirSync(missionFolder, { recursive: true });
fs.mkdirSync(modFolder, { recursive: true });

const configCpp = `class CfgVehicles
{
  class Inventory_Base;
  class TZ_TestItem: Inventory_Base
  {
    scope=2;
  };
  class LM_Chainsaw: Inventory_Base
  {
    scope=2;
  };
};
`;

fs.writeFileSync(path.join(modFolder, "config.cpp"), configCpp, "utf8");

console.log("Created:");
console.log(missionFolder);
console.log(modFolder);
