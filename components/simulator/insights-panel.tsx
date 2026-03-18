"use client"

import { DollarSign, Target } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type GoalSolverMessages = {
  title: string
  targetPortfolio: string
  delayYears: string
  delayYearsHelp: string
  requiredMonthly: string
  yearsNeeded: string
  onTrack: string
  belowTarget: string
  targetStatus: string
  over60Years: string
  currentPaceHelp: string
  targetHelp: string
  targetStatusHelp: string
}

type FireMessages = {
  title: string
  targetMonthlyExpenses: string
  swr: string
  swrHelp: string
  fireNumber: string
  supportedIncome: string
  delayCost: string
  status: string
  almostThere: string
  stillBuilding: string
  sectionHelp: string
  fireHelp: string
  supportedHelp: string
  delayHelp: string
  statusHelpAbove: string
  statusHelpBelow: string
}

type GoalSolverResult = {
  requiredMonthly: number | null
  yearsNeeded: number | null
  fireNumber: number
  supportedAnnualIncome: number
  reachesGoal: boolean
  reachesFire: boolean
  delayCost: number
}

type InsightsPanelProps = {
  goalSolver: GoalSolverResult
  targetAmountInput: string
  onTargetAmountChange: (value: string) => void
  onTargetAmountBlur: () => void
  delayYearsInput: string
  onDelayYearsChange: (value: string) => void
  onDelayYearsBlur: () => void
  monthlyExpensesInput: string
  onMonthlyExpensesChange: (value: string) => void
  onMonthlyExpensesBlur: () => void
  safeWithdrawalRateInput: string
  onSafeWithdrawalRateChange: (value: string) => void
  onSafeWithdrawalRateBlur: () => void
  fmtCurrency: (value: number) => string
  targetAmount: number
  years: number
  annualPct: number
  monthly: number
  initial: number
  totalValue: number
  monthlyExpenses: number
  safeWithdrawalRate: number
  delayYears: number
  yearsLabel: string
  goalSolverMessages: GoalSolverMessages
  fireMessages: FireMessages
}

