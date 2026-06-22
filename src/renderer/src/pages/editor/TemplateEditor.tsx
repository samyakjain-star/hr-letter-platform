import React, { useState, useEffect, useRef, useMemo } from 'react'
import { X, Save, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react'
import type { Template } from '../../types'
import { extractVariables } from '../../lib/variableResolver'
import VariablePillPicker from '../../components/layout/VariablePillPicker'
import { DEFAULT_APPRAISAL_HTML } from '../../lib/defaultTemplate'

interface Props {
  template: Template | null
  onSave: (name: string, subject: string, html: string) => void
  onClose: () => void
}

/** {{VAR}} → visual chip the user can see & delete but not mistype. */
function htmlToEditor(html: string): string {
  return html.replace(/\{\{([^}]+)\}\}/g, (_m, k) => {
    const key = k.trim()
    return `<span class="tpl-chip" contenteditable="false" data-var="${key}">${key}</span>`
  })
}

/** Editor DOM → clean template HTML: chips back to {{VAR}}, drop edit-only attrs. */
function editorToHtml(editorEl: HTMLElement): string {
  const clone = editorEl.cloneNode(true) as HTMLElement
  clone.querySelectorAll('.tpl-chip').forEach(c => {
    c.replaceWith(document.createTextNode('{{' + (c.getAttribute('data-var') || '') + '}}'))
  })
  clone.querySelectorAll('[contenteditable]').forEach(e => e.removeAttribute('contenteditable'))
  return clone.innerHTML.trim()
}

