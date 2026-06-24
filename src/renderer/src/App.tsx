import React, { useEffect, useState } from 'react'
import { FileText } from 'lucide-react'
import TopBar from './components/layout/TopBar'
import LeftPanel from './components/layout/LeftPanel'
import NewPersonModal from './components/layout/NewPersonModal'
import AssignDocModal from './components/layout/AssignDocModal'
import DocumentCanvas from './pages/editor/DocumentCanvas'
import SalaryCalculator from './pages/editor/SalaryCalculator'
import TemplateEditor from './pages/editor/TemplateEditor'
import SettingsPage from './pages/settings/index'
import { usePeopleStore } from './store/people.store'
import { useTemplatesStore } from './store/templates.store'
import { useSettingsStore } from './store/settings.store'
import { generatePdf } from './lib/pdf'
import { buildSystemFields, mergeFields, resolveVariables } from './lib/variableResolver'
import { toLetterFields } from './lib/calculator'
import type { Person } from './types'

type MainTab = 'editor' | 'settings'
type LeftTab = 'people' | 'templates'

export default function App() {
  const people = usePeopleStore()
  const templates = useTemplatesStore()
  const settings = useSettingsStore()

  const [mainTab, setMainTab] = useState<MainTab>('editor')
  const [leftTab, setLeftTab] = useState<LeftTab>('people')
  const [showNewPerson, setShowNewPerson] = useState(false)
  const [showAssignDoc, setShowAssignDoc] = useState(false)
  const [assignDocPersonId, setAssignDocPersonId] = useState<string | null>(null)
  const [showTemplateEditor, setShowTemplateEditor] = useState(false)
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null)
  const [showCalculator, setShowCalculator] = useState(false)

  // Load all stores on mount
  useEffect(() => {
    Promise.all([people.load(), templates.load(), settings.load()])
  }, [])

  const assignDocPerson = assignDocPersonId
    ? people.people.find(p => p.id === assignDocPersonId) ?? null
    : null

  const editingTemplate = editingTemplateId
    ? templates.templates.find(t => t.id === editingTemplateId) ?? null
    : null

  const handleAssignDoc = (personId: string) => {
    setAssignDocPersonId(personId)
    setShowAssignDoc(true)
  }

  const handleAssignDocSubmit = (templateId: string, docName: string) => {
    if (!assignDocPersonId) return
    const tmpl = templates.getLatestVersion(templateId)
    if (!tmpl) return
    const t = templates.templates.find(t => t.id === templateId)
    people.assignDocument(
      assignDocPersonId,
      templateId,
      t?.currentVersion ?? 1,
      docName,
      tmpl.html
    )
  }

  const handleTemplateEditorSave = (name: string, subject: string, html: string) => {
    if (editingTemplateId) {
      templates.updateTemplate(editingTemplateId, subject, html)
    } else {
      templates.addTemplate(name, subject, html)
    }
    setShowTemplateEditor(false)
    setEditingTemplateId(null)
  }

  const handleGeneratePdf = async () => {
    const { activePerson, activeDoc } = people
    if (!activePerson || !activeDoc) return

    const el = document.getElementById('a4-paper')
    if (!el) return

    const sysFields = buildSystemFields(activePerson, activeDoc.name)
    const allFields = mergeFields(sysFields, {}, activeDoc.fields)
    const pattern = settings.settings.pdfFilenamePattern
    const filename = resolveVariables(pattern, allFields).replace(/[/\\:*?"<>|]/g, '_') + '.pdf'

    await generatePdf(el as HTMLElement, filename)
  }

  const handleAutoFill = (fields: Record<string, string>) => {
    const { activePerson, activeDoc } = people
    if (!activePerson || !activeDoc) return
    Object.entries(fields).forEach(([key, value]) => {
      people.updateDocField(activePerson.id, activeDoc.docId, key, value)
    })
  }

  const { activePerson, activeDoc } = people

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <TopBar
        activeTab={mainTab}
        onTabChange={setMainTab}
        personName={activePerson?.name}
        docName={activeDoc?.name}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left panel — only on editor tab */}
        {mainTab === 'editor' && (
          <LeftPanel
            activeTab={leftTab}
            onTabChange={setLeftTab}
            people={people.people}
            templates={templates.templates}
            activePerson={activePerson}
            activeDoc={activeDoc}
            onSelectPerson={people.setActivePerson}
            onSelectDoc={people.setActiveDoc}
            onNewPerson={() => setShowNewPerson(true)}
            onAssignDoc={handleAssignDoc}
            onDeletePerson={people.deletePerson}
            onDeleteDoc={people.deleteDoc}
            onNewTemplate={() => { setEditingTemplateId(null); setShowTemplateEditor(true) }}
            onEditTemplate={id => { setEditingTemplateId(id); setShowTemplateEditor(true) }}
            onDeleteTemplate={templates.deleteTemplate}
          />
        )}

        {/* Main content area */}
        {mainTab === 'editor' && (
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {activePerson && activeDoc ? (
              <>
                <DocumentCanvas
                  person={activePerson}
                  doc={activeDoc}
                  onFieldChange={(key, value) =>
                    people.updateDocField(activePerson.id, activeDoc.docId, key, value)
                  }
                  onGeneratePdf={handleGeneratePdf}
                  onShowCalculator={() => setShowCalculator(c => !c)}
                  calculatorOpen={showCalculator}
                />
                {showCalculator && (
                  <SalaryCalculator
                    onAutoFill={handleAutoFill}
                    onClose={() => setShowCalculator(false)}
                  />
                )}
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, color: '#6b85a8', background: '#e8ecf2' }}>
                <FileText size={56} strokeWidth={1.25} style={{ opacity: 0.35, color: '#1E88E5' }} />
                <div style={{ fontSize: 15, fontWeight: 600, color: '#3a4f6e' }}>No document open</div>
                <div style={{ fontSize: 13, textAlign: 'center', maxWidth: 320, lineHeight: 1.5 }}>
                  Pick a person on the left and choose one of their documents — or
                  <button onClick={() => setShowNewPerson(true)} style={{ background: 'none', border: 'none', color: '#1E88E5', fontWeight: 600, cursor: 'pointer', padding: '0 4px', fontSize: 13 }}>add a new person</button>
                  to get started.
                </div>
              </div>
            )}
          </div>
        )}

        {mainTab === 'settings' && <SettingsPage />}
      </div>

      {/* Modals */}
      <NewPersonModal
        open={showNewPerson}
        onClose={() => setShowNewPerson(false)}
        onSubmit={data => people.addPerson(data as Omit<Person, 'id' | 'documents'>)}
      />

      <AssignDocModal
        open={showAssignDoc}
        onClose={() => { setShowAssignDoc(false); setAssignDocPersonId(null) }}
        personName={assignDocPerson?.name ?? ''}
        templates={templates.templates}
        onAssign={handleAssignDocSubmit}
      />

      {showTemplateEditor && (
        <TemplateEditor
          template={editingTemplate}
          onSave={handleTemplateEditorSave}
          onClose={() => { setShowTemplateEditor(false); setEditingTemplateId(null) }}
        />
      )}
    </div>
  )
}
