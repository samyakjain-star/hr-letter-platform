import React, { useState, useEffect } from 'react'
import { Mail, Loader, ExternalLink } from 'lucide-react'
import { useSettingsStore } from '../../store/settings.store'
import type { Settings } from '../../types'

const inp: React.CSSProperties = { width: '100%', padding: '8px 12px', background: '#0a1e38', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#eef4ff', fontSize: 13, outline: 'none', transition: 'border-color 0.15s' }
const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, color: '#6b85a8', marginBottom: 5, letterSpacing: '0.5px', textTransform: 'uppercase' }

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#0f2744', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '20px 24px', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ width: 3, height: 16, background: '#1E88E5', borderRadius: 2 }} />
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#eef4ff' }}>{title}</h3>
      </div>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const store = useSettingsStore()
  const [smtp, setSmtp] = useState(store.settings.smtp)

  useEffect(() => { setSmtp(store.settings.smtp) }, [store.settings.smtp])

  const saveSmtp = () => {
    const updated: Settings = { ...store.settings, smtp }
    store.save(updated)
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', background: '#071426' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <h2 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 700, color: '#eef4ff' }}>Settings</h2>

        {/* SMTP */}
        <Card title="SMTP Configuration">
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Gmail Address</label>
            <input style={inp} type="email" value={smtp.email} onChange={e => setSmtp(s => ({ ...s, email: e.target.value }))} placeholder="hr@mtap.in" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>App Password</label>
            <input style={inp} type="password" value={smtp.appPassword} onChange={e => setSmtp(s => ({ ...s, appPassword: e.target.value }))} placeholder="Gmail App Password (not login password)" />
            <p style={{ fontSize: 11, color: '#6b85a8', marginTop: 5 }}>
              Generate at Google Account → Security → App Passwords
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 12, marginBottom: 18 }}>
            <div>
              <label style={lbl}>SMTP Host</label>
              <input style={inp} value={smtp.host} onChange={e => setSmtp(s => ({ ...s, host: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Port</label>
              <input style={inp} type="number" value={smtp.port} onChange={e => setSmtp(s => ({ ...s, port: parseInt(e.target.value) || 587 }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => store.testConnection()} disabled={store.testLoading}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#eef4ff', fontSize: 13, cursor: store.testLoading ? 'not-allowed' : 'pointer' }}>
              {store.testLoading ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Mail size={13} />}
              Test Connection
            </button>
            <button onClick={saveSmtp} style={{ padding: '7px 16px', background: '#1E88E5', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Save SMTP
            </button>
          </div>
          {store.testResult && (
            <div style={{ marginTop: 12, padding: '8px 14px', borderRadius: 8, background: store.testResult.ok ? 'rgba(67,160,71,0.12)' : 'rgba(229,57,53,0.12)', border: `1px solid ${store.testResult.ok ? 'rgba(67,160,71,0.3)' : 'rgba(229,57,53,0.3)'}`, color: store.testResult.ok ? '#43A047' : '#E53935', fontSize: 12 }}>
              {store.testResult.ok ? '✓ Connection successful' : `✗ ${store.testResult.error}`}
            </div>
          )}
        </Card>

        {/* About & Updates */}
        <Card title="About & Updates">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ padding: '4px 12px', background: 'rgba(30,136,229,0.15)', border: '1px solid rgba(30,136,229,0.3)', borderRadius: 20, fontSize: 12, color: '#93b8f5', fontWeight: 600 }}>
              v{store.settings.appVersion}
            </div>
            <span style={{ fontSize: 13, color: '#6b85a8' }}>MTAP HR Letter Platform</span>
          </div>
          <button onClick={store.checkForUpdates} disabled={store.updateLoading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#eef4ff', fontSize: 13, cursor: store.updateLoading ? 'not-allowed' : 'pointer', marginBottom: 12 }}>
            {store.updateLoading ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : null}
            Check for Updates
          </button>
          {store.updateInfo && (
            <div style={{ padding: '12px 14px', borderRadius: 8, background: store.updateInfo.hasUpdate ? 'rgba(67,160,71,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${store.updateInfo.hasUpdate ? 'rgba(67,160,71,0.3)' : 'rgba(255,255,255,0.08)'}`, fontSize: 12 }}>
              {store.updateInfo.hasUpdate ? (
                <>
                  <div style={{ color: '#43A047', fontWeight: 600, marginBottom: 6 }}>v{store.updateInfo.version} available</div>
                  {store.updateInfo.changelog && <div style={{ color: '#8fa0b8', marginBottom: 8, whiteSpace: 'pre-wrap' }}>{store.updateInfo.changelog}</div>}
                  {store.updateInfo.downloadUrl && (
                    <a href={store.updateInfo.downloadUrl} target="_blank" rel="noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#1E88E5', textDecoration: 'none', fontSize: 12 }}>
                      <ExternalLink size={11} /> Download release
                    </a>
                  )}
                </>
              ) : (
                <div style={{ color: '#6b85a8' }}>You're on the latest version.</div>
              )}
            </div>
          )}
        </Card>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}
