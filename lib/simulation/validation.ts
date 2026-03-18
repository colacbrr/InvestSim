import { DEFAULT_NUMERIC_LIMITS } from "@/lib/simulation/constants"
import type { ValidationErrorCode } from "@/lib/i18n/messages"
import type {
  CompoundingMode,
  SimulationApiErrorCode,
  SimulationRequest,
} from "@/packages/shared/types"

const VALID_COMPOUNDING_MODES: CompoundingMode[] = ["monthly", "annual", "daily"]

export function validateInputs(
  initial: number,
  monthly: number,
  years: number,
  annualPct: number
) {
  const errors: ValidationErrorCode[] = []

  if (initial < 0) errors.push("initial_negative")
  if (initial > 1_000_000) errors.push("initial_too_large")
  if (monthly < 0) errors.push("monthly_negative")
  if (monthly > 50_000) errors.push("monthly_too_large")
  if (years < 1 || years > 50) errors.push("years_out_of_range")
  if (annualPct < DEFAULT_NUMERIC_LIMITS.annualPctMin || annualPct > DEFAULT_NUMERIC_LIMITS.annualPctMax) {
    errors.push("annual_pct_out_of_range")
  }

  return errors
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

export function validateSimulationPayload(
  payload: unknown
): { ok: true; data: SimulationRequest } | { ok: false; errors: SimulationApiErrorCode[] } {
  if (!isObject(payload)) {
    return { ok: false, errors: ["invalid_payload"] }
  }

  const initial = payload.initial
  const monthly = payload.monthly
  const years = payload.years
  const annualPct = payload.annualPct
  const reinvest = payload.reinvest
  const compounding = payload.compounding

  if (
    !isFiniteNumber(initial) ||
    !isFiniteNumber(monthly) ||
    !isFiniteNumber(years) ||
    !isFiniteNumber(annualPct) ||
    typeof reinvest !== "boolean" ||
    !VALID_COMPOUNDING_MODES.includes(compounding as CompoundingMode)
  ) {
    return { ok: false, errors: ["invalid_payload"] }
  }

  const validationErrors = validateInputs(initial, monthly, years, annualPct)
  if (validationErrors.length > 0) {
    return { ok: false, errors: validationErrors }
  }

  const numericOptionKeys = [
    "annualFeePct",
    "inflationPct",
    "taxOnWithdrawPct",
    "stepUpAnnualPct",
  ] as const

  for (const key of numericOptionKeys) {
    const value = payload[key]
    if (value !== undefined && !isFiniteNumber(value)) {
      return { ok: false, errors: ["invalid_payload"] }
    }
  }

  if (payload.startDate !== undefined && typeof payload.startDate !== "string") {
    return { ok: false, errors: ["invalid_payload"] }
  }

  const oneTimeDeposits = payload.oneTimeDeposits
  if (
    oneTimeDeposits !== undefined &&
    (!Array.isArray(oneTimeDeposits) ||
      oneTimeDeposits.some(
        (entry) => !isObject(entry) || !isFiniteNumber(entry.month) || !isFiniteNumber(entry.amount)
      ))
  ) {
    return { ok: false, errors: ["invalid_payload"] }
  }

  const contributionPauses = payload.contributionPauses
  if (
    contributionPauses !== undefined &&
    (!Array.isArray(contributionPauses) ||
      contributionPauses.some(
        (entry) =>
          !isObject(entry) ||
          !isFiniteNumber(entry.startMonth) ||
          !isFiniteNumber(entry.endMonth)
      ))
  ) {
    return { ok: false, errors: ["invalid_payload"] }
  }

  return {
    ok: true,
    data: {
      initial,
      monthly,
      years,
      annualPct,
      reinvest,
      compounding: compounding as CompoundingMode,
      annualFeePct: payload.annualFeePct as number | undefined,
      inflationPct: payload.inflationPct as number | undefined,
      taxOnWithdrawPct: payload.taxOnWithdrawPct as number | undefined,
      stepUpAnnualPct: payload.stepUpAnnualPct as number | undefined,
      oneTimeDeposits: oneTimeDeposits as SimulationRequest["oneTimeDeposits"],
      contributionPauses: contributionPauses as SimulationRequest["contributionPauses"],
      startDate: payload.startDate as string | undefined,
    },
  }
}
