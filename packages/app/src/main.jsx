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
  const log = (message, type = "INFO") => {
    if (apiAvailable) window.dayztools.log(message, type);
  };

  const handleSelectMission = async () => {
    if (!apiAvailable) return;
    const result = await window.dayztools.selectMissionFolder();
    if (result) setMissionFolder(result);
    if (result) log(`Types/SpawnableTypes folder set: ${result}`, "DIR");
  };

  const handleSelectMod = async () => {
    if (!apiAvailable) return;
    const result = await window.dayztools.selectModPath();
    if (result) setModPath(result);
    if (result) log(`Mod path set: ${result}`, "DIR");
  };

  const handleSelectBaseTypes = async () => {
    if (!apiAvailable) return;
    const result = await window.dayztools.selectBaseTypes();
    if (result) setBaseTypesPath(result);
    if (result) log(`Base types.xml set: ${result}`, "DIR");
  };

  const handleGenerateTypes = async () => {
    if (!apiAvailable) return;
    setStatus("Generating types.xml...");
    log("Generating types.xml...", "INFO");
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
          log("Overwrite confirmed by user.", "INFO");
          return;
        }
      }
      setStatus(result?.error || "Failed to generate types.xml");
      log(result?.error || "Failed to generate types.xml", "ERR");
      return;
    }
    setStats(result);
    setStatus(`Wrote ${result.included} types to ${result.outputPath}`);
    log(`Wrote ${result.included} type(s) to ${result.outputPath}`, "INFO");
  };

  const handlePreview = async () => {
    if (!apiAvailable || !modPath) return;
    setStatus("Generating preview...");
    log("Generating preview...", "INFO");
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
      log(result?.error || "Failed to generate preview.", "ERR");
      return;
    }
    setPreview(result.xml);
    setStatus("Preview updated.");
    log("Preview updated.", "INFO");
  };

  const handleUsageChange = (event) => {
    const value = event.target.value;
    setUsageInput(value);
    const next = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    setUsages(next);
    log(`Usage updated: ${next.join(", ") || "none"}`, "INFO");
  };

  return (
    <div className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">DayZ Tools</p>
          <h1>Generate types.xml and spawnabletypes.xml from mod configs.</h1>
          <p className="subtitle">
            Build types.xml and spawnabletypes.xml from config sources, then
            export safely into a types/spawnabletypes folder.
          </p>
          <div className="actions">
            <button className="primary" onClick={handleSelectMission}>
              Select Types/SpawnableTypes Folder
            </button>
            <button className="ghost" onClick={handleSelectMod}>
              Select Mod Folder
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
                onChange={(event) => {
                  setCategory(event.target.value);
                  log(`Category updated: ${event.target.value || "none"}`, "INFO");
                }}
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
                onChange={(event) => {
                  setDefaults((prev) => ({ ...prev, nominal: event.target.value }));
                  log(`Nominal updated: ${event.target.value || "0"}`, "INFO");
                }}
              />
            </label>
            <label>
              Min
              <input
                type="number"
                value={defaults.min}
                onChange={(event) => {
                  setDefaults((prev) => ({ ...prev, min: event.target.value }));
                  log(`Min updated: ${event.target.value || "0"}`, "INFO");
                }}
              />
            </label>
            <label>
              Lifetime
              <input
                type="number"
                value={defaults.lifetime}
                onChange={(event) => {
                  setDefaults((prev) => ({ ...prev, lifetime: event.target.value }));
                  log(`Lifetime updated: ${event.target.value || "0"}`, "INFO");
                }}
              />
            </label>
            <label>
              Restock
              <input
                type="number"
                value={defaults.restock}
                onChange={(event) => {
                  setDefaults((prev) => ({ ...prev, restock: event.target.value }));
                  log(`Restock updated: ${event.target.value || "0"}`, "INFO");
                }}
              />
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={allowOverwrite}
                onChange={(event) => {
                  setAllowOverwrite(event.target.checked);
                  log(`Allow overwrite: ${event.target.checked ? "on" : "off"}`, "INFO");
                }}
              />
              Allow overwrite of types.xml
            </label>
          </div>
        </div>
        <div className="side">
          <div className="card">
            <h2>Quick Start</h2>
            <ol>
              <li>Pick the folder where types.xml should be written</li>
              <li>Import a mod archive or unpacked folder</li>
              <li>Generate types.xml output</li>
            </ol>
            <div className="status">
              <span className="dot" />
              {status}
            </div>
            <div className="paths">
              <div>
                <span>Types Folder:</span>
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
          <div className="card coming-soon">
            <div className="card-header">
              <h2>Spawnable Types</h2>
              <span className="tag">Coming Soon</span>
            </div>
            <p>
              Build spawnabletypes.xml from selected classes and attachable
              loadouts. This will live alongside types generation once ready.
            </p>
          </div>
        </div>
      </header>
      <section className="preview">
        <div className="preview-header">
          <h3>Preview</h3>
          <button
            className="ghost"
            type="button"
            disabled={!preview}
            onClick={() => navigator.clipboard.writeText(preview)}
          >
            Copy XML
          </button>
        </div>
        <pre
          className="xml-preview"
          dangerouslySetInnerHTML={{
            __html: preview
              ? highlightXml(preview.slice(0, 4000))
              : "No preview generated yet.",
          }}
        />
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

function highlightXml(xml) {
  const xmlDecl = /(&lt;\\?xml[^&]*\\?&gt;)/gi;
  const closeTag = new RegExp("(&lt;\\/)([A-Za-z0-9_:\\\\-]+)(&gt;)", "g");
  const openTag = new RegExp("(&lt;)([A-Za-z0-9_:\\\\-]+)([^&]*?)(&gt;)", "g");
  const attrPattern = new RegExp("([A-Za-z0-9_:\\\\-]+)=(&quot;.*?&quot;)", "g");

  return escapeHtml(xml)
    .replace(xmlDecl, '<span class="xml-decl">$1</span>')
    .replace(closeTag, '$1<span class="xml-tag">$2</span>$3')
    .replace(openTag, (match, open, tag, rest, close) => {
      const attrs = rest.replace(
        attrPattern,
        '<span class="xml-attr">$1</span>=<span class="xml-value">$2</span>'
      );
      return `${open}<span class="xml-tag">${tag}</span>${attrs}${close}`;
    });
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
