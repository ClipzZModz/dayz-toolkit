import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function App() {
  const apiAvailable = typeof window !== "undefined" && window.dayztools;
  const [missionFolder, setMissionFolder] = React.useState("");
  const [modPath, setModPath] = React.useState("");
  const [baseTypesPath, setBaseTypesPath] = React.useState("");
  const [category, setCategory] = React.useState("tools");
  const [usageInput, setUsageInput] = React.useState("Industrial");
  const [usages, setUsages] = React.useState(["Industrial"]);
  const [defaults, setDefaults] = React.useState({
    nominal: "0",
    min: "0",
    lifetime: "7800",
    restock: "3600",
  });
  const [allowOverwrite, setAllowOverwrite] = React.useState(false);
  const [preview, setPreview] = React.useState("");
  const [status, setStatus] = React.useState(
    apiAvailable
      ? "Ready."
      : "Electron preload not detected. Start the app with npm run dev:app."
  );
  const [stats, setStats] = React.useState(null);

  const handleSelectMission = async () => {
    if (!apiAvailable) return;
    const result = await window.dayztools.selectMissionFolder();
    if (result) setMissionFolder(result);
  };

  const handleSelectMod = async () => {
    if (!apiAvailable) return;
    const result = await window.dayztools.selectModPath();
    if (result) setModPath(result);
  };

  const handleSelectBaseTypes = async () => {
    if (!apiAvailable) return;
    const result = await window.dayztools.selectBaseTypes();
    if (result) setBaseTypesPath(result);
  };

  const handleGenerateTypes = async () => {
    if (!apiAvailable) return;
    setStatus("Generating types.xml...");
    const result = await window.dayztools.generateTypes({
      modPath,
      missionFolder,
      category,
      usages,
      defaults,
      baseTypesPath,
      allowOverwrite,
    });
    if (!result || !result.ok) {
      setStats(null);
      if (result?.requiresConfirm) {
        const confirm = window.confirm("types.xml already exists. Overwrite?");
        if (confirm) {
          setAllowOverwrite(true);
          setStatus("Overwrite confirmed. Click Generate Types again.");
          return;
        }
      }
      setStatus(result?.error || "Failed to generate types.xml");
      return;
    }
    setStats(result);
    setStatus(`Wrote ${result.included} types to ${result.outputPath}`);
  };

  const handlePreview = async () => {
    if (!apiAvailable || !modPath) return;
    setStatus("Generating preview...");
    const result = await window.dayztools.previewTypes({
      modPath,
      category,
      usages,
      defaults,
      baseTypesPath,
    });
    if (!result || !result.ok) {
      setPreview("");
      setStatus(result?.error || "Failed to generate preview.");
      return;
    }
    setPreview(result.xml);
    setStatus("Preview updated.");
  };

  const handleUsageChange = (event) => {
    const value = event.target.value;
    setUsageInput(value);
    const next = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    setUsages(next);
  };

  return (
    <div className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">DayZ Tools</p>
          <h1>Mission XML from mods</h1>
          <p className="subtitle">
            Build types.xml and spawnabletypes.xml from config sources, then
            export safely into a mission folder.
          </p>
          <div className="actions">
            <button className="primary" onClick={handleSelectMission}>
              Select Mission Folder
            </button>
            <button className="ghost" onClick={handleSelectMod}>
              Import Mod Archive
            </button>
            <button className="ghost" onClick={handleSelectBaseTypes}>
              Choose Base types.xml
            </button>
            <button
              className="ghost"
              disabled={!apiAvailable || !missionFolder || !modPath}
              onClick={handleGenerateTypes}
            >
              Generate Types
            </button>
            <button
              className="ghost"
              disabled={!apiAvailable || !modPath}
              onClick={handlePreview}
            >
              Preview XML
            </button>
          </div>
          <div className="inputs">
            <label>
              Category
              <input
                type="text"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="tools"
              />
            </label>
            <label>
              Usage (comma-separated)
              <input
                type="text"
                value={usageInput}
                onChange={handleUsageChange}
                placeholder="Industrial, Town"
              />
            </label>
            <label>
              Nominal
              <input
                type="number"
                value={defaults.nominal}
                onChange={(event) =>
                  setDefaults((prev) => ({ ...prev, nominal: event.target.value }))
                }
              />
            </label>
            <label>
              Min
              <input
                type="number"
                value={defaults.min}
                onChange={(event) =>
                  setDefaults((prev) => ({ ...prev, min: event.target.value }))
                }
              />
            </label>
            <label>
              Lifetime
              <input
                type="number"
                value={defaults.lifetime}
                onChange={(event) =>
                  setDefaults((prev) => ({ ...prev, lifetime: event.target.value }))
                }
              />
            </label>
            <label>
              Restock
              <input
                type="number"
                value={defaults.restock}
                onChange={(event) =>
                  setDefaults((prev) => ({ ...prev, restock: event.target.value }))
                }
              />
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={allowOverwrite}
                onChange={(event) => setAllowOverwrite(event.target.checked)}
              />
              Allow overwrite of types.xml
            </label>
          </div>
        </div>
        <div className="card">
          <h2>Quick Start</h2>
          <ol>
            <li>Pick a mission folder ending in .map.empty</li>
            <li>Import a mod archive or unpacked folder</li>
            <li>Generate types.xml output</li>
          </ol>
          <div className="status">
            <span className="dot" />
            {status}
          </div>
          <div className="paths">
            <div>
              <span>Mission:</span>
              <strong>{missionFolder || "Not selected"}</strong>
            </div>
            <div>
              <span>Mod:</span>
              <strong>{modPath || "Not selected"}</strong>
            </div>
            <div>
              <span>Base types.xml:</span>
              <strong>{baseTypesPath || "Not selected"}</strong>
            </div>
            {stats ? (
              <div>
                <span>Types:</span>
                <strong>
                  {stats.included} / {stats.totalClasses} (added {stats.added})
                </strong>
              </div>
            ) : null}
          </div>
        </div>
      </header>
      <section className="preview">
        <h3>Preview</h3>
        <pre>{preview ? preview.slice(0, 4000) : "No preview generated yet."}</pre>
      </section>
      <section className="grid">
        <div className="panel">
          <h3>Types Generator</h3>
          <p>Extract class names from CfgVehicles and generate skeleton XML.</p>
        </div>
        <div className="panel">
          <h3>Vehicle Builder</h3>
          <p>Manual class selection for clean spawnabletypes output.</p>
        </div>
        <div className="panel">
          <h3>Spawn Maker</h3>
          <p>Map-driven spawns, export as JSON or XML.</p>
        </div>
      </section>
    </div>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
