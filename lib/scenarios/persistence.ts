import type { Scenario, ScenarioWithVersion } from "@/packages/shared/types"

export function mapStoredScenarioToScenario(record: ScenarioWithVersion): Scenario {
  const payload = record.version.payload

  return {
    id: record.scenario.id,
    name: record.scenario.title,
    color: record.scenario.color,
    note: payload.scenario.note,
    initial: payload.simulation.initial,
    monthly: payload.simulation.monthly,
    years: payload.simulation.years,
    annualPct: payload.simulation.annualPct,
    reinvest: payload.simulation.reinvest,
    compounding: payload.simulation.compounding,
    annualFeePct: payload.simulation.annualFeePct,
    inflationPct: payload.simulation.inflationPct,
    stepUpAnnualPct: payload.simulation.stepUpAnnualPct,
    taxOnWithdrawPct: payload.simulation.taxOnWithdrawPct,
    oneTimeDeposits: payload.simulation.oneTimeDeposits,
    contributionPauses: payload.simulation.contributionPauses,
  }
}
