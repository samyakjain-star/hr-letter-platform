import React, { useState, useEffect } from 'react'
import { X, FileText, Check } from 'lucide-react'
import type { Template } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  personName: string
  templates: Template[]
  onAssign: (templateId: string, docName: string) => void
}

export default function AssignDocModal({ open, onClose, personName, templates, onAssign }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [docName, setDocName] = useState('')

  useEffect(() => {
    if (!open) { setSelectedId(null); setDocName('') }
  }, [open])

  useEffect(() => {
    if (selectedId) {
      const t = templates.find(t => t.id === selectedId)
      if (t) setDocName(t.name)
    }
  }, [selectedId])

  if (!open) return null

  const canAssign = !!selectedId && docName.trim().length > 0

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div style={{ background: '#0f2444', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, width: '100%', maxWidth: 500, padding: 24, boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#1E88E5', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 4 }}>Assign Document</div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#eef4ff' }}>{personName}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b85a8', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ marginBottom: 16, fontSize: 11, fontWeight: 700, color: '#6b85a8', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          Select Template
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, maxHeight: 240, overflowY: 'auto' }}>
          {templates.map(t => {
            const sel = selectedId === t.id
            return (
              <div
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                  borderRadius: 8, cursor: 'pointer',
                  background: sel ? 'rgba(30,136,229,0.1)' : 'rgba(255,255,255,0.03)',
                  border: sel ? '1px solid #1E88E5' : '1px solid rgba(255,255,255,0.08)',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 6, background: sel ? '#1E88E5' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {sel ? <Check size={14} color="#fff" /> : <FileText size={14} color="#6b85a8" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: '#eef4ff', fontWeight: sel ? 600 : 400 }}>{t.name}</div>
                </div>
                <div style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: sel ? '#1E88E5' : 'rgba(255,255,255,0.08)', color: sel ? '#fff' : '#6b85a8', fontWeight: 600 }}>
                  v{t.currentVersion}
                </div>
              </div>
            )
          })}
          {templates.length === 0 && (
            <div style={{ textAlign: 'center', color: '#6b85a8', fontSize: 13, padding: 20 }}>
              No templates available. Create one first.
            </div>
          )}
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b85a8', marginBottom: 5, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Document Name
          </label>
          <input
            style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#eef4ff', fontSize: 13, outline: 'none' }}
            value={docName}
            onChange={e => setDocName(e.target.value)}
            placeholder="e.g. Appraisal Letter - Apr 2026"
          />
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 18px', background: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#6b85a8', fontSize: 13, cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            onClick={() => { if (canAssign) { onAssign(selectedId!, docName.trim()); onClose() } }}
            disabled={!canAssign}
            style={{ padding: '8px 18px', background: canAssign ? '#1E88E5' : 'rgba(30,136,229,0.3)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: canAssign ? 'pointer' : 'not-allowed', opacity: canAssign ? 1 : 0.7 }}
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  )
}
