import { simulate } from "@/lib/simulation/engine"
import type {
  SaveScenarioInput,
  ScenarioDocumentPayload,
  ScenarioSummary,
  ScenarioWithVersion,
} from "@/packages/shared/types"

export const SCENARIO_SCHEMA_VERSION = 1
export const DEFAULT_LOCAL_USER_ID = "local-dev-user"

export interface ScenarioRepository {
  listScenarios(userId: string): Promise<ScenarioWithVersion[]>
  getScenario(scenarioId: string, userId: string): Promise<ScenarioWithVersion | null>
  saveScenario(input: SaveScenarioInput): Promise<ScenarioWithVersion>
  listScenarioVersions(
    scenarioId: string,
    userId: string
  ): Promise<ScenarioWithVersion["version"][]>
  archiveScenario(scenarioId: string, userId: string): Promise<boolean>
}

export function buildScenarioDocumentPayload(input: SaveScenarioInput): ScenarioDocumentPayload {
  return {
    schemaVersion: SCENARIO_SCHEMA_VERSION,
    scenario: {
      name: input.title,
      color: input.color,
      note: input.note,
    },
    simulation: input.simulation,
    ui: {
      startDate: input.startDate,
    },
  }
}

export function buildScenarioSummary(input: SaveScenarioInput): ScenarioSummary {
  const result = simulate(
    input.simulation.initial,
    input.simulation.monthly,
    input.simulation.years * 12,
    input.simulation.annualPct / 100,
    {
      reinvest: input.simulation.reinvest,
      compounding: input.simulation.compounding,
      annualFeePct: input.simulation.annualFeePct,
      inflationPct: input.simulation.inflationPct,
      taxOnWithdrawPct: input.simulation.taxOnWithdrawPct,
      stepUpAnnualPct: input.simulation.stepUpAnnualPct,
      oneTimeDeposits: input.simulation.oneTimeDeposits,
      contributionPauses: input.simulation.contributionPauses,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
    }
  )

  return {
    finalValue: result.totalValue,
    totalContrib: result.totalContrib,
    totalGains: result.totalGains,
    yieldPct: result.yieldPct,
    years: input.simulation.years,
    annualPct: input.simulation.annualPct,
    monthly: input.simulation.monthly,
    initial: input.simulation.initial,
    inflationPct: input.simulation.inflationPct,
    compounding: input.simulation.compounding,
    reinvest: input.simulation.reinvest,
  }
}
