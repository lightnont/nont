const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const ytdl = require('ytdl-core');
const { FFmpeg } = require('@ffmpeg/ffmpeg');
const { fetchFile } = require('@ffmpeg/util');
const { shell } = require('electron');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, '../preload/index.js'),
    },
    frame: false,
    transparent: false,
    backgroundColor: '#191414',
    titleBarStyle: 'hidden',
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

const ffmpeg = new FFmpeg();
let ffmpegLoaded = false;

async function loadFFmpeg() {
  if (ffmpegLoaded) return;
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd';
  await ffmpeg.load({
    coreURL: await fetchFile(`${baseURL}/ffmpeg-core.js`),
    wasmURL: await fetchFile(`${baseURL}/ffmpeg-core.wasm`),
  });
  ffmpegLoaded = true;
}

ipcMain.handle('search-youtube', async (event, query) => {
  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl);
    const html = await response.text();
    const videoRegex = /"videoId":"([^"]+)".*"title":({"runs":\[{"text":"([^"]+)/g;
    const results = [];
    let match;
    while ((match = videoRegex.exec(html)) !== null) {
      results.push({
        id: match[1],
        title: match[3].replace(/\\u0026/g, '&'),
        url: `https://www.youtube.com/watch?v=${match[1]}`
      });
    }
    return results.slice(0, 20);
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
});

ipcMain.handle('download-track', async (event, { videoId, title, outputPath }) => {
  try {
    await loadFFmpeg();
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const outputFileName = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`;
    const outputFilePath = path.join(outputPath, outputFileName);

    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    const videoInfo = await ytdl.getInfo(videoUrl);
    const audioFormats = videoInfo.formats.filter(f => f.hasAudio && !f.hasVideo);
    const audioFormat = audioFormats.reduce((prev, current) =>
      (prev.abr > current.abr) ? prev : current
    );

    const audioStream = ytdl(videoUrl, { quality: audioFormat.itag });
    const inputFileName = `${videoId}.webm`;
    const inputFilePath = path.join(outputPath, inputFileName);
    const writeStream = fs.createWriteStream(inputFilePath);
    audioStream.pipe(writeStream);

    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    await ffmpeg.exec([
      '-i', inputFilePath,
      '-codec:a', 'libmp3lame',
      '-qscale:a', '2',
      outputFilePath
    ]);

    fs.unlinkSync(inputFilePath);
    return { success: true, filePath: outputFilePath, fileName: outputFileName };
  } catch (error) {
    console.error('Download error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('download-playlist', async (event, { videoIds, outputPath }) => {
  try {
    const results = [];
    for (const videoId of videoIds) {
      const result = await ipcMain.handle('download-track', event, {
        videoId,
        title: `track_${videoId}`,
        outputPath
      });
      results.push(result);
    }
    return results;
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-downloads-path', async () => {
  const downloadsPath = path.join(app.getPath('userData'), 'Downloads');
  if (!fs.existsSync(downloadsPath)) {
    fs.mkdirSync(downloadsPath, { recursive: true });
  }
  return downloadsPath;
});

ipcMain.handle('list-downloads', async (event, downloadsPath) => {
  try {
    if (!fs.existsSync(downloadsPath)) return [];
    const files = fs.readdirSync(downloadsPath)
      .filter(file => file.endsWith('.mp3'))
      .map(file => ({
        name: file,
        path: path.join(downloadsPath, file),
        size: fs.statSync(path.join(downloadsPath, file)).size,
        date: fs.statSync(path.join(downloadsPath, file)).mtime
      }));
    return files;
  } catch (error) {
    return [];
  }
});

ipcMain.handle('minimize-window', () => mainWindow?.minimize());
ipcMain.handle('maximize-window', () => mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize());
ipcMain.handle('close-window', () => mainWindow?.close());
ipcMain.handle('open-folder', async (event, folderPath) => {
  try { await shell.openPath(folderPath); return { success: true }; }
  catch (error) { return { success: false, error: error.message }; }
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => BrowserWindow.getAllWindows().length === 0 && createWindow());
});

app.on('window-all-closed', () => process.platform !== 'darwin' && app.quit());