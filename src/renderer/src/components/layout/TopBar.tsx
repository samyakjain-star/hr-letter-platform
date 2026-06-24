import React from 'react'
import { Users, Settings, RefreshCw, Download, Check, AlertCircle } from 'lucide-react'
import { useSettingsStore } from '../../store/settings.store'

type Tab = 'editor' | 'settings'

interface Props {
  activeTab: Tab
  onTabChange: (t: Tab) => void
  personName?: string
  docName?: string
}

const LOGO_SVG = (
  <svg width="140" height="36" viewBox="0 0 140 36" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="26" r="4.5" fill="#ddd" />
    <circle cx="20" cy="21" r="4.5" fill="#ddd" />
    <circle cx="30" cy="26" r="4.5" fill="#ddd" />
    <line x1="14" y1="24" x2="16" y2="22" stroke="#ddd" strokeWidth="2" strokeLinecap="round" />
    <line x1="24" y1="22" x2="26" y2="24" stroke="#ddd" strokeWidth="2" strokeLinecap="round" />
    <path d="M 3 18 Q 20 4 37 18"  fill="none" stroke="#1E88E5" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M 7 20 Q 20 9 33 20"  fill="none" stroke="#E53935" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M 11 22 Q 20 13 29 22" fill="none" stroke="#FB8C00" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M 15 24 Q 20 17 25 24" fill="none" stroke="#43A047" strokeWidth="1.8" strokeLinecap="round" />
    <text x="42" y="22" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="14" fill="#eef4ff" letterSpacing="1">MTAP</text>
    <text x="43" y="32" fontFamily="Arial, sans-serif" fontSize="8" fill="#6b85a8" letterSpacing="0.3">HR Platform</text>
  </svg>
)

const TABS: { id: Tab; label: string; Icon: React.FC<{ size: number }> }[] = [
  { id: 'editor',   label: 'People & Letters', Icon: Users },
  { id: 'settings', label: 'Settings',         Icon: Settings },
]

/** Checks GitHub for a newer release. When one exists, the button turns into a
 *  green "Update to vX.Y.Z" action that opens the release download page. */
function UpdateButton() {
  const updateInfo = useSettingsStore(s => s.updateInfo)
  const updateLoading = useSettingsStore(s => s.updateLoading)
  const checkForUpdates = useSettingsStore(s => s.checkForUpdates)

  const hasUpdate = !!updateInfo?.hasUpdate
  // The store reports errors via updateInfo with no `version` field.
  const isError = !!updateInfo && !updateInfo.hasUpdate && !updateInfo.version
  const isUpToDate = !!updateInfo && !updateInfo.hasUpdate && !!updateInfo.version

  let label = 'Check for updates'
  let Icon = RefreshCw
  let color = 'rgba(255,255,255,0.6)'
  let bg = 'rgba(255,255,255,0.06)'
  let border = 'rgba(255,255,255,0.12)'

  if (updateLoading) {
    label = 'Checking…'
  } else if (hasUpdate) {
    label = `Update to v${updateInfo!.version}`
    Icon = Download
    color = '#fff'
    bg = '#43A047'
    border = '#43A047'
  } else if (isUpToDate) {
    label = 'Up to date'
    Icon = Check
    color = '#43A047'
    bg = 'rgba(67,160,71,0.12)'
    border = 'rgba(67,160,71,0.3)'
  } else if (isError) {
    label = 'Check failed — retry'
    Icon = AlertCircle
    color = '#E53935'
    bg = 'rgba(229,57,53,0.12)'
    border = 'rgba(229,57,53,0.3)'
  }

  const onClick = () => {
    if (updateLoading) return
    if (hasUpdate && updateInfo?.downloadUrl) {
      window.open(updateInfo.downloadUrl, '_blank') // main opens it externally
    } else {
      checkForUpdates()
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={updateLoading}
      title={hasUpdate ? updateInfo?.changelog || 'Open the download page' : 'Check GitHub for a newer version'}
      style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
        background: bg, border: `1px solid ${border}`, borderRadius: 6,
        color, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
        cursor: updateLoading ? 'default' : 'pointer', transition: 'all 0.15s',
        flexShrink: 0
      }}
    >
      <Icon size={13} style={updateLoading ? { animation: 'spin 1s linear infinite' } : undefined} />
      {label}
    </button>
  )
}

export default function TopBar({ activeTab, onTabChange, personName, docName }: Props) {
  return (
    <header
      style={{
        height: 48,
        background: '#0b1d3a',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 16,
        flexShrink: 0,
        WebkitAppRegion: 'drag' as never,
        userSelect: 'none'
      }}
    >
      {/* Logo */}
      <div style={{ flexShrink: 0, WebkitAppRegion: 'no-drag' as never }}>
        {LOGO_SVG}
      </div>

      {/* Tab switcher */}
      <nav style={{ display: 'flex', gap: 2, WebkitAppRegion: 'no-drag' as never }}>
        {TABS.map(({ id, label, Icon }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                background: active ? 'rgba(30,136,229,0.18)' : 'transparent',
                border: 'none',
                borderBottom: active ? '2px solid #1E88E5' : '2px solid transparent',
                borderRadius: '4px 4px 0 0',
                color: active ? '#1E88E5' : 'rgba(255,255,255,0.5)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          )
        })}
      </nav>

      {/* Breadcrumb + update button (right aligned) */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 14, WebkitAppRegion: 'no-drag' as never }}>
        {personName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, maxWidth: 280, overflow: 'hidden' }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {personName}
            </span>
            {docName && (
              <>
                <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>›</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {docName}
                </span>
              </>
            )}
          </div>
        )}
        <UpdateButton />
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </header>
  )
}
