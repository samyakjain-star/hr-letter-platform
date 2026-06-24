import { IpcMain, app, safeStorage } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from 'fs'

function getDataDir(): string {
  return join(app.getPath('userData'), 'data')
}

function ensureDataDir(): void {
  const dir = getDataDir()
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

/** Encryption is backed by the OS keychain (macOS Keychain / Windows DPAPI /
 *  libsecret). Unavailable on some headless Linux setups — there we fall back
 *  to plaintext so the app still works, just unencrypted. */
function canEncrypt(): boolean {
  try {
    return safeStorage.isEncryptionAvailable()
  } catch {
    return false
  }
}

/** Read a JSON file. When `encrypted` is set, the file holds a safeStorage
 *  blob; we transparently fall back to (and re-encrypt) any legacy plaintext
 *  file written before encryption was introduced. */
function readJson<T>(filename: string, fallback: T, encrypted = false): T {
  ensureDataDir()
  const file = join(getDataDir(), filename)
  if (!existsSync(file)) return fallback

  const buf = readFileSync(file)

  if (encrypted && canEncrypt()) {
    // 1. Try to decrypt (the normal path once migrated).
    try {
      return JSON.parse(safeStorage.decryptString(buf)) as T
    } catch {
      // 2. Legacy plaintext from an older build → parse, then upgrade on disk.
      try {
        const data = JSON.parse(buf.toString('utf-8')) as T
        writeJson(filename, data, true) // re-write encrypted
        return data
      } catch {
        return fallback
      }
    }
  }

  try {
    return JSON.parse(buf.toString('utf-8')) as T
  } catch {
    return fallback
  }
}

/** Atomic write: write to .tmp then rename to avoid corruption on crash.
 *  When `encrypted` is set and the OS supports it, the payload is sealed with
 *  safeStorage before hitting disk. */
function writeJson(filename: string, data: unknown, encrypted = false): void {
  ensureDataDir()
  const file = join(getDataDir(), filename)
  const tmp = file + '.tmp'
  const json = JSON.stringify(data, null, 2)

  const payload =
    encrypted && canEncrypt() ? safeStorage.encryptString(json) : Buffer.from(json, 'utf-8')

  writeFileSync(tmp, payload)
  renameSync(tmp, file)
}

export function registerStorageHandlers(ipcMain: IpcMain): void {
  // people.json holds salary/CTC data → encrypted at rest.
  ipcMain.handle('storage:read-people', () =>
    readJson('people.json', { people: [] }, true)
  )
  ipcMain.handle('storage:write-people', (_e, data) => {
    writeJson('people.json', data, true)
  })

  ipcMain.handle('storage:read-templates', () =>
    readJson('templates.json', { templates: [] })
  )
  ipcMain.handle('storage:write-templates', (_e, data) => {
    writeJson('templates.json', data)
  })

  ipcMain.handle('storage:read-settings', () =>
    readJson('settings.json', {
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
