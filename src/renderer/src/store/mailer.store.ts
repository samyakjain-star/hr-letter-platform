import { create } from 'zustand'
import { parseExcel, detectEmailColumn } from '../lib/excel'
import { resolveVariables } from '../lib/variableResolver'
import type { Recipient, MailJob, SendProgress, SmtpConfig, TemplateVersion } from '../types'

interface State {
  recipients: Recipient[]
  excelHeaders: string[]
  selectedTemplateId: string | null
  cc: string
  bcc: string
  ccApplyToAll: boolean
  sending: boolean
  previewRecipient: Recipient | null
}

interface Actions {
  loadFromExcel: (file: File) => Promise<void>
  toggleRecipient: (rowIndex: number) => void
  toggleAll: (selected: boolean) => void
  setTemplate: (id: string) => void
  setCc: (cc: string) => void
  setBcc: (bcc: string) => void
  setCcApplyToAll: (v: boolean) => void
  setPreview: (r: Recipient | null) => void
  sendAll: (
    cfg: SmtpConfig,
    template: TemplateVersion,
    extraFields: Record<string, string>
  ) => Promise<void>
  retryFailed: () => void
  resetSendProgress: () => void
}

export const useMailerStore = create<State & Actions>((set, get) => ({
  recipients: [],
  excelHeaders: [],
  selectedTemplateId: null,
  cc: '',
  bcc: '',
  ccApplyToAll: false,
  sending: false,
  previewRecipient: null,

  loadFromExcel: async (file) => {
    const { headers, rows } = await parseExcel(file)
    const emailCol = detectEmailColumn(headers)
    const recipients: Recipient[] = rows.map((row, i) => ({
      rowIndex: i,
      to: emailCol ? row[emailCol] ?? '' : '',
      data: row,
      selected: true,
      status: 'pending'
    }))
    set({ recipients, excelHeaders: headers })
  },

  toggleRecipient: (rowIndex) => {
    set(s => ({
      recipients: s.recipients.map(r =>
        r.rowIndex === rowIndex ? { ...r, selected: !r.selected } : r
      )
    }))
  },

  toggleAll: (selected) => {
    set(s => ({ recipients: s.recipients.map(r => ({ ...r, selected })) }))
  },

  setTemplate: (id) => set({ selectedTemplateId: id }),
  setCc: (cc) => set({ cc }),
  setBcc: (bcc) => set({ bcc }),
  setCcApplyToAll: (v) => set({ ccApplyToAll: v }),
  setPreview: (r) => set({ previewRecipient: r }),

  sendAll: async (cfg, template, extraFields) => {
    const { recipients, cc, bcc, ccApplyToAll } = get()
    const selected = recipients.filter(r => r.selected)
    if (!selected.length) return

    set({ sending: true })

    const jobs: MailJob[] = selected.map(r => {
      const fields = { ...extraFields, ...r.data }
      return {
        rowIndex: r.rowIndex,
        to: r.to,
        cc: ccApplyToAll ? cc : undefined,
        bcc: bcc || undefined,
        subject: resolveVariables(template.subject, fields),
        html: resolveVariables(template.html, fields)
      }
    })

    // Set all selected to 'sending'
    set(s => ({
      recipients: s.recipients.map(r =>
        r.selected ? { ...r, status: 'sending' as const } : r
      )
    }))

    const unsub = window.electronAPI.onSendProgress((p: SendProgress) => {
      set(s => ({
        recipients: s.recipients.map(r =>
          r.rowIndex === p.rowIndex
            ? { ...r, status: p.status, error: p.error }
            : r
        )
      }))
    })

    try {
      await window.electronAPI.sendBatch(cfg, jobs)
    } finally {
      if (typeof unsub === 'function') unsub()
      set({ sending: false })
    }
  },

  retryFailed: () => {
    set(s => ({
      recipients: s.recipients.map(r =>
        r.status === 'failed' ? { ...r, status: 'pending', error: undefined } : r
      )
    }))
  },

  resetSendProgress: () => {
    set(s => ({
      recipients: s.recipients.map(r => ({ ...r, status: 'pending', error: undefined }))
    }))
  }
}))
