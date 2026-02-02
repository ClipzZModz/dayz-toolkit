const { extractPbo } = require("@dayztools/core");

function runExtract(pboFile, options) {
  const result = extractPbo(pboFile, options.to, {
    extractorPath: options.extractor,
  });

  if (options.format === "json") {
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exitCode = 1;
    return;
  }

  if (!result.ok) {
    console.error(result.error || "Extraction failed.");
    process.exitCode = 1;
    return;
  }

  console.log("Extraction completed.");
}

module.exports = {
  runExtract,
};
