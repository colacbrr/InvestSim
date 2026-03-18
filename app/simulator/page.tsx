"use client"

import React, { startTransition, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
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
  AlertCircle,
  CheckCircle,
  RefreshCw,
  PieChart,
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
import type {
  CompoundingMode,
  ContributionPause,
  OneTimeDeposit,
  Scenario,
} from "@/packages/shared/types"
import { AssumptionsPanel } from "@/components/simulator/assumptions-panel"
import { ChartsPanel } from "@/components/simulator/charts-panel"
import { InsightsPanel } from "@/components/simulator/insights-panel"
import { InputsPanel } from "@/components/simulator/inputs-panel"
import { MobileDrawer } from "@/components/simulator/mobile-drawer"
import { NotesPanel } from "@/components/simulator/notes-panel"
import { QuickStatsCard } from "@/components/simulator/quick-stats-card"
import { ScenarioComparisonPanel } from "@/components/simulator/scenario-comparison-panel"
import { SimulatorNavList } from "@/components/simulator/simulator-nav-list"
import { SummarySection } from "@/components/simulator/summary-section"
import { TrustPanel } from "@/components/simulator/trust-panel"
import {
  detectPreferredLanguage,
  LANGUAGE_STORAGE_KEY,
  messages,
  type Language,
} from "@/lib/i18n/messages"
import {
  createSavedScenario,
  deleteSavedScenario,
  listSavedScenarios,
  postSimulation,
} from "@/lib/simulation/client"
import { mapStoredScenarioToScenario } from "@/lib/scenarios/persistence"
import {
  DEFAULT_NUMERIC_LIMITS,
  DEFAULT_SIMULATOR_VALUES,
  SCENARIO_COLORS,
  SIMULATOR_PRESETS,
  SIMULATOR_STORAGE_KEY,
} from "@/lib/simulation/constants"
import { buildScenarioSimulationRequest } from "@/lib/simulation/request"
import type { SimulationResult } from "@/packages/shared/types"
type ChartType = "area" | "line" | "bar"
type ScenarioWithResult = Scenario & SimulationResult

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
  oneTimeDeposits: OneTimeDeposit[]
  contributionPauses: ContributionPause[]
  notes: string
  scenarios: Scenario[]
  startDate: string
  targetAmount: number
  monthlyExpenses: number
  safeWithdrawalRate: number
  delayYears: number
}

type UrlSerializableState = Pick<
  PersistedSimulatorState,
  | "initial"
  | "monthly"
  | "years"
  | "annualPct"
  | "reinvest"
  | "compounding"
  | "annualFeePct"
  | "inflationPct"
  | "stepUpAnnualPct"
  | "taxOnWithdrawPct"
  | "startDate"
  | "targetAmount"
  | "monthlyExpenses"
  | "safeWithdrawalRate"
  | "delayYears"
>

const defaultSimulatorState: PersistedSimulatorState = {
  initial: DEFAULT_SIMULATOR_VALUES.initial,
  monthly: DEFAULT_SIMULATOR_VALUES.monthly,
  years: DEFAULT_SIMULATOR_VALUES.years,
  annualPct: DEFAULT_SIMULATOR_VALUES.annualPct,
  reinvest: DEFAULT_SIMULATOR_VALUES.reinvest,
  compounding: DEFAULT_SIMULATOR_VALUES.compounding,
  annualFeePct: DEFAULT_SIMULATOR_VALUES.annualFeePct,
  inflationPct: DEFAULT_SIMULATOR_VALUES.inflationPct,
  stepUpAnnualPct: DEFAULT_SIMULATOR_VALUES.stepUpAnnualPct,
  taxOnWithdrawPct: DEFAULT_SIMULATOR_VALUES.taxOnWithdrawPct,
  oneTimeDeposits: [],
  contributionPauses: [],
  notes: "",
  scenarios: [],
  startDate: toLocalDateInputValue(),
  targetAmount: DEFAULT_SIMULATOR_VALUES.targetAmount,
  monthlyExpenses: DEFAULT_SIMULATOR_VALUES.monthlyExpenses,
  safeWithdrawalRate: DEFAULT_SIMULATOR_VALUES.safeWithdrawalRate,
  delayYears: DEFAULT_SIMULATOR_VALUES.delayYears,
}

function readUrlState(): Partial<UrlSerializableState> {
  if (typeof window === "undefined") return {}

  const params = new URLSearchParams(window.location.search)
  if (params.toString().length === 0) return {}

  const parseNumber = (key: string): number | undefined => {
    const value = params.get(key)
    if (value === null || value === "") return undefined
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }

  const reinvest = params.get("reinvest")
  const compounding = params.get("compounding")
  const startDate = params.get("start")

  return {
    initial: parseNumber("initial"),
    monthly: parseNumber("monthly"),
    years: parseNumber("years"),
    annualPct: parseNumber("return"),
    reinvest: reinvest === null ? undefined : reinvest === "1",
    compounding:
      compounding === "monthly" || compounding === "annual" || compounding === "daily"
        ? compounding
        : undefined,
    annualFeePct: parseNumber("fee"),
    inflationPct: parseNumber("inflation"),
    stepUpAnnualPct: parseNumber("stepup"),
    taxOnWithdrawPct: parseNumber("tax"),
    startDate: startDate && startDate.length > 0 ? startDate : undefined,
    targetAmount: parseNumber("target"),
    monthlyExpenses: parseNumber("expenses"),
    safeWithdrawalRate: parseNumber("swr"),
    delayYears: parseNumber("delay"),
  }
}

