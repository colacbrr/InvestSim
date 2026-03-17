import type { SimulationRow } from "@/packages/shared/types"

export function computeIRRFromRows(
  rows: SimulationRow[],
  params: {
    initial: number
    monthly: number
    months: number
    reinvest: boolean
    totalValue: number
    totalContrib: number
  }
): number | null {
  const { initial, monthly, months, reinvest, totalValue, totalContrib } = params
  if (months <= 0) return null

  const cashflows = new Array(months + 1).fill(0)
  cashflows[0] = -initial

  for (let month = 1; month <= months; month++) {
    cashflows[month] -= monthly
    if (!reinvest) {
      const gain = rows[month - 1]["Câștig lunar"] || 0
      if (gain > 0) cashflows[month] += gain
    }
  }

  cashflows[months] += reinvest ? totalValue : totalContrib

  const npv = (rate: number) =>
    cashflows.reduce((acc, cashflow, t) => acc + cashflow / Math.pow(1 + rate, t), 0)

  let low = -0.9
  let high = 1
  let lowValue = npv(low)
  let highValue = npv(high)
  let tries = 0

  while (lowValue * highValue > 0 && tries < 10) {
    high *= 2
    highValue = npv(high)
    tries += 1
    if (high > 10) break
  }

  if (lowValue * highValue > 0) return null

  for (let iteration = 0; iteration < 100; iteration++) {
    const mid = (low + high) / 2
    const midValue = npv(mid)

    if (Math.abs(midValue) < 1e-7) return Math.pow(1 + mid, 12) - 1

    if (lowValue * midValue < 0) {
      high = mid
      highValue = midValue
    } else {
      low = mid
      lowValue = midValue
    }
  }

  const rate = (low + high) / 2
  return Math.pow(1 + rate, 12) - 1
}
