import { create } from 'zustand'
import type { Template, TemplateVersion, TemplatesStore } from '../types'
import { DEFAULT_APPRAISAL_HTML, APPRAISAL_TPL_REV } from '../lib/defaultTemplate'

const REV_MARKER = `data-tpl-rev="${APPRAISAL_TPL_REV}"`

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

const SEED_TEMPLATE: Template = {
  id: 'appraisal_letter',
  name: 'Appraisal Letter',
  currentVersion: 1,
  versions: [{
    version: 1,
    savedAt: new Date().toISOString().split('T')[0],
    subject: 'Your Appraisal Letter — {{EMPLOYEE_NAME}}',
    html: DEFAULT_APPRAISAL_HTML,
    variables: [
      'EMPLOYEE_NAME', 'EMPLOYEE_ID', 'DESIGNATION', 'DIVISION', 'GRADE',
      'DATE', 'REF_NUMBER', 'PERFORMANCE_RATING', 'NEW_CTC', 'NEW_CTC_FORMATTED',
      'EFFECTIVE_DATE', 'BASIC_MONTHLY', 'BASIC_ANNUAL', 'HRA_MONTHLY', 'HRA_ANNUAL',
      'SPECIAL_ALLOWANCE_MONTHLY', 'SPECIAL_ALLOWANCE_ANNUAL', 'LTA_MONTHLY', 'LTA_ANNUAL',
      'VEHICLE_MONTHLY', 'VEHICLE_ANNUAL', 'DRIVER_MONTHLY', 'DRIVER_ANNUAL',
      'TELEPHONE_MONTHLY', 'TELEPHONE_ANNUAL', 'FOOD_MONTHLY', 'FOOD_ANNUAL',
      'FIXED_CTC_MONTHLY', 'FIXED_CTC_ANNUAL', 'PF_MONTHLY', 'PF_ANNUAL',
      'SUBTOTAL_MONTHLY', 'SUBTOTAL_ANNUAL', 'TOTAL_FIXED_CTC_MONTHLY', 'TOTAL_FIXED_CTC_ANNUAL',
      'NET_MONTHLY_CREDIT_MONTHLY', 'NET_MONTHLY_CREDIT_ANNUAL',
      'PERFORMANCE_BONUS_ANNUAL', 'TOTAL_BONUS_ANNUAL'
    ]
  }]
}

export const useTemplatesStore = create<State & Actions>((set, get) => ({
  templates: [],
  loading: false,

  load: async () => {
    set({ loading: true })
    try {
      const data = await window.electronAPI.readTemplates()
      let templates = data.templates?.length ? data.templates : [SEED_TEMPLATE]
      let needsSave = !data.templates?.length

      // Migration: refresh the stock Appraisal Letter when an older template
      // revision is stored (3-page layout, logo & PDF paging fixes).
      const seed = templates.find(t => t.id === 'appraisal_letter')
      const seedLatest = seed?.versions.find(v => v.version === seed.currentVersion)
      if (seed && seedLatest && !seedLatest.html.includes(REV_MARKER)) {
        templates = templates.map(t => t.id === 'appraisal_letter' ? SEED_TEMPLATE : t)
        needsSave = true
      }

      set({ templates, loading: false })
      if (needsSave) get()._save(templates)
    } catch {
      set({ templates: [SEED_TEMPLATE], loading: false })
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
