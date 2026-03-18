import { simulate } from "@/lib/simulation/engine"
import { validateSimulationPayload } from "@/lib/simulation/validation"
import type {
  SimulationApiErrorCode,
  SimulationApiResponse,
  SimulationRequest,
} from "@/packages/shared/types"

function toDateOrUndefined(value: string | undefined): Date | undefined {
  if (!value) return undefined

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function sanitizeRequest(payload: SimulationRequest): SimulationRequest {
  return {
    initial: payload.initial,
    monthly: payload.monthly,
    years: payload.years,
    annualPct: payload.annualPct,
    reinvest: payload.reinvest,
    compounding: payload.compounding,
    annualFeePct: payload.annualFeePct ?? 0,
    inflationPct: payload.inflationPct ?? 0,
    taxOnWithdrawPct: payload.taxOnWithdrawPct ?? 0,
    stepUpAnnualPct: payload.stepUpAnnualPct ?? 0,
    oneTimeDeposits: payload.oneTimeDeposits ?? [],
    contributionPauses: payload.contributionPauses ?? [],
    startDate: payload.startDate,
  }
}

export function createSimulationResponse(payload: unknown): SimulationApiResponse {
  const validation = validateSimulationPayload(payload)
  if (!validation.ok) {
    return {
      ok: false,
      errors: validation.errors,
    }
  }

  const request = sanitizeRequest(validation.data)
  const result = simulate(
    request.initial,
    request.monthly,
    request.years * 12,
    request.annualPct / 100,
    {
      reinvest: request.reinvest,
      compounding: request.compounding,
      annualFeePct: request.annualFeePct,
      inflationPct: request.inflationPct,
      taxOnWithdrawPct: request.taxOnWithdrawPct,
      stepUpAnnualPct: request.stepUpAnnualPct,
      oneTimeDeposits: request.oneTimeDeposits,
      contributionPauses: request.contributionPauses,
      startDate: toDateOrUndefined(request.startDate),
    }
  )

  return {
    ok: true,
    data: result,
  }
}

export function isClientPayloadError(code: SimulationApiErrorCode) {
  return code !== "invalid_json"
}