export default function TemplateEditor({ template, onSave, onClose }: Props) {
  const latest = template?.versions.find(v => v.version === template.currentVersion)
  const [name, setName] = useState(template?.name ?? 'New Template')
  const [subject, setSubject] = useState(latest?.subject ?? 'Your Letter — {{EMPLOYEE_NAME}}')
  const [bodyVars, setBodyVars] = useState<string[]>([])

  const editorRef = useRef<HTMLDivElement>(null)
  const subjectRef = useRef<HTMLInputElement>(null)
  const savedRange = useRef<Range | null>(null)

  const initialHtml = useMemo(() => htmlToEditor(latest?.html ?? DEFAULT_APPRAISAL_HTML), [])

  // Protect brand chrome (logo + footer) from accidental edits; index the chips.
  useEffect(() => {
    const ed = editorRef.current
    if (!ed) return
    ed.querySelectorAll('.appr-logo, .appr-footer').forEach(el => el.setAttribute('contenteditable', 'false'))
    refreshVars()
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); handleSave() }
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [name, subject])

  const refreshVars = () => {
    const ed = editorRef.current
    if (!ed) return
    const vars = Array.from(ed.querySelectorAll('.tpl-chip')).map(c => c.getAttribute('data-var') || '')
    setBodyVars([...new Set(vars.filter(Boolean))])
  }

  const handleSave = () => {
    const ed = editorRef.current
    if (!ed) return
    onSave(name, subject, editorToHtml(ed))
  }

  // ── Formatting ────────────────────────────────────────────────────────────
  const exec = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value)
    editorRef.current?.focus()
    refreshVars()
  }

  // Remember caret so toolbar clicks (which blur the editor) insert in place.
  const saveRange = () => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount && editorRef.current?.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0).cloneRange()
    }
  }

  const insertSubjectVar = (token: string) => {
    const el = subjectRef.current
    if (!el) { setSubject(s => s + token); return }
    const start = el.selectionStart ?? subject.length
    const end = el.selectionEnd ?? subject.length
    const next = subject.slice(0, start) + token + subject.slice(end)
    setSubject(next)
    requestAnimationFrame(() => { el.focus(); el.selectionStart = el.selectionEnd = start + token.length })
  }

  const insertBodyVar = (key: string) => {
    const ed = editorRef.current
    if (!ed) return
    ed.focus()
    const sel = window.getSelection()
    let range: Range
    if (sel && sel.rangeCount && ed.contains(sel.anchorNode)) {
      range = sel.getRangeAt(0)
    } else if (savedRange.current && ed.contains(savedRange.current.startContainer)) {
      range = savedRange.current
    } else {
      range = document.createRange()
      range.selectNodeContents(ed)
      range.collapse(false)
    }
    range.deleteContents()
    const chip = document.createElement('span')
    chip.className = 'tpl-chip'
    chip.setAttribute('contenteditable', 'false')
    chip.setAttribute('data-var', key)
    chip.textContent = key
    const space = document.createTextNode('​')
    range.insertNode(space)
    range.insertNode(chip)
    range.setStartAfter(space)
    range.collapse(true)
    sel?.removeAllRanges()
    sel?.addRange(range)
    refreshVars()
  }

  const allVars = useMemo(() => extractVariables(subject + ' ' + bodyVars.map(v => `{{${v}}}`).join(' ')), [subject, bodyVars])

  const fmtBtn = (icon: React.ReactNode, cmd: string, title: string, value?: string) => (
    <button onMouseDown={e => e.preventDefault()} onClick={() => exec(cmd, value)} title={title}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 28, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#c9d8f0', cursor: 'pointer' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.14)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>
      {icon}
    </button>
  )
  const divider = <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,0.1)', margin: '0 3px' }} />

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: '#071426', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .tpl-editable { outline: none; }
        .tpl-editable [contenteditable="false"] { cursor: default; }
        .tpl-chip {
          display: inline-block; background: rgba(30,136,229,0.12); color: #1565c0;
          border: 1px solid rgba(30,136,229,0.4); border-radius: 5px; padding: 0 6px;
          margin: 0 1px; font-family: 'Courier New', monospace; font-size: 0.82em;
          font-weight: 700; white-space: nowrap; user-select: none; line-height: 1.5;
        }
        .tpl-chip:hover { background: rgba(30,136,229,0.22); }
        .tpl-editable .appr-page { cursor: text; }
      `}</style>

      {/* Header */}
      <div style={{ height: 52, background: '#0b1d3a', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <input value={name} onChange={e => setName(e.target.value)}
            style={{ background: 'none', border: 'none', outline: 'none', color: '#eef4ff', fontSize: 15, fontWeight: 700, width: '100%' }}
            placeholder="Template name..." />
        </div>
        <span style={{ fontSize: 11, color: '#6b85a8' }}>Click any text to edit it directly</span>
        <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 16px', background: '#1E88E5', border: 'none', borderRadius: 7, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Save size={14} /> Save
        </button>
        <button onClick={onClose} title="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b85a8', padding: 4 }}>
          <X size={18} />
        </button>
      </div>

      {/* Subject row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0, background: '#0b1d3a' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#6b85a8', letterSpacing: '0.5px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Email Subject</span>
        <input ref={subjectRef} value={subject} onChange={e => setSubject(e.target.value)}
          style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, padding: '6px 10px', outline: 'none', color: '#eef4ff', fontSize: 13 }}
          placeholder="Email subject…" />
        <VariablePillPicker variables={allVars} onInsert={insertSubjectVar} />
      </div>

      {/* Formatting toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: '#071426', flexShrink: 0 }}>
        {fmtBtn(<Bold size={15} />, 'bold', 'Bold (⌘B)')}
        {fmtBtn(<Italic size={15} />, 'italic', 'Italic (⌘I)')}
        {fmtBtn(<Underline size={15} />, 'underline', 'Underline (⌘U)')}
        {divider}
        {fmtBtn(<AlignLeft size={15} />, 'justifyLeft', 'Align left')}
        {fmtBtn(<AlignCenter size={15} />, 'justifyCenter', 'Align center')}
        {fmtBtn(<AlignRight size={15} />, 'justifyRight', 'Align right')}
        {fmtBtn(<AlignJustify size={15} />, 'justifyFull', 'Justify')}
        {divider}
        <div onMouseDown={e => e.preventDefault()}>
          <VariablePillPicker variables={allVars} onInsert={token => insertBodyVar(token.replace(/[{}]/g, '').trim())} />
        </div>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#6b85a8' }}>
          Variables show as <span className="tpl-chip" style={{ fontSize: 10 }}>BLUE_PILLS</span> — they fill in per employee
        </span>
      </div>

      {/* Editable document */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#e8ecf2', padding: '24px 0 48px', display: 'flex', justifyContent: 'center' }}>
        <div
          ref={editorRef}
          className="tpl-editable"
          contentEditable
          suppressContentEditableWarning
          onInput={refreshVars}
          onKeyUp={saveRange}
          onMouseUp={saveRange}
          onBlur={saveRange}
          dangerouslySetInnerHTML={{ __html: initialHtml }}
        />
      </div>

      {/* Status bar */}
      <div style={{ height: 26, background: '#040e1e', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 20, flexShrink: 0 }}>
        <span style={{ fontSize: 10, color: '#6b85a8' }}>{bodyVars.length} variable{bodyVars.length !== 1 ? 's' : ''} in body</span>
        <span style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>⌘S to save · Esc to close</span>
      </div>

      {/* MTAP footer bar */}
      <div style={{ display: 'flex', height: 3, flexShrink: 0 }}>
        <span style={{ flex: 1, background: '#E53935' }} />
        <span style={{ flex: 1, background: '#FB8C00' }} />
        <span style={{ flex: 1, background: '#43A047' }} />
        <span style={{ flex: 1, background: '#1E88E5' }} />
      </div>
    </div>
  )
}
