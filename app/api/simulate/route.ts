import { NextResponse } from "next/server"

import { createSimulationResponse } from "@/lib/simulation/service"

export async function POST(request: Request) {
  let payload: unknown

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json(
      {
        ok: false,
        errors: ["invalid_json"],
      },
      { status: 400 }
    )
  }

  const response = createSimulationResponse(payload)
  const status = response.ok ? 200 : 400

  return NextResponse.json(response, { status })
}
