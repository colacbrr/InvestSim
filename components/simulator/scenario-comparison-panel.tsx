"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ArrowDown, ArrowUp, Copy, PieChart, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Scenario, SimulationResult } from "@/packages/shared/types"

type ScenarioComparisonMessages = {
  title: string
  hide: string
  compare: string
  importJson: string
  exportJson: string
  loading: string
  loadingHelp: string
  error: string
  noneSaved: string
  noneSavedHelp: string
  saveFirst: string
  monthly: string
  duration: string
  return: string
  inflation: string
  roi: string
  deleteScenario: string
  duplicateScenario: string
  moveUp: string
  moveDown: string
  loadScenario: string
  comparisonTitle: string
  initialLabel: string
  table: {
    scenario: string
    contributions: string
    gains: string
    finalValue: string
    roi: string
  }
}

type ScenarioWithResult = Scenario & SimulationResult

type ScenarioComparisonPanelProps = {
  scenarios: Scenario[]
  scenarioResults: ScenarioWithResult[]
  activeScenario: string | null
  showComparison: boolean
  isLoading: boolean
  loadError: string | null
  onToggleComparison: () => void
  onAddScenario: () => void
  onRemoveScenario: (id: string) => void
  onDuplicateScenario: (id: string) => void
  onMoveScenarioUp: (id: string) => void
  onMoveScenarioDown: (id: string) => void
  onLoadScenario: (scenario: Scenario) => void
  inputErrorsCount: number
  fmtCurrency: (value: number) => string
  yearsLabel: string
  inflationFallbackPct: number
  onExportJson: () => void
  onImportJson: () => void
  messages: ScenarioComparisonMessages
}

export function ScenarioComparisonPanel({
  scenarios,
  scenarioResults,
  activeScenario,
  showComparison,
  isLoading,
  loadError,
  onToggleComparison,
  onAddScenario,
  onRemoveScenario,
  onDuplicateScenario,
  onMoveScenarioUp,
  onMoveScenarioDown,
  onLoadScenario,
  inputErrorsCount,
  fmtCurrency,
  yearsLabel,
  inflationFallbackPct,
  onExportJson,
  onImportJson,
  messages,
}: ScenarioComparisonPanelProps) {
  return (
    <section id="scenarios">
      <Card className="overflow-hidden rounded-2xl border-0 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-indigo-600" /> {messages.title}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onToggleComparison} disabled={scenarios.length === 0}>
                {showComparison ? messages.hide : messages.compare} ({scenarios.length})
              </Button>
              <Button variant="outline" onClick={onImportJson}>
                {messages.importJson}
              </Button>
              <Button variant="outline" onClick={onExportJson} disabled={scenarios.length === 0}>
                {messages.exportJson}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {scenarios.length === 0 ? (
            <div className="py-12 text-center">
              <PieChart className="mx-auto mb-4 h-16 w-16 text-slate-300" />
              <h3 className="mb-2 text-lg font-semibold text-slate-600 dark:text-slate-400">{messages.noneSaved}</h3>
              <p className="mb-4 text-sm text-slate-500">{messages.noneSavedHelp}</p>
              <Button onClick={onAddScenario} disabled={inputErrorsCount > 0} className="gap-2">
                <Plus className="h-4 w-4" /> {messages.saveFirst}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {isLoading && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                  <div className="font-semibold">{messages.loading}</div>
                  <div className="mt-1 text-xs">{messages.loadingHelp}</div>
                </div>
              )}
              {loadError && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                  {messages.error}: {loadError}
                </div>
              )}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {scenarios.map((scenario) => {
                  const result = scenarioResults.find((entry) => entry.id === scenario.id)

                  return (
                    <div
                      key={scenario.id}
                      className="relative rounded-xl border-2 border-slate-200 p-4 transition-all duration-200 hover:shadow-lg dark:border-slate-700"
                      style={{ borderColor: activeScenario === scenario.id ? scenario.color : undefined }}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="size-3 rounded-full" style={{ backgroundColor: scenario.color }} />
                          <h4 className="text-sm font-semibold">{scenario.name}</h4>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => onRemoveScenario(scenario.id)}
                          className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                          aria-label={messages.deleteScenario}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="mb-3 flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => onDuplicateScenario(scenario.id)}
                          className="h-7 w-7 p-0"
                          aria-label={messages.duplicateScenario}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => onMoveScenarioUp(scenario.id)}
                          className="h-7 w-7 p-0"
                          aria-label={messages.moveUp}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => onMoveScenarioDown(scenario.id)}
                          className="h-7 w-7 p-0"
                          aria-label={messages.moveDown}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">{messages.initialLabel}:</span>
                          <span className="font-medium">{fmtCurrency(scenario.initial)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">{messages.monthly}:</span>
                          <span className="font-medium">{fmtCurrency(scenario.monthly)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">{messages.duration}:</span>
                          <span className="font-medium">
                            {scenario.years} {yearsLabel}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">{messages.return}:</span>
                          <span className="font-medium">{scenario.annualPct}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">{messages.inflation}:</span>
                          <span className="font-medium">{scenario.inflationPct ?? inflationFallbackPct}%</span>
                        </div>
                      </div>

                      {result && (
                        <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-600">
                          <div className="text-lg font-bold" style={{ color: scenario.color }}>
                            {fmtCurrency(result.totalValue)}
                          </div>
                          <div className="text-xs text-slate-500">
                            {messages.roi}: {result.yieldPct.toFixed(1)}%
                          </div>
                        </div>
                      )}

                      <Button variant="outline" className="mt-3 w-full" onClick={() => onLoadScenario(scenario)}>
                        {messages.loadScenario}
                      </Button>
                    </div>
                  )
                })}
              </div>

              {showComparison && scenarioResults.length > 0 && (
                <div className="mt-8">
                  <h4 className="mb-4 text-lg font-semibold">{messages.comparisonTitle}</h4>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={scenarioResults}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tickFormatter={(v: number) => fmtCurrency(v)} tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(v: number) => fmtCurrency(v)}
                          contentStyle={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12 }}
                        />
                        <Bar dataKey="totalValue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 text-left">{messages.table.scenario}</th>
                          <th className="py-2 text-right">{messages.table.contributions}</th>
                          <th className="py-2 text-right">{messages.table.gains}</th>
                          <th className="py-2 text-right">{messages.table.finalValue}</th>
                          <th className="py-2 text-right">{messages.table.roi}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scenarioResults.map((result) => (
                          <tr key={result.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                            <td className="py-2">
                              <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full" style={{ backgroundColor: result.color }} />
                                {result.name}
                              </div>
                            </td>
                            <td className="py-2 text-right">{fmtCurrency(result.totalContrib)}</td>
                            <td className="py-2 text-right text-green-600">{fmtCurrency(result.totalGains)}</td>
                            <td className="py-2 text-right font-bold">{fmtCurrency(result.totalValue)}</td>
                            <td className="py-2 text-right">{result.yieldPct.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
