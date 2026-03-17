import type { SimulationOptions } from "@/packages/shared/types"

import { simulate } from "./engine"

export function solveMonthlyContributionForTarget(
  target: number,
  initial: number,
  months: number,
  annualRate: number,
  options?: SimulationOptions
) {
  if (months <= 0) return null
  if (target <= initial) return 0

  let low = 0
  let high = 1000

  while (high <= 100_000) {
    const result = simulate(initial, high, months, annualRate, options)
    if (result.totalValue >= target) break
    high *= 2
  }

  if (high > 100_000) return null

  for (let iteration = 0; iteration < 60; iteration++) {
    const mid = (low + high) / 2
    const result = simulate(initial, mid, months, annualRate, options)

    if (result.totalValue >= target) {
      high = mid
    } else {
      low = mid
    }
  }

  return high
}

export function solveYearsToTarget(
  target: number,
  initial: number,
  monthly: number,
  annualRate: number,
  options?: SimulationOptions
) {
  if (target <= initial) return 0

  for (let years = 1; years <= 60; years++) {
    const result = simulate(initial, monthly, years * 12, annualRate, options)
    if (result.totalValue >= target) return years
  }

  return null
}

export function calculateFireNumber(monthlyExpenses: number, safeWithdrawalRate: number) {
  return (monthlyExpenses * 12) / Math.max(safeWithdrawalRate / 100, 0.0001)
}

export function calculateSupportedAnnualIncome(totalValue: number, safeWithdrawalRate: number) {
  return totalValue * (safeWithdrawalRate / 100)
}
