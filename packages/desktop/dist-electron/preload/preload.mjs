import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("electron", {
  // 文件系统操作
  fs: {
    readFile: (path) => ipcRenderer.invoke("fs:readFile", path),
    writeFile: (path, content) => ipcRenderer.invoke("fs:writeFile", path, content),
    readDir: (path) => ipcRenderer.invoke("fs:readDir", path),
    exists: (path) => ipcRenderer.invoke("fs:exists", path)
  },
  // 应用信息
  platform: process.platform,
  version: process.versions.electron
});
