/** Ambient type for the contextBridge API exposed by the preload. Keeps the
 *  renderer type-safe without importing across the main/renderer project
 *  boundary. Mirrors the `api` object in src/preload/index.ts. */
import type { PeopleStore, TemplatesStore, Settings, UpdateInfo } from './types'

declare global {
  interface Window {
    electronAPI: {
      readPeople(): Promise<PeopleStore>
      writePeople(d: PeopleStore): Promise<void>
      readTemplates(): Promise<TemplatesStore>
      writeTemplates(d: TemplatesStore): Promise<void>
      readSettings(): Promise<Settings>
      writeSettings(d: Settings): Promise<void>
      checkForUpdates(currentVersion: string): Promise<UpdateInfo>
      printToPDF(html: string): Promise<string>
    }
  }
}

export {}
