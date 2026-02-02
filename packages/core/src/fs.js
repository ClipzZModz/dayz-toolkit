const fs = require("fs");
const path = require("path");

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function fileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function resolvePath(baseDir, relativePath) {
  return path.resolve(baseDir, relativePath);
}

module.exports = {
  fileExists,
  readText,
  resolvePath,
};
