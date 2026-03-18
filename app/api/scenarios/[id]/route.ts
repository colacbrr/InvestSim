import { NextResponse } from "next/server"

import { fileScenarioRepository } from "@/lib/server/file-scenario-repository"
import { DEFAULT_LOCAL_USER_ID } from "@/lib/server/scenario-repository"
import { validateSimulationPayload } from "@/lib/simulation/validation"

export const runtime = "nodejs"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params
  const scenario = await fileScenarioRepository.getScenario(id, DEFAULT_LOCAL_USER_ID)

  if (!scenario) {
    return NextResponse.json({ ok: false, errors: ["not_found"] }, { status: 404 })
  }

  return NextResponse.json({ ok: true, data: scenario })
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params
  const existing = await fileScenarioRepository.getScenario(id, DEFAULT_LOCAL_USER_ID)
  if (!existing) {
    return NextResponse.json({ ok: false, errors: ["not_found"] }, { status: 404 })
  }

  let payload: unknown

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, errors: ["invalid_json"] }, { status: 400 })
  }

  if (typeof payload !== "object" || payload === null) {
    return NextResponse.json({ ok: false, errors: ["invalid_payload"] }, { status: 400 })
  }

  const candidate = payload as Record<string, unknown>
  const simulation = validateSimulationPayload(candidate.simulation)
  if (!simulation.ok) {
    return NextResponse.json({ ok: false, errors: simulation.errors }, { status: 400 })
  }

  const saved = await fileScenarioRepository.saveScenario({
    scenarioId: id,
    userId: DEFAULT_LOCAL_USER_ID,
    title: typeof candidate.title === "string" ? candidate.title : existing.scenario.title,
    color: typeof candidate.color === "string" ? candidate.color : existing.scenario.color,
    note: typeof candidate.note === "string" ? candidate.note : existing.version.payload.scenario.note,
    simulation: simulation.data,
    startDate:
      typeof candidate.startDate === "string"
        ? candidate.startDate
        : existing.version.payload.ui.startDate,
    source: "manual_edit",
  })

  return NextResponse.json({ ok: true, data: saved })
}

export async function DELETE(_: Request, context: RouteContext) {
  const { id } = await context.params
  const archived = await fileScenarioRepository.archiveScenario(id, DEFAULT_LOCAL_USER_ID)

  if (!archived) {
    return NextResponse.json({ ok: false, errors: ["not_found"] }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
