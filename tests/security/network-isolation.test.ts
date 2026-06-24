import { describe, it, expect } from 'vitest'
import { read, rendererSources, mainSources } from '../helpers/sources'

/**
 * GUARANTEE: employee/salary data never leaves the machine, and there is no
 * code path — for anyone, including the tool's own developer — that can fetch
 * or exfiltrate local data to a remote server.
 *
 * These tests are tripwires: they fail the build if a future change weakens
 * the network isolation (e.g. relaxes the CSP, adds fetch/XHR, posts data, or
 * pulls in a telemetry dependency).
 */
describe('Network isolation — data stays local', () => {
  const indexHtml = read('src/renderer/index.html')

  it('renderer CSP forbids ALL outbound connections (connect-src none)', () => {
    expect(indexHtml).toMatch(/Content-Security-Policy/i)
    // connect-src 'none' => fetch / XHR / WebSocket / EventSource / sendBeacon
    // are all blocked by the browser engine itself.
    expect(indexHtml).toMatch(/connect-src\s+'none'/)
  })

  it('renderer CSP only allows first-party scripts (no inline / eval)', () => {
    const csp = indexHtml.match(/Content-Security-Policy[^>]*content="([^"]+)"/i)?.[1] ?? ''
    const scriptSrc = csp.match(/script-src([^;]*)/)?.[1] ?? ''
    expect(scriptSrc).toContain("'self'")
    expect(scriptSrc).not.toContain('unsafe-inline')
    expect(scriptSrc).not.toContain('unsafe-eval')
    expect(scriptSrc).not.toContain('*')
  })

  it('renderer code makes no network calls of any kind', () => {
    const forbidden = [
      /\bfetch\s*\(/,
      /XMLHttpRequest/,
      /\bWebSocket\b/,
      /\bEventSource\b/,
      /navigator\.sendBeacon/,
      /\bimport\s*\(\s*['"`]https?:/, // dynamic import of a remote module
      /\baxios\b/
    ]
    const offenders: string[] = []
    for (const { path, text } of rendererSources()) {
      for (const re of forbidden) {
        if (re.test(text)) offenders.push(`${path} :: ${re}`)
      }
    }
    expect(offenders, `network calls found in renderer:\n${offenders.join('\n')}`).toEqual([])
  })

  it('the ONLY outbound network in the whole app is the update version check', () => {
    const netUsers = mainSources().filter(({ text }) =>
      /\brequire\(['"]https?['"]\)|from ['"]https?['"]|https?\.(get|request)\(/.test(text)
    )
    // Exactly one file may touch the network: the updater.
    expect(netUsers.map((f) => f.path).every((p) => p.endsWith('updater.ipc.ts'))).toBe(true)
    expect(netUsers).toHaveLength(1)
  })

  it('the update check only GETs a version file and sends no user data', () => {
    const updater = read('src/main/ipc/updater.ipc.ts')
    // It performs GET requests only...
    expect(updater).toMatch(/https\.get\(/)
    expect(updater).not.toMatch(/\.write\(|method:\s*['"]POST|body:|postData/i)
    // ...to a hard-coded GitHub version file, and never references local data.
    expect(updater).toMatch(/version\.txt/)
    expect(updater).not.toMatch(/people|salary|ctc|employee|appPassword|fields/i)
  })

  it('ships no network / telemetry / analytics runtime dependencies', () => {
    const pkg = JSON.parse(read('package.json'))
    const deps = Object.keys(pkg.dependencies ?? {})
    // The app has no runtime deps at all — nothing that could phone home.
    expect(deps).toEqual([])
    const banned = /nodemailer|axios|got|node-fetch|amplitude|segment|sentry|analytics|posthog|mixpanel/i
    const allDeps = [...deps, ...Object.keys(pkg.devDependencies ?? {})]
    expect(allDeps.filter((d) => banned.test(d))).toEqual([])
  })
})
