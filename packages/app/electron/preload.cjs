const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("dayztools", {
  version: "0.5.0",
  selectMissionFolder: () => ipcRenderer.invoke("mission:select"),
  selectModPath: () => ipcRenderer.invoke("mod:select"),
  selectBaseTypes: () => ipcRenderer.invoke("types:base-select"),
  generateTypes: (payload) => ipcRenderer.invoke("types:generate", payload),
  previewTypes: (payload) => ipcRenderer.invoke("types:preview", payload),
  runCli: (command) => ipcRenderer.invoke("cli:run", command),
  log: (message, type = "INFO") =>
    ipcRenderer.invoke("log:custom", { message, type }),
  onLog: (handler) => {
    ipcRenderer.removeAllListeners("log:event");
    ipcRenderer.on("log:event", (_event, payload) => handler(payload));
  },
});
