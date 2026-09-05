const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  searchYouTube: (query) => ipcRenderer.invoke('search-youtube', query),
  downloadTrack: (videoId, title, outputPath) => ipcRenderer.invoke('download-track', { videoId, title, outputPath }),
  downloadPlaylist: (videoIds, outputPath) => ipcRenderer.invoke('download-playlist', { videoIds, outputPath }),
  getDownloadsPath: () => ipcRenderer.invoke('get-downloads-path'),
  listDownloads: (downloadsPath) => ipcRenderer.invoke('list-downloads', downloadsPath),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  openFolder: (folderPath) => ipcRenderer.invoke('open-folder', folderPath),
});