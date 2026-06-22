/**
 * Salary calculator — New Wage Code 2026 logic.
 * Formulas derived from MTAP CTC_Calculator_ for Validation (1).html
 */

export interface CalcConfig {
  basicPct: number        // % of monthly CTC → default 50 (New Wage Code)
  hraRate: number         // 0.50 (metro) | 0.40 (other) → default 0.50
  pfPref: '12%' | '1800' // employee + employer each → default '12%'
  floor15k: boolean       // raise basic to ₹15,000 if below → default false
  bonusAnnual: number     // performance bonus (annual, entered manually)
}

export interface LineItem {
  monthly: number
  annual: number
}

export interface CalcResult {
  // Inputs
  annualCTC: number
  monthlyCtc: number

  // A — Fixed
  basic: LineItem
  hra: LineItem
  statutoryBonus: LineItem
  specialAllowance: LineItem
  lta: LineItem

  // B — Reimbursements
  vehicle: LineItem
  driver: LineItem
  telephone: LineItem
  food: LineItem

  grossPay: LineItem

  // C — Variable
  performanceBonus: LineItem

  // D — Employee deductions
  pfEmployee: LineItem
  esiEmployee: LineItem
  professionalTax: LineItem
  totalDeductions: LineItem

  // E — Employer contributions (CTC components)
  pfEmployer: LineItem
  esiEmployer: LineItem
  totalEmployerContrib: LineItem

  // Reconciliation
  totalCTC: LineItem
  netTakeHome: LineItem

  // Compliance flags
  basicPctActual: number
  floor15kApplied: boolean
  reimbursementsActive: boolean
}

const r = Math.round

function line(monthly: number): LineItem {
  return { monthly: r(monthly), annual: r(monthly * 12) }
}

export function calculate(annualCTC: number, cfg: CalcConfig): CalcResult {
  const ctcM = r(annualCTC / 12)

  // ── Slab-based reimbursements (monthly) ────────────────────────────────
  const vehM  = annualCTC >= 1_000_000 ? 2400 : annualCTC >= 500_000 ? 1800 : 0
  const drvM  = annualCTC >= 500_000   ? 900  : 0
  const telM  = annualCTC >= 1_000_000 ? 1500 : annualCTC >= 500_000 ? 1000 : 0
  const foodM = annualCTC >= 500_000   ? 1250 : 0
  const reimbM = vehM + drvM + telM + foodM

  // ── Basic (50% of monthly CTC per New Wage Code) ────────────────────────
  const raw50 = r(ctcM * (cfg.basicPct / 100))
  let basicM  = raw50
  let floor15kApplied = false

  if (cfg.floor15k && basicM < 15_000) {
    basicM = 15_000
    floor15kApplied = true
  }

  // ── HRA ────────────────────────────────────────────────────────────────
  const hraM = r(basicM * cfg.hraRate)

  // ── LTA (Basic ÷ 12, only if CTC ≥ ₹5L) ───────────────────────────────
  const ltaM = annualCTC >= 500_000 ? r(basicM / 12) : 0

  // ── Statutory Bonus (8.33% of Basic | Basic ≤ ₹21,000) ─────────────────
  const sbM = basicM <= 21_000 ? Math.max(100, r(basicM * 0.0833)) : 0

  // ── Special Allowance H5 (pure residual) ───────────────────────────────
  const splM = Math.max(0, ctcM - basicM - hraM - sbM - ltaM - reimbM)

  // ── Gross Pay ──────────────────────────────────────────────────────────
  const grossM = basicM + hraM + sbM + splM + ltaM + reimbM

  // ── Variable ───────────────────────────────────────────────────────────
  const pbM = r(cfg.bonusAnnual / 12)

  // ── Employee deductions ────────────────────────────────────────────────
  const pfEmpM  = cfg.pfPref === '12%' ? r(basicM * 0.12) : 1800
  const esiEmpM = grossM <= 21_000 ? r(grossM * 0.0075) : 0
  const ptM     = grossM >= 20_000 ? 200 : grossM >= 15_000 ? 150 : 0
  const totalDed = pfEmpM + esiEmpM + ptM

  // ── Employer contributions ─────────────────────────────────────────────
  const pfErM   = cfg.pfPref === '12%' ? r(basicM * 0.12) : 1800
  const esiErM  = grossM <= 21_000 ? r(grossM * 0.0325) : 0
  const totalEmp = pfErM + esiErM

  // ── Net / CTC reconciliation ───────────────────────────────────────────
  const netM    = grossM + pbM - totalDed
  const ctcRecM = grossM + pbM + totalEmp

  return {
    annualCTC,
    monthlyCtc: ctcM,

    basic:            line(basicM),
    hra:              line(hraM),
    statutoryBonus:   line(sbM),
    specialAllowance: line(splM),
    lta:              line(ltaM),

    vehicle:   line(vehM),
    driver:    line(drvM),
    telephone: line(telM),
    food:      line(foodM),

    grossPay: line(grossM),

    performanceBonus: line(pbM),

    pfEmployee:      line(pfEmpM),
    esiEmployee:     line(esiEmpM),
    professionalTax: line(ptM),
    totalDeductions: line(totalDed),

    pfEmployer:           line(pfErM),
    esiEmployer:          line(esiErM),
    totalEmployerContrib: line(totalEmp),

    totalCTC:    line(ctcRecM),
    netTakeHome: line(netM),

    basicPctActual:         ctcM > 0 ? (basicM / ctcM) * 100 : 0,
    floor15kApplied,
    reimbursementsActive: annualCTC >= 500_000,
  }
}

