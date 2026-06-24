import { create } from 'zustand'
import type { Template, TemplateVersion, TemplatesStore } from '../types'
import { STOCK_TEMPLATES } from '../lib/stockTemplates'
import { STOCK_TPL_REV } from '../lib/templateShared'

const REV_MARKER = `data-tpl-rev="${STOCK_TPL_REV}"`
const STOCK_IDS = new Set(STOCK_TEMPLATES.map(t => t.id))

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}

interface State {
  templates: Template[]
  loading: boolean
}

interface Actions {
  load: () => Promise<void>
  _save: (templates: Template[]) => Promise<void>
  addTemplate: (name: string, subject: string, html: string) => void
  updateTemplate: (id: string, subject: string, html: string) => void
  duplicateTemplate: (id: string) => void
  deleteTemplate: (id: string) => void
  getLatestVersion: (id: string) => TemplateVersion | null
}

/** Merge the stock templates into whatever is stored: add any that are
 *  missing, and refresh any stock template whose markup pre-dates the current
 *  revision. User-created templates are left untouched. */
function mergeStockTemplates(stored: Template[]): { templates: Template[]; changed: boolean } {
  let changed = false
  const templates = stored.map(t => {
    if (!STOCK_IDS.has(t.id)) return t
    const latest = t.versions.find(v => v.version === t.currentVersion)
    if (latest && !latest.html.includes(REV_MARKER)) {
      changed = true
      return STOCK_TEMPLATES.find(s => s.id === t.id) ?? t
    }
    return t
  })
  for (const stock of STOCK_TEMPLATES) {
    if (!templates.some(t => t.id === stock.id)) {
      templates.push(stock)
      changed = true
    }
  }
  return { templates, changed }
}

export const useTemplatesStore = create<State & Actions>((set, get) => ({
  templates: [],
  loading: false,

  load: async () => {
    set({ loading: true })
    try {
      const data = await window.electronAPI.readTemplates()
      const { templates, changed } = mergeStockTemplates(data.templates ?? [])
      const needsSave = changed || !data.templates?.length
      set({ templates, loading: false })
      if (needsSave) get()._save(templates)
    } catch {
      set({ templates: STOCK_TEMPLATES, loading: false })
    }
  },

  _save: async (templates: Template[]) => {
    const store: TemplatesStore = { templates }
    await window.electronAPI.writeTemplates(store)
  },

  addTemplate: (name, subject, html) => {
    const id = slugify(name) + '_' + Date.now()
    const template: Template = {
      id,
      name,
      currentVersion: 1,
      versions: [{
        version: 1,
        savedAt: new Date().toISOString().split('T')[0],
        subject,
        html,
        variables: []
      }]
    }
    const templates = [...get().templates, template]
    set({ templates })
    get()._save(templates)
  },

  updateTemplate: (id, subject, html) => {
    const templates = get().templates.map(t => {
      if (t.id !== id) return t
      const nextVersion = t.currentVersion + 1
      return {
        ...t,
        currentVersion: nextVersion,
        versions: [...t.versions, {
          version: nextVersion,
          savedAt: new Date().toISOString().split('T')[0],
          subject,
          html,
          variables: []
        }]
      }
    })
    set({ templates })
    get()._save(templates)
  },

  duplicateTemplate: (id) => {
    const orig = get().templates.find(t => t.id === id)
    if (!orig) return
    const latest = orig.versions.find(v => v.version === orig.currentVersion)
    if (!latest) return
    const newId = slugify(orig.name + '_copy') + '_' + Date.now()
    const copy: Template = {
      id: newId,
      name: orig.name + ' (Copy)',
      currentVersion: 1,
      versions: [{ ...latest, version: 1, savedAt: new Date().toISOString().split('T')[0] }]
    }
    const templates = [...get().templates, copy]
    set({ templates })
    get()._save(templates)
  },

  deleteTemplate: (id) => {
    const templates = get().templates.filter(t => t.id !== id)
    set({ templates })
    get()._save(templates)
  },

  getLatestVersion: (id) => {
    const t = get().templates.find(t => t.id === id)
    if (!t) return null
    return t.versions.find(v => v.version === t.currentVersion) ?? null
  }
}))
