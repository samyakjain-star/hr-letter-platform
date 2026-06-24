# Security Test Summary

What the automated tests verify, and the current results. These tests are
**tripwires**: each one encodes a security guarantee and fails the build if a
future change (by anyone, including a developer) weakens it.

Run them anytime with `npm test`. They also run automatically on every push to
`main`, on every pull request, and as a **gate before any release is built** —
no installer ships unless every test below passes on that exact version.

---

## Latest result

```
Test Files  6 passed (6)
Tests       27 passed (27)
```

| Suite | File | Tests | Status |
|-------|------|------:|:------:|
| Network isolation | `network-isolation.test.ts` | 6 | ✅ pass |
| Electron hardening | `electron-hardening.test.ts` | 6 | ✅ pass |
| Data at rest | `data-at-rest.test.ts` | 5 | ✅ pass |
| IPC surface | `ipc-surface.test.ts` | 3 | ✅ pass |
| Version compare (unit) | `../unit/version-compare.test.ts` | 3 | ✅ pass |
| Filename safety (unit) | `../unit/filename-safety.test.ts` | 4 | ✅ pass |
| **Total** | | **27** | ✅ |

---

## The core guarantee

**Employee/salary data never leaves the machine, and there is no code path —
for anyone, including the tool's developer — to fetch or exfiltrate local data
to a remote server.** The suites below prove and protect this.

---

## 1. Network isolation — "data stays local" (6 tests)

Proves the app cannot send data anywhere.

- **CSP forbids all outbound connections** — `index.html` sets
  `connect-src 'none'`, so the browser engine itself blocks every
  fetch / XHR / WebSocket / EventSource / sendBeacon.
- **CSP only allows first-party scripts** — `script-src 'self'`, with no
  `unsafe-inline`, `unsafe-eval`, or `*` (injected scripts can't run).
- **Renderer makes no network calls** — scans every renderer source file and
  fails if it finds `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`,
  `navigator.sendBeacon`, a remote dynamic `import()`, or `axios`.
- **Only one outbound call in the whole app** — the update check is the single
  file allowed to touch the network.
- **The update check sends no user data** — it is GET-only (no POST/body),
  hits a hard-coded GitHub `version.txt`, and never references people, salary,
  CTC, or employee data.
- **No telemetry/network dependencies shipped** — the app has zero runtime
  dependencies, and bans `nodemailer`, `axios`, `sentry`, `segment`,
  `analytics`, `posthog`, `mixpanel`, etc.

## 2. Electron hardening — "the shell can't be broken out of" (6 tests)

Proves a hostile document/template can't escape into the OS or Node.

- **Main window** runs with `sandbox: true`, `contextIsolation: true`,
  `nodeIntegration: false`.
- **PDF print window** is also sandboxed/isolated/Node-off and loads **no
  preload** (it has no app capabilities at all).
- **No dangerous webPreference is ever re-enabled** — fails on any
  `nodeIntegration: true`, `contextIsolation: false`, `sandbox: false`,
  `webSecurity: false`, `allowRunningInsecureContent: true`,
  `rejectUnauthorized: false` (TLS bypass), or `webviewTag: true`.
- **External links are https-only** — `isSafeExternalUrl` accepts `https://`
  and rejects `http://`, `file://`, `javascript:`, and custom schemes; the
  window-open handler is verified to use it.
- **In-app navigation is blocked** — a `will-navigate` handler prevents the
  window from being navigated away from the app.
- **No dynamic code** — no `eval` / `new Function` in main or preload.

## 3. Data at rest — "the salary file is unreadable on disk" (5 tests)

Exercises the real encryption logic against a stand-in for the OS keychain.

- **People file is written as ciphertext** — `people.json` does not contain the
  name, employee ID, or salary as plaintext.
- **Round-trips correctly** — the app reads back exactly what it wrote.
- **A copied file is useless without the key** — parsing the raw file as JSON
  fails; only the keychain key decrypts it.
- **Legacy plaintext auto-migrates** — an old unencrypted `people.json` is
  re-sealed to ciphertext on first read, with no data loss.
- **Stays inside the app data dir** — no path traversal in storage.

## 4. IPC surface — "the UI↔system bridge is tiny" (3 tests)

Proves a compromised page has almost nothing to call.

- **Only an explicit 8-method allow-list** is exposed
  (`readPeople`, `writePeople`, `readTemplates`, `writeTemplates`,
  `readSettings`, `writeSettings`, `checkForUpdates`, `printToPDF`).
- **No raw `ipcRenderer` or generic passthrough** is handed to the renderer.
- **Every call maps to a hard-coded, namespaced channel**
  (`storage:` / `updater:` / `pdf:` only).

## 5. Unit tests (7 tests)

- **Version compare** (3) — the update check flags genuinely newer versions,
  never same/older ones, and handles differing segment counts. Prevents false
  "update available" prompts.
- **Filename safety** (4) — the exported PDF filename strips path separators
  and `..` traversal and OS-reserved characters, so user/template data can't
  escape the chosen folder.

---

## Why HR can trust it

By the time HR can even *see* an update, that version already passed all 27
tests during the release build. HR never runs tests — they receive a build that
is guaranteed-tested. And because `connect-src 'none'` is enforced (and tested),
the app simply has no ability to transmit salary data anywhere; the encrypted
file only opens on the machine that wrote it.
