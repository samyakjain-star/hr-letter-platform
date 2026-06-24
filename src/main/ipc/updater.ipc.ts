import { IpcMain, app } from 'electron'
import https from 'https'

const GH_OWNER = 'samyakjain-star'
const GH_REPO = 'hr-letter-platform'
const VERSION_URL =
  `https://raw.githubusercontent.com/${GH_OWNER}/${GH_REPO}/main/version.txt`
const RELEASES_URL = `https://github.com/${GH_OWNER}/${GH_REPO}/releases/latest`

/** GET a URL as text, following GitHub's redirects, with a short timeout. */
function fetchText(url: string, redirectsLeft = 3): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      { headers: { 'User-Agent': 'hr-letter-platform' } },
      (res) => {
        // Follow redirects (raw → fastly, releases/latest → tagged).
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location &&
          redirectsLeft > 0
        ) {
          res.resume()
          resolve(fetchText(res.headers.location, redirectsLeft - 1))
          return
        }
        if (res.statusCode !== 200) {
          res.resume()
          reject(new Error(`HTTP ${res.statusCode} fetching version info`))
          return
        }
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => resolve(data.trim()))
      }
    )
    req.on('error', reject)
    req.setTimeout(8000, () => req.destroy(new Error('Update check timed out')))
  })
}

/** Compare dotted numeric versions. Returns true if `latest` > `current`. */
function isNewer(latest: string, current: string): boolean {
  const a = latest.split('.').map((n) => parseInt(n, 10) || 0)
  const b = current.split('.').map((n) => parseInt(n, 10) || 0)
  const len = Math.max(a.length, b.length)
  for (let i = 0; i < len; i++) {
    const x = a[i] ?? 0
    const y = b[i] ?? 0
    if (x !== y) return x > y
  }
  return false
}

export function registerUpdaterHandlers(ipcMain: IpcMain): void {
  ipcMain.handle('updater:check', async () => {
    // Compare against the real running build, not a value the renderer persisted
    // (settings.appVersion can go stale across upgrades).
    const currentVersion = app.getVersion()
    try {
      const raw = await fetchText(VERSION_URL)
      // Expected format: "1.2.0\nChangelog line 1\nChangelog line 2"
      const [latestVersion, ...changelogLines] = raw.split('\n')
      const hasUpdate = isNewer(latestVersion, currentVersion)

      return {
        hasUpdate,
        version: latestVersion,
        changelog: changelogLines.join('\n').trim(),
        downloadUrl: hasUpdate ? RELEASES_URL : undefined
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      throw new Error(`Update check failed: ${message}`)
    }
  })
}
