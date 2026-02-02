#!/usr/bin/env node

const { Command } = require("commander");
const { runScan } = require("../src/commands/scan");
const { runExtract } = require("../src/commands/extract");
const { runTypes } = require("../src/commands/types");
const { runSpawnableTypes } = require("../src/commands/spawnabletypes");
const { runSpawnableTypesFromJson } = require("../src/commands/spawnabletypes-from-json");

const program = new Command();

program
  .name("dayztools")
  .description("DayZ server mod helpers")
  .version("0.1.0");

program
  .command("scan")
  .argument("<missionFolder>")
  .option("--format <format>", "text or json", "text")
  .action((missionFolder, options) => runScan(missionFolder, options));

program
  .command("extract")
  .argument("<pboFile>")
  .requiredOption("--to <dir>")
  .option("--format <format>", "text or json", "text")
  .option("--extractor <path>")
  .action((pboFile, options) => runExtract(pboFile, options));

program
  .command("types")
  .argument("<modPath>")
  .option("--out <file>")
  .option("--scope <scope>", "scope to include", "2")
  .option("--category <name>", "category name to apply to all types")
  .option("--usage <list>", "comma-separated usage names to apply to all types")
  .option("--base <typesXml>", "existing types.xml to merge into")
  .option("--overwrite", "allow overwriting output file")
  .option("--nominal <number>", "default nominal value")
  .option("--min <number>", "default min value")
  .option("--lifetime <number>", "default lifetime value")
  .option("--restock <number>", "default restock value")
  .option("--format <format>", "text or json", "text")
  .action((modPath, options) => runTypes(modPath, options));

program
  .command("spawnabletypes")
  .argument("<modPath>")
  .option("--out <file>")
  .option("--no-vehicles-only", "include all classes")
  .option("--format <format>", "text or json", "text")
  .action((modPath, options) => runSpawnableTypes(modPath, options));

program
  .command("spawnabletypes-from-json")
  .argument("<jsonFile>")
  .option("--out <file>")
  .option("--format <format>", "text or json", "text")
  .action((jsonFile, options) => runSpawnableTypesFromJson(jsonFile, options));

program.parse(process.argv);