function buildUrlSearchParams(state: UrlSerializableState): URLSearchParams {
  const params = new URLSearchParams()

  const setNumber = (key: string, value: number, defaultValue: number) => {
    if (value !== defaultValue) params.set(key, String(value))
  }

  setNumber("initial", state.initial, defaultSimulatorState.initial)
  setNumber("monthly", state.monthly, defaultSimulatorState.monthly)
  setNumber("years", state.years, defaultSimulatorState.years)
  setNumber("return", state.annualPct, defaultSimulatorState.annualPct)
  if (state.reinvest !== defaultSimulatorState.reinvest) params.set("reinvest", state.reinvest ? "1" : "0")
  if (state.compounding !== defaultSimulatorState.compounding) params.set("compounding", state.compounding)
  setNumber("fee", state.annualFeePct, defaultSimulatorState.annualFeePct)
  setNumber("inflation", state.inflationPct, defaultSimulatorState.inflationPct)
  setNumber("stepup", state.stepUpAnnualPct, defaultSimulatorState.stepUpAnnualPct)
  setNumber("tax", state.taxOnWithdrawPct, defaultSimulatorState.taxOnWithdrawPct)
  if (state.startDate !== defaultSimulatorState.startDate) params.set("start", state.startDate)
  setNumber("target", state.targetAmount, defaultSimulatorState.targetAmount)
  setNumber("expenses", state.monthlyExpenses, defaultSimulatorState.monthlyExpenses)
  setNumber("swr", state.safeWithdrawalRate, defaultSimulatorState.safeWithdrawalRate)
  setNumber("delay", state.delayYears, defaultSimulatorState.delayYears)

  return params
}

function isScenarioLike(value: unknown): value is Scenario {
  if (!value || typeof value !== "object") return false

  const candidate = value as Partial<Scenario>
  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.initial === "number" &&
    typeof candidate.monthly === "number" &&
    typeof candidate.years === "number" &&
    typeof candidate.annualPct === "number" &&
    typeof candidate.color === "string"
  )
}

