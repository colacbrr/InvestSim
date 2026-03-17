"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  BarChart,
  Bar,
} from "recharts"
import {
  Calculator,
  TrendingUp,
  Download,
  Menu,
  BarChart3,
  Settings,
  FileText,
  DollarSign,
  Target,
  Calendar,
  Percent,
  AlertCircle,
  CheckCircle,
  Copy,
  RefreshCw,
  PieChart,
  X,
  Plus,
  Trash2,
  Rocket,
} from "lucide-react"
import { fmtCurrency, toCSV, toLocalDateInputValue } from "@/lib/simulation/format"
import { simulate } from "@/lib/simulation/engine"
import { computeIRRFromRows } from "@/lib/simulation/irr"
import {
  calculateFireNumber,
  calculateSupportedAnnualIncome,
  solveMonthlyContributionForTarget,
  solveYearsToTarget,
} from "@/lib/simulation/solvers"
import { validateInputs } from "@/lib/simulation/validation"
import type { CompoundingMode, Scenario } from "@/packages/shared/types"

const STORAGE_KEY = "investsim:simulator:v1"
type ChartType = "area" | "line" | "bar"

type PersistedSimulatorState = {
  initial: number
  monthly: number
  years: number
  annualPct: number
  reinvest: boolean
  compounding: CompoundingMode
  annualFeePct: number
  inflationPct: number
  stepUpAnnualPct: number
  taxOnWithdrawPct: number
  notes: string
  scenarios: Scenario[]
  startDate: string
  targetAmount: number
  monthlyExpenses: number
  safeWithdrawalRate: number
  delayYears: number
}

const defaultSimulatorState: PersistedSimulatorState = {
  initial: 0,
  monthly: 200,
  years: 10,
  annualPct: 8,
  reinvest: true,
  compounding: "monthly",
  annualFeePct: 0,
  inflationPct: 2.5,
  stepUpAnnualPct: 0,
  taxOnWithdrawPct: 10,
  notes: "",
  scenarios: [],
  startDate: toLocalDateInputValue(),
  targetAmount: 100_000,
  monthlyExpenses: 1_500,
  safeWithdrawalRate: 4,
  delayYears: 3,
}

function loadInitialState(): PersistedSimulatorState {
  if (typeof window === "undefined") return defaultSimulatorState

  try {
    const rawState = window.localStorage.getItem(STORAGE_KEY)
    if (!rawState) return defaultSimulatorState

    const savedState = JSON.parse(rawState) as Partial<PersistedSimulatorState>

    return {
      ...defaultSimulatorState,
      ...savedState,
      scenarios: Array.isArray(savedState.scenarios)
        ? savedState.scenarios
        : defaultSimulatorState.scenarios,
      startDate:
        typeof savedState.startDate === "string" && savedState.startDate.length > 0
          ? savedState.startDate
          : defaultSimulatorState.startDate,
    }
  } catch (error) {
    console.error("Nu s-a putut incarca starea simulatorului:", error)
    return defaultSimulatorState
  }
}

/* ====================== Mobile Drawer Component ====================== */
function MobileDrawer({
  open,
  onClose,
  children,
}: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (open) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", onKey)
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKey)
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal>
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed left-0 top-0 h-full w-72 bg-white dark:bg-slate-950 shadow-xl" aria-label="Meniu lateral">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-lg font-semibold">Meniu</h3>
          <Button variant="outline" onClick={onClose} aria-label="Închide meniul">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}

