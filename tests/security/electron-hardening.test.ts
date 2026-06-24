import { describe, it, expect } from 'vitest'
import { read, mainSources } from '../helpers/sources'
import { isSafeExternalUrl } from '../../src/main/security'

/**
 * GUARANTEE: the desktop shell is hardened so a hostile document/template
 * rendered in the window cannot break out into the OS or the Node runtime.
 */
describe('Electron process hardening', () => {
  it('main window runs sandboxed, isolated, with Node disabled', () => {
    const idx = read('src/main/index.ts')
    expect(idx).toMatch(/sandbox:\s*true/)
    expect(idx).toMatch(/contextIsolation:\s*true/)
    expect(idx).toMatch(/nodeIntegration:\s*false/)
  })

  it('PDF print window is also sandboxed, isolated, Node disabled, no preload', () => {
    const pdf = read('src/main/ipc/pdf.ipc.ts')
    expect(pdf).toMatch(/sandbox:\s*true/)
    expect(pdf).toMatch(/contextIsolation:\s*true/)
    expect(pdf).toMatch(/nodeIntegration:\s*false/)
    // The print window must NOT load the preload (it needs no app capabilities).
    expect(pdf).not.toMatch(/preload:/)
  })

  it('no source ever re-enables a dangerous webPreference', () => {
    const banned = [
      /nodeIntegration:\s*true/,
      /contextIsolation:\s*false/,
      /sandbox:\s*false/,
      /webSecurity:\s*false/,
      /allowRunningInsecureContent:\s*true/,
      /rejectUnauthorized:\s*false/, // would disable TLS cert checks
      /webviewTag:\s*true/
    ]
    const offenders: string[] = []
    for (const { path, text } of mainSources()) {
      for (const re of banned) if (re.test(text)) offenders.push(`${path} :: ${re}`)
    }
    expect(offenders, offenders.join('\n')).toEqual([])
  })

  it('external links are restricted to https only', () => {
    expect(isSafeExternalUrl('https://github.com/x/y/releases')).toBe(true)
    expect(isSafeExternalUrl('http://example.com')).toBe(false)
    expect(isSafeExternalUrl('file:///etc/passwd')).toBe(false)
    expect(isSafeExternalUrl('javascript:alert(1)')).toBe(false)
    expect(isSafeExternalUrl('ms-calculator://')).toBe(false)
    expect(isSafeExternalUrl('  https://ok.com')).toBe(true)
    // The window-open handler actually uses this guard.
    const idx = read('src/main/index.ts')
    expect(idx).toMatch(/setWindowOpenHandler/)
    expect(idx).toMatch(/isSafeExternalUrl\(/)
  })

  it('blocks in-app navigation away from the app', () => {
    const idx = read('src/main/index.ts')
    expect(idx).toMatch(/will-navigate/)
    expect(idx).toMatch(/preventDefault\(\)/)
  })

  it('does not expose eval / new Function in the preload or main', () => {
    for (const { path, text } of mainSources()) {
      expect(/\beval\s*\(|new Function\s*\(/.test(text), `dynamic code in ${path}`).toBe(false)
    }
  })
})
