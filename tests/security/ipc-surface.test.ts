import { describe, it, expect } from 'vitest'
import { read } from '../helpers/sources'

/**
 * GUARANTEE: the bridge between the web UI and the privileged main process is a
 * small, explicit allow-list. The renderer cannot reach arbitrary IPC channels,
 * the file system, or Node — so a compromised page has almost nothing to call.
 */
describe('IPC surface is minimal and explicit', () => {
  const preload = read('src/preload/index.ts')

  it('exposes only the known electronAPI methods — nothing more', () => {
    const allowed = new Set([
      'readPeople', 'writePeople',
      'readTemplates', 'writeTemplates',
      'readSettings', 'writeSettings',
      'checkForUpdates',
      'printToPDF'
    ])
    const exposed = [...preload.matchAll(/^\s*(\w+):\s*\(/gm)].map((m) => m[1])
    expect(exposed.length).toBeGreaterThan(0)
    for (const name of exposed) {
      expect(allowed.has(name), `unexpected IPC method exposed: ${name}`).toBe(true)
    }
  })

  it('does not leak the raw ipcRenderer or a generic invoke/send to the page', () => {
    expect(preload).toMatch(/contextBridge\.exposeInMainWorld/)
    // Must not hand the whole ipcRenderer (or a passthrough) to the renderer.
    expect(preload).not.toMatch(/exposeInMainWorld\([^)]*ipcRenderer/)
    expect(preload).not.toMatch(/exposeInMainWorld\(\s*['"`]ipc/i)
  })

  it('every exposed call maps to a namespaced, hard-coded channel', () => {
    const channels = [...preload.matchAll(/invoke\(\s*['"]([^'"]+)['"]/g)].map((m) => m[1])
    expect(channels.length).toBeGreaterThan(0)
    for (const ch of channels) {
      expect(ch, `non-namespaced channel: ${ch}`).toMatch(/^(storage|updater|pdf):/)
    }
  })
})
