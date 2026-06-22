import { create } from 'zustand'
import type { Person, PersonDocument, PeopleStore } from '../types'
import { DEFAULT_APPRAISAL_HTML, APPRAISAL_TPL_REV } from '../lib/defaultTemplate'

const REV_MARKER = `data-tpl-rev="${APPRAISAL_TPL_REV}"`

/** One-time upgrade: stock Appraisal Letter documents frozen from an older
 *  template revision get their markup refreshed (keeping all field values) so
 *  layout fixes — 3-page layout, logo, PDF paging — reach existing documents. */
function migrateDocs(people: Person[]): { people: Person[]; changed: boolean } {
  let changed = false
  const next = people.map(p => ({
    ...p,
    documents: p.documents.map(d => {
      if (d.templateId === 'appraisal_letter' && !d.frozenHtml.includes(REV_MARKER)) {
        changed = true
        return { ...d, frozenHtml: DEFAULT_APPRAISAL_HTML }
      }
      return d
    })
  }))
  return { people: next, changed }
}

interface State {
  people: Person[]
  activePerson: Person | null
  activeDoc: PersonDocument | null
  loading: boolean
}

interface Actions {
  load: () => Promise<void>
  _save: (people: Person[]) => Promise<void>
  addPerson: (p: Omit<Person, 'id' | 'documents'>) => void
  updatePerson: (id: string, patch: Partial<Person>) => void
  deletePerson: (id: string) => void
  setActivePerson: (id: string | null) => void
  assignDocument: (
    personId: string,
    templateId: string,
    templateVersion: number,
    name: string,
    frozenHtml: string
  ) => void
  updateDocField: (personId: string, docId: string, key: string, value: string) => void
  setActiveDoc: (personId: string, docId: string) => void
  deleteDoc: (personId: string, docId: string) => void
}

export const usePeopleStore = create<State & Actions>((set, get) => ({
  people: [],
  activePerson: null,
  activeDoc: null,
  loading: false,

  load: async () => {
    set({ loading: true })
    try {
      const data = await window.electronAPI.readPeople()
      const { people, changed } = migrateDocs(data.people ?? [])
      set({ people, loading: false })
      if (changed) get()._save(people)
    } catch {
      set({ loading: false })
    }
  },

  _save: async (people: Person[]) => {
    const store: PeopleStore = { people }
    await window.electronAPI.writePeople(store)
  },

  addPerson: (p) => {
    const person: Person = { ...p, id: crypto.randomUUID(), documents: [] }
    const people = [...get().people, person]
    set({ people })
    get()._save(people)
  },

  updatePerson: (id, patch) => {
    const people = get().people.map(p => p.id === id ? { ...p, ...patch } : p)
    set({ people })
    get()._save(people)
  },

  deletePerson: (id) => {
    const people = get().people.filter(p => p.id !== id)
    const wasActive = get().activePerson?.id === id
    set({ people, ...(wasActive ? { activePerson: null, activeDoc: null } : {}) })
    get()._save(people)
  },

  setActivePerson: (id) => {
    const person = id ? get().people.find(p => p.id === id) ?? null : null
    set({ activePerson: person, activeDoc: null })
  },

  assignDocument: (personId, templateId, templateVersion, name, frozenHtml) => {
    const doc: PersonDocument = {
      docId: crypto.randomUUID(),
      templateId,
      templateVersion,
      name,
      createdAt: new Date().toISOString().split('T')[0],
      frozenHtml,
      fields: {}
    }
    const people = get().people.map(p =>
      p.id === personId ? { ...p, documents: [...p.documents, doc] } : p
    )
    set({ people })
    get()._save(people)
  },

  updateDocField: (personId, docId, key, value) => {
    const people = get().people.map(p => {
      if (p.id !== personId) return p
      return {
        ...p,
        documents: p.documents.map(d =>
          d.docId !== docId ? d : { ...d, fields: { ...d.fields, [key]: value } }
        )
      }
    })
    set({ people })
    // Also update activeDoc if it's the one being edited
    const { activePerson, activeDoc } = get()
    if (activePerson?.id === personId && activeDoc?.docId === docId) {
      const updated = people.find(p => p.id === personId)?.documents.find(d => d.docId === docId)
      if (updated) set({ activeDoc: updated })
    }
    get()._save(people)
  },

  setActiveDoc: (personId, docId) => {
    const person = get().people.find(p => p.id === personId) ?? null
    const doc = person?.documents.find(d => d.docId === docId) ?? null
    set({ activePerson: person, activeDoc: doc })
  },

  deleteDoc: (personId, docId) => {
    const people = get().people.map(p =>
      p.id !== personId ? p : { ...p, documents: p.documents.filter(d => d.docId !== docId) }
    )
    const wasActive = get().activeDoc?.docId === docId
    set({ people, ...(wasActive ? { activeDoc: null } : {}) })
    get()._save(people)
  }
}))
