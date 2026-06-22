import React, { useEffect, useRef, useMemo, useState } from 'react'
import { Download, Calculator, FileText, Check } from 'lucide-react'
import type { Person, PersonDocument } from '../../types'
import { buildSystemFields, mergeFields, extractVariables } from '../../lib/variableResolver'

interface Props {
  person: Person
  doc: PersonDocument
  onFieldChange: (key: string, value: string) => void
  onGeneratePdf: () => void
  onShowCalculator: () => void
  calculatorOpen: boolean
}

/** Size an inline field input to its content. Measures the real rendered text
 *  width with a hidden mirror that copies the input's computed font, so the box
 *  grows to fit any value (proportional fonts, bold, etc.) without clipping. */
function autosize(input: HTMLInputElement, paper: HTMLElement) {
  let m = paper.querySelector<HTMLSpanElement>('#field-measure')
  if (!m) {
    m = document.createElement('span')
    m.id = 'field-measure'
    m.setAttribute('aria-hidden', 'true')
    m.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden;white-space:pre;pointer-events:none'
    paper.appendChild(m)
  }
  const cs = getComputedStyle(input)
  m.style.fontFamily = cs.fontFamily
  m.style.fontSize = cs.fontSize
  m.style.fontWeight = cs.fontWeight
  m.style.fontStyle = cs.fontStyle
  m.style.letterSpacing = cs.letterSpacing
  m.textContent = input.value || input.placeholder || ''
  // +10px = horizontal padding (6) + caret/slack
  input.style.width = (m.offsetWidth + 10) + 'px'
}

