import React, { useState, useEffect, useRef } from 'react'
import { Plus, ChevronDown } from 'lucide-react'

const SYSTEM_VARS = ['EMPLOYEE_NAME', 'EMPLOYEE_ID', 'EMAIL', 'DATE', 'DESIGNATION', 'DIVISION', 'GRADE', 'DOCUMENT_TYPE', 'REF_NUMBER', 'EFFECTIVE_DATE', 'PERFORMANCE_RATING', 'NEW_CTC', 'NEW_CTC_FORMATTED']

interface Props {
  variables: string[]
  onInsert: (v: string) => void
}

export default function VariablePillPicker({ variables, onInsert }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const excelVars = variables.filter(v => !SYSTEM_VARS.includes(v.toUpperCase()))

  const pill = (v: string, color: string) => (
    <button
      key={v}
      onClick={() => { onInsert(`{{${v}}}`); setOpen(false) }}
      style={{
        padding: '3px 9px', border: `1px solid ${color}22`, borderRadius: 20,
        background: `${color}15`, color, fontSize: 11,
        fontFamily: 'Courier New, monospace', cursor: 'pointer',
        transition: 'background 0.1s', whiteSpace: 'nowrap'
      }}
      onMouseEnter={e => (e.currentTarget.style.background = `${color}30`)}
      onMouseLeave={e => (e.currentTarget.style.background = `${color}15`)}
    >
      {`{{${v}}}`}
    </button>
  )

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        style={{
          display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px',
          background: '#1E88E5', border: 'none', borderRadius: 6,
          color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer'
        }}
      >
        <Plus size={12} />
        Insert Variable
        <ChevronDown size={12} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 100, marginTop: 4,
          background: '#0f2746', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10, padding: '12px 14px', minWidth: 300, maxWidth: 420,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 8 }}>
            System Variables
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: excelVars.length ? 12 : 0 }}>
            {SYSTEM_VARS.map(v => pill(v, '#1E88E5'))}
          </div>

          {excelVars.length > 0 && (
            <>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '8px 0' }} />
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 8 }}>
                From Excel
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {excelVars.map(v => pill(v, '#43A047'))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
