import { contextBridge, ipcRenderer } from 'electron'
import type {
  PeopleStore, TemplatesStore, Settings, SmtpConfig,
  MailJob, SendProgress, UpdateInfo, ConnectionTestResult
} from '../renderer/src/types'

const api = {
  // ── Storage ──────────────────────────────────────────────────
  readPeople:    (): Promise<PeopleStore>    => ipcRenderer.invoke('storage:read-people'),
  writePeople:   (d: PeopleStore): Promise<void> => ipcRenderer.invoke('storage:write-people', d),

  readTemplates: (): Promise<TemplatesStore> => ipcRenderer.invoke('storage:read-templates'),
  writeTemplates:(d: TemplatesStore): Promise<void> => ipcRenderer.invoke('storage:write-templates', d),

  readSettings:  (): Promise<Settings>      => ipcRenderer.invoke('storage:read-settings'),
  writeSettings: (d: Settings): Promise<void> => ipcRenderer.invoke('storage:write-settings', d),

  // ── Mail ─────────────────────────────────────────────────────
  testConnection: (cfg: SmtpConfig): Promise<ConnectionTestResult> =>
    ipcRenderer.invoke('mail:test-connection', cfg),

  sendBatch: (cfg: SmtpConfig, jobs: MailJob[]): Promise<void> =>
    ipcRenderer.invoke('mail:send-batch', cfg, jobs),

  onSendProgress: (cb: (p: SendProgress) => void) => {
    ipcRenderer.on('mail:send-progress', (_e, p) => cb(p))
    return () => ipcRenderer.removeAllListeners('mail:send-progress')
  },

  // ── Updater ──────────────────────────────────────────────────
  checkForUpdates: (currentVersion: string): Promise<UpdateInfo> =>
    ipcRenderer.invoke('updater:check', currentVersion),

  // ── PDF ──────────────────────────────────────────────────────
  // Render standalone HTML to a PDF via Chromium's native print engine.
  // Returns the PDF as a base64 string.
  printToPDF: (html: string): Promise<string> =>
    ipcRenderer.invoke('pdf:print', html)
}

contextBridge.exposeInMainWorld('electronAPI', api)

declare global {
  interface Window {
    electronAPI: typeof api
  }
}
