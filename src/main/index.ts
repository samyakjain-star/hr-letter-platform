import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { join } from 'path'
import { registerStorageHandlers } from './ipc/storage.ipc'
import { registerMailHandlers } from './ipc/mail.ipc'
import { registerUpdaterHandlers } from './ipc/updater.ipc'
import { registerPdfHandlers } from './ipc/pdf.ipc'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    backgroundColor: '#071426',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  if (process.platform === 'win32') {
    app.setAppUserModelId('in.mtap.hr-letter-platform')
  }

  app.on('browser-window-created', (_e, _window) => {
    // window shortcuts registered here if needed
  })

  // Register all IPC handlers
  registerStorageHandlers(ipcMain)
  registerMailHandlers(ipcMain, () => mainWindow)
  registerUpdaterHandlers(ipcMain)
  registerPdfHandlers(ipcMain)

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
