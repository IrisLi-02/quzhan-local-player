const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('overlay', {
  onState: (callback) => {
    const handler = (_event, value) => callback(value);
    ipcRenderer.on('overlay:state', handler);
    return () => ipcRenderer.removeListener('overlay:state', handler);
  },
  onSettings: (callback) => {
    const handler = (_event, value) => callback(value);
    ipcRenderer.on('overlay:settings', handler);
    return () => ipcRenderer.removeListener('overlay:settings', handler);
  },
  close: () => ipcRenderer.send('overlay:close'),
});
