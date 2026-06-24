import React from 'react'
import { Loader, Download } from 'lucide-react'
import { useSettingsStore } from '../../store/settings.store'

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
  const info = store.updateInfo

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', background: '#071426' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <h2 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 700, color: '#eef4ff' }}>Settings</h2>

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
          {info && (
            <div style={{ padding: '12px 14px', borderRadius: 8, background: info.hasUpdate ? 'rgba(67,160,71,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${info.hasUpdate ? 'rgba(67,160,71,0.3)' : 'rgba(255,255,255,0.08)'}`, fontSize: 12 }}>
              {info.hasUpdate ? (
                <>
                  <div style={{ color: '#43A047', fontWeight: 600, marginBottom: 6 }}>v{info.version} available</div>
                  {info.changelog && <div style={{ color: '#8fa0b8', marginBottom: 8, whiteSpace: 'pre-wrap' }}>{info.changelog}</div>}
                  {info.downloadUrl && (
                    <a href={info.downloadUrl} target="_blank" rel="noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#1E88E5', textDecoration: 'none', fontSize: 12 }}>
                      <Download size={11} /> Download release
                    </a>
                  )}
                </>
              ) : info.version ? (
                <div style={{ color: '#6b85a8' }}>You're on the latest version.</div>
              ) : (
                <div style={{ color: '#E53935' }}>{info.changelog || 'Update check failed.'}</div>
              )}
            </div>
          )}
        </Card>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}
