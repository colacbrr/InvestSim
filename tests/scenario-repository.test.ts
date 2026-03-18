import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"

import { afterEach, describe, expect, it } from "vitest"

import { FileScenarioRepository } from "@/lib/server/file-scenario-repository"
import { buildScenarioSummary } from "@/lib/server/scenario-repository"

const tempDirs: string[] = []

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true }))
  )
})

async function createRepository() {
  const dir = await mkdtemp(path.join(tmpdir(), "investsim-repo-"))
  tempDirs.push(dir)
  return new FileScenarioRepository(path.join(dir, "scenarios.json"))
}

describe("buildScenarioSummary", () => {
  it("derives a stable summary from a simulation payload", () => {
    const summary = buildScenarioSummary({
      userId: "user-1",
      title: "Growth",
      color: "#3b82f6",
      simulation: {
        initial: 1000,
        monthly: 250,
        years: 10,
        annualPct: 8,
        reinvest: true,
        compounding: "monthly",
      },
      startDate: "2026-03-18",
    })

    expect(summary.years).toBe(10)
    expect(summary.compounding).toBe("monthly")
    expect(summary.finalValue).toBeGreaterThan(summary.totalContrib)
  })
})

describe("FileScenarioRepository", () => {
  it("saves and lists scenarios with a current version", async () => {
    const repository = await createRepository()

    const saved = await repository.saveScenario({
      userId: "user-1",
      title: "Balanced 20y",
      color: "#10b981",
      simulation: {
        initial: 5000,
        monthly: 400,
        years: 20,
        annualPct: 6,
        reinvest: true,
        compounding: "monthly",
      },
      startDate: "2026-03-18",
    })

    const scenarios = await repository.listScenarios("user-1")

    expect(saved.version.versionNumber).toBe(1)
    expect(scenarios).toHaveLength(1)
    expect(scenarios[0].scenario.id).toBe(saved.scenario.id)
    expect(scenarios[0].version.summary.years).toBe(20)
  })

  it("creates a new immutable version on update", async () => {
    const repository = await createRepository()

    const created = await repository.saveScenario({
      userId: "user-1",
      title: "Starter",
      color: "#3b82f6",
      simulation: {
        initial: 0,
        monthly: 200,
        years: 10,
        annualPct: 8,
        reinvest: true,
        compounding: "monthly",
      },
    })

    const updated = await repository.saveScenario({
      scenarioId: created.scenario.id,
      userId: "user-1",
      title: "Starter Updated",
      color: "#3b82f6",
      simulation: {
        initial: 0,
        monthly: 300,
        years: 10,
        annualPct: 8,
        reinvest: true,
        compounding: "monthly",
      },
    })

    const versions = await repository.listScenarioVersions(created.scenario.id, "user-1")

    expect(updated.version.versionNumber).toBe(2)
    expect(versions).toHaveLength(2)
    expect(versions[0].summary.monthly).toBe(300)
    expect(versions[1].summary.monthly).toBe(200)
  })
})