function loadInitialState(): PersistedSimulatorState {
  if (typeof window === "undefined") return defaultSimulatorState

  try {
    const rawState = window.localStorage.getItem(SIMULATOR_STORAGE_KEY)
    if (!rawState) return defaultSimulatorState

    const savedState = JSON.parse(rawState) as Partial<PersistedSimulatorState>
    const urlState = readUrlState()

    return {
      ...defaultSimulatorState,
      ...savedState,
      ...urlState,
      scenarios: Array.isArray(savedState.scenarios)
        ? savedState.scenarios
        : defaultSimulatorState.scenarios,
      oneTimeDeposits: Array.isArray(savedState.oneTimeDeposits)
        ? savedState.oneTimeDeposits
        : defaultSimulatorState.oneTimeDeposits,
      contributionPauses: Array.isArray(savedState.contributionPauses)
        ? savedState.contributionPauses
        : defaultSimulatorState.contributionPauses,
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function parseNumberInput(raw: string, fallback: number, min: number, max: number): number {
  if (raw.trim() === "") return fallback

  const parsed = Number(raw)
  if (Number.isNaN(parsed)) return fallback

  return clamp(parsed, min, max)
}

function formatInputNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : String(value)
}

function isPersistedScenarioId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

/* ====================== App ====================== */
export default function App() {
  const [initialState] = useState<PersistedSimulatorState>(() => loadInitialState())
  const scenarioImportRef = useRef<HTMLInputElement | null>(null)
  const [language, setLanguage] = useState<Language>(() => detectPreferredLanguage())
  const t = messages[language]

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  }, [language])

  const [initialInput, setInitialInput] = useState(() => formatInputNumber(initialState.initial))
  const [monthlyInput, setMonthlyInput] = useState(() => formatInputNumber(initialState.monthly))
  const [years, setYears] = useState(initialState.years)
  const [annualPctInput, setAnnualPctInput] = useState(() => formatInputNumber(initialState.annualPct))
  const [reinvest, setReinvest] = useState(initialState.reinvest)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [compounding, setCompounding] = useState<CompoundingMode>(initialState.compounding)
  const [annualFeePctInput, setAnnualFeePctInput] = useState(() => formatInputNumber(initialState.annualFeePct))
  const [inflationPctInput, setInflationPctInput] = useState(() => formatInputNumber(initialState.inflationPct))
  const [stepUpAnnualPctInput, setStepUpAnnualPctInput] = useState(() => formatInputNumber(initialState.stepUpAnnualPct))
  const [taxOnWithdrawPctInput, setTaxOnWithdrawPctInput] = useState(() => formatInputNumber(initialState.taxOnWithdrawPct))
  const [showErrors, setShowErrors] = useState(false)
  const isCalculating = false
  const [chartType, setChartType] = useState<ChartType>("area")
  const [scenarios, setScenarios] = useState<Scenario[]>(initialState.scenarios)
  const [oneTimeDeposits, setOneTimeDeposits] = useState<OneTimeDeposit[]>(initialState.oneTimeDeposits)
  const [contributionPauses, setContributionPauses] = useState<ContributionPause[]>(
    initialState.contributionPauses
  )
  const [activeScenario, setActiveScenario] = useState<string | null>(null)
  const [notes, setNotes] = useState(initialState.notes)
  const [showComparison, setShowComparison] = useState(false)
  const [scenarioResults, setScenarioResults] = useState<ScenarioWithResult[]>([])
  const [scenarioResultsLoading, setScenarioResultsLoading] = useState(false)
  const [scenarioResultsError, setScenarioResultsError] = useState<string | null>(null)
  const [serverScenariosLoaded, setServerScenariosLoaded] = useState(false)
  const [startDate, setStartDate] = useState<string>(initialState.startDate)
  const [targetAmountInput, setTargetAmountInput] = useState(() => formatInputNumber(initialState.targetAmount))
  const [monthlyExpensesInput, setMonthlyExpensesInput] = useState(() => formatInputNumber(initialState.monthlyExpenses))
  const [safeWithdrawalRateInput, setSafeWithdrawalRateInput] = useState(() => formatInputNumber(initialState.safeWithdrawalRate))
  const [delayYearsInput, setDelayYearsInput] = useState(() => formatInputNumber(initialState.delayYears))

  const initial = parseNumberInput(initialInput, DEFAULT_SIMULATOR_VALUES.initial, 0, DEFAULT_NUMERIC_LIMITS.moneyMax)
  const monthly = parseNumberInput(monthlyInput, DEFAULT_SIMULATOR_VALUES.monthly, 0, DEFAULT_NUMERIC_LIMITS.moneyMax)
  const annualPct = parseNumberInput(
    annualPctInput,
    DEFAULT_SIMULATOR_VALUES.annualPct,
    DEFAULT_NUMERIC_LIMITS.annualPctMin,
    DEFAULT_NUMERIC_LIMITS.annualPctMax
  )
  const annualFeePct = parseNumberInput(
    annualFeePctInput,
    DEFAULT_SIMULATOR_VALUES.annualFeePct,
    DEFAULT_NUMERIC_LIMITS.percentMin,
    DEFAULT_NUMERIC_LIMITS.percentMax
  )
  const inflationPct = parseNumberInput(
    inflationPctInput,
    DEFAULT_SIMULATOR_VALUES.inflationPct,
    DEFAULT_NUMERIC_LIMITS.percentMin,
    DEFAULT_NUMERIC_LIMITS.percentMax
  )
  const stepUpAnnualPct = parseNumberInput(
    stepUpAnnualPctInput,
    DEFAULT_SIMULATOR_VALUES.stepUpAnnualPct,
    DEFAULT_NUMERIC_LIMITS.percentMin,
    DEFAULT_NUMERIC_LIMITS.percentMax
  )
  const taxOnWithdrawPct = parseNumberInput(
    taxOnWithdrawPctInput,
    DEFAULT_SIMULATOR_VALUES.taxOnWithdrawPct,
    DEFAULT_NUMERIC_LIMITS.percentMin,
    DEFAULT_NUMERIC_LIMITS.percentMax
  )
  const targetAmount = parseNumberInput(targetAmountInput, DEFAULT_SIMULATOR_VALUES.targetAmount, 0, DEFAULT_NUMERIC_LIMITS.moneyMax)
  const monthlyExpenses = parseNumberInput(
    monthlyExpensesInput,
    DEFAULT_SIMULATOR_VALUES.monthlyExpenses,
    0,
    DEFAULT_NUMERIC_LIMITS.moneyMax
  )
  const safeWithdrawalRate = parseNumberInput(
    safeWithdrawalRateInput,
    DEFAULT_SIMULATOR_VALUES.safeWithdrawalRate,
    DEFAULT_NUMERIC_LIMITS.safeWithdrawalRateMin,
    DEFAULT_NUMERIC_LIMITS.safeWithdrawalRateMax
  )
  const delayYears = parseNumberInput(
    delayYearsInput,
    DEFAULT_SIMULATOR_VALUES.delayYears,
    DEFAULT_NUMERIC_LIMITS.delayYearsMin,
    DEFAULT_NUMERIC_LIMITS.delayYearsMax
  )

  const deferredInitial = useDeferredValue(initial)
  const deferredMonthly = useDeferredValue(monthly)
  const deferredYears = useDeferredValue(years)
  const deferredAnnualPct = useDeferredValue(annualPct)
  const deferredReinvest = useDeferredValue(reinvest)
  const deferredCompounding = useDeferredValue(compounding)
  const deferredAnnualFeePct = useDeferredValue(annualFeePct)
  const deferredInflationPct = useDeferredValue(inflationPct)
  const deferredStepUpAnnualPct = useDeferredValue(stepUpAnnualPct)
  const deferredTaxOnWithdrawPct = useDeferredValue(taxOnWithdrawPct)
  const deferredStartDate = useDeferredValue(startDate)

  useEffect(() => {
    try {
      window.localStorage.setItem(
        SIMULATOR_STORAGE_KEY,
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
          oneTimeDeposits,
          contributionPauses,
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
    oneTimeDeposits,
    contributionPauses,
    notes,
    scenarios,
    startDate,
    targetAmount,
    monthlyExpenses,
    safeWithdrawalRate,
    delayYears,
  ])

  useEffect(() => {
    const params = buildUrlSearchParams({
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
      startDate,
      targetAmount,
      monthlyExpenses,
      safeWithdrawalRate,
      delayYears,
    })

    const nextSearch = params.toString()
    const nextUrl = nextSearch ? `${window.location.pathname}?${nextSearch}` : window.location.pathname
    window.history.replaceState(null, "", nextUrl)
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
    startDate,
    targetAmount,
    monthlyExpenses,
    safeWithdrawalRate,
    delayYears,
  ])

  // Handlers cu validare
  const handleInitialChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInitialInput(e.target.value)
      if (showErrors) setShowErrors(false)
    },
    [showErrors]
  )

  const handleMonthlyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMonthlyInput(e.target.value)
      if (showErrors) setShowErrors(false)
    },
    [showErrors]
  )

  const handleAnnualPctChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setAnnualPctInput(e.target.value)
      if (showErrors) setShowErrors(false)
    },
    [showErrors]
  )

  // Validare inputs
  const inputErrors = useMemo(
    () => validateInputs(initial, monthly, years, annualPct),
    [initial, monthly, years, annualPct]
  )
  const translatedInputErrors = useMemo(
    () => inputErrors.map((error) => t.validation[error]),
    [inputErrors, t]
  )
  const hasInitialError = inputErrors.some(
    (error) => error === "initial_negative" || error === "initial_too_large"
  )
  const hasMonthlyError = inputErrors.some(
    (error) => error === "monthly_negative" || error === "monthly_too_large"
  )
  const hasAnnualPctError = inputErrors.some((error) => error === "annual_pct_out_of_range")

  const simulationOptions = useMemo(
    () => ({
      reinvest: deferredReinvest,
      startDate: new Date(deferredStartDate),
      compounding: deferredCompounding,
      annualFeePct: deferredAnnualFeePct,
      inflationPct: deferredInflationPct,
      stepUpAnnualPct: deferredStepUpAnnualPct,
      taxOnWithdrawPct: deferredTaxOnWithdrawPct,
      oneTimeDeposits,
      contributionPauses,
    }),
    [
      deferredReinvest,
      deferredStartDate,
      deferredCompounding,
      deferredAnnualFeePct,
      deferredInflationPct,
      deferredStepUpAnnualPct,
      deferredTaxOnWithdrawPct,
      oneTimeDeposits,
      contributionPauses,
    ]
  )

  // Simulare
  const months = deferredYears * 12
  const simulationResult = useMemo(() => {
    if (inputErrors.length > 0) return null
    return simulate(deferredInitial, deferredMonthly, months, deferredAnnualPct / 100, simulationOptions)
  }, [deferredInitial, deferredMonthly, months, deferredAnnualPct, inputErrors, simulationOptions])

  const { rows = [], totalValue = 0, totalContrib = 0, totalGains = 0, yieldPct = 0 } =
    simulationResult || {}

  // IRR anual (TIR)
  const irrAnnual = useMemo(() => {
    if (!simulationResult) return null
    return computeIRRFromRows(rows, {
      initial,
      monthly,
      months: deferredYears * 12,
      reinvest,
      totalValue,
      totalContrib,
    })
  }, [rows, initial, monthly, deferredYears, reinvest, totalValue, totalContrib, simulationResult])

  // Export CSV
  const handleExport = useCallback(() => {
    if (!rows.length) return
    const csv = toCSV(rows, scenarios)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${t.files.csvPrefix}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [rows, scenarios, t.files.csvPrefix])

  const handleExportScenariosJson = useCallback(() => {
    if (scenarios.length === 0) return

    const payload = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        scenarios,
      },
      null,
      2
    )
    const blob = new Blob([payload], { type: "application/json;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `${t.files.scenariosPrefix}-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }, [scenarios, t.files.scenariosPrefix])

  const handleImportScenariosClick = useCallback(() => {
    scenarioImportRef.current?.click()
  }, [])

  const handleImportScenarios = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const parsed = JSON.parse(text) as { scenarios?: unknown }
      const importedScenarios = Array.isArray(parsed.scenarios)
        ? parsed.scenarios.filter(isScenarioLike)
        : []

      if (importedScenarios.length === 0) {
        window.alert(t.alerts.invalidScenarioImport)
        return
      }

      const normalized = importedScenarios.map((scenario, index) => ({
        ...scenario,
        id: `${scenario.id}-${Date.now()}-${index}`,
      }))

      setScenarios((prev) => [...prev, ...normalized])
      void Promise.all(
        normalized.map((scenario) =>
          createSavedScenario({
            title: scenario.name,
            color: scenario.color,
            note: scenario.note,
            simulation: buildScenarioSimulationRequest(scenario, {
              reinvest: scenario.reinvest ?? reinvest,
              compounding: scenario.compounding ?? compounding,
              annualFeePct: scenario.annualFeePct ?? annualFeePct,
              inflationPct: scenario.inflationPct ?? inflationPct,
              stepUpAnnualPct: scenario.stepUpAnnualPct ?? stepUpAnnualPct,
              taxOnWithdrawPct: scenario.taxOnWithdrawPct ?? taxOnWithdrawPct,
              oneTimeDeposits: scenario.oneTimeDeposits ?? [],
              contributionPauses: scenario.contributionPauses ?? [],
              startDate,
            }),
            startDate,
            source: "import_json",
          })
        )
      )
        .then((savedRecords) => {
          setScenarios((prev) => {
            const replacements = new Map(
              savedRecords.map((record, index) => [
                normalized[index].id,
                mapStoredScenarioToScenario(record),
              ])
            )

            return prev.map((entry) => replacements.get(entry.id) ?? entry)
          })
        })
        .catch((error) => {
          console.error("Failed to persist imported scenarios:", error)
          window.alert(t.alerts.failedScenarioSync)
        })
    } catch (error) {
      console.error("Failed to import scenarios JSON:", error)
      window.alert(t.alerts.failedScenarioImport)
    } finally {
      event.target.value = ""
    }
  }, [
    annualFeePct,
    compounding,
    inflationPct,
    reinvest,
    startDate,
    stepUpAnnualPct,
    t.alerts.failedScenarioImport,
    t.alerts.failedScenarioSync,
    t.alerts.invalidScenarioImport,
    taxOnWithdrawPct,
  ])

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: "smooth", block: "start" })
    setSidebarOpen(false)
  }, [])

  useEffect(() => {
    if (serverScenariosLoaded) return

    let cancelled = false

    void listSavedScenarios()
      .then((saved) => {
        if (cancelled) return
        setServerScenariosLoaded(true)
        if (saved.length === 0) return
        setScenarios((prev) => (prev.length > 0 ? prev : saved.map(mapStoredScenarioToScenario)))
      })
      .catch((error) => {
        if (cancelled) return
        console.error("Failed to load saved scenarios:", error)
        setServerScenariosLoaded(true)
      })

    return () => {
      cancelled = true
    }
  }, [serverScenariosLoaded])

  const applySimulatorValues = useCallback((values: Partial<PersistedSimulatorState>) => {
    if (values.initial !== undefined) setInitialInput(formatInputNumber(values.initial))
    if (values.monthly !== undefined) setMonthlyInput(formatInputNumber(values.monthly))
    if (values.years !== undefined) setYears(values.years)
    if (values.annualPct !== undefined) setAnnualPctInput(formatInputNumber(values.annualPct))
    if (values.reinvest !== undefined) setReinvest(values.reinvest)
    if (values.compounding !== undefined) setCompounding(values.compounding)
    if (values.annualFeePct !== undefined) setAnnualFeePctInput(formatInputNumber(values.annualFeePct))
    if (values.inflationPct !== undefined) setInflationPctInput(formatInputNumber(values.inflationPct))
    if (values.stepUpAnnualPct !== undefined) setStepUpAnnualPctInput(formatInputNumber(values.stepUpAnnualPct))
    if (values.taxOnWithdrawPct !== undefined) setTaxOnWithdrawPctInput(formatInputNumber(values.taxOnWithdrawPct))
    if (values.oneTimeDeposits !== undefined) setOneTimeDeposits(values.oneTimeDeposits)
    if (values.contributionPauses !== undefined) setContributionPauses(values.contributionPauses)
    if (values.notes !== undefined) setNotes(values.notes)
    if (values.scenarios !== undefined) setScenarios(values.scenarios)
    if (values.startDate !== undefined) setStartDate(values.startDate)
    if (values.targetAmount !== undefined) setTargetAmountInput(formatInputNumber(values.targetAmount))
    if (values.monthlyExpenses !== undefined) setMonthlyExpensesInput(formatInputNumber(values.monthlyExpenses))
    if (values.safeWithdrawalRate !== undefined) setSafeWithdrawalRateInput(formatInputNumber(values.safeWithdrawalRate))
    if (values.delayYears !== undefined) setDelayYearsInput(formatInputNumber(values.delayYears))
  }, [])

  const addScenario = () => {
    if (inputErrors.length > 0) return
    const newScenario: Scenario = {
      id: Date.now().toString(),
      name: `${t.scenarios.table.scenario} ${scenarios.length + 1}`,
      initial,
      monthly,
      years,
      annualPct,
      color: SCENARIO_COLORS[scenarios.length % SCENARIO_COLORS.length],
      reinvest,
      compounding,
      annualFeePct,
      inflationPct,
      stepUpAnnualPct,
      taxOnWithdrawPct,
      oneTimeDeposits,
      contributionPauses,
    }
    setScenarios((prev) => [...prev, newScenario])

    void createSavedScenario({
      title: newScenario.name,
      color: newScenario.color,
      note: newScenario.note,
      simulation: buildScenarioSimulationRequest(newScenario, {
        reinvest,
        compounding,
        annualFeePct,
        inflationPct,
        stepUpAnnualPct,
        taxOnWithdrawPct,
        oneTimeDeposits,
        contributionPauses,
        startDate,
      }),
      startDate,
      source: "manual_edit",
    })
      .then((saved) => {
        setScenarios((prev) =>
          prev.map((entry) =>
            entry.id === newScenario.id ? mapStoredScenarioToScenario(saved) : entry
          )
        )
      })
      .catch((error) => {
        console.error("Failed to persist scenario:", error)
        window.alert(t.alerts.failedScenarioSync)
      })
  }

  const removeScenario = useCallback(
    (id: string) => {
      let removedScenario: Scenario | null = null
      setScenarios((prev) => {
        removedScenario = prev.find((entry) => entry.id === id) ?? null
        return prev.filter((s) => s.id !== id)
      })
      if (activeScenario === id) setActiveScenario(null)
      if (!isPersistedScenarioId(id)) return

      void deleteSavedScenario(id).catch((error) => {
        console.error("Failed to remove scenario:", error)
        if (removedScenario) {
          setScenarios((prev) => [...prev, removedScenario as Scenario])
        }
        window.alert(t.alerts.failedScenarioSync)
      })
    },
    [activeScenario, t.alerts.failedScenarioSync]
  )

  const duplicateScenario = useCallback((id: string) => {
    setScenarios((prev) => {
      const scenario = prev.find((entry) => entry.id === id)
      if (!scenario) return prev

      const duplicate: Scenario = {
        ...scenario,
        id: `${scenario.id}-copy-${Date.now()}`,
        name: `${scenario.name} ${t.scenarios.duplicateSuffix}`,
      }

      const index = prev.findIndex((entry) => entry.id === id)
      if (index === -1) return [...prev, duplicate]

      void createSavedScenario({
        title: duplicate.name,
        color: duplicate.color,
        note: duplicate.note,
        simulation: buildScenarioSimulationRequest(duplicate, {
          reinvest: duplicate.reinvest ?? reinvest,
          compounding: duplicate.compounding ?? compounding,
          annualFeePct: duplicate.annualFeePct ?? annualFeePct,
          inflationPct: duplicate.inflationPct ?? inflationPct,
          stepUpAnnualPct: duplicate.stepUpAnnualPct ?? stepUpAnnualPct,
          taxOnWithdrawPct: duplicate.taxOnWithdrawPct ?? taxOnWithdrawPct,
          oneTimeDeposits: duplicate.oneTimeDeposits ?? [],
          contributionPauses: duplicate.contributionPauses ?? [],
          startDate,
        }),
        startDate,
        source: "duplicate",
      })
        .then((saved) => {
          setScenarios((current) =>
            current.map((entry) =>
              entry.id === duplicate.id ? mapStoredScenarioToScenario(saved) : entry
            )
          )
        })
        .catch((error) => {
          console.error("Failed to persist duplicated scenario:", error)
          window.alert(t.alerts.failedScenarioSync)
        })

      return [...prev.slice(0, index + 1), duplicate, ...prev.slice(index + 1)]
    })
  }, [
    annualFeePct,
    compounding,
    inflationPct,
    reinvest,
    startDate,
    stepUpAnnualPct,
    t.alerts.failedScenarioSync,
    t.scenarios.duplicateSuffix,
    taxOnWithdrawPct,
  ])

  const moveScenario = useCallback((id: string, direction: -1 | 1) => {
    setScenarios((prev) => {
      const index = prev.findIndex((entry) => entry.id === id)
      const nextIndex = index + direction
      if (index === -1 || nextIndex < 0 || nextIndex >= prev.length) return prev

      const next = [...prev]
      ;[next[index], next[nextIndex]] = [next[nextIndex], next[index]]
      return next
    })
  }, [])

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error("Nu s-a putut copia în clipboard:", err)
    }
  }, [])

  const resetAll = useCallback(() => {
    applySimulatorValues({
      ...defaultSimulatorState,
      oneTimeDeposits: [],
      contributionPauses: [],
      startDate: toLocalDateInputValue(),
    })
    setScenarios([])
    setActiveScenario(null)
    setShowComparison(false)
    setShowErrors(false)
  }, [applySimulatorValues])

  useEffect(() => {
    if (scenarios.length === 0) {
      setScenarioResults([])
      setScenarioResultsLoading(false)
      setScenarioResultsError(null)
      return
    }

    let cancelled = false
    setScenarioResultsLoading(true)
    setScenarioResultsError(null)

    void Promise.all(
      scenarios.map(async (scenario) => {
        const result = await postSimulation(
          buildScenarioSimulationRequest(scenario, {
            reinvest: deferredReinvest,
            compounding: deferredCompounding,
            annualFeePct: deferredAnnualFeePct,
            inflationPct: deferredInflationPct,
            stepUpAnnualPct: deferredStepUpAnnualPct,
            taxOnWithdrawPct: deferredTaxOnWithdrawPct,
            oneTimeDeposits,
            contributionPauses,
            startDate: deferredStartDate,
          })
        )

        return { ...scenario, ...result }
      })
    )
      .then((results) => {
        if (cancelled) return
        startTransition(() => {
          setScenarioResults(results)
          setScenarioResultsLoading(false)
        })
      })
      .catch((error) => {
        if (cancelled) return
        console.error("Failed to refresh scenario comparisons:", error)
        startTransition(() => {
          setScenarioResults([])
          setScenarioResultsLoading(false)
          setScenarioResultsError(error instanceof Error ? error.message : "comparison_failed")
        })
      })

    return () => {
      cancelled = true
    }
  }, [
    scenarios,
    deferredReinvest,
    deferredCompounding,
    deferredAnnualFeePct,
    deferredInflationPct,
    deferredStepUpAnnualPct,
    deferredTaxOnWithdrawPct,
    deferredStartDate,
    oneTimeDeposits,
    contributionPauses,
  ])

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

  const navItems = [
    { id: "params", label: t.nav.params, Icon: Settings },
    { id: "summary", label: t.nav.summary, Icon: BarChart3 },
    { id: "insights", label: t.nav.insights, Icon: Target },
    { id: "trust", label: t.nav.trust, Icon: Settings },
    { id: "chart", label: t.nav.chart, Icon: TrendingUp },
    { id: "scenarios", label: t.nav.scenarios, Icon: PieChart },
    { id: "assumptions", label: t.nav.assumptions, Icon: FileText },
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
              <h1 className="text-base font-bold leading-tight">{t.appName}</h1>
              <p className="text-[11px] text-blue-200">{t.versionTagline}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 p-4">
          <SimulatorNavList
            items={navItems}
            onSelect={scrollTo}
            className="space-y-1 text-sm"
            buttonClassName="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 hover:shadow-sm dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          />
        </div>

        {/* Stats quick view */}
        {simulationResult && (
          <div className="px-4 pb-4">
            <QuickStatsCard
              label={t.quickStats}
              totalValue={fmtCurrency(totalValue)}
              roiLabel={`+${yieldPct.toFixed(1)}% ROI`}
            />
          </div>
        )}
        <div className="px-4 py-3 border-t text-center text-xs text-slate-500">© 2025 {t.appName} {t.appVersion}</div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur-md dark:bg-slate-900/95 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                aria-label={t.openMenu}
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
                  <h2 className="text-lg font-bold leading-tight">{t.simulatorTitle}</h2>
                  <p className="text-xs text-slate-500">{t.appTagline}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 text-xs font-semibold text-slate-600">
                <span className="px-2">{t.languageLabel}</span>
                <button
                  type="button"
                  onClick={() => setLanguage("ro")}
                  className={`rounded-full px-3 py-1 ${language === "ro" ? "bg-slate-900 text-white" : ""}`}
                >
                  {t.languageRo}
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`rounded-full px-3 py-1 ${language === "en" ? "bg-slate-900 text-white" : ""}`}
                >
                  {t.languageEn}
                </button>
              </div>
              {inputErrors.length > 0 && (
                <div className="flex items-center gap-1 text-red-500 text-sm" aria-live="polite">
                  <AlertCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.errorCount(inputErrors.length)}</span>
                </div>
              )}
              {simulationResult && inputErrors.length === 0 && (
                <div className="flex items-center gap-1 text-green-500 text-sm" aria-live="polite">
                  <CheckCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.valid}</span>
                </div>
              )}
              <Button variant="outline" className="gap-2" onClick={handleExport} disabled={!rows.length}>
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">{t.export}</span>
              </Button>
              <Button variant="outline" className="gap-2" onClick={resetAll}>
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">{t.reset}</span>
              </Button>
            </div>
          </div>

        </header>

        {/* Main */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
            <InputsPanel
              messages={t}
              showErrors={showErrors}
              translatedInputErrors={translatedInputErrors}
              isCalculating={isCalculating}
              initial={initial}
              initialInput={initialInput}
              onInitialChange={handleInitialChange}
              onInitialBlur={() => setInitialInput(formatInputNumber(initial))}
              hasInitialError={hasInitialError}
              monthly={monthly}
              monthlyInput={monthlyInput}
              onMonthlyChange={handleMonthlyChange}
              onMonthlyBlur={() => setMonthlyInput(formatInputNumber(monthly))}
              hasMonthlyError={hasMonthlyError}
              years={years}
              onYearsChange={setYears}
              annualPctInput={annualPctInput}
              onAnnualPctChange={handleAnnualPctChange}
              onAnnualPctBlur={() => setAnnualPctInput(formatInputNumber(annualPct))}
              hasAnnualPctError={hasAnnualPctError}
              reinvest={reinvest}
              onReinvestChange={setReinvest}
              inputErrorsCount={inputErrors.length}
              onCalculate={() => setShowErrors(inputErrors.length > 0)}
              onSaveScenario={addScenario}
              presetActions={{
                etfStarter: () => applySimulatorValues(SIMULATOR_PRESETS.etfStarter),
                balanced: () => applySimulatorValues(SIMULATOR_PRESETS.balanced),
                growth: () => applySimulatorValues(SIMULATOR_PRESETS.growth),
              }}
              quickStartActions={[
                () => setInitialInput(formatInputNumber(DEFAULT_SIMULATOR_VALUES.initial)),
                () => setMonthlyInput(formatInputNumber(DEFAULT_SIMULATOR_VALUES.monthly)),
                () => setMonthlyInput("500"),
                () => setYears(20),
              ]}
              startDate={startDate}
              onStartDateChange={setStartDate}
              onSetToday={() => setStartDate(toLocalDateInputValue())}
              compounding={compounding}
              onCompoundingChange={setCompounding}
              inflationPctInput={inflationPctInput}
              onInflationChange={setInflationPctInput}
              onInflationBlur={() => setInflationPctInput(formatInputNumber(inflationPct))}
              annualFeePctInput={annualFeePctInput}
              onAnnualFeeChange={setAnnualFeePctInput}
              onAnnualFeeBlur={() => setAnnualFeePctInput(formatInputNumber(annualFeePct))}
              stepUpAnnualPctInput={stepUpAnnualPctInput}
              onStepUpAnnualPctChange={setStepUpAnnualPctInput}
              onStepUpAnnualPctBlur={() => setStepUpAnnualPctInput(formatInputNumber(stepUpAnnualPct))}
              taxOnWithdrawPctInput={taxOnWithdrawPctInput}
              onTaxOnWithdrawPctChange={setTaxOnWithdrawPctInput}
              onTaxOnWithdrawPctBlur={() => setTaxOnWithdrawPctInput(formatInputNumber(taxOnWithdrawPct))}
              oneTimeDeposits={oneTimeDeposits}
              contributionPauses={contributionPauses}
              onAddDeposit={() => setOneTimeDeposits((prev) => [...prev, { month: 1, amount: 1000 }])}
              onUpdateDepositMonth={(index, value) =>
                setOneTimeDeposits((prev) =>
                  prev.map((entry, entryIndex) =>
                    entryIndex === index ? { ...entry, month: Math.max(1, value) } : entry
                  )
                )
              }
              onUpdateDepositAmount={(index, value) =>
                setOneTimeDeposits((prev) =>
                  prev.map((entry, entryIndex) =>
                    entryIndex === index ? { ...entry, amount: Math.max(0, value) } : entry
                  )
                )
              }
              onRemoveDeposit={(index) =>
                setOneTimeDeposits((prev) => prev.filter((_, entryIndex) => entryIndex !== index))
              }
              onAddPause={() => setContributionPauses((prev) => [...prev, { startMonth: 1, endMonth: 3 }])}
              onUpdatePauseStart={(index, value) =>
                setContributionPauses((prev) =>
                  prev.map((entry, entryIndex) =>
                    entryIndex === index ? { ...entry, startMonth: Math.max(1, value) } : entry
                  )
                )
              }
              onUpdatePauseEnd={(index, value) =>
                setContributionPauses((prev) =>
                  prev.map((entry, entryIndex) =>
                    entryIndex === index
                      ? { ...entry, endMonth: Math.max(entry.startMonth, value) }
                      : entry
                  )
                )
              }
              onRemovePause={(index) =>
                setContributionPauses((prev) => prev.filter((_, entryIndex) => entryIndex !== index))
              }
              maxMonth={months || 600}
            />

            {/* KPI */}
            {simulationResult && (
              <SummarySection
                fmtCurrency={fmtCurrency}
                totalContrib={totalContrib}
                totalGains={totalGains}
                totalValue={totalValue}
                yieldPct={yieldPct}
                initial={initial}
                monthly={monthly}
                months={months}
                irrAnnual={irrAnnual}
                reinvest={reinvest}
                messages={t.kpis}
              />
            )}

            {simulationResult && goalSolver && (
              <InsightsPanel
                goalSolver={goalSolver}
                targetAmountInput={targetAmountInput}
                onTargetAmountChange={setTargetAmountInput}
                onTargetAmountBlur={() => setTargetAmountInput(formatInputNumber(targetAmount))}
                delayYearsInput={delayYearsInput}
                onDelayYearsChange={setDelayYearsInput}
                onDelayYearsBlur={() => setDelayYearsInput(formatInputNumber(delayYears))}
                monthlyExpensesInput={monthlyExpensesInput}
                onMonthlyExpensesChange={setMonthlyExpensesInput}
                onMonthlyExpensesBlur={() => setMonthlyExpensesInput(formatInputNumber(monthlyExpenses))}
                safeWithdrawalRateInput={safeWithdrawalRateInput}
                onSafeWithdrawalRateChange={setSafeWithdrawalRateInput}
                onSafeWithdrawalRateBlur={() => setSafeWithdrawalRateInput(formatInputNumber(safeWithdrawalRate))}
                fmtCurrency={fmtCurrency}
                targetAmount={targetAmount}
                years={years}
                annualPct={annualPct}
                monthly={monthly}
                initial={initial}
                totalValue={totalValue}
                monthlyExpenses={monthlyExpenses}
                safeWithdrawalRate={safeWithdrawalRate}
                delayYears={delayYears}
                yearsLabel={t.years}
                goalSolverMessages={t.goalSolver}
                fireMessages={t.fire}
              />
            )}

            {simulationResult && (
              <ChartsPanel
                rows={rows}
                chartType={chartType}
                onChartTypeChange={setChartType}
                fmtCurrency={fmtCurrency}
                months={months}
                totalGains={totalGains}
                totalContrib={totalContrib}
                annualPct={annualPct}
                years={years}
                reinvest={reinvest}
                messages={t.chart}
              />
            )}

            <TrustPanel messages={t.trust} />

            <ScenarioComparisonPanel
              scenarios={scenarios}
              scenarioResults={scenarioResults}
              activeScenario={activeScenario}
              showComparison={showComparison}
              isLoading={scenarioResultsLoading}
              loadError={scenarioResultsError}
              onToggleComparison={() => setShowComparison(!showComparison)}
              onAddScenario={addScenario}
              onRemoveScenario={removeScenario}
              onDuplicateScenario={duplicateScenario}
              onMoveScenarioUp={(id) => moveScenario(id, -1)}
              onMoveScenarioDown={(id) => moveScenario(id, 1)}
              onLoadScenario={(scenario) => {
                applySimulatorValues({
                  initial: scenario.initial,
                  monthly: scenario.monthly,
                  years: scenario.years,
                  annualPct: scenario.annualPct,
                  reinvest: scenario.reinvest ?? reinvest,
                  compounding: scenario.compounding ?? compounding,
                  annualFeePct: scenario.annualFeePct ?? annualFeePct,
                  inflationPct: scenario.inflationPct ?? inflationPct,
                  stepUpAnnualPct: scenario.stepUpAnnualPct ?? stepUpAnnualPct,
                  taxOnWithdrawPct: scenario.taxOnWithdrawPct ?? taxOnWithdrawPct,
                  oneTimeDeposits: scenario.oneTimeDeposits ?? [],
                  contributionPauses: scenario.contributionPauses ?? [],
                })
                setActiveScenario(scenario.id)
                scrollTo("params")
              }}
              inputErrorsCount={inputErrors.length}
              fmtCurrency={fmtCurrency}
              yearsLabel={t.years}
              inflationFallbackPct={inflationPct}
              onExportJson={handleExportScenariosJson}
              onImportJson={handleImportScenariosClick}
              messages={t.scenarios}
            />

            <AssumptionsPanel messages={t.assumptions} />
            <NotesPanel
              notes={notes}
              onNotesChange={setNotes}
              onCopyNotes={() => copyToClipboard(notes)}
              messages={t.assumptions}
            />
          </div>
        </main>
      </div>

      <input
        ref={scenarioImportRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleImportScenarios}
      />

      {/* Mobile Drawer */}
      <MobileDrawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        title={t.menu}
        closeLabel={t.closeMenu}
        ariaLabel={t.menu}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="size-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 grid place-items-center text-white">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold">{t.appName}</h3>
              <p className="text-xs text-slate-500">{t.appVersion}</p>
            </div>
          </div>
          <SimulatorNavList items={navItems} onSelect={scrollTo} />
          {simulationResult && (
            <div className="pt-4 border-t">
              <QuickStatsCard
                label={t.mobile.finalValue}
                totalValue={fmtCurrency(totalValue)}
                roiLabel={`${t.mobile.roiPrefix}: +${yieldPct.toFixed(1)}%`}
                className="rounded-lg"
              />
            </div>
          )}
        </div>
      </MobileDrawer>
    </div>
  )
}
