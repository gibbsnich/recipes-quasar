import { app, BrowserWindow, ipcMain, nativeTheme } from 'electron'
import path from 'path'
import os from 'os'
import axios from 'axios'
import fs from 'fs';

// needed in case process is undefined under Linux
const platform = process.platform || os.platform()

try {
  if (platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    require('fs').unlinkSync(path.join(app.getPath('userData'), 'DevTools Extensions'))
  }
}
catch (_) { }

let mainWindow

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, 'icons/icon.png'), // tray icon
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      // More info: /quasar-cli/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD)
    }
  })

  mainWindow.loadURL(process.env.APP_URL)

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools()
  }
  else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools()
    })
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.handle('request', async (event, url) => {
  const result = await axios.get(url);
  return result.data;
});

function getAppPath() {
  if (process.env.NODE_ENV === 'development') {
    return app.getAppPath();
  } else {
    return app.getPath('appData');
  }
}

function getDataPath(fileName) {
  if (fileName) {
    return path.join(getAppPath(), 'electron-recipe-data', `${fileName}.json`);
  }
  return path.join(getAppPath(), 'electron-recipe-data');
}

ipcMain.handle('readJSON', async (event, fileName) => {
  const dirPath = getDataPath(null);
  const dirExists = fs.existsSync(dirPath);
  if (!dirExists) {
    const mkdirErr = await fs.promises.mkdir(dirPath);
    if (mkdirErr) {
      console.warn(mkdirErr);
      return;
    }
  }
  const path = getDataPath(fileName);
  const exists = fs.existsSync(path);
  if (exists) {
    const data = await fs.promises.readFile(path, {encoding: 'UTF-8'});
    return JSON.parse(data);
  } else {
    return [];
  }
});

ipcMain.handle('writeJSON', async (event, ...data) => {
  await fs.promises.writeFile(getDataPath(data[0]), data[1]);
});
