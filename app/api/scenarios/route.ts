import { NextResponse } from "next/server"

import { fileScenarioRepository } from "@/lib/server/file-scenario-repository"
import { DEFAULT_LOCAL_USER_ID } from "@/lib/server/scenario-repository"
import { validateSimulationPayload } from "@/lib/simulation/validation"

export const runtime = "nodejs"

export async function GET() {
  const scenarios = await fileScenarioRepository.listScenarios(DEFAULT_LOCAL_USER_ID)
  return NextResponse.json({ ok: true, data: scenarios })
}

export async function POST(request: Request) {
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
  if (typeof candidate.title !== "string" || typeof candidate.color !== "string") {
    return NextResponse.json({ ok: false, errors: ["invalid_payload"] }, { status: 400 })
  }

  const simulation = validateSimulationPayload(candidate.simulation)
  if (!simulation.ok) {
    return NextResponse.json({ ok: false, errors: simulation.errors }, { status: 400 })
  }

  const saved = await fileScenarioRepository.saveScenario({
    userId: DEFAULT_LOCAL_USER_ID,
    title: candidate.title,
    color: candidate.color,
    note: typeof candidate.note === "string" ? candidate.note : undefined,
    simulation: simulation.data,
    startDate: typeof candidate.startDate === "string" ? candidate.startDate : undefined,
    source: "manual_edit",
  })

  return NextResponse.json({ ok: true, data: saved }, { status: 201 })
}
