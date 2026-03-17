export interface SimulationRequest {
  initial: number
  monthly: number
  years: number
  annualPct: number
  reinvest: boolean
}

export type CompoundingMode = "monthly" | "annual" | "daily"

export interface SimulationOptions {
  reinvest?: boolean
  startDate?: Date
  compounding?: CompoundingMode
  annualFeePct?: number
  inflationPct?: number
  taxOnWithdrawPct?: number
  stepUpAnnualPct?: number
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
}
