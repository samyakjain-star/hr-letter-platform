import React, { useState, useMemo } from 'react'
import { X, Zap } from 'lucide-react'
import { calculate, formatINR, toLetterFields, DEFAULT_CALC_CONFIG } from '../../lib/calculator'

interface Props {
  onAutoFill: (fields: Record<string, string>) => void
  onClose: () => void
}

function parseNum(s: string) { return parseInt(s.replace(/[^0-9]/g, ''), 10) || 0 }

const METRO_OPTIONS = [
  { label: 'Chennai / Bangalore / Mumbai / Delhi (50%)', value: 0.50 },
  { label: 'Other City (40%)', value: 0.40 },
]

export default function SalaryCalculator({ onAutoFill, onClose }: Props) {
  const cfg = DEFAULT_CALC_CONFIG

  const [ctcInput, setCtcInput] = useState('')
  const [bonusInput, setBonusInput] = useState('0')
  const [hraRate, setHraRate] = useState(cfg.hraRate)
  const [pfPref, setPfPref] = useState(cfg.pfPref)
  const [floor15k, setFloor15k] = useState(cfg.floor15k)

  const result = useMemo(() => {
    const ctc = parseNum(ctcInput)
    if (!ctc) return null
    return calculate(ctc, { basicPct: 50, hraRate, pfPref, floor15k, bonusAnnual: parseNum(bonusInput) })
  }, [ctcInput, bonusInput, hraRate, pfPref, floor15k])

  const rs = (n: number) => n === 0 ? '—' : '₹' + formatINR(n)

  const rows: Array<{ label: string; key: keyof typeof result; bold?: boolean; indent?: boolean }> = [
    { label: 'Basic Salary', key: 'basic', indent: true },
    { label: 'HRA', key: 'hra', indent: true },
    { label: 'Statutory Bonus', key: 'statutoryBonus', indent: true },
    { label: 'Special Allowance (H5)', key: 'specialAllowance', indent: true },
    { label: 'LTA', key: 'lta', indent: true },
    { label: 'Vehicle Reimbursement', key: 'vehicle', indent: true },
    { label: "Driver's Salary", key: 'driver', indent: true },
    { label: 'Telephone Reimbursement', key: 'telephone', indent: true },
    { label: 'Food Coupon / Allowance', key: 'food', indent: true },
    { label: 'Gross Pay', key: 'grossPay', bold: true },
    { label: 'PF Employee (−)', key: 'pfEmployee', indent: true },
    { label: 'ESI Employee (−)', key: 'esiEmployee', indent: true },
    { label: 'Professional Tax (−)', key: 'professionalTax', indent: true },
    { label: 'Net Take-Home', key: 'netTakeHome', bold: true },
    { label: 'PF Employer', key: 'pfEmployer', indent: true },
    { label: 'ESI Employer', key: 'esiEmployer', indent: true },
    { label: 'Total CTC', key: 'totalCTC', bold: true },
  ]

  return (
    <div style={{ width: 320, flexShrink: 0, background: '#0f2744', borderLeft: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'flex-start', gap: 9 }}>
        <Zap size={15} color="#FB8C00" style={{ marginTop: 1, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#eef4ff' }}>Salary Calculator</div>
          <div style={{ fontSize: 11, color: '#6b85a8', marginTop: 2, lineHeight: 1.35 }}>New Wage Code 2026 — fills Annexure 1 from CTC</div>
        </div>
        <button onClick={onClose} title="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b85a8', padding: 3, flexShrink: 0 }}>
          <X size={16} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
        {/* CTC Input */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#6b85a8', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: 5 }}>
            Annual CTC (₹)
          </label>
          <input
            type="text" inputMode="numeric"
            value={ctcInput}
            onChange={e => setCtcInput(e.target.value)}
            placeholder="e.g. 1500000"
            style={{ width: '100%', padding: '8px 12px', background: 'rgba(232,144,10,0.1)', border: '1.5px solid rgba(232,144,10,0.4)', borderRadius: 8, color: '#fcd17a', fontSize: 16, fontFamily: 'monospace', fontWeight: 500, outline: 'none' }}
          />
          {result && <div style={{ fontSize: 11, color: '#0d7a6e', marginTop: 3, fontFamily: 'monospace' }}>
            ₹{result.annualCTC >= 10_000_000 ? (result.annualCTC / 10_000_000).toFixed(2) + ' Cr' : result.annualCTC >= 100_000 ? (result.annualCTC / 100_000).toFixed(2) + ' L' : formatINR(result.annualCTC)}
          </div>}
        </div>

        {/* Bonus */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#6b85a8', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: 5 }}>
            Performance Bonus (₹)
          </label>
          <input type="text" inputMode="numeric" value={bonusInput} onChange={e => setBonusInput(e.target.value)}
            style={{ width: '100%', padding: '7px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#eef4ff', fontSize: 13, outline: 'none' }} />
        </div>

        {/* HRA */}
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#6b85a8', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: 5 }}>City</label>
          <select value={hraRate} onChange={e => setHraRate(parseFloat(e.target.value))}
            style={{ width: '100%', padding: '7px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#eef4ff', fontSize: 12, outline: 'none' }}>
            {METRO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* PF */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 14 }}>
          {(['12%', '1800'] as const).map(p => (
            <button key={p} onClick={() => setPfPref(p)}
              style={{ padding: '6px', border: '1.5px solid', borderColor: pfPref === p ? '#1E88E5' : 'rgba(255,255,255,0.1)', borderRadius: 6, background: pfPref === p ? 'rgba(30,136,229,0.15)' : 'rgba(255,255,255,0.04)', color: pfPref === p ? '#93b8f5' : '#6b85a8', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              {p === '12%' ? '12% of Basic' : 'Fixed ₹1,800'}
            </button>
          ))}
        </div>

        {/* ₹15K floor */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 14, fontSize: 12, color: '#8fa0b8' }}>
          <input type="checkbox" checked={floor15k} onChange={e => setFloor15k(e.target.checked)} />
          Adjust Basic to ₹15,000 floor
        </label>

        {/* Results table */}
        {result && (
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', padding: '6px 10px', background: '#071426' }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#5a7aa0', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Component</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#5a7aa0', textAlign: 'right', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Monthly</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#5a7aa0', textAlign: 'right', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Annual</span>
            </div>
            {rows.map(row => {
              if (!result) return null
              const val = result[row.key as keyof typeof result] as { monthly: number; annual: number }
              if (!val || typeof val !== 'object') return null
              return (
                <div key={row.key} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', padding: '5px 10px', borderTop: '1px solid rgba(255,255,255,0.05)', background: row.bold ? 'rgba(255,255,255,0.04)' : 'transparent' }}>
                  <span style={{ fontSize: 11, color: row.bold ? '#eef4ff' : '#8fa0b8', fontWeight: row.bold ? 700 : 400, paddingLeft: row.indent ? 8 : 0 }}>{row.label}</span>
                  <span style={{ fontSize: 11, color: '#6b85a8', textAlign: 'right', fontFamily: 'monospace' }}>{rs(val.monthly)}</span>
                  <span style={{ fontSize: 11, color: row.bold ? '#eef4ff' : '#6b85a8', textAlign: 'right', fontFamily: 'monospace', fontWeight: row.bold ? 600 : 400 }}>{rs(val.annual)}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Compliance */}
        {result && (
          <div style={{ fontSize: 11, color: result.basicPctActual >= 49.9 ? '#43A047' : '#E53935', marginBottom: 14, padding: '6px 10px', background: 'rgba(0,0,0,0.2)', borderRadius: 6 }}>
            Basic = {result.basicPctActual.toFixed(1)}% of monthly CTC {result.basicPctActual >= 49.9 ? '✓ Wage Code compliant' : '✗ Below 50% minimum'}
          </div>
        )}
      </div>

      {/* Auto-fill button */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        <button
          onClick={() => { if (result) onAutoFill(toLetterFields(result)) }}
          disabled={!result}
          style={{ width: '100%', padding: '9px', background: result ? '#43A047' : 'rgba(67,160,71,0.3)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700, cursor: result ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        >
          <Zap size={14} /> Auto-fill Document
        </button>
        <p style={{ fontSize: 10, color: '#6b85a8', textAlign: 'center', marginTop: 6 }}>
          Pushes all values into the open letter
        </p>
      </div>
    </div>
  )
}
