# Changelog

All notable changes to this project will be documented in this file.

## Versioning

- Pre-release until `1.0.0`.
- Use semantic versioning: `MAJOR.MINOR.PATCH`.
- Update this file for every user-facing change (features, fixes, behavior changes).

## Unreleased

- No changes yet.

## 0.5.0 - 2026-02-03

- Added core parser for `CfgVehicles` and XML generators for `types.xml` and `spawnabletypes.xml`.
- Added CLI commands: `scan`, `extract`, `types`, `spawnabletypes`.
- Documented manual Vehicle Builder intent in README.
- Added include resolution for `config.cpp` via `#include` scanning.
- Added `spawnabletypes-from-json` command for manual vehicle lists.
- Added Electron + React app scaffold with Vite dev server workflow.
- Wired Electron UI to select types folder + mod path and generate `types.xml`.
- Added UI warning and button disabling when Electron preload APIs are not available.
- Switched Electron preload to CommonJS (`preload.cjs`) to ensure preload loads in dev.
- Added `scripts/create-test-data.js` and `npm run test-data` for local testing.
- Simplified app styling.
- Updated types generation to default to `types.xml` (UI writes to selected folder, CLI defaults to current directory).
- Added category/usage inputs to the Electron UI and CLI support for `--category`/`--usage`.
- Added defaults, preview, overwrite confirmation, and base types.xml merge support in the UI and CLI.
- Added electron-builder config and release scripts for Windows installer + portable EXE.
- Pinned Electron version and added app metadata for release builds.
- Added colored XML highlighting in the preview pane.
- Added a Copy XML button to the preview pane.
- Added a dedicated console window with log streaming and a simple CLI runner.
- Added detailed UI action logging to the console window.
- Added log badges ([INFO], [DIR], [CMD], [OUT], [ERR]) in the console window.
- Updated mod import button label to "Select Mod Folder".
- Updated UI labels to avoid "mission" wording in favor of types/spawnabletypes language.
- Updated hero headline to match types/spawnabletypes focus.

## 0.1.0

- Initial workspace scaffolding (core + cli packages).
