import { describe, it, expect, beforeEach, vi } from 'vitest'
import { existsSync, mkdirSync, rmSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

/**
 * GUARANTEE: salary data (people.json) is encrypted on disk with an OS-keychain
 * key, so a copied file / backup / other user / malware cannot read it. The
 * encryption is exercised here against a fake safeStorage that stands in for
 * the OS keychain; the contract (ciphertext != plaintext, only the key reads
 * it, legacy files auto-migrate) is what we verify.
 */
const h = vi.hoisted(() => {
  const os = require('os')
  const path = require('path')
  return { dataRoot: path.join(os.tmpdir(), `hrsec-${process.pid}-${Date.now()}`) }
})

// Fake "OS keychain": prefixes ENC1: so plaintext is unrecoverable without it.
vi.mock('electron', () => ({
  app: { getPath: () => h.dataRoot },
  safeStorage: {
    isEncryptionAvailable: () => true,
    encryptString: (s: string) => Buffer.from('ENC1:' + Buffer.from(s, 'utf-8').toString('base64'), 'utf-8'),
    decryptString: (buf: Buffer) => {
      const t = buf.toString('utf-8')
      if (!t.startsWith('ENC1:')) throw new Error('not encrypted with this key')
      return Buffer.from(t.slice(5), 'base64').toString('utf-8')
    }
  }
}))

import { registerStorageHandlers } from '../../src/main/ipc/storage.ipc'

type Handler = (e: unknown, ...args: unknown[]) => unknown
function buildHandlers(): Record<string, Handler> {
  const handlers: Record<string, Handler> = {}
  const fakeIpc = { handle: (ch: string, fn: Handler) => { handlers[ch] = fn } }
  registerStorageHandlers(fakeIpc as never)
  return handlers
}

const dataDir = join(h.dataRoot, 'data')
const SECRET = { people: [{ name: 'Samyak Jain', employeeId: 'm00478', ctcAnnual: 4200000 }] }

beforeEach(() => {
  rmSync(h.dataRoot, { recursive: true, force: true })
  mkdirSync(dataDir, { recursive: true })
})

describe('Salary data encrypted at rest', () => {
  it('writes people.json as ciphertext — plaintext is NOT on disk', () => {
    const h2 = buildHandlers()
    h2['storage:write-people'](null, SECRET)

    const raw = readFileSync(join(dataDir, 'people.json'), 'utf-8')
    expect(raw.startsWith('ENC1:')).toBe(true)        // sealed
    expect(raw).not.toContain('Samyak')               // name not readable
    expect(raw).not.toContain('m00478')               // id not readable
    expect(raw).not.toContain('4200000')              // salary not readable
  })

  it('round-trips: the app reads back exactly what it wrote', () => {
    const h2 = buildHandlers()
    h2['storage:write-people'](null, SECRET)
    expect(h2['storage:read-people'](null)).toEqual(SECRET)
  })

  it('a copied file cannot be read as JSON without the keychain key', () => {
    const h2 = buildHandlers()
    h2['storage:write-people'](null, SECRET)
    const raw = readFileSync(join(dataDir, 'people.json'), 'utf-8')
    // Attacker with the file but not the key: parsing yields nothing useful.
    expect(() => JSON.parse(raw)).toThrow()
  })

  it('auto-migrates an existing PLAINTEXT people.json to encrypted on first read', () => {
    // Simulate a file written by an older (pre-encryption) build.
    writeFileSync(join(dataDir, 'people.json'), JSON.stringify(SECRET, null, 2), 'utf-8')
    const before = readFileSync(join(dataDir, 'people.json'), 'utf-8')
    expect(before).toContain('Samyak') // starts readable

    const h2 = buildHandlers()
    const loaded = h2['storage:read-people'](null)
    expect(loaded).toEqual(SECRET) // still readable by the app

    const after = readFileSync(join(dataDir, 'people.json'), 'utf-8')
    expect(after.startsWith('ENC1:')).toBe(true) // now sealed
    expect(after).not.toContain('Samyak')
  })

  it('stays inside the app data dir (no path traversal in storage)', () => {
    const h2 = buildHandlers()
    h2['storage:write-people'](null, SECRET)
    expect(existsSync(join(dataDir, 'people.json'))).toBe(true)
  })
})
