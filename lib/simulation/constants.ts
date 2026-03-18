import type { CompoundingMode } from "@/packages/shared/types"

export const SIMULATOR_STORAGE_KEY = "investsim:simulator:v1"

export const SCENARIO_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
] as const

export const DEFAULT_NUMERIC_LIMITS = {
  moneyMax: 1_000_000_000,
  annualPctMin: -50,
  annualPctMax: 50,
  percentMin: 0,
  percentMax: 100,
  safeWithdrawalRateMin: 1,
  safeWithdrawalRateMax: 10,
  delayYearsMin: 0,
  delayYearsMax: 20,
} as const

export const DEFAULT_SIMULATOR_VALUES = {
  initial: 0,
  monthly: 200,
  years: 10,
  annualPct: 8,
  reinvest: true,
  compounding: "monthly" as CompoundingMode,
  annualFeePct: 0,
  inflationPct: 2.5,
  stepUpAnnualPct: 0,
  taxOnWithdrawPct: 10,
  targetAmount: 100_000,
  monthlyExpenses: 1_500,
  safeWithdrawalRate: 4,
  delayYears: 3,
} as const

export const SIMULATOR_PRESETS = {
  etfStarter: {
    initial: 0,
    monthly: 250,
    years: 15,
    annualPct: 7,
    annualFeePct: 0.2,
    inflationPct: 2.5,
  },
  balanced: {
    initial: 5_000,
    monthly: 400,
    years: 20,
    annualPct: 6,
    annualFeePct: 0.4,
    inflationPct: 2.5,
  },
  growth: {
    initial: 10_000,
    monthly: 600,
    years: 25,
    annualPct: 9,
    annualFeePct: 0.5,
    inflationPct: 2.5,
  },
} as const
