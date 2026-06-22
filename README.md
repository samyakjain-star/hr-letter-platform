# MTAP HR Letter Platform

Desktop app for generating, previewing and emailing appraisal/HR letters. Built with
Electron + React + TypeScript. All employee and salary data stays on the local machine —
nothing is transmitted except an explicit SMTP send and the update check.

## Install (end users)

Download the latest installer from the [Releases page](https://github.com/samyakjain-star/hr-letter-platform/releases/latest):

- **macOS** — `HR Letter Platform-x.y.z.dmg` (Apple Silicon + Intel)
- **Windows** — `HR Letter Platform Setup x.y.z.exe`

Open it and follow the installer. Data is stored locally:

- macOS: `~/Library/Application Support/hr-letter-platform/`
- Windows: `%APPDATA%/hr-letter-platform/`

## Development

```bash
npm install
npm run dev          # launch in dev mode
npm run typecheck    # type-check both processes
npm run build        # compile main/preload/renderer
npm run dist:mac     # build the .dmg
npm run dist:win     # build the .exe (run on / for Windows)
```

## Releasing a new version

The in-app **Check for Updates** button (Settings → About & Updates) reads
[`version.txt`](version.txt) from `main` and compares it to the running app version.

To ship an update:

1. Bump `version` in `package.json` **and** `appVersion` in the settings defaults.
2. Update `version.txt`: first line = new version, following lines = changelog.
3. `npm run build && npm run dist:mac` (and `dist:win` on Windows).
4. Create a GitHub Release tagged `vX.Y.Z` and upload the installers as assets.
5. Push the `version.txt` change to `main`.

Users who click **Check for Updates** will see the new version and a **Download release**
button linking to the latest release.
