const { spawnSync } = require("child_process");
const fs = require("fs");

function extractPbo(pboFile, outputDir, options = {}) {
  const extractorPath = options.extractorPath || process.env.DAYZTOOLS_PBO_EXTRACTOR;

  if (!extractorPath) {
    return {
      ok: false,
      error: "No PBO extractor configured. Set DAYZTOOLS_PBO_EXTRACTOR to a CLI extractor path.",
    };
  }

  if (!fs.existsSync(extractorPath)) {
    return {
      ok: false,
      error: `PBO extractor not found at ${extractorPath}`,
    };
  }

  const result = spawnSync(extractorPath, [pboFile, outputDir], {
    stdio: "inherit",
  });

  if (result.error) {
    return { ok: false, error: result.error.message };
  }

  return { ok: result.status === 0 };
}

module.exports = {
  extractPbo,
};
