const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("dayztools", {
  version: "0.1.0",
  selectMissionFolder: () => ipcRenderer.invoke("mission:select"),
  selectModPath: () => ipcRenderer.invoke("mod:select"),
  selectBaseTypes: () => ipcRenderer.invoke("types:base-select"),
  generateTypes: (payload) => ipcRenderer.invoke("types:generate", payload),
  previewTypes: (payload) => ipcRenderer.invoke("types:preview", payload),
});