/* ====================== App ====================== */
export default function App() {
  const [initialState] = useState<PersistedSimulatorState>(() => loadInitialState())

  // State principal (initial poate fi 0 OBLIGATORIU)
  const [initial, setInitial] = useState(initialState.initial)
  const [monthly, setMonthly] = useState(initialState.monthly)
  const [years, setYears] = useState(initialState.years)
  const [annualPct, setAnnualPct] = useState(initialState.annualPct)
  const [reinvest, setReinvest] = useState(initialState.reinvest)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [compounding, setCompounding] = useState<CompoundingMode>(initialState.compounding)
  const [annualFeePct, setAnnualFeePct] = useState(initialState.annualFeePct)
  const [inflationPct, setInflationPct] = useState(initialState.inflationPct)
  const [stepUpAnnualPct, setStepUpAnnualPct] = useState(initialState.stepUpAnnualPct)
  const [taxOnWithdrawPct, setTaxOnWithdrawPct] = useState(initialState.taxOnWithdrawPct)
  const [showErrors, setShowErrors] = useState(false)
  const isCalculating = false
  const [chartType, setChartType] = useState<ChartType>("area")
  const [scenarios, setScenarios] = useState<Scenario[]>(initialState.scenarios)
  const [activeScenario, setActiveScenario] = useState<string | null>(null)
  const [notes, setNotes] = useState(initialState.notes)
  const [showComparison, setShowComparison] = useState(false)
  const [startDate, setStartDate] = useState<string>(initialState.startDate)
  const [targetAmount, setTargetAmount] = useState(initialState.targetAmount)
  const [monthlyExpenses, setMonthlyExpenses] = useState(initialState.monthlyExpenses)
  const [safeWithdrawalRate, setSafeWithdrawalRate] = useState(initialState.safeWithdrawalRate)
  const [delayYears, setDelayYears] = useState(initialState.delayYears)

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          initial,
          monthly,
          years,
          annualPct,
          reinvest,
          compounding,
          annualFeePct,
          inflationPct,
          stepUpAnnualPct,
          taxOnWithdrawPct,
          notes,
          scenarios,
          startDate,
          targetAmount,
          monthlyExpenses,
          safeWithdrawalRate,
          delayYears,
        })
      )
    } catch (error) {
      console.error("Nu s-a putut salva starea simulatorului:", error)
    }
  }, [
    initial,
    monthly,
    years,
    annualPct,
    reinvest,
    compounding,
    annualFeePct,
    inflationPct,
    stepUpAnnualPct,
    taxOnWithdrawPct,
    notes,
    scenarios,
    startDate,
    targetAmount,
    monthlyExpenses,
    safeWithdrawalRate,
    delayYears,
  ])

  // Handlers cu validare
  const handleInitialChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Math.max(0, Number(e.target.value) || 0)
      setInitial(val)
      if (showErrors) setShowErrors(false)
    },
    [showErrors]
  )

  const handleMonthlyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Math.max(0, Number(e.target.value) || 0)
      setMonthly(val)
      if (showErrors) setShowErrors(false)
    },
    [showErrors]
  )

  const handleAnnualPctChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Math.max(-50, Math.min(50, Number(e.target.value) || 0))
      setAnnualPct(val)
      if (showErrors) setShowErrors(false)
    },
    [showErrors]
  )

  // Validare inputs
  const inputErrors = useMemo(
    () => validateInputs(initial, monthly, years, annualPct),
    [initial, monthly, years, annualPct]
  )

  const simulationOptions = useMemo(
    () => ({
      reinvest,
      startDate: new Date(startDate),
      compounding,
      annualFeePct,
      inflationPct,
      stepUpAnnualPct,
      taxOnWithdrawPct,
    }),
    [reinvest, startDate, compounding, annualFeePct, inflationPct, stepUpAnnualPct, taxOnWithdrawPct]
  )

  // Simulare
  const months = years * 12
  const simulationResult = useMemo(() => {
    if (inputErrors.length > 0) return null
    return simulate(initial, monthly, months, annualPct / 100, simulationOptions)
  }, [initial, monthly, months, annualPct, inputErrors, simulationOptions])

  const { rows = [], totalValue = 0, totalContrib = 0, totalGains = 0, yieldPct = 0 } =
    simulationResult || {}

  // IRR anual (TIR)
  const irrAnnual = useMemo(() => {
    if (!simulationResult) return null
    return computeIRRFromRows(rows, {
      initial,
      monthly,
      months,
      reinvest,
      totalValue,
      totalContrib,
    })
  }, [rows, initial, monthly, months, reinvest, totalValue, totalContrib, simulationResult])

  // Export CSV
  const handleExport = useCallback(() => {
    if (!rows.length) return
    const csv = toCSV(rows, scenarios)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `simulare-investitii-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [rows, scenarios])

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: "smooth", block: "start" })
    setSidebarOpen(false)
  }, [])

  const addScenario = useCallback(() => {
    if (inputErrors.length > 0) return
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]
    const newScenario: Scenario = {
      id: Date.now().toString(),
      name: `Scenariul ${scenarios.length + 1}`,
      initial,
      monthly,
      years,
      annualPct,
      color: colors[scenarios.length % colors.length],
      reinvest,
      compounding,
      annualFeePct,
      inflationPct,
      stepUpAnnualPct,
      taxOnWithdrawPct,
    }
    setScenarios((prev) => [...prev, newScenario])
  }, [
    initial,
    monthly,
    years,
    annualPct,
    scenarios.length,
    inputErrors,
    reinvest,
    compounding,
    annualFeePct,
    inflationPct,
    stepUpAnnualPct,
    taxOnWithdrawPct,
  ])

  const removeScenario = useCallback(
    (id: string) => {
      setScenarios((prev) => prev.filter((s) => s.id !== id))
      if (activeScenario === id) setActiveScenario(null)
    },
    [activeScenario]
  )

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error("Nu s-a putut copia în clipboard:", err)
    }
  }, [])

  const resetAll = useCallback(() => {
    setInitial(0)
    setMonthly(200)
    setYears(10)
    setAnnualPct(8)
    setReinvest(true)
    setCompounding("monthly")
    setAnnualFeePct(0)
    setInflationPct(2.5)
    setStepUpAnnualPct(0)
    setTaxOnWithdrawPct(10)
    setScenarios([])
    setNotes("")
    setActiveScenario(null)
    setShowComparison(false)
    setStartDate(toLocalDateInputValue())
    setTargetAmount(100_000)
    setMonthlyExpenses(1_500)
    setSafeWithdrawalRate(4)
    setDelayYears(3)
    setShowErrors(false)
  }, [])

  // Calcul scenarii
  const scenarioResults = useMemo(() => {
    return scenarios.map((scenario) => {
      const result = simulate(
        scenario.initial,
        scenario.monthly,
        scenario.years * 12,
        scenario.annualPct / 100,
        {
          reinvest: scenario.reinvest ?? reinvest,
          startDate: new Date(startDate),
          compounding: scenario.compounding ?? compounding,
          annualFeePct: scenario.annualFeePct ?? annualFeePct,
          inflationPct: scenario.inflationPct ?? inflationPct,
          stepUpAnnualPct: scenario.stepUpAnnualPct ?? stepUpAnnualPct,
          taxOnWithdrawPct: scenario.taxOnWithdrawPct ?? taxOnWithdrawPct,
        }
      )
      return { ...scenario, ...result }
    })
  }, [scenarios, reinvest, startDate, compounding, annualFeePct, inflationPct, stepUpAnnualPct, taxOnWithdrawPct])

  const goalSolver = useMemo(() => {
    if (!simulationResult || inputErrors.length > 0) return null

    const requiredMonthly = solveMonthlyContributionForTarget(
      targetAmount,
      initial,
      months,
      annualPct / 100,
      simulationOptions
    )

    const yearsNeeded = solveYearsToTarget(
      targetAmount,
      initial,
      monthly,
      annualPct / 100,
      simulationOptions
    )

    const fireNumber = calculateFireNumber(monthlyExpenses, safeWithdrawalRate)
    const supportedAnnualIncome = calculateSupportedAnnualIncome(totalValue, safeWithdrawalRate)
    const reachesGoal = totalValue >= targetAmount
    const reachesFire = totalValue >= fireNumber
    const delayedMonths = Math.max(0, months - delayYears * 12)
    const delayedStartValue =
      delayedMonths > 0
        ? simulate(initial, monthly, delayedMonths, annualPct / 100, simulationOptions).totalValue
        : initial
    const delayCost = totalValue - delayedStartValue

    return {
      requiredMonthly,
      yearsNeeded,
      fireNumber,
      supportedAnnualIncome,
      reachesGoal,
      reachesFire,
      delayedStartValue,
      delayCost,
    }
  }, [
    simulationResult,
    inputErrors,
    simulationOptions,
    targetAmount,
    initial,
    months,
    annualPct,
    monthly,
    monthlyExpenses,
    safeWithdrawalRate,
    totalValue,
    delayYears,
  ])

  // Quick-start nudges (îi încurajează să înceapă ACUM)
  const quickStarts = [
    { label: "Începe cu €0 azi", action: () => setInitial(0) },
    { label: "200€/lună", action: () => setMonthly(200) },
    { label: "500€/lună", action: () => setMonthly(500) },
    { label: "Crește durata la 20 ani", action: () => setYears(20) },
  ]

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r bg-white dark:bg-slate-950 shadow-lg">
        {/* Brand */}
        <div className="flex items-center justify-between px-6 py-5 border-b bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-white/20 grid place-items-center backdrop-blur">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">InvestSim Pro</h1>
              <p className="text-[11px] text-blue-200">Financial Planning v2.0</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 text-sm">
          {[
            { id: "params", label: "Configurare", Icon: Settings },
            { id: "summary", label: "Rezultate", Icon: BarChart3 },
            { id: "insights", label: "Instrumente", Icon: Target },
            { id: "chart", label: "Grafice", Icon: TrendingUp },
            { id: "scenarios", label: "Scenarii", Icon: PieChart },
            { id: "assumptions", label: "Note", Icon: FileText },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-all duration-200 hover:shadow-sm"
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Stats quick view */}
        {simulationResult && (
          <div className="px-4 pb-4">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-3 border">
              <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Quick Stats</div>
              <div className="text-sm font-bold text-green-600 dark:text-green-400">{fmtCurrency(totalValue)}</div>
              <div className="text-xs text-slate-500">+{yieldPct.toFixed(1)}% ROI</div>
            </div>
          </div>
        )}
        <div className="px-4 py-3 border-t text-xs text-slate-500 text-center">© 2025 InvestSim Pro v2.0</div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur-md dark:bg-slate-900/95 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                aria-label="Deschide meniu"
                variant="outline"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 grid place-items-center text-white">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold leading-tight">Simulator Investiții</h2>
                  <p className="text-xs text-slate-500">Planificare financiară inteligentă</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {inputErrors.length > 0 && (
                <div className="flex items-center gap-1 text-red-500 text-sm" aria-live="polite">
                  <AlertCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">{inputErrors.length} erori</span>
                </div>
              )}
              {simulationResult && inputErrors.length === 0 && (
                <div className="flex items-center gap-1 text-green-500 text-sm" aria-live="polite">
                  <CheckCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Valid</span>
                </div>
              )}
              <Button variant="outline" className="gap-2" onClick={handleExport} disabled={!rows.length}>
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button variant="outline" className="gap-2" onClick={resetAll}>
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            </div>
          </div>

          {/* Nudge bar pentru a începe acum */}
          {(initial === 0 || monthly === 0) && (
            <div className="max-w-7xl mx-auto px-4 md:px-6 pb-3">
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2 text-sm">
                <Rocket className="w-4 h-4" />
                <span>
                  Începe acum: chiar și cu <strong>€0 capital inițial</strong> și o contribuție mică, timpul lucrează în favoarea ta.
                </span>
                <div className="ml-auto flex gap-2">
                  {quickStarts.map((q) => (
                    <Button key={q.label} size="sm" variant="outline" onClick={q.action}>
                      {q.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Main */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
            {/* Erori validation */}
            {showErrors && inputErrors.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-300 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-semibold">Erori de validare:</span>
                </div>
                <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                  {inputErrors.map((error, i) => (
                    <li key={i} className="flex gap-2">
                      <span>•</span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Parametri */}
            <section id="params">
              <Card className="shadow-lg border">
                <CardHeader className="border-b bg-slate-50 dark:bg-slate-800">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-blue-600" /> Configurare investiție
                    </div>
                    {isCalculating && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Calculez...</span>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Capital inițial */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <Target className="w-4 h-4 text-green-600" /> Capital inițial (poate fi €0)
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          min={0}
                          value={initial}
                          onChange={handleInitialChange}
                          className={`pl-8 h-11 ${inputErrors.some((e) => e.includes("inițial")) ? "border-red-300 focus:border-red-500" : "focus:border-blue-500"}`}
                          placeholder="ex. 1000"
                          aria-label="Capital inițial"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">€</span>
                      </div>
                      <p className="text-xs text-slate-500">Suma inițială de investit (poate fi 0).</p>
                    </div>

                    {/* Contribuție lunară */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" /> Contribuție lunară (min €0)
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          min={0}
                          value={monthly}
                          onChange={handleMonthlyChange}
                          className={`pl-8 h-11 ${inputErrors.some((e) => e.includes("lunară")) ? "border-red-300 focus:border-red-500" : "focus:border-blue-500"}`}
                          placeholder="ex. 200"
                          aria-label="Contribuție lunară"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">€</span>
                      </div>
                      <div className="space-y-2">
                        <Slider value={[monthly]} min={0} max={2000} step={25} onValueChange={(v) => setMonthly(v[0])} />
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>€0</span>
                          <span className="text-blue-600 font-medium">€{monthly}</span>
                          <span>€2,000</span>
                        </div>
                      </div>
                    </div>

                    {/* Durata */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-600" /> Durata investiției
                      </Label>
                      <Select value={String(years)} onValueChange={(v) => setYears(Number(v))}>
                        <SelectTrigger>
                          <div className="h-11 flex items-center w-full">
                            <SelectValue placeholder="Selectează durata" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 3, 5, 10, 15, 20, 25, 30, 40, 50].map((y) => (
                            <SelectItem key={y} value={String(y)}>
                              {y} {y === 1 ? "an" : "ani"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-slate-500">Perioada de investire (1-50 ani)</p>
                    </div>

                    {/* Randament anual */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <Percent className="w-4 h-4 text-yellow-600" /> Randament anual estimat
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          step={0.1}
                          min={-50}
                          max={50}
                          value={annualPct}
                          onChange={handleAnnualPctChange}
                          className={`pr-8 h-11 ${inputErrors.some((e) => e.includes("Randament")) ? "border-red-300 focus:border-red-500" : "focus:border-blue-500"}`}
                          placeholder="ex. 8.0"
                          aria-label="Randament anual"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">%</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Conservator: 3-5%</span>
                        <span>Moderat: 6-8%</span>
                        <span>Agresiv: 9-12%</span>
                      </div>
                    </div>

                    {/* Opțiuni avansate scurte + CTA */}
                    <div className="md:col-span-2 space-y-4">
                      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-4 border rounded-lg">
                        <div>
                          <Label className="text-sm font-semibold">Reinvestirea automată</Label>
                          <p className="text-xs text-slate-500 mt-1">Câștigurile sunt reinvestite automat (dobândă compusă)</p>
                        </div>
                        <Switch checked={reinvest} onCheckedChange={setReinvest} aria-label="Comută reinvestirea" />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2 h-11"
                          disabled={inputErrors.length > 0 || isCalculating}
                          onClick={() => setShowErrors(inputErrors.length > 0)}
                        >
                          <Calculator className="w-4 h-4" /> {isCalculating ? "Calculez..." : "Calculează simularea"}
                        </Button>
                        <Button variant="outline" className="gap-2 h-11" onClick={addScenario} disabled={inputErrors.length > 0}>
                          <Plus className="w-4 h-4" /> Salvează scenariu
                        </Button>
                      </div>

                      {/* Data de start (utilizată în etichetele de lună) */}
                      <div className="flex items-center gap-3 text-sm">
                        <Label className="min-w-40">Data de start</Label>
                        <div className="flex flex-1 items-center gap-3">
                          <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="h-10"
                            aria-label="Data de start"
                          />
                          <Button type="button" variant="outline" className="shrink-0" onClick={() => setStartDate(toLocalDateInputValue())}>
                            Azi
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">
                        Graficul și timeline-ul folosesc această dată ca punct real de început, nu etichete abstracte.
                      </p>

                      <div className="rounded-xl border bg-slate-50 dark:bg-slate-800/60 p-4 space-y-4">
                        <div>
                          <Label className="text-sm font-semibold">Setări avansate</Label>
                          <p className="text-xs text-slate-500 mt-1">
                            Simulează și efectele inflației, comisioanelor, ritmului de compunere și ale creșterii contribuțiilor.
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Compunere</Label>
                            <Select value={compounding} onValueChange={(value) => setCompounding(value as CompoundingMode)}>
                              <SelectTrigger className="h-10">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="monthly">Lunară</SelectItem>
                                <SelectItem value="annual">Anuală</SelectItem>
                                <SelectItem value="daily">Zilnică</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Inflație anuală</Label>
                            <div className="relative">
                              <Input type="number" step={0.1} value={inflationPct} onChange={(e) => setInflationPct(Math.max(0, Number(e.target.value) || 0))} className="pr-8 h-10" />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">%</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Comision anual</Label>
                            <div className="relative">
                              <Input type="number" step={0.1} value={annualFeePct} onChange={(e) => setAnnualFeePct(Math.max(0, Number(e.target.value) || 0))} className="pr-8 h-10" />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">%</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Creștere contribuții</Label>
                            <div className="relative">
                              <Input type="number" step={0.1} value={stepUpAnnualPct} onChange={(e) => setStepUpAnnualPct(Math.max(0, Number(e.target.value) || 0))} className="pr-8 h-10" />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">%</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Taxă pe retragere</Label>
                            <div className="relative">
                              <Input type="number" step={0.1} value={taxOnWithdrawPct} onChange={(e) => setTaxOnWithdrawPct(Math.max(0, Number(e.target.value) || 0))} className="pr-8 h-10" disabled={reinvest} />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* KPI */}
            {simulationResult && (
              <section id="summary">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {[
                    {
                      title: "Total contribuții",
                      value: fmtCurrency(totalContrib),
                      Icon: Target,
                      bgColor: "bg-blue-50 dark:bg-blue-900/20",
                      textColor: "text-blue-600",
                    },
                    {
                      title: "Câștiguri generate",
                      value: fmtCurrency(totalGains),
                      Icon: TrendingUp,
                      bgColor: "bg-green-50 dark:bg-green-900/20",
                      textColor: "text-green-600",
                    },
                    {
                      title: "Valoare totală",
                      value: fmtCurrency(totalValue),
                      Icon: DollarSign,
                      bgColor: "bg-indigo-50 dark:bg-indigo-900/2 0",
                      textColor: "text-indigo-600",
                    },
                    {
                      title: "ROI total",
                      value: `${yieldPct > 0 ? "+" : ""}${yieldPct.toFixed(1)}%`,
                      Icon: Percent,
                      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
                      textColor: "text-yellow-600",
                    },
                  ].map(({ title, value, Icon, textColor, bgColor }, i) => (
                    <Card key={i} className={`${bgColor} border hover:shadow-lg transition-shadow duration-200`}>
                      <CardContent className="p-4 md:p-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-xs font-medium opacity-70">{title}</p>
                            <p className="text-xl md:text-2xl font-bold">{value}</p>
                          </div>
                          <div className={`size-10 md:size-12 ${textColor} bg-white rounded-lg grid place-items-center shadow-sm`}>
                            <Icon className="w-5 h-5 md:w-6 md:h-6" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Stats suplimentare */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border shadow-sm">
                    <div className="text-slate-600 dark:text-slate-400 mb-1">Contribuție totală</div>
                    <div className="font-bold">{fmtCurrency(initial + monthly * months)}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Initial: {fmtCurrency(initial)} + {months} × {fmtCurrency(monthly)}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border shadow-sm">
                    <div className="text-slate-600 dark:text-slate-400 mb-1">Multiplicator</div>
                    <div className="font-bold text-green-600">{(totalValue / Math.max(totalContrib, 1)).toFixed(2)}×</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Fiecare euro investit devine {fmtCurrency(totalValue / Math.max(totalContrib, 1))}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border shadow-sm">
                    <div className="text-slate-600 dark:text-slate-400 mb-1">TIR (IRR) aproximativ</div>
                    <div className="font-bold text-blue-600">{irrAnnual !== null ? (irrAnnual * 100).toFixed(1) : "n/a"}%</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {reinvest
                        ? "Pe baza contribuțiilor lunare și răscumpărării finale."
                        : "Pe baza contribuțiilor, câștigurilor retrase lunar și răscumpărării capitalului."}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {simulationResult && goalSolver && (
              <section id="insights">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <Card className="shadow-lg border">
                    <CardHeader className="border-b bg-slate-50 dark:bg-slate-800">
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-indigo-600" /> Goal Solver
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Țintă de portofoliu</Label>
                          <div className="relative">
                            <Input type="number" min={0} value={targetAmount} onChange={(e) => setTargetAmount(Math.max(0, Number(e.target.value) || 0))} className="pl-8 h-11" />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">€</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Ani de întârziere</Label>
                          <div className="relative">
                            <Input type="number" min={0} max={20} value={delayYears} onChange={(e) => setDelayYears(Math.max(0, Math.min(20, Number(e.target.value) || 0)))} className="pr-10 h-11" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">ani</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-xl border p-4 bg-indigo-50/70 dark:bg-indigo-900/10">
                          <div className="text-xs text-slate-500 mb-1">Contribuție lunară necesară</div>
                          <div className="text-2xl font-bold text-indigo-600">
                            {goalSolver.requiredMonthly !== null ? fmtCurrency(goalSolver.requiredMonthly) : "n/a"}
                          </div>
                          <p className="text-xs text-slate-500 mt-2">
                            Pentru a ajunge la {fmtCurrency(targetAmount)} în {years} ani la {annualPct}% randament anual.
                          </p>
                        </div>
                        <div className="rounded-xl border p-4 bg-blue-50/70 dark:bg-blue-900/10">
                          <div className="text-xs text-slate-500 mb-1">Ani necesari la ritmul actual</div>
                          <div className="text-2xl font-bold text-blue-600">
                            {goalSolver.yearsNeeded !== null ? `${goalSolver.yearsNeeded} ani` : "> 60 ani"}
                          </div>
                          <p className="text-xs text-slate-500 mt-2">
                            Cu {fmtCurrency(monthly)} / lună și {fmtCurrency(initial)} capital inițial.
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl border p-4 bg-slate-50 dark:bg-slate-800/60">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Status obiectiv</span>
                          <span className={goalSolver.reachesGoal ? "text-green-600 font-semibold" : "text-amber-600 font-semibold"}>
                            {goalSolver.reachesGoal ? "Pe traiectorie" : "Sub țintă"}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-slate-500">
                          Valoarea finală simulată este {fmtCurrency(totalValue)} față de o țintă de {fmtCurrency(targetAmount)}.
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg border">
                    <CardHeader className="border-b bg-slate-50 dark:bg-slate-800">
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" /> FIRE, venit pasiv și costul amânării
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Cheltuieli lunare țintă</Label>
                          <div className="relative">
                            <Input type="number" min={0} value={monthlyExpenses} onChange={(e) => setMonthlyExpenses(Math.max(0, Number(e.target.value) || 0))} className="pl-8 h-11" />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">€</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Safe withdrawal rate</Label>
                          <div className="relative">
                            <Input type="number" step={0.1} min={1} max={10} value={safeWithdrawalRate} onChange={(e) => setSafeWithdrawalRate(Math.max(1, Math.min(10, Number(e.target.value) || 0)))} className="pr-8 h-11" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">%</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-xl border p-4 bg-green-50/70 dark:bg-green-900/10">
                          <div className="text-xs text-slate-500 mb-1">FIRE number estimat</div>
                          <div className="text-2xl font-bold text-green-600">{fmtCurrency(goalSolver.fireNumber)}</div>
                          <p className="text-xs text-slate-500 mt-2">
                            Capital necesar pentru a susține aproximativ {fmtCurrency(monthlyExpenses)}/lună.
                          </p>
                        </div>
                        <div className="rounded-xl border p-4 bg-emerald-50/70 dark:bg-emerald-900/10">
                          <div className="text-xs text-slate-500 mb-1">Venit anual susținut de portofoliu</div>
                          <div className="text-2xl font-bold text-emerald-600">{fmtCurrency(goalSolver.supportedAnnualIncome)}</div>
                          <p className="text-xs text-slate-500 mt-2">
                            Aproximare simplă: portofoliu final × {safeWithdrawalRate}% pe an.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-xl border p-4 bg-amber-50/70 dark:bg-amber-900/10">
                          <div className="text-xs text-slate-500 mb-1">Costul amânării cu {delayYears} ani</div>
                          <div className="text-2xl font-bold text-amber-600">{fmtCurrency(goalSolver.delayCost)}</div>
                          <p className="text-xs text-slate-500 mt-2">
                            Diferența dintre valoarea curentă și scenariul în care începi mai târziu.
                          </p>
                        </div>
                        <div className="rounded-xl border p-4 bg-slate-50 dark:bg-slate-800/60">
                          <div className="text-xs text-slate-500 mb-1">Status independență financiară</div>
                          <div className={`text-2xl font-bold ${goalSolver.reachesFire ? "text-green-600" : "text-rose-600"}`}>
                            {goalSolver.reachesFire ? "Aproape acolo" : "Încă în construcție"}
                          </div>
                          <p className="text-xs text-slate-500 mt-2">
                            Portofoliul final {goalSolver.reachesFire ? "depășește" : "nu atinge încă"} pragul FIRE estimat.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>
            )}

            {/* Chart */}
            {simulationResult && (
              <section id="chart">
                <Card className="shadow-xl rounded-2xl overflow-hidden border-0 ring-1 ring-slate-200 dark:ring-slate-800">
                  <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-purple-50 dark:from-slate-800 dark:to-slate-700">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-600" /> Evoluția detaliată a investiției
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
                          <div className="w-32">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </div>
                          <SelectContent>
                            <SelectItem value="area">Zonă</SelectItem>
                            <SelectItem value="line">Linii</SelectItem>
                            <SelectItem value="bar">Bare</SelectItem>
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
                            <Tooltip
                              formatter={(v: number, name: string) => [fmtCurrency(v), name]}
                              labelFormatter={(l: string) => l}
                              contentStyle={{
                                background: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: 12,
                                boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1)",
                              }}
                            />
                            <Legend />
                            <Area type="monotone" dataKey="Valoare totală" stroke="#3b82f6" strokeWidth={2} fill="url(#colorTotal)" />
                            <Area type="monotone" dataKey="Contribuții cumulate" stroke="#10b981" strokeWidth={2} fill="url(#colorContrib)" />
                            <Area type="monotone" dataKey="Câștiguri cumulate" stroke="#f59e0b" strokeWidth={2} fill="url(#colorGainsCum)" />
                          </AreaChart>
                        ) : chartType === "line" ? (
                          <LineChart data={rows}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-700" />
                            <XAxis dataKey="luna" tick={{ fontSize: 12 }} stroke="#64748b" />
                            <YAxis tickFormatter={(v: number) => fmtCurrency(v)} tick={{ fontSize: 12 }} stroke="#64748b" />
                            <Tooltip
                              formatter={(v: number, name: string) => [fmtCurrency(v), name]}
                              labelFormatter={(l: string) => l}
                              contentStyle={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1)" }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="Valoare totală" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6", strokeWidth: 2, r: 3 }} />
                            <Line type="monotone" dataKey="Contribuții cumulate" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", strokeWidth: 2, r: 3 }} />
                            <Line type="monotone" dataKey="Câștiguri cumulate" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b", strokeWidth: 2, r: 3 }} />
                            <Line type="monotone" dataKey="Câștig lunar" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 3 }} />
                          </LineChart>
                        ) : (
                          <BarChart data={rows}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-700" />
                            <XAxis dataKey="luna" tick={{ fontSize: 12 }} stroke="#64748b" />
                            <YAxis tickFormatter={(v: number) => fmtCurrency(v)} tick={{ fontSize: 12 }} stroke="#64748b" />
                            <Tooltip
                              formatter={(v: number, name: string) => [fmtCurrency(v), name]}
                              labelFormatter={(l: string) => l}
                              contentStyle={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1)" }}
                            />
                            <Legend />
                            <Bar dataKey="Contribuții cumulate" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Câștiguri cumulate" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>

                    {/* Chart insights */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{months}</div>
                        <div className="text-xs text-slate-500">Luni de investire</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {totalGains > totalContrib ? "📈" : totalGains > 0 ? "📊" : "📉"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {totalGains > totalContrib ? "Performanță excelentă" : totalGains > 0 ? "Performanță pozitivă" : "Atenție la risc"}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {rows.length > 0 ? fmtCurrency(rows[rows.length - 1]["Câștig lunar"]) : "€0"}
                        </div>
                        <div className="text-xs text-slate-500">Câștig lunar final</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{((annualPct - 2) * years).toFixed(0)}%</div>
                        <div className="text-xs text-slate-500">Avantaj vs. inflație (est.)</div>
                      </div>
                    </div>

                    {/* Legendă */}
                    <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <h4 className="text-sm font-bold mb-2">Legenda graficului:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-600 rounded" />
                          <span>
                            <strong>Valoare totală:</strong> {reinvest ? "Suma totală a portofoliului" : "Portofoliu + câștiguri retrase"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-600 rounded" />
                          <span>
                            <strong>Contribuții cumulate:</strong> Total investit până acum
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-yellow-600 rounded" />
                          <span>
                            <strong>Câștiguri cumulate:</strong> Profitul total generat
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-purple-600 rounded" />
                          <span>
                            <strong>Câștig lunar:</strong> Câștigul din acea lună
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Scenarii */}
            <section id="scenarios">
              <Card className="shadow-xl rounded-2xl overflow-hidden border-0 ring-1 ring-slate-200 dark:ring-slate-800">
                <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-indigo-600" /> Comparare scenarii
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={() => setShowComparison(!showComparison)} disabled={scenarios.length === 0}>
                        {showComparison ? "Ascunde" : "Compară"} ({scenarios.length})
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {scenarios.length === 0 ? (
                    <div className="text-center py-12">
                      <PieChart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">Niciun scenariu salvat</h3>
                      <p className="text-sm text-slate-500 mb-4">
                        Configurează parametrii și salvează scenarii pentru a compara diferite strategii de investiție.
                      </p>
                      <Button onClick={addScenario} disabled={inputErrors.length > 0} className="gap-2">
                        <Plus className="w-4 h-4" /> Salvează primul scenariu
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Lista scenarii */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {scenarios.map((scenario) => (
                          <div
                            key={scenario.id}
                            className="relative rounded-xl border-2 border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg transition-all duration-200"
                            style={{ borderColor: activeScenario === scenario.id ? scenario.color : undefined }}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full" style={{ backgroundColor: scenario.color }} />
                                <h4 className="font-semibold text-sm">{scenario.name}</h4>
                              </div>
                              <Button
                                variant="outline"
                                onClick={() => removeScenario(scenario.id)}
                                className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                                aria-label="Șterge scenariul"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>

                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Initial:</span>
                                <span className="font-medium">{fmtCurrency(scenario.initial)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Lunar:</span>
                                <span className="font-medium">{fmtCurrency(scenario.monthly)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Durata:</span>
                                <span className="font-medium">{scenario.years} ani</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Randament:</span>
                                <span className="font-medium">{scenario.annualPct}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Inflație:</span>
                                <span className="font-medium">{scenario.inflationPct ?? inflationPct}%</span>
                              </div>
                            </div>

                            {/* Rezultate rapide pentru scenariu */}
                            {scenarioResults.find((r) => r.id === scenario.id) && (
                              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                                <div className="text-lg font-bold" style={{ color: scenario.color }}>
                                  {fmtCurrency(scenarioResults.find((r) => r.id === scenario.id)?.totalValue || 0)}
                                </div>
                                <div className="text-xs text-slate-500">
                                  ROI: {(scenarioResults.find((r) => r.id === scenario.id)?.yieldPct || 0).toFixed(1)}%
                                </div>
                              </div>
                            )}

                            <Button
                              variant="outline"
                              className="w-full mt-3"
                              onClick={() => {
                                setInitial(scenario.initial)
                                setMonthly(scenario.monthly)
                                setYears(scenario.years)
                                setAnnualPct(scenario.annualPct)
                                setReinvest(scenario.reinvest ?? reinvest)
                                setCompounding(scenario.compounding ?? compounding)
                                setAnnualFeePct(scenario.annualFeePct ?? annualFeePct)
                                setInflationPct(scenario.inflationPct ?? inflationPct)
                                setStepUpAnnualPct(scenario.stepUpAnnualPct ?? stepUpAnnualPct)
                                setTaxOnWithdrawPct(scenario.taxOnWithdrawPct ?? taxOnWithdrawPct)
                                setActiveScenario(scenario.id)
                                scrollTo("params")
                              }}
                            >
                              Încarcă acest scenariu
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Comparație vizuală */}
                      {showComparison && scenarioResults.length > 0 && (
                        <div className="mt-8">
                          <h4 className="text-lg font-semibold mb-4">Comparație scenarii</h4>
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

                          {/* Tabel comparativ */}
                          <div className="mt-6 overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left py-2">Scenariu</th>
                                  <th className="text-right py-2">Contribuții</th>
                                  <th className="text-right py-2">Câștiguri</th>
                                  <th className="text-right py-2">Valoare finală</th>
                                  <th className="text-right py-2">ROI</th>
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
                                    <td className="text-right py-2">{fmtCurrency(result.totalContrib)}</td>
                                    <td className="text-right py-2 text-green-600">{fmtCurrency(result.totalGains)}</td>
                                    <td className="text-right py-2 font-bold">{fmtCurrency(result.totalValue)}</td>
                                    <td className="text-right py-2">{result.yieldPct.toFixed(1)}%</td>
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

            {/* Note & Metodologie */}
            <section id="assumptions">
              <Card className="shadow-xl rounded-2xl overflow-hidden border-0 ring-1 ring-slate-200 dark:ring-slate-800">
                <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-green-50 dark:from-slate-800 dark:to-slate-700">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" /> Note & Metodologie
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-bold mb-3 text-slate-700 dark:text-slate-300">Ipoteze de calcul:</h4>
                      <ul className="text-sm space-y-2">
                        {[
                          "Contribuția se face la începutul fiecărei luni",
                          "Dobânda compusă se calculează lunar din rata anuală",
                          "Taxele/comisioanele și inflația sunt 0 implicit (pot fi activate în cod)",
                          "Randamentul este constant în simulare",
                          "Reinvestirea câștigurilor este automată (dacă este activată)",
                          "Capitalul inițial poate fi €0",
                        ].map((item, i) => (
                          <li key={i} className="flex gap-3 items-start">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold mb-3 text-slate-700 dark:text-slate-300">Note personale:</h4>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Adaugă observații, obiective financiare, strategii..."
                        rows={6}
                        maxLength={500}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm bg-white dark:bg-slate-800 focus:border-blue-500 focus:ring-blue-100 transition-all resize-none"
                      />
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-slate-400">{notes.length}/500 caractere</span>
                        <Button variant="outline" onClick={() => copyToClipboard(notes)} disabled={!notes} className="gap-1">
                          <Copy className="w-3 h-3" /> Copiază
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Sfaturi practice */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <h4 className="text-sm font-bold mb-2 text-blue-700 dark:text-blue-300">Sfaturi pentru investiții:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-blue-600 dark:text-blue-400">
                      <div>
                        <strong>Diversificare:</strong> Nu pune toate ouăle în același coș
                      </div>
                      <div>
                        <strong>Disciplină:</strong> Investește constant, indiferent de fluctuații
                      </div>
                      <div>
                        <strong>Timp:</strong> Cu cât începi mai devreme, cu atât mai bine
                      </div>
                      <div>
                        <strong>Educație:</strong> Înțelege ce investești și de ce
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                      <div>
                        <strong className="text-yellow-700 dark:text-yellow-400">Atenție:</strong> Aceasta este o simulare informativă. Randamentele din trecut
                        nu garantează rezultate viitoare. Consultă un consilier financiar pentru sfaturi personalizate. Investițiile implică riscuri și poți
                        pierde bani.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </main>
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="size-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 grid place-items-center text-white">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold">InvestSim Pro</h3>
              <p className="text-xs text-slate-500">v2.0</p>
            </div>
          </div>
          <nav className="space-y-1 text-sm">
            {[
              { id: "params", label: "Configurare", Icon: Settings },
              { id: "summary", label: "Rezultate", Icon: BarChart3 },
              { id: "insights", label: "Instrumente", Icon: Target },
              { id: "chart", label: "Grafice", Icon: TrendingUp },
              { id: "scenarios", label: "Scenarii", Icon: PieChart },
              { id: "assumptions", label: "Note", Icon: FileText },
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>
          {simulationResult && (
            <div className="pt-4 border-t">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-3">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Valoare finală</div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">{fmtCurrency(totalValue)}</div>
                <div className="text-xs text-slate-500">ROI: +{yieldPct.toFixed(1)}%</div>
              </div>
            </div>
          )}
        </div>
      </MobileDrawer>
    </div>
  )
}
