const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('quzhan', {
  platform: process.platform,
  mediaBaseUrl: ipcRenderer.sendSync('media:origin'),
  getState: () => ipcRenderer.invoke('app:get-state'),
  getAppInfo: () => ipcRenderer.invoke('app:info'),
  saveState: (state) => ipcRenderer.send('state:save', state),
  flushState: (state) => ipcRenderer.invoke('state:flush', state),
  importFromDialog: () => ipcRenderer.invoke('dialog:import-audio'),
  importPaths: (paths) => ipcRenderer.invoke('audio:import-paths', paths),
  getCoverPalette: (filePath) => ipcRenderer.invoke('cover:palette', filePath),
  getCoverArtwork: (filePath) => ipcRenderer.invoke('cover:artwork', filePath),
  getPathForFile: (file) => webUtils.getPathForFile(file),
  revealFile: (filePath) => ipcRenderer.invoke('path:reveal', filePath),
  minimize: () => ipcRenderer.invoke('window:minimize'),
  toggleMaximize: () => ipcRenderer.invoke('window:toggle-maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  hideToTray: () => ipcRenderer.invoke('window:hide-to-tray'),
  quitApp: () => ipcRenderer.invoke('app:quit'),
  openUserData: () => ipcRenderer.invoke('app:open-user-data'),
  registerAssociations: () => ipcRenderer.invoke('associations:register'),
  getAssociationStatus: () => ipcRenderer.invoke('associations:status'),
  openDefaultAppsSettings: () => ipcRenderer.invoke('associations:open-default-apps'),
  takeLaunchActions: () => ipcRenderer.invoke('app:take-launch-actions'),
  isMaximized: () => ipcRenderer.invoke('window:is-maximized'),
  onWindowMaximized: (callback) => {
    const handler = (_event, value) => callback(Boolean(value));
    ipcRenderer.on('window:maximized', handler);
    return () => ipcRenderer.removeListener('window:maximized', handler);
  },
  onImportProgress: (callback) => {
    const handler = (_event, value) => callback(value);
    ipcRenderer.on('import:progress', handler);
    return () => ipcRenderer.removeListener('import:progress', handler);
  },
  onSmokeImport: (callback) => {
    const handler = (_event, value) => callback(value);
    ipcRenderer.on('smoke:import', handler);
    return () => ipcRenderer.removeListener('smoke:import', handler);
  },
  showDesktopLyrics: (payload) => ipcRenderer.invoke('desktopLyrics:show', payload),
  hideDesktopLyrics: () => ipcRenderer.invoke('desktopLyrics:hide'),
  updateDesktopLyrics: (playback) => ipcRenderer.send('desktopLyrics:update', playback),
  onDesktopLyricsVisibility: (callback) => {
    const handler = (_event, value) => callback(Boolean(value));
    ipcRenderer.on('desktopLyrics:visibility', handler);
    return () => ipcRenderer.removeListener('desktopLyrics:visibility', handler);
  },
  onOpenFiles: (callback) => {
    const handler = (_event, paths) => callback(Array.isArray(paths) ? paths : []);
    ipcRenderer.on('files:open', handler);
    return () => ipcRenderer.removeListener('files:open', handler);
  },
  onRequestClose: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('window:request-close', handler);
    return () => ipcRenderer.removeListener('window:request-close', handler);
  },
  onTrayAction: (callback) => {
    const handler = (_event, action) => callback(action);
    ipcRenderer.on('tray:action', handler);
    return () => ipcRenderer.removeListener('tray:action', handler);
  },
  onOpenDefaultSettings: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('app:open-default-settings', handler);
    return () => ipcRenderer.removeListener('app:open-default-settings', handler);
  },
});
