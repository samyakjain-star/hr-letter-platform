import React, { useState } from 'react'
import { Users, FileText, Plus, ChevronDown, ChevronRight, FilePlus, Pencil, Trash2, Layers } from 'lucide-react'
import type { Person, Template, PersonDocument } from '../../types'

type PanelTab = 'people' | 'templates'

interface Props {
  activeTab: PanelTab
  onTabChange: (t: PanelTab) => void
  people: Person[]
  templates: Template[]
  activePerson: Person | null
  activeDoc: PersonDocument | null
  onSelectPerson: (id: string) => void
  onSelectDoc: (personId: string, docId: string) => void
  onNewPerson: () => void
  onAssignDoc: (personId: string) => void
  onDeletePerson: (id: string) => void
  onNewTemplate: () => void
  onEditTemplate: (id: string) => void
  onDeleteTemplate: (id: string) => void
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function LeftPanel(props: Props) {
  const { activeTab, onTabChange, people, templates, activePerson, activeDoc } = props
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggle = (id: string) => setExpanded(s => {
    const n = new Set(s)
    n.has(id) ? n.delete(id) : n.add(id)
    return n
  })

  return (
    <div style={{ width: 288, minWidth: 240, background: '#071426', borderRight: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        {(['people', 'templates'] as PanelTab[]).map(tab => (
          <button key={tab} onClick={() => onTabChange(tab)} style={{
            flex: 1, padding: '10px 0', fontSize: 11, fontWeight: 700, letterSpacing: '0.6px',
            textTransform: 'uppercase', border: 'none', background: 'transparent', cursor: 'pointer',
            color: activeTab === tab ? '#eef4ff' : '#6b85a8',
            borderBottom: activeTab === tab ? '2px solid #1E88E5' : '2px solid transparent',
            transition: 'all 0.15s'
          }}>
            {tab === 'people' ? 'People' : 'Templates'}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
        {/* ── PEOPLE TAB ─────────────────────────────────────────── */}
        {activeTab === 'people' && (
          <>
            <button onClick={props.onNewPerson} style={{
              width: '100%', padding: '8px 12px', marginBottom: 10,
              background: '#1E88E5', border: 'none', borderRadius: 8,
              color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center'
            }}>
              <Plus size={14} /> New Person
            </button>

            {people.length === 0 && (
              <div style={{ textAlign: 'center', color: '#6b85a8', fontSize: 12, padding: '24px 0' }}>
                No people yet. Add someone to get started.
              </div>
            )}

            {people.map(person => {
              const isExpanded = expanded.has(person.id)
              const isActive = activePerson?.id === person.id

              return (
                <div key={person.id} style={{ marginBottom: 4 }}>
                  {/* Person row */}
                  <div
                    onClick={() => { props.onSelectPerson(person.id); toggle(person.id) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px',
                      borderRadius: 8, cursor: 'pointer',
                      background: isActive ? 'rgba(30,136,229,0.2)' : 'transparent',
                      transition: 'background 0.1s'
                    }}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.05)' }}
                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: isActive ? '#1E88E5' : '#1a3a5c',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700, color: '#fff'
                    }}>
                      {initials(person.name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#eef4ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {person.name}
                      </div>
                      <div style={{ fontSize: 11, color: '#6b85a8' }}>{person.employeeId}</div>
                    </div>
                    {isExpanded
                      ? <ChevronDown size={14} color="#6b85a8" />
                      : <ChevronRight size={14} color="#6b85a8" />
                    }
                    {!isExpanded && (
                      <button
                        onClick={e => { e.stopPropagation(); props.onDeletePerson(person.id) }}
                        title="Delete person"
                        style={{ padding: 3, background: 'none', border: 'none', cursor: 'pointer', color: '#6b85a8', opacity: 0, transition: 'opacity 0.15s', borderRadius: 4 }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; (e.currentTarget as HTMLButtonElement).style.color = '#E53935' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0'; (e.currentTarget as HTMLButtonElement).style.color = '#6b85a8' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>

                  {/* Document list */}
                  {isExpanded && (
                    <div style={{ borderLeft: '2px solid rgba(30,136,229,0.2)', marginLeft: 20, paddingLeft: 8 }}>
                      {person.documents.map(doc => (
                        <div
                          key={doc.docId}
                          onClick={() => props.onSelectDoc(person.id, doc.docId)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px',
                            borderRadius: 6, cursor: 'pointer',
                            color: activeDoc?.docId === doc.docId ? '#1E88E5' : '#8fa0b8',
                            transition: 'all 0.1s'
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                        >
                          <FileText size={12} />
                          <span style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</span>
                        </div>
                      ))}
                      <button
                        onClick={() => props.onAssignDoc(person.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 5, width: '100%',
                          padding: '5px 8px', marginTop: 2,
                          background: 'none', border: '1px dashed rgba(30,136,229,0.3)',
                          borderRadius: 6, color: '#1E88E5', fontSize: 11, fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        <FilePlus size={11} /> Assign Document
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}

        {/* ── TEMPLATES TAB ──────────────────────────────────────── */}
        {activeTab === 'templates' && (
          <>
            <button onClick={props.onNewTemplate} style={{
              width: '100%', padding: '8px 12px', marginBottom: 10,
              background: '#43A047', border: 'none', borderRadius: 8,
              color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center'
            }}>
              <Plus size={14} /> New Template
            </button>

            {templates.length === 0 && (
              <div style={{ textAlign: 'center', color: '#6b85a8', fontSize: 12, padding: '24px 0' }}>
                No templates yet.
              </div>
            )}

            {templates.map(t => (
              <div key={t.id}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 8, marginBottom: 2, transition: 'background 0.1s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ width: 28, height: 28, background: 'rgba(67,160,71,0.15)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Layers size={13} color="#43A047" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: '#eef4ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
                  <div style={{ fontSize: 10, color: '#6b85a8' }}>v{t.currentVersion}</div>
                </div>
                <button onClick={() => props.onEditTemplate(t.id)} title="Edit" style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#6b85a8', borderRadius: 4, opacity: 0.6 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; (e.currentTarget as HTMLButtonElement).style.color = '#1E88E5' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.6'; (e.currentTarget as HTMLButtonElement).style.color = '#6b85a8' }}>
                  <Pencil size={12} />
                </button>
                <button onClick={() => props.onDeleteTemplate(t.id)} title="Delete" style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#6b85a8', borderRadius: 4, opacity: 0.6 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; (e.currentTarget as HTMLButtonElement).style.color = '#E53935' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.6'; (e.currentTarget as HTMLButtonElement).style.color = '#6b85a8' }}>
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
