import React, { useRef } from 'react'
import { Upload, Send, RotateCcw, Eye } from 'lucide-react'
import { useMailerStore } from '../../store/mailer.store'
import { useSettingsStore } from '../../store/settings.store'
import { useTemplatesStore } from '../../store/templates.store'

export default function MailerPage() {
  const mailer = useMailerStore()
  const { settings } = useSettingsStore()
  const { templates, getLatestVersion } = useTemplatesStore()
  const fileRef = useRef<HTMLInputElement>(null)

  const selectedTemplate = mailer.selectedTemplateId ? getLatestVersion(mailer.selectedTemplateId) : null
  const selectedCount = mailer.recipients.filter(r => r.selected).length
  const canSend = selectedCount > 0 && !!selectedTemplate && !mailer.sending

  const sentCount = mailer.recipients.filter(r => r.status === 'sent').length
  const failedCount = mailer.recipients.filter(r => r.status === 'failed').length
  const sendingCount = mailer.recipients.filter(r => r.status === 'sending').length

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await mailer.loadFromExcel(file)
    e.target.value = ''
  }

  const handleSend = async () => {
    if (!selectedTemplate || !canSend) return
    await mailer.sendAll(settings.smtp, selectedTemplate, {})
  }

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; color: string; label: string }> = {
      pending: { bg: 'rgba(255,255,255,0.08)', color: '#6b85a8', label: 'Pending' },
      sending: { bg: 'rgba(251,140,0,0.15)', color: '#FB8C00', label: 'Sending…' },
      sent:    { bg: 'rgba(67,160,71,0.15)',  color: '#43A047', label: 'Sent' },
      failed:  { bg: 'rgba(229,57,53,0.15)',  color: '#E53935', label: 'Failed' },
    }
    const s = map[status] ?? map.pending
    return <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: s.bg, color: s.color, fontWeight: 600, whiteSpace: 'nowrap' }}>{s.label}</span>
  }

  const inp: React.CSSProperties = { width: '100%', padding: '7px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, color: '#eef4ff', fontSize: 12, outline: 'none' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: 10, fontWeight: 700, color: '#6b85a8', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 4 }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#071426' }}>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── LEFT: Recipients (40%) ─────────────────────────────── */}
        <div style={{ width: '40%', borderRight: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#eef4ff', flex: 1 }}>Recipients</h3>
              {mailer.recipients.length > 0 && (
                <span style={{ fontSize: 11, color: '#6b85a8' }}>{selectedCount}/{mailer.recipients.length} selected</span>
              )}
            </div>
            <button onClick={() => fileRef.current?.click()}
              style={{ width: '100%', padding: '8px', background: 'rgba(30,136,229,0.1)', border: '1.5px dashed rgba(30,136,229,0.4)', borderRadius: 8, color: '#1E88E5', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Upload size={13} /> Upload Excel / CSV
            </button>
            <input ref={fileRef} type="file" accept=".xlsx,.csv,.xls" onChange={handleFileChange} style={{ display: 'none' }} />
          </div>

          {/* Controls */}
          {mailer.recipients.length > 0 && (
            <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 8 }}>
              <button onClick={() => mailer.toggleAll(true)} style={{ fontSize: 11, padding: '3px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, color: '#8fa0b8', cursor: 'pointer' }}>Select All</button>
              <button onClick={() => mailer.toggleAll(false)} style={{ fontSize: 11, padding: '3px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, color: '#8fa0b8', cursor: 'pointer' }}>Deselect All</button>
              {failedCount > 0 && <button onClick={mailer.retryFailed} style={{ fontSize: 11, padding: '3px 10px', background: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.3)', borderRadius: 5, color: '#E53935', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><RotateCcw size={10} /> Retry {failedCount}</button>}
            </div>
          )}

          {/* Table */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {mailer.recipients.length === 0 && (
              <div style={{ padding: 32, textAlign: 'center', color: '#6b85a8', fontSize: 12 }}>
                Upload an Excel file to load recipients.
              </div>
            )}
            {mailer.recipients.map(r => (
              <div key={r.rowIndex}
                onClick={() => mailer.setPreview(mailer.previewRecipient?.rowIndex === r.rowIndex ? null : r)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', background: mailer.previewRecipient?.rowIndex === r.rowIndex ? 'rgba(30,136,229,0.08)' : 'transparent', borderLeft: mailer.previewRecipient?.rowIndex === r.rowIndex ? '2px solid #1E88E5' : '2px solid transparent', transition: 'background 0.1s' }}
              >
                <input type="checkbox" checked={r.selected} onChange={e => { e.stopPropagation(); mailer.toggleRecipient(r.rowIndex) }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: '#eef4ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.data.name || r.data.Name || r.data.EMPLOYEE_NAME || `Row ${r.rowIndex + 1}`}
                  </div>
                  <div style={{ fontSize: 11, color: '#6b85a8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.to}</div>
                  {r.error && <div style={{ fontSize: 10, color: '#E53935', marginTop: 2 }}>{r.error}</div>}
                </div>
                {statusBadge(r.status)}
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Compose + Preview (60%) ────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Compose */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#eef4ff' }}>Compose</h3>

            {/* Template selector */}
            <div style={{ marginBottom: 10 }}>
              <label style={lbl}>Template</label>
              <select value={mailer.selectedTemplateId ?? ''} onChange={e => mailer.setTemplate(e.target.value)}
                style={{ ...inp }}>
                <option value="">— Select a template —</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name} (v{t.currentVersion})</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 8, fontSize: 12, color: '#6b85a8' }}>
              To: <strong style={{ color: '#eef4ff' }}>{selectedCount} recipient{selectedCount !== 1 ? 's' : ''} selected</strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={lbl}>CC</label>
                <input style={inp} value={mailer.cc} onChange={e => mailer.setCc(e.target.value)} placeholder="cc@example.com" />
              </div>
              <div>
                <label style={lbl}>BCC</label>
                <input style={inp} value={mailer.bcc} onChange={e => mailer.setBcc(e.target.value)} placeholder="bcc@example.com" />
              </div>
            </div>

            {mailer.cc && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 8, fontSize: 12, color: '#6b85a8', cursor: 'pointer' }}>
                <input type="checkbox" checked={mailer.ccApplyToAll} onChange={e => mailer.setCcApplyToAll(e.target.checked)} />
                Apply CC to all recipients
              </label>
            )}
          </div>

          {/* Preview */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {mailer.previewRecipient && selectedTemplate ? (
              <>
                <div style={{ padding: '8px 16px', background: 'rgba(30,136,229,0.08)', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Eye size={13} color="#1E88E5" />
                  <span style={{ fontSize: 12, color: '#1E88E5', fontWeight: 600 }}>
                    Preview — {mailer.previewRecipient.data.name || mailer.previewRecipient.to}
                  </span>
                </div>
                <iframe
                  srcDoc={`<!doctype html><html><body style="margin:16px;font-family:sans-serif">${selectedTemplate.html.replace(/\{\{([^}]+)\}\}/g, (_m, k) => mailer.previewRecipient!.data[k.trim()] || mailer.previewRecipient!.data[k.trim().toLowerCase()] || `<span style="background:rgba(229,57,53,0.2);color:#E53935;padding:1px 4px">{{${k}}}</span>`)}</body></html>`}
                  style={{ flex: 1, border: 'none', background: '#fff' }}
                  sandbox="allow-same-origin"
                />
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b85a8', fontSize: 12 }}>
                Click a recipient to preview their resolved email
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Send bar ────────────────────────────────────────────── */}
      <div style={{ height: 60, background: '#0b1d3a', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16, flexShrink: 0 }}>
        <button onClick={handleSend} disabled={!canSend}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 24px', background: canSend ? '#43A047' : 'rgba(67,160,71,0.3)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 700, cursor: canSend ? 'pointer' : 'not-allowed' }}>
          <Send size={15} />
          {mailer.sending ? `Sending…` : `Send ${selectedCount} Email${selectedCount !== 1 ? 's' : ''}`}
        </button>

        <div style={{ display: 'flex', gap: 14, fontSize: 12 }}>
          {sentCount > 0 && <span style={{ color: '#43A047' }}>✓ {sentCount} sent</span>}
          {sendingCount > 0 && <span style={{ color: '#FB8C00' }}>⟳ {sendingCount} sending</span>}
          {failedCount > 0 && <span style={{ color: '#E53935' }}>✗ {failedCount} failed</span>}
        </div>
      </div>
    </div>
  )
}
