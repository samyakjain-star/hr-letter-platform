import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { join } from 'path'
import { registerStorageHandlers } from './ipc/storage.ipc'
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
      // Hardened: full OS-process sandbox. The preload only uses ipcRenderer +
      // contextBridge, both supported under the sandbox, so nothing breaks.
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  // Only ever hand https URLs to the OS shell. Without this, an injected
  // window.open() could pass file:// or a custom protocol handler to the OS.
  mainWindow.webContents.setWindowOpenHandler((details) => {
    if (/^https:\/\//i.test(details.url)) shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Block in-app navigation away from the app (e.g. injected links/forms).
  mainWindow.webContents.on('will-navigate', (e, url) => {
    const isDevServer = !app.isPackaged && process.env['ELECTRON_RENDERER_URL'] &&
      url.startsWith(process.env['ELECTRON_RENDERER_URL'])
    if (!isDevServer) e.preventDefault()
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
