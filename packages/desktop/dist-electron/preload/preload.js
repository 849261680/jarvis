"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electron", {
  // 文件系统操作
  fs: {
    readFile: (path) => electron.ipcRenderer.invoke("fs:readFile", path),
    writeFile: (path, content) => electron.ipcRenderer.invoke("fs:writeFile", path, content),
    readDir: (path) => electron.ipcRenderer.invoke("fs:readDir", path),
    exists: (path) => electron.ipcRenderer.invoke("fs:exists", path)
  },
  // 窗口控制
  window: {
    minimize: () => electron.ipcRenderer.send("window:minimize"),
    maximize: () => electron.ipcRenderer.send("window:maximize"),
    close: () => electron.ipcRenderer.send("window:close")
  },
  // 应用信息
  platform: process.platform,
  version: process.versions.electron
});
