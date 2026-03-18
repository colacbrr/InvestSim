"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { BarChart3 } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { SimulationRow } from "@/packages/shared/types"

type ChartType = "area" | "line" | "bar"

type ChartsMessages = {
  title: string
  area: string
  line: string
  bar: string
  investingMonths: string
  excellent: string
  positive: string
  caution: string
  finalMonthlyGain: string
  inflationEdge: string
  legendTitle: string
  legendTotal: string
  legendContrib: string
  legendGains: string
  legendMonthlyGain: string
  legendTotalHelpReinvest: string
  legendTotalHelpWithdraw: string
  legendContribHelp: string
  legendGainsHelp: string
  legendMonthlyGainHelp: string
  series: {
    totalValue: string
    totalContrib: string
    totalGains: string
    monthlyGain: string
  }
}

type ChartsPanelProps = {
  rows: SimulationRow[]
  chartType: ChartType
  onChartTypeChange: (value: ChartType) => void
  fmtCurrency: (value: number) => string
  months: number
  totalGains: number
  totalContrib: number
  annualPct: number
  years: number
  reinvest: boolean
  messages: ChartsMessages
}

export function ChartsPanel({
  rows,
  chartType,
  onChartTypeChange,
  fmtCurrency,
  months,
  totalGains,
  totalContrib,
  annualPct,
  years,
  reinvest,
  messages,
}: ChartsPanelProps) {
  const seriesLabels = {
    "Valoare totală": messages.series.totalValue,
    "Contribuții cumulate": messages.series.totalContrib,
    "Câștiguri cumulate": messages.series.totalGains,
    "Câștig lunar": messages.series.monthlyGain,
  } as const

  const commonTooltipProps = {
    formatter: (value: number, name: string) => [fmtCurrency(value), seriesLabels[name as keyof typeof seriesLabels] ?? name],
    labelFormatter: (label: string) => label,
    contentStyle: {
      background: "white",
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1)",
    },
  }

  return (
    <section id="chart">
      <Card className="overflow-hidden rounded-2xl border-0 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-purple-50 dark:from-slate-800 dark:to-slate-700">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" /> {messages.title}
            </div>
            <div className="flex items-center gap-2">
              <Select value={chartType} onValueChange={(value) => onChartTypeChange(value as ChartType)}>
                <div className="w-32">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </div>
                <SelectContent>
                  <SelectItem value="area">{messages.area}</SelectItem>
                  <SelectItem value="line">{messages.line}</SelectItem>
                  <SelectItem value="bar">{messages.bar}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[500px] md:h-[600px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "area" ? (
                <AreaChart data={rows}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="colorContrib" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="colorGainsCum" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-700" />
                  <XAxis dataKey="luna" tick={{ fontSize: 12 }} stroke="#64748b" />
                  <YAxis tickFormatter={(v: number) => fmtCurrency(v)} tick={{ fontSize: 12 }} stroke="#64748b" />
                  <Tooltip {...commonTooltipProps} />
                  <Legend />
                  <Area type="monotone" dataKey="Valoare totală" name={messages.series.totalValue} stroke="#3b82f6" strokeWidth={2} fill="url(#colorTotal)" />
                  <Area type="monotone" dataKey="Contribuții cumulate" name={messages.series.totalContrib} stroke="#10b981" strokeWidth={2} fill="url(#colorContrib)" />
                  <Area type="monotone" dataKey="Câștiguri cumulate" name={messages.series.totalGains} stroke="#f59e0b" strokeWidth={2} fill="url(#colorGainsCum)" />
                </AreaChart>
              ) : chartType === "line" ? (
                <LineChart data={rows}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-700" />
                  <XAxis dataKey="luna" tick={{ fontSize: 12 }} stroke="#64748b" />
                  <YAxis tickFormatter={(v: number) => fmtCurrency(v)} tick={{ fontSize: 12 }} stroke="#64748b" />
                  <Tooltip {...commonTooltipProps} />
                  <Legend />
                  <Line type="monotone" dataKey="Valoare totală" name={messages.series.totalValue} stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6", strokeWidth: 2, r: 3 }} />
                  <Line type="monotone" dataKey="Contribuții cumulate" name={messages.series.totalContrib} stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", strokeWidth: 2, r: 3 }} />
                  <Line type="monotone" dataKey="Câștiguri cumulate" name={messages.series.totalGains} stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b", strokeWidth: 2, r: 3 }} />
                  <Line type="monotone" dataKey="Câștig lunar" name={messages.series.monthlyGain} stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 3 }} />
                </LineChart>
              ) : (
                <BarChart data={rows}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-700" />
                  <XAxis dataKey="luna" tick={{ fontSize: 12 }} stroke="#64748b" />
                  <YAxis tickFormatter={(v: number) => fmtCurrency(v)} tick={{ fontSize: 12 }} stroke="#64748b" />
                  <Tooltip {...commonTooltipProps} />
                  <Legend />
                  <Bar dataKey="Contribuții cumulate" name={messages.series.totalContrib} fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Câștiguri cumulate" name={messages.series.totalGains} fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{months}</div>
              <div className="text-xs text-slate-500">{messages.investingMonths}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {totalGains > totalContrib ? "📈" : totalGains > 0 ? "📊" : "📉"}
              </div>
              <div className="text-xs text-slate-500">
                {totalGains > totalContrib ? messages.excellent : totalGains > 0 ? messages.positive : messages.caution}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {rows.length > 0 ? fmtCurrency(rows[rows.length - 1]["Câștig lunar"]) : "€0"}
              </div>
              <div className="text-xs text-slate-500">{messages.finalMonthlyGain}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{((annualPct - 2) * years).toFixed(0)}%</div>
              <div className="text-xs text-slate-500">{messages.inflationEdge}</div>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
            <h4 className="mb-2 text-sm font-bold">{messages.legendTitle}</h4>
            <div className="grid grid-cols-1 gap-2 text-xs md:grid-cols-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-blue-600" />
                <span>
                  <strong>{messages.legendTotal}:</strong>{" "}
                  {reinvest ? messages.legendTotalHelpReinvest : messages.legendTotalHelpWithdraw}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-green-600" />
                <span>
                  <strong>{messages.legendContrib}:</strong> {messages.legendContribHelp}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-yellow-600" />
                <span>
                  <strong>{messages.legendGains}:</strong> {messages.legendGainsHelp}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-purple-600" />
                <span>
                  <strong>{messages.legendMonthlyGain}:</strong> {messages.legendMonthlyGainHelp}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