/** Indian number format (lakh system): 1,00,000 */
export function formatINR(n: number): string {
  return Math.round(n).toLocaleString('en-IN')
}

/** Map CalcResult to {{VAR}} field keys used in the appraisal letter template */
export function toLetterFields(r: CalcResult): Record<string, string> {
  const f = formatINR
  return {
    BASIC_MONTHLY:               f(r.basic.monthly),
    BASIC_ANNUAL:                f(r.basic.annual),
    HRA_MONTHLY:                 f(r.hra.monthly),
    HRA_ANNUAL:                  f(r.hra.annual),
    SPECIAL_ALLOWANCE_MONTHLY:   f(r.specialAllowance.monthly),
    SPECIAL_ALLOWANCE_ANNUAL:    f(r.specialAllowance.annual),
    LTA_MONTHLY:                 f(r.lta.monthly),
    LTA_ANNUAL:                  f(r.lta.annual),
    VEHICLE_MONTHLY:             f(r.vehicle.monthly),
    VEHICLE_ANNUAL:              f(r.vehicle.annual),
    DRIVER_MONTHLY:              f(r.driver.monthly),
    DRIVER_ANNUAL:               f(r.driver.annual),
    TELEPHONE_MONTHLY:           f(r.telephone.monthly),
    TELEPHONE_ANNUAL:            f(r.telephone.annual),
    FOOD_MONTHLY:                f(r.food.monthly),
    FOOD_ANNUAL:                 f(r.food.annual),
    FIXED_CTC_MONTHLY:           f(r.grossPay.monthly),
    FIXED_CTC_ANNUAL:            f(r.grossPay.annual),
    PF_MONTHLY:                  f(r.pfEmployer.monthly),
    PF_ANNUAL:                   f(r.pfEmployer.annual),
    SUBTOTAL_MONTHLY:            f(r.pfEmployer.monthly),
    SUBTOTAL_ANNUAL:             f(r.pfEmployer.annual),
    TOTAL_FIXED_CTC_MONTHLY:     f(r.totalCTC.monthly),
    TOTAL_FIXED_CTC_ANNUAL:      f(r.totalCTC.annual),
    NET_MONTHLY_CREDIT_MONTHLY:  f(r.netTakeHome.monthly),
    NET_MONTHLY_CREDIT_ANNUAL:   f(r.netTakeHome.annual),
    PERFORMANCE_BONUS_ANNUAL:    f(r.performanceBonus.annual),
    TOTAL_BONUS_ANNUAL:          f(r.performanceBonus.annual),
    NEW_CTC:                     f(r.annualCTC),
    NEW_CTC_FORMATTED:           'Rs.' + f(r.annualCTC),
  }
}

/** Default config matching the MTAP CTC calculator defaults */
export const DEFAULT_CALC_CONFIG: CalcConfig = {
  basicPct:    50,
  hraRate:     0.50,   // Chennai is metro
  pfPref:      '12%',
  floor15k:    false,
  bonusAnnual: 0,
}