export default function DocumentCanvas({ person, doc, onFieldChange, onGeneratePdf, onShowCalculator, calculatorOpen }: Props) {
  const paperRef = useRef<HTMLDivElement>(null)
  const [localFields, setLocalFields] = useState<Record<string, string>>(doc.fields)
  const [filledCount, setFilledCount] = useState(0)
  const [pageCount, setPageCount] = useState(1)

  // Full reset when switching to a different document
  useEffect(() => { setLocalFields(doc.fields) }, [doc.docId])

  // Merge externally-updated fields (e.g. Salary Calculator auto-fill, which
  // writes through the store) into local state so the injected inputs update.
  useEffect(() => {
    setLocalFields(prev => {
      let changed = false
      const next = { ...prev }
      for (const [k, v] of Object.entries(doc.fields)) {
        if (next[k] !== v) { next[k] = v; changed = true }
      }
      return changed ? next : prev
    })
  }, [doc.fields])

  const systemFields = useMemo(() => buildSystemFields(person, doc.name), [person, doc.name])
  const allFields = useMemo(() => mergeFields(systemFields, {}, localFields), [systemFields, localFields])

  // Sentinel HTML: replace {{KEY}} with <span data-var="KEY">value</span>
  const sentinelHtml = useMemo(() => {
    return doc.frozenHtml.replace(/\{\{([^}]+)\}\}/g, (_m, key) => {
      const k = key.trim().toUpperCase()
      const val = allFields[k] ?? ''
      return `<span data-var="${k}" data-val="${encodeURIComponent(val)}" style="display:inline-block"></span>`
    })
  }, [doc.frozenHtml, doc.docId])

  const totalVars = useMemo(() => extractVariables(doc.frozenHtml).length, [doc.frozenHtml])

  // After mount/update: inject real inputs over sentinels
  useEffect(() => {
    const paper = paperRef.current
    if (!paper) return

    // Inject scoped styles
    const styleId = 'field-styles'
    if (!paper.querySelector(`#${styleId}`)) {
      const s = document.createElement('style')
      s.id = styleId
      s.textContent = `
        .doc-field-input {
          border: none; border-bottom: 1.5px dotted rgba(30,136,229,0.55);
          background: rgba(30,136,229,0.04); outline: none; padding: 0 3px;
          font: inherit; color: inherit; min-width: 36px; border-radius: 2px 2px 0 0;
          transition: border-color 0.15s, background 0.1s;
        }
        .doc-field-input::placeholder { color: rgba(30,136,229,0.45); font-style: italic; }
        .doc-field-input:hover { background: rgba(30,136,229,0.08); }
        .doc-field-input:focus { border-bottom-color: #1E88E5; background: rgba(30,136,229,0.1); }
        .doc-field-input.filled { border-bottom-color: rgba(30,136,229,0.18); background: transparent; }
        .appr-printing .doc-field-input { border: none; background: transparent; }
      `
      paper.appendChild(s)
    }

    let filled = 0
    const spans = paper.querySelectorAll<HTMLSpanElement>('span[data-var]')

    spans.forEach(span => {
      const key = span.getAttribute('data-var') ?? ''
      const initVal = decodeURIComponent(span.getAttribute('data-val') ?? '')
      if (initVal) filled++

      const input = document.createElement('input')
      input.className = 'doc-field-input' + (initVal ? ' filled' : '')
      input.value = initVal
      input.setAttribute('data-field', key)
      input.placeholder = key.replace(/_/g, ' ').toLowerCase()

      input.addEventListener('input', () => {
        input.classList.toggle('filled', input.value.length > 0)
        autosize(input, paper)
        setLocalFields(f => ({ ...f, [key]: input.value }))
        onFieldChange(key, input.value)
      })

      span.replaceWith(input)
      autosize(input, paper) // after insertion: computed font is now resolved
    })

    setFilledCount(filled)
    setPageCount(paper.querySelectorAll('.appr-page').length || 1)
  }, [sentinelHtml])

  // Sync auto-fill (calculator) back into DOM without full re-render
  useEffect(() => {
    const paper = paperRef.current
    if (!paper) return
    let filled = 0
    paper.querySelectorAll<HTMLInputElement>('input[data-field]').forEach(input => {
      const key = input.getAttribute('data-field') ?? ''
      const val = localFields[key] ?? ''
      if (input.value !== val) {
        input.value = val
        autosize(input, paper)
        input.classList.toggle('filled', val.length > 0)
      }
      if (input.value) filled++
    })
    setFilledCount(filled)
  }, [localFields])

  const progress = totalVars > 0 ? filledCount / totalVars : 0
  const complete = totalVars > 0 && filledCount >= totalVars

  return (
    <div style={{ flex: 1, background: '#e8ecf2', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Toolbar — sticky */}
      <div style={{ position: 'sticky', top: 0, zIndex: 5, width: '100%', display: 'flex', justifyContent: 'center', background: 'rgba(232,236,242,0.92)', backdropFilter: 'blur(6px)', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '10px 0' }}>
        <div style={{ width: '210mm', display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={onGeneratePdf} title="Download as PDF"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', background: '#1E88E5', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Download size={15} /> Generate PDF
          </button>
          <button onClick={onShowCalculator} title="Compute salary components from CTC"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', background: calculatorOpen ? '#FB8C00' : '#fff', border: `1px solid ${calculatorOpen ? '#FB8C00' : 'rgba(0,0,0,0.15)'}`, borderRadius: 8, color: calculatorOpen ? '#fff' : '#0b1d3a', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
            <Calculator size={15} /> Salary Calculator
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 4, color: '#4a5e7a', fontSize: 12 }}>
            <FileText size={13} /> {pageCount} page{pageCount !== 1 ? 's' : ''}
          </div>

          {/* Fill progress */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
            <div style={{ width: 140, height: 5, background: 'rgba(0,0,0,0.1)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress * 100}%`, background: complete ? '#43A047' : '#1E88E5', borderRadius: 3, transition: 'width 0.3s' }} />
            </div>
            <span style={{ fontSize: 12, color: complete ? '#43A047' : '#4a5e7a', fontWeight: complete ? 600 : 400, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
              {complete && <Check size={13} />}
              {filledCount}/{totalVars} filled
            </span>
          </div>
        </div>
      </div>

      {/* Pages */}
      <div style={{ padding: '20px 0 48px' }}>
        <div
          id="a4-paper"
          ref={paperRef}
          style={{ width: '210mm' }}
          dangerouslySetInnerHTML={{ __html: sentinelHtml }}
        />
      </div>
    </div>
  )
}
