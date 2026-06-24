import { readFileSync, readdirSync, statSync } from 'fs'
import { join, resolve } from 'path'

export const ROOT = resolve(__dirname, '..', '..')

export function read(relPath: string): string {
  return readFileSync(join(ROOT, relPath), 'utf-8')
}

/** Recursively collect source files under a dir, filtered by extension. */
export function collectFiles(relDir: string, exts = ['.ts', '.tsx']): string[] {
  const base = join(ROOT, relDir)
  const out: string[] = []
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry)
      if (statSync(full).isDirectory()) {
        if (entry === 'node_modules' || entry === 'out' || entry === 'dist') continue
        walk(full)
      } else if (exts.some((e) => entry.endsWith(e))) {
        out.push(full)
      }
    }
  }
  walk(base)
  return out
}

/** Read every renderer source file as one searchable blob (path-tagged). */
export function rendererSources(): { path: string; text: string }[] {
  return collectFiles('src/renderer/src').map((p) => ({ path: p, text: readFileSync(p, 'utf-8') }))
}

export function mainSources(): { path: string; text: string }[] {
  return [...collectFiles('src/main'), ...collectFiles('src/preload')].map((p) => ({
    path: p,
    text: readFileSync(p, 'utf-8')
  }))
}
