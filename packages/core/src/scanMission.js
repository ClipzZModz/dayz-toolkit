const fs = require("fs");
const path = require("path");

function scanMissionFolder(folderPath) {
  const result = {
    missionFolder: folderPath,
    exists: fs.existsSync(folderPath),
    isDirectory: false,
    isMapEmpty: false,
    files: {},
  };

  if (!result.exists) return result;

  try {
    const stat = fs.statSync(folderPath);
    result.isDirectory = stat.isDirectory();
  } catch {
    return result;
  }

  if (!result.isDirectory) return result;

  const baseName = path.basename(folderPath);
  result.isMapEmpty = baseName.endsWith(".map.empty");

  const filesToCheck = ["types.xml", "spawnabletypes.xml"];
  for (const fileName of filesToCheck) {
    const target = path.join(folderPath, fileName);
    result.files[fileName] = fs.existsSync(target);
  }

  return result;
}

module.exports = {
  scanMissionFolder,
};
