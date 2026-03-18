import { describe, expect, it } from "vitest"

import { computeIRRFromRows } from "@/lib/simulation/irr"
import {
  calculateFireNumber,
  calculateSupportedAnnualIncome,
  solveMonthlyContributionForTarget,
  solveYearsToTarget,
} from "@/lib/simulation/solvers"
import { createSimulationResponse } from "@/lib/simulation/service"
import { simulate } from "@/lib/simulation/engine"
import { validateInputs, validateSimulationPayload } from "@/lib/simulation/validation"

describe("simulate", () => {
  it("keeps contributions equal to value when return is zero", () => {
    const result = simulate(1000, 100, 1, 0, {
      startDate: new Date("2026-03-17"),
    })

    expect(result.totalContrib).toBe(1100)
    expect(result.totalValue).toBe(1100)
    expect(result.totalGains).toBe(0)
    expect(result.rows[0].luna).toContain("17")
  })

  it("shows lower real value when inflation is enabled", () => {
    const nominal = simulate(0, 500, 24, 0.08)
    const withInflation = simulate(0, 500, 24, 0.08, {
      inflationPct: 5,
    })

    expect(withInflation.totalValueReal).toBeDefined()
    expect(Number(withInflation.totalValueReal)).toBeLessThan(nominal.totalValue)
  })

  it("reduces final value when annual fees are applied", () => {
    const withoutFees = simulate(0, 500, 24, 0.08)
    const withFees = simulate(0, 500, 24, 0.08, {
      annualFeePct: 2,
    })

    expect(withFees.totalValue).toBeLessThan(withoutFees.totalValue)
  })

  it("makes reinvestment outperform monthly withdrawals when returns are positive", () => {
    const reinvested = simulate(0, 500, 36, 0.1, {
      reinvest: true,
    })
    const withdrawn = simulate(0, 500, 36, 0.1, {
      reinvest: false,
      taxOnWithdrawPct: 0,
    })

    expect(reinvested.totalValue).toBeGreaterThan(withdrawn.totalValue)
  })

  it("adds one-time deposits to contributions and final value", () => {
    const withoutDeposit = simulate(0, 500, 12, 0)
    const withDeposit = simulate(0, 500, 12, 0, {
      oneTimeDeposits: [{ month: 6, amount: 2_000 }],
    })

    expect(withDeposit.totalContrib).toBe(withoutDeposit.totalContrib + 2_000)
    expect(withDeposit.totalValue).toBe(withoutDeposit.totalValue + 2_000)
  })

  it("skips monthly contributions during pause periods", () => {
    const baseline = simulate(0, 500, 12, 0)
    const withPause = simulate(0, 500, 12, 0, {
      contributionPauses: [{ startMonth: 4, endMonth: 6 }],
    })

    expect(withPause.totalContrib).toBe(baseline.totalContrib - 1_500)
    expect(withPause.totalValue).toBe(baseline.totalValue - 1_500)
  })
})

describe("computeIRRFromRows", () => {
  it("returns an annualized rate near zero for a zero-growth path", () => {
    const result = simulate(0, 500, 24, 0)
    const irr = computeIRRFromRows(result.rows, {
      initial: 0,
      monthly: 500,
      months: 24,
      reinvest: true,
      totalValue: result.totalValue,
      totalContrib: result.totalContrib,
    })

    expect(irr).not.toBeNull()
    expect(Math.abs(Number(irr))).toBeLessThan(0.01)
  })
})

describe("solvers", () => {
  it("returns zero required monthly contribution when target is already met", () => {
    expect(solveMonthlyContributionForTarget(5000, 5000, 24, 0.08)).toBe(0)
  })

  it("finds a monthly contribution that reaches the target", () => {
    const monthlyNeeded = solveMonthlyContributionForTarget(20_000, 1000, 24, 0.08)

    expect(monthlyNeeded).not.toBeNull()
    const result = simulate(1000, Number(monthlyNeeded), 24, 0.08)
    expect(result.totalValue).toBeGreaterThanOrEqual(20_000)
  })

  it("returns the first year that reaches the target", () => {
    const years = solveYearsToTarget(15_000, 1000, 400, 0.08)

    expect(years).not.toBeNull()
    expect(Number(years)).toBeGreaterThan(0)
  })

  it("calculates FIRE number and supported annual income deterministically", () => {
    expect(calculateFireNumber(2000, 4)).toBe(600_000)
    expect(calculateSupportedAnnualIncome(500_000, 4)).toBe(20_000)
  })
})

describe("validateInputs", () => {
  it("returns stable validation error codes", () => {
    const errors = validateInputs(-1, 60_000, 0, 80)

    expect(errors).toEqual([
      "initial_negative",
      "monthly_too_large",
      "years_out_of_range",
      "annual_pct_out_of_range",
    ])
  })
})

describe("validateSimulationPayload", () => {
  it("accepts the expanded API request shape", () => {
    const payload = validateSimulationPayload({
      initial: 1000,
      monthly: 200,
      years: 10,
      annualPct: 8,
      reinvest: true,
      compounding: "monthly",
      annualFeePct: 0.4,
      inflationPct: 2.5,
      taxOnWithdrawPct: 10,
      stepUpAnnualPct: 1,
      oneTimeDeposits: [{ month: 6, amount: 500 }],
      contributionPauses: [{ startMonth: 4, endMonth: 5 }],
      startDate: "2026-03-18",
    })

    expect(payload.ok).toBe(true)
  })

  it("rejects malformed API payloads", () => {
    const payload = validateSimulationPayload({
      initial: "1000",
      monthly: 200,
      years: 10,
      annualPct: 8,
      reinvest: true,
      compounding: "monthly",
    })

    expect(payload).toEqual({
      ok: false,
      errors: ["invalid_payload"],
    })
  })
})

describe("createSimulationResponse", () => {
  it("returns a successful API response for valid payloads", () => {
    const response = createSimulationResponse({
      initial: 0,
      monthly: 250,
      years: 5,
      annualPct: 7,
      reinvest: true,
      compounding: "monthly",
      startDate: "2026-03-18",
    })

    expect(response.ok).toBe(true)
    if (response.ok) {
      expect(response.data.totalContrib).toBeGreaterThan(0)
      expect(response.data.rows).toHaveLength(60)
    }
  })

  it("returns validation errors for invalid payloads", () => {
    const response = createSimulationResponse({
      initial: -1,
      monthly: 250,
      years: 5,
      annualPct: 7,
      reinvest: true,
      compounding: "monthly",
    })

    expect(response).toEqual({
      ok: false,
      errors: ["initial_negative"],
    })
  })
})
