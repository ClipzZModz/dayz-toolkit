const { scanMissionFolder } = require("@dayztools/core");

function runScan(missionFolder, options) {
  const result = scanMissionFolder(missionFolder);
  if (options.format === "json") {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (!result.exists) {
    console.error("Mission folder not found.");
    process.exitCode = 1;
    return;
  }

  if (!result.isDirectory) {
    console.error("Mission path is not a directory.");
    process.exitCode = 1;
    return;
  }

  console.log(`Mission folder: ${result.missionFolder}`);
  console.log(`Map empty folder: ${result.isMapEmpty ? "yes" : "no"}`);
  console.log(`types.xml: ${result.files["types.xml"] ? "found" : "missing"}`);
  console.log(`spawnabletypes.xml: ${result.files["spawnabletypes.xml"] ? "found" : "missing"}`);
}

module.exports = {
  runScan,
};
