import React from 'react'
import { Users, Mail, Settings } from 'lucide-react'

type Tab = 'editor' | 'mailer' | 'settings'

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
  { id: 'mailer',   label: 'Mailer',           Icon: Mail },
  { id: 'settings', label: 'Settings',         Icon: Settings },
]

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

      {/* Breadcrumb */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', WebkitAppRegion: 'no-drag' as never }}>
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
      </div>
    </header>
  )
}
