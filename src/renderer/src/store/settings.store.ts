import { create } from 'zustand'
import type { Settings, UpdateInfo } from '../types'

const DEFAULT_SETTINGS: Settings = {
  calculator: { basicPct: 50, hraRate: 0.50, pfPref: '12%', floor15k: false },
  appVersion: '1.0.0',
  pdfFilenamePattern: '{{EMPLOYEE_NAME}}_{{DOCUMENT_TYPE}}_{{DATE}}'
}

interface State {
  settings: Settings
  loading: boolean
  updateInfo: UpdateInfo | null
  updateLoading: boolean
}

interface Actions {
  load: () => Promise<void>
  save: (s: Settings) => Promise<void>
  checkForUpdates: () => Promise<void>
}

export const useSettingsStore = create<State & Actions>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loading: false,
  updateInfo: null,
  updateLoading: false,

  load: async () => {
    set({ loading: true })
    try {
      const loaded = await window.electronAPI.readSettings()
      set({ settings: loaded ?? DEFAULT_SETTINGS, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  save: async (s: Settings) => {
    set({ loading: true })
    try {
      await window.electronAPI.writeSettings(s)
      set({ settings: s, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  checkForUpdates: async () => {
    set({ updateLoading: true, updateInfo: null })
    try {
      const info = await window.electronAPI.checkForUpdates(get().settings.appVersion)
      set({ updateInfo: info, updateLoading: false })
    } catch (err) {
      set({
        updateInfo: { hasUpdate: false, changelog: err instanceof Error ? err.message : String(err) },
        updateLoading: false
      })
    }
  }
}))
