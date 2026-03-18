import type {
  SaveScenarioInput,
  ScenarioWithVersion,
  SimulationApiResponse,
  SimulationRequest,
  SimulationResult,
} from "@/packages/shared/types"

export async function postSimulation(request: SimulationRequest): Promise<SimulationResult> {
  const response = await fetch("/api/simulate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  })

  const payload = (await response.json()) as SimulationApiResponse

  if (!response.ok || !payload.ok) {
    throw new Error(payload.ok ? "simulation_failed" : payload.errors.join(","))
  }

  return payload.data
}

export async function listSavedScenarios(): Promise<ScenarioWithVersion[]> {
  const response = await fetch("/api/scenarios")
  const payload = (await response.json()) as { ok: boolean; data?: ScenarioWithVersion[] }

  if (!response.ok || !payload.ok || !payload.data) {
    throw new Error("scenario_list_failed")
  }

  return payload.data
}

export async function createSavedScenario(
  request: Omit<SaveScenarioInput, "userId">
): Promise<ScenarioWithVersion> {
  const response = await fetch("/api/scenarios", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  })

  const payload = (await response.json()) as { ok: boolean; data?: ScenarioWithVersion }

  if (!response.ok || !payload.ok || !payload.data) {
    throw new Error("scenario_create_failed")
  }

  return payload.data
}

export async function deleteSavedScenario(scenarioId: string): Promise<void> {
  const response = await fetch(`/api/scenarios/${scenarioId}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("scenario_delete_failed")
  }
}
