import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { randomUUID } from "node:crypto"

import type {
  SaveScenarioInput,
  ScenarioRecord,
  ScenarioVersionRecord,
  ScenarioWithVersion,
} from "@/packages/shared/types"

import {
  buildScenarioDocumentPayload,
  buildScenarioSummary,
  type ScenarioRepository,
} from "@/lib/server/scenario-repository"

type ScenarioStoreFile = {
  scenarios: ScenarioRecord[]
  versions: ScenarioVersionRecord[]
}

const EMPTY_STORE: ScenarioStoreFile = {
  scenarios: [],
  versions: [],
}

export class FileScenarioRepository implements ScenarioRepository {
  constructor(private readonly filePath: string) {}

  private async readStore(): Promise<ScenarioStoreFile> {
    try {
      const raw = await readFile(this.filePath, "utf8")
      return JSON.parse(raw) as ScenarioStoreFile
    } catch {
      return { ...EMPTY_STORE }
    }
  }

  private async writeStore(store: ScenarioStoreFile) {
    await mkdir(path.dirname(this.filePath), { recursive: true })
    await writeFile(this.filePath, JSON.stringify(store, null, 2), "utf8")
  }

  async listScenarios(userId: string): Promise<ScenarioWithVersion[]> {
    const store = await this.readStore()
    return store.scenarios
      .filter((scenario) => scenario.userId === userId && scenario.archivedAt === null)
      .map((scenario) => {
        const version = store.versions.find((entry) => entry.id === scenario.latestVersionId)
        if (!version) {
          throw new Error(`Missing latest version ${scenario.latestVersionId} for scenario ${scenario.id}`)
        }
        return { scenario, version }
      })
      .sort((a, b) => b.scenario.updatedAt.localeCompare(a.scenario.updatedAt))
  }

  async getScenario(scenarioId: string, userId: string): Promise<ScenarioWithVersion | null> {
    const store = await this.readStore()
    const scenario = store.scenarios.find((entry) => entry.id === scenarioId && entry.userId === userId)
    if (!scenario) return null

    const version = store.versions.find((entry) => entry.id === scenario.latestVersionId)
    if (!version) return null

    return { scenario, version }
  }

  async saveScenario(input: SaveScenarioInput): Promise<ScenarioWithVersion> {
    const store = await this.readStore()
    const now = new Date().toISOString()
    const existingScenario = input.scenarioId
      ? store.scenarios.find((entry) => entry.id === input.scenarioId && entry.userId === input.userId)
      : undefined

    const scenarioId = existingScenario?.id ?? randomUUID()
    const existingVersions = store.versions.filter((entry) => entry.scenarioId === scenarioId)
    const nextVersionNumber =
      existingVersions.reduce((max, entry) => Math.max(max, entry.versionNumber), 0) + 1

    const version: ScenarioVersionRecord = {
      id: randomUUID(),
      scenarioId,
      versionNumber: nextVersionNumber,
      schemaVersion: 1,
      source: input.source ?? "manual_edit",
      payload: buildScenarioDocumentPayload(input),
      summary: buildScenarioSummary(input),
      createdByUserId: input.userId,
      createdAt: now,
    }

    const scenario: ScenarioRecord = existingScenario
      ? {
          ...existingScenario,
          title: input.title,
          color: input.color,
          latestVersionId: version.id,
          updatedAt: now,
        }
      : {
          id: scenarioId,
          userId: input.userId,
          title: input.title,
          color: input.color,
          archivedAt: null,
          isFavorite: false,
          latestVersionId: version.id,
          createdAt: now,
          updatedAt: now,
          lastOpenedAt: null,
        }

    const nextStore: ScenarioStoreFile = {
      scenarios: existingScenario
        ? store.scenarios.map((entry) => (entry.id === scenario.id ? scenario : entry))
        : [...store.scenarios, scenario],
      versions: [...store.versions, version],
    }

    await this.writeStore(nextStore)
    return { scenario, version }
  }

  async listScenarioVersions(scenarioId: string, userId: string): Promise<ScenarioVersionRecord[]> {
    const store = await this.readStore()
    const scenario = store.scenarios.find((entry) => entry.id === scenarioId && entry.userId === userId)
    if (!scenario) return []

    return store.versions
      .filter((entry) => entry.scenarioId === scenarioId)
      .sort((a, b) => b.versionNumber - a.versionNumber)
  }

  async archiveScenario(scenarioId: string, userId: string): Promise<boolean> {
    const store = await this.readStore()
    const scenario = store.scenarios.find((entry) => entry.id === scenarioId && entry.userId === userId)
    if (!scenario) return false

    const archivedAt = new Date().toISOString()
    const nextStore: ScenarioStoreFile = {
      ...store,
      scenarios: store.scenarios.map((entry) =>
        entry.id === scenarioId ? { ...entry, archivedAt, updatedAt: archivedAt } : entry
      ),
    }

    await this.writeStore(nextStore)
    return true
  }
}

const defaultStorePath = path.join(process.cwd(), ".local-data", "scenarios.json")

export const fileScenarioRepository = new FileScenarioRepository(defaultStorePath)
