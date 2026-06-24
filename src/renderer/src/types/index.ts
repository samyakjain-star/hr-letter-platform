// ─── Core entities ─────────────────────────────────────────────────────────

export interface Person {
  id: string
  name: string
  employeeId: string
  email: string
  designation: string
  division: string
  grade: string
  documents: PersonDocument[]
}

/** A document assigned to a person. frozenHtml is the template HTML snapshot
 *  taken at assignment time — never retroactively updated by template edits. */
export interface PersonDocument {
  docId: string
  templateId: string
  templateVersion: number
  name: string
  createdAt: string
  frozenHtml: string
  fields: Record<string, string>
}

// ─── Templates ─────────────────────────────────────────────────────────────

export interface Template {
  id: string
  name: string
  currentVersion: number
  versions: TemplateVersion[]
}

export interface TemplateVersion {
  version: number
  savedAt: string
  subject: string
  html: string
  variables: string[]
}

// ─── Settings ──────────────────────────────────────────────────────────────

export interface Settings {
  calculator: CalculatorConfig
  appVersion: string
  pdfFilenamePattern: string
}

/** New Wage Code 2026 — matches MTAP CTC_Calculator_ for Validation (1).html */
export interface CalculatorConfig {
  basicPct: number        // % of monthly CTC → default 50 (New Wage Code)
  hraRate: number         // 0.50 metro | 0.40 other → default 0.50
  pfPref: '12%' | '1800' // PF preference → default '12%'
  floor15k: boolean       // ₹15K basic floor → default false
}

// ─── Salary calculator ─────────────────────────────────────────────────────

export interface SalaryComponent {
  monthly: number
  annual: number
}

export interface CalculatorResult {
  annualCTC: number
  basic: SalaryComponent
  hra: SalaryComponent
  specialAllowance: SalaryComponent
  lta: SalaryComponent
  vehicleReimbursement: SalaryComponent
  driverSalary: SalaryComponent
  telephoneReimbursement: SalaryComponent
  foodCoupon: SalaryComponent
  fixedCTC: SalaryComponent
  pf: SalaryComponent
  totalFixedCTC: SalaryComponent
  netMonthlyCredit: SalaryComponent
  performanceBonus: number
  totalBonus: number
}

// ─── IPC API surface (matches preload contextBridge) ───────────────────────

export interface PeopleStore { people: Person[] }
export interface TemplatesStore { templates: Template[] }

export interface UpdateInfo {
  hasUpdate: boolean
  version?: string
  changelog?: string
  downloadUrl?: string
}
