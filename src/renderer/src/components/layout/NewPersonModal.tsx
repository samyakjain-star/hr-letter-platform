import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { Person } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: Omit<Person, 'id' | 'documents'>) => void
}

const EMPTY = { name: '', employeeId: '', email: '', designation: '', division: '', grade: '' }

export default function NewPersonModal({ open, onClose, onSubmit }: Props) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState<Partial<typeof EMPTY>>({})

  useEffect(() => { if (!open) { setForm(EMPTY); setErrors({}) } }, [open])

  if (!open) return null

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const e: Partial<typeof EMPTY> = {}
    if (!form.name.trim()) e.name = 'Full name is required.'
    if (!form.employeeId.trim()) e.employeeId = 'Employee ID is required.'
    if (!form.email.trim()) e.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address.'
    return e
  }

  const handleSubmit = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    onSubmit(form)
    onClose()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
    color: '#eef4ff', fontSize: 13, outline: 'none', transition: 'border-color 0.15s',
    fontFamily: 'Inter, sans-serif'
  }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, color: '#6b85a8', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }
  const errStyle: React.CSSProperties = { fontSize: 11, color: '#E53935', marginTop: 3 }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div style={{ background: '#0f2444', border: '1px solid rgba(30,136,229,0.28)', borderRadius: 14, width: '100%', maxWidth: 480, padding: 24, boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#eef4ff' }}>Add Person</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b85a8', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Full Name *</label>
          <input style={inputStyle} value={form.name} onChange={set('name')} placeholder="e.g. Samyak Jain" />
          {errors.name && <p style={errStyle} role="alert">{errors.name}</p>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Employee ID *</label>
            <input style={inputStyle} value={form.employeeId} onChange={set('employeeId')} placeholder="e.g. MT0042" />
            {errors.employeeId && <p style={errStyle}>{errors.employeeId}</p>}
          </div>
          <div>
            <label style={labelStyle}>Grade</label>
            <input style={inputStyle} value={form.grade} onChange={set('grade')} placeholder="e.g. M2" />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Email *</label>
          <input style={inputStyle} type="email" value={form.email} onChange={set('email')} placeholder="e.g. samyak@mtap.in" />
          {errors.email && <p style={errStyle} role="alert">{errors.email}</p>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          <div>
            <label style={labelStyle}>Designation</label>
            <input style={inputStyle} value={form.designation} onChange={set('designation')} placeholder="e.g. Senior Engineer" />
          </div>
          <div>
            <label style={labelStyle}>Division</label>
            <input style={inputStyle} value={form.division} onChange={set('division')} placeholder="e.g. Engineering" />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 18px', background: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#6b85a8', fontSize: 13, cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={handleSubmit} style={{ padding: '8px 18px', background: '#1E88E5', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
