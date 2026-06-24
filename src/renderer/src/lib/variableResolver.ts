import type { Person } from '../types/index'

const VAR_PATTERN = /\{\{([^}]+)\}\}/g

/** Strip path separators and reserved characters so a resolved filename can
 *  never escape the chosen save directory (path-traversal safe). */
export function sanitizeFilename(name: string): string {
  return name.replace(/[/\\:*?"<>|]/g, '_').replace(/\.\.+/g, '_')
}

export function resolveVariables(template: string, fields: Record<string, string>): string {
  const normalizedFields: Record<string, string> = {}
  for (const key of Object.keys(fields)) {
    normalizedFields[key.toUpperCase()] = fields[key]
  }
  return template.replace(VAR_PATTERN, (_match, varName: string) => {
    const upper = varName.trim().toUpperCase()
    return upper in normalizedFields ? normalizedFields[upper] : ''
  })
}

export function extractVariables(html: string): string[] {
  const found = new Set<string>()
  let match: RegExpExecArray | null
  const pattern = new RegExp(VAR_PATTERN.source, 'g')
  while ((match = pattern.exec(html)) !== null) {
    found.add(match[1].trim())
  }
  return Array.from(found)
}

export function buildSystemFields(person: Person, docName?: string): Record<string, string> {
  const today = new Date().toISOString().split('T')[0]
  return {
    EMPLOYEE_NAME: person.name,
    EMPLOYEE_ID: person.employeeId,
    EMAIL: person.email,
    DATE: today,
    DESIGNATION: person.designation,
    DIVISION: person.division,
    GRADE: person.grade,
    DOCUMENT_TYPE: docName ?? ''
  }
}

export function mergeFields(
  systemFields: Record<string, string>,
  personFields: Record<string, string>,
  docFields: Record<string, string>
): Record<string, string> {
  return { ...systemFields, ...personFields, ...docFields }
}