export function InsightsPanel({
  goalSolver,
  targetAmountInput,
  onTargetAmountChange,
  onTargetAmountBlur,
  delayYearsInput,
  onDelayYearsChange,
  onDelayYearsBlur,
  monthlyExpensesInput,
  onMonthlyExpensesChange,
  onMonthlyExpensesBlur,
  safeWithdrawalRateInput,
  onSafeWithdrawalRateChange,
  onSafeWithdrawalRateBlur,
  fmtCurrency,
  targetAmount,
  years,
  annualPct,
  monthly,
  initial,
  totalValue,
  monthlyExpenses,
  safeWithdrawalRate,
  delayYears,
  yearsLabel,
  goalSolverMessages,
  fireMessages,
}: InsightsPanelProps) {
  return (
    <section id="insights">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="border shadow-lg">
          <CardHeader className="border-b bg-slate-50 dark:bg-slate-800">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-600" /> {goalSolverMessages.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">{goalSolverMessages.targetPortfolio}</Label>
                <div className="relative">
                  <Input
                    type="number"
                    min={0}
                    value={targetAmountInput}
                    onChange={(event) => onTargetAmountChange(event.target.value)}
                    onBlur={onTargetAmountBlur}
                    className="h-11 pl-8"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">€</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">{goalSolverMessages.delayYears}</Label>
                <div className="relative">
                  <Input
                    type="number"
                    min={0}
                    max={20}
                    value={delayYearsInput}
                    onChange={(event) => onDelayYearsChange(event.target.value)}
                    onBlur={onDelayYearsBlur}
                    className="h-11 pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">{yearsLabel}</span>
                </div>
                <p className="text-xs text-slate-500">{goalSolverMessages.delayYearsHelp}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border bg-indigo-50/70 p-4 dark:bg-indigo-900/10">
                <div className="mb-1 text-xs text-slate-500">{goalSolverMessages.requiredMonthly}</div>
                <div className="text-2xl font-bold text-indigo-600">
                  {goalSolver.requiredMonthly !== null ? fmtCurrency(goalSolver.requiredMonthly) : "n/a"}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {goalSolverMessages.targetHelp
                    .replace("{target}", fmtCurrency(targetAmount))
                    .replace("{years}", String(years))
                    .replace("{rate}", String(annualPct))}
                </p>
              </div>
              <div className="rounded-xl border bg-blue-50/70 p-4 dark:bg-blue-900/10">
                <div className="mb-1 text-xs text-slate-500">{goalSolverMessages.yearsNeeded}</div>
                <div className="text-2xl font-bold text-blue-600">
                  {goalSolver.yearsNeeded !== null ? `${goalSolver.yearsNeeded} ${yearsLabel}` : goalSolverMessages.over60Years}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {goalSolverMessages.currentPaceHelp
                    .replace("{monthly}", fmtCurrency(monthly))
                    .replace("{initial}", fmtCurrency(initial))}
                </p>
              </div>
            </div>

            <div className="rounded-xl border bg-slate-50 p-4 dark:bg-slate-800/60">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{goalSolverMessages.targetStatus}</span>
                <span className={goalSolver.reachesGoal ? "font-semibold text-green-600" : "font-semibold text-amber-600"}>
                  {goalSolver.reachesGoal ? goalSolverMessages.onTrack : goalSolverMessages.belowTarget}
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                {goalSolverMessages.targetStatusHelp
                  .replace("{total}", fmtCurrency(totalValue))
                  .replace("{target}", fmtCurrency(targetAmount))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-lg">
          <CardHeader className="border-b bg-slate-50 dark:bg-slate-800">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" /> {fireMessages.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 p-6">
            <div className="rounded-xl border bg-slate-50 p-4 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
              {fireMessages.sectionHelp}
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">{fireMessages.targetMonthlyExpenses}</Label>
                <div className="relative">
                  <Input
                    type="number"
                    min={0}
                    value={monthlyExpensesInput}
                    onChange={(event) => onMonthlyExpensesChange(event.target.value)}
                    onBlur={onMonthlyExpensesBlur}
                    className="h-11 pl-8"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">€</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">{fireMessages.swr}</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step={0.1}
                    min={1}
                    max={10}
                    value={safeWithdrawalRateInput}
                    onChange={(event) => onSafeWithdrawalRateChange(event.target.value)}
                    onBlur={onSafeWithdrawalRateBlur}
                    className="h-11 pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">%</span>
                </div>
                <p className="text-xs text-slate-500">{fireMessages.swrHelp}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border bg-green-50/70 p-4 dark:bg-green-900/10">
                <div className="mb-1 text-xs text-slate-500">{fireMessages.fireNumber}</div>
                <div className="text-2xl font-bold text-green-600">{fmtCurrency(goalSolver.fireNumber)}</div>
                <p className="mt-2 text-xs text-slate-500">
                  {fireMessages.fireHelp.replace("{monthly}", fmtCurrency(monthlyExpenses))}
                </p>
              </div>
              <div className="rounded-xl border bg-emerald-50/70 p-4 dark:bg-emerald-900/10">
                <div className="mb-1 text-xs text-slate-500">{fireMessages.supportedIncome}</div>
                <div className="text-2xl font-bold text-emerald-600">
                  {fmtCurrency(goalSolver.supportedAnnualIncome)}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {fireMessages.supportedHelp.replace("{rate}", String(safeWithdrawalRate))}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border bg-amber-50/70 p-4 dark:bg-amber-900/10">
                <div className="mb-1 text-xs text-slate-500">
                  {fireMessages.delayCost.replace("{years}", String(delayYears))}
                </div>
                <div className="text-2xl font-bold text-amber-600">{fmtCurrency(goalSolver.delayCost)}</div>
                <p className="mt-2 text-xs text-slate-500">{fireMessages.delayHelp}</p>
              </div>
              <div className="rounded-xl border bg-slate-50 p-4 dark:bg-slate-800/60">
                <div className="mb-1 text-xs text-slate-500">{fireMessages.status}</div>
                <div className={`text-2xl font-bold ${goalSolver.reachesFire ? "text-green-600" : "text-rose-600"}`}>
                  {goalSolver.reachesFire ? fireMessages.almostThere : fireMessages.stillBuilding}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {goalSolver.reachesFire ? fireMessages.statusHelpAbove : fireMessages.statusHelpBelow}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
