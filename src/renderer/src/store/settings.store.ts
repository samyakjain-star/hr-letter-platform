import { create } from 'zustand'
import type { Settings, UpdateInfo, ConnectionTestResult } from '../types'

const DEFAULT_SETTINGS: Settings = {
  smtp: { email: '', appPassword: '', host: 'smtp.gmail.com', port: 587 },
  calculator: { basicPct: 50, hraRate: 0.50, pfPref: '12%', floor15k: false },
  appVersion: '1.0.0',
  pdfFilenamePattern: '{{EMPLOYEE_NAME}}_{{DOCUMENT_TYPE}}_{{DATE}}'
}

interface State {
  settings: Settings
  loading: boolean
  testResult: ConnectionTestResult | null
  testLoading: boolean
  updateInfo: UpdateInfo | null
  updateLoading: boolean
}

interface Actions {
  load: () => Promise<void>
  save: (s: Settings) => Promise<void>
  testConnection: () => Promise<void>
  checkForUpdates: () => Promise<void>
}

export const useSettingsStore = create<State & Actions>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loading: false,
  testResult: null,
  testLoading: false,
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

  testConnection: async () => {
    set({ testLoading: true, testResult: null })
    try {
      const result = await window.electronAPI.testConnection(get().settings.smtp)
      set({ testResult: result, testLoading: false })
    } catch (err) {
      set({
        testResult: { ok: false, error: err instanceof Error ? err.message : String(err) },
        testLoading: false
      })
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
