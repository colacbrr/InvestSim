export interface SimulationRequest {
  initial: number
  monthly: number
  years: number
  annualPct: number
  reinvest: boolean
  compounding: CompoundingMode
  annualFeePct?: number
  inflationPct?: number
  taxOnWithdrawPct?: number
  stepUpAnnualPct?: number
  oneTimeDeposits?: OneTimeDeposit[]
  contributionPauses?: ContributionPause[]
  startDate?: string
}

export type CompoundingMode = "monthly" | "annual" | "daily"

export interface OneTimeDeposit {
  month: number
  amount: number
}

export interface ContributionPause {
  startMonth: number
  endMonth: number
}

export interface SimulationOptions {
  reinvest?: boolean
  startDate?: Date
  compounding?: CompoundingMode
  annualFeePct?: number
  inflationPct?: number
  taxOnWithdrawPct?: number
  stepUpAnnualPct?: number
  oneTimeDeposits?: OneTimeDeposit[]
  contributionPauses?: ContributionPause[]
}

export interface SimulationRow {
  luna: string
  month: number
  "Valoare totală": number
  "Contribuții cumulate": number
  "Câștiguri cumulate": number
  "Câștig lunar": number
  "Valoare reală"?: number
}

export interface SimulationResult {
  rows: SimulationRow[]
  totalValue: number
  totalContrib: number
  totalGains: number
  yieldPct: number
  monthlyGrowth: number[]
  totalValueReal?: number
  yieldRealPct?: number
}

export interface Scenario {
  id: string
  name: string
  initial: number
  monthly: number
  years: number
  annualPct: number
  color: string
  reinvest?: boolean
  note?: string
  compounding?: CompoundingMode
  annualFeePct?: number
  inflationPct?: number
  stepUpAnnualPct?: number
  taxOnWithdrawPct?: number
  oneTimeDeposits?: OneTimeDeposit[]
  contributionPauses?: ContributionPause[]
}

export type SimulationApiErrorCode =
  | "invalid_json"
  | "invalid_payload"
  | "initial_negative"
  | "initial_too_large"
  | "monthly_negative"
  | "monthly_too_large"
  | "years_out_of_range"
  | "annual_pct_out_of_range"

export type SimulationApiResponse =
  | {
      ok: true
      data: SimulationResult
    }
  | {
      ok: false
      errors: SimulationApiErrorCode[]
    }

export interface ScenarioDocumentPayload {
  schemaVersion: number
  scenario: {
    name: string
    color: string
    note?: string
  }
  simulation: SimulationRequest
  ui: {
    startDate?: string
  }
}

export interface ScenarioSummary {
  finalValue: number
  totalContrib: number
  totalGains: number
  yieldPct: number
  years: number
  annualPct: number
  monthly: number
  initial: number
  inflationPct?: number
  compounding: CompoundingMode
  reinvest: boolean
}

export interface ScenarioRecord {
  id: string
  userId: string
  title: string
  color: string
  archivedAt: string | null
  isFavorite: boolean
  latestVersionId: string
  createdAt: string
  updatedAt: string
  lastOpenedAt: string | null
}

export interface ScenarioVersionRecord {
  id: string
  scenarioId: string
  versionNumber: number
  schemaVersion: number
  source: "manual_edit" | "import_json" | "duplicate" | "migration" | "autosave"
  payload: ScenarioDocumentPayload
  summary: ScenarioSummary
  createdByUserId: string | null
  createdAt: string
}

export interface ScenarioWithVersion {
  scenario: ScenarioRecord
  version: ScenarioVersionRecord
}

export interface SaveScenarioInput {
  scenarioId?: string
  userId: string
  title: string
  color: string
  note?: string
  simulation: SimulationRequest
  startDate?: string
  source?: ScenarioVersionRecord["source"]
}
