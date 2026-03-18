import { NextResponse } from "next/server"

import { fileScenarioRepository } from "@/lib/server/file-scenario-repository"
import { DEFAULT_LOCAL_USER_ID } from "@/lib/server/scenario-repository"

export const runtime = "nodejs"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params
  const versions = await fileScenarioRepository.listScenarioVersions(id, DEFAULT_LOCAL_USER_ID)
  return NextResponse.json({ ok: true, data: versions })
}
