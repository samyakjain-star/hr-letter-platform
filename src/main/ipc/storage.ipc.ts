import { IpcMain, app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from 'fs'

function getDataDir(): string {
  return join(app.getPath('userData'), 'data')
}

function ensureDataDir(): void {
  const dir = getDataDir()
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

function readJson<T>(filename: string, fallback: T): T {
  ensureDataDir()
  const file = join(getDataDir(), filename)
  if (!existsSync(file)) return fallback
  try {
    return JSON.parse(readFileSync(file, 'utf-8')) as T
  } catch {
    return fallback
  }
}

/** Atomic write: write to .tmp then rename to avoid corruption on crash. */
function writeJson(filename: string, data: unknown): void {
  ensureDataDir()
  const file = join(getDataDir(), filename)
  const tmp = file + '.tmp'
  writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8')
  renameSync(tmp, file)
}

export function registerStorageHandlers(ipcMain: IpcMain): void {
  ipcMain.handle('storage:read-people', () =>
    readJson('people.json', { people: [] })
  )
  ipcMain.handle('storage:write-people', (_e, data) => {
    writeJson('people.json', data)
  })

  ipcMain.handle('storage:read-templates', () =>
    readJson('templates.json', { templates: [] })
  )
  ipcMain.handle('storage:write-templates', (_e, data) => {
    writeJson('templates.json', data)
  })

  ipcMain.handle('storage:read-settings', () =>
    readJson('settings.json', {
      smtp: { email: '', appPassword: '', host: 'smtp.gmail.com', port: 587 },
      calculator: {
        basicPct: 50,
        hraRate: 0.50,
        pfPref: '12%',
        floor15k: false,
      },
      appVersion: '1.0.0',
      pdfFilenamePattern: '{{EMPLOYEE_NAME}}_{{DOCUMENT_TYPE}}_{{DATE}}'
    })
  )
  ipcMain.handle('storage:write-settings', (_e, data) => {
    writeJson('settings.json', data)
  })
}
