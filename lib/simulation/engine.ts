import type { SimulationOptions, SimulationResult, SimulationRow } from "@/packages/shared/types"

import { fmtMonth } from "./format"

export function simulate(
  initial: number,
  monthly: number,
  months: number,
  annualRate: number,
  options?: SimulationOptions
): SimulationResult {
  const reinvest = options?.reinvest ?? true
  const startDate = options?.startDate ?? new Date()
  const compounding = options?.compounding ?? "monthly"
  const annualFee = (options?.annualFeePct ?? 0) / 100
  const inflation = (options?.inflationPct ?? 0) / 100
  const withdrawalTax = (options?.taxOnWithdrawPct ?? 0) / 100
  const stepUp = (options?.stepUpAnnualPct ?? 0) / 100
  const oneTimeDeposits = options?.oneTimeDeposits ?? []
  const contributionPauses = options?.contributionPauses ?? []

  const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1
  const feeFactor = Math.pow(1 - annualFee, 1 / 12)
  const deflator = (month: number) => Math.pow(1 + inflation, month / 12)

  let balance = initial
  let withdrawnGains = 0
  let contribSoFar = initial

  const rows: SimulationRow[] = []
  const monthlyGrowth: number[] = []

  for (let month = 1; month <= months; month++) {
    const balanceBeforeContrib = balance
    const yearsPassed = Math.floor((month - 1) / 12)
    const steppedMonthly = monthly * Math.pow(1 + stepUp, yearsPassed)
    const isPaused = contributionPauses.some(
      (pause) => month >= pause.startMonth && month <= pause.endMonth
    )
    const monthlyContribution = isPaused ? 0 : steppedMonthly
    const depositThisMonth = oneTimeDeposits
      .filter((deposit) => deposit.month === month)
      .reduce((sum, deposit) => sum + deposit.amount, 0)
    const totalContributionThisMonth = monthlyContribution + depositThisMonth

    balance += totalContributionThisMonth
    contribSoFar += totalContributionThisMonth

    let growthThisMonth = 0
    if (compounding === "monthly" || compounding === "daily") {
      growthThisMonth = balance * monthlyRate
      balance += growthThisMonth
    } else if (compounding === "annual" && month % 12 === 0) {
      growthThisMonth = balance * annualRate
      balance += growthThisMonth
    }

    balance *= feeFactor

    if (!reinvest && growthThisMonth > 0) {
      balance -= growthThisMonth
      withdrawnGains += growthThisMonth * (1 - withdrawalTax)
    }

    const wealth = balance + withdrawnGains
    const totalGains = wealth - contribSoFar
    const realWealth = wealth / deflator(month)
    const monthlyGrowthPct =
      balanceBeforeContrib > 0
        ? ((balance - balanceBeforeContrib - totalContributionThisMonth) / balanceBeforeContrib) * 100
        : 0

    monthlyGrowth.push(monthlyGrowthPct)
    rows.push({
      luna: fmtMonth(month, startDate),
      month,
      "Valoare totală": Math.round(wealth),
      "Contribuții cumulate": Math.round(contribSoFar),
      "Câștiguri cumulate": Math.round(totalGains),
      "Câștig lunar": Math.round(growthThisMonth),
      "Valoare reală": Math.round(realWealth),
    })
  }

  const totalValue = balance + withdrawnGains
  const totalContrib = contribSoFar
  const totalGains = totalValue - totalContrib
  const yieldPct = totalContrib > 0 ? (totalGains / totalContrib) * 100 : 0
  const totalValueReal = rows[rows.length - 1]?.["Valoare reală"]
  const yieldRealPct =
    totalContrib > 0 && totalValueReal !== undefined
      ? ((totalValueReal - totalContrib) / totalContrib) * 100
      : undefined

  return {
    rows,
    totalValue,
    totalContrib,
    totalGains,
    yieldPct,
    monthlyGrowth,
    totalValueReal,
    yieldRealPct,
  }
}
