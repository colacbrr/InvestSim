import type {
  CompoundingMode,
  ContributionPause,
  OneTimeDeposit,
  Scenario,
  SimulationRequest,
} from "@/packages/shared/types"

type SimulationRequestFallbacks = {
  reinvest: boolean
  compounding: CompoundingMode
  annualFeePct: number
  inflationPct: number
  stepUpAnnualPct: number
  taxOnWithdrawPct: number
  oneTimeDeposits: OneTimeDeposit[]
  contributionPauses: ContributionPause[]
  startDate: string
}

type RequestBase = {
  initial: number
  monthly: number
  years: number
  annualPct: number
  reinvest: boolean
  compounding: CompoundingMode
  annualFeePct: number
  inflationPct: number
  stepUpAnnualPct: number
  taxOnWithdrawPct: number
  oneTimeDeposits: OneTimeDeposit[]
  contributionPauses: ContributionPause[]
  startDate: string
}

export function buildSimulationRequest(base: RequestBase): SimulationRequest {
  return {
    initial: base.initial,
    monthly: base.monthly,
    years: base.years,
    annualPct: base.annualPct,
    reinvest: base.reinvest,
    compounding: base.compounding,
    annualFeePct: base.annualFeePct,
    inflationPct: base.inflationPct,
    stepUpAnnualPct: base.stepUpAnnualPct,
    taxOnWithdrawPct: base.taxOnWithdrawPct,
    oneTimeDeposits: base.oneTimeDeposits,
    contributionPauses: base.contributionPauses,
    startDate: base.startDate,
  }
}

export function buildScenarioSimulationRequest(
  scenario: Scenario,
  fallbacks: SimulationRequestFallbacks
): SimulationRequest {
  return buildSimulationRequest({
    initial: scenario.initial,
    monthly: scenario.monthly,
    years: scenario.years,
    annualPct: scenario.annualPct,
    reinvest: scenario.reinvest ?? fallbacks.reinvest,
    compounding: scenario.compounding ?? fallbacks.compounding,
    annualFeePct: scenario.annualFeePct ?? fallbacks.annualFeePct,
    inflationPct: scenario.inflationPct ?? fallbacks.inflationPct,
    stepUpAnnualPct: scenario.stepUpAnnualPct ?? fallbacks.stepUpAnnualPct,
    taxOnWithdrawPct: scenario.taxOnWithdrawPct ?? fallbacks.taxOnWithdrawPct,
    oneTimeDeposits: scenario.oneTimeDeposits ?? fallbacks.oneTimeDeposits,
    contributionPauses: scenario.contributionPauses ?? fallbacks.contributionPauses,
    startDate: fallbacks.startDate,
  })
}
