import type { Scenario, SimulationRow } from "@/packages/shared/types"

export const fmtCurrency = (value: number): string =>
  new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value)

export const toLocalDateInputValue = (date: Date = new Date()) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 10)
}

export const fmtMonth = (index: number, start: Date = new Date()): string => {
  const date = new Date(start.getFullYear(), start.getMonth() + (index - 1), start.getDate())
  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

export function toCSV(rows: SimulationRow[], scenarios: Scenario[]) {
  if (!rows.length) return ""

  const header = [
    "Simulare Investitii - Export Raport",
    `Data: ${new Date().toLocaleDateString("ro-RO")}`,
    "",
  ]
  const scenarioLines = [
    "SCENARII:",
    ...scenarios.map(
      (scenario) =>
        `${scenario.name},Initial: EUR${scenario.initial},Lunar: EUR${scenario.monthly},Ani: ${scenario.years},Randament: ${scenario.annualPct}%`
    ),
    "",
  ]
  const headers = Object.keys(rows[0]) as (keyof SimulationRow)[]
  const table = [
    headers.join(","),
    ...rows.map((row) => headers.map((headerName) => String(row[headerName] ?? "")).join(",")),
  ]

  return [...header, ...scenarioLines, ...table].join("\n")
}
