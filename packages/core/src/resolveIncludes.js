const path = require("path");
const { fileExists, readText, resolvePath } = require("./fs");

const INCLUDE_RE = /^\s*#include\s+"([^"]+)"/gm;

function collectConfigFiles(entryFile) {
  const seen = new Set();
  const ordered = [];

  function walk(filePath) {
    const normalized = path.resolve(filePath);
    if (seen.has(normalized)) return;
    if (!fileExists(normalized)) return;

    seen.add(normalized);
    ordered.push(normalized);

    const text = readText(normalized);
    const baseDir = path.dirname(normalized);
    let match;
    while ((match = INCLUDE_RE.exec(text)) !== null) {
      const includePath = resolvePath(baseDir, match[1]);
      walk(includePath);
    }
  }

  walk(entryFile);
  return ordered;
}

module.exports = {
  collectConfigFiles,
};
