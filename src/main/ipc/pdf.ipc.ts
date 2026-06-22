import { IpcMain, BrowserWindow, app } from 'electron'
import { writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'

/** Render standalone HTML to a PDF using Chromium's native print engine.
 *  This reproduces the document exactly as it renders on screen — correct
 *  vertical centering, fonts, colors and page breaks — unlike a canvas
 *  rasteriser. Returns the PDF as a base64 string. */
export function registerPdfHandlers(ipcMain: IpcMain): void {
  ipcMain.handle('pdf:print', async (_e, html: string): Promise<string> => {
    const tmpFile = join(app.getPath('temp'), `mtap-print-${process.pid}-${Date.now()}.html`)
    writeFileSync(tmpFile, html, 'utf-8')

    const win = new BrowserWindow({
      show: false,
      webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false }
    })

    try {
      await win.loadFile(tmpFile)
      // Give data-URI images (logo) and fonts a beat to settle before printing.
      await new Promise(resolve => setTimeout(resolve, 200))

      const data = await win.webContents.printToPDF({
        pageSize: 'A4',
        printBackground: true,
        margins: { top: 0, bottom: 0, left: 0, right: 0 }
      })
      return data.toString('base64')
    } finally {
      win.destroy()
      try { unlinkSync(tmpFile) } catch { /* best-effort cleanup */ }
    }
  })
}
