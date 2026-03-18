"use client"

import type { ChangeEvent } from "react"
import {
  Calculator,
  Calendar,
  Percent,
  Plus,
  RefreshCw,
  Rocket,
  Settings,
  Target,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { EventsPanel } from "@/components/simulator/events-panel"
import type { CompoundingMode, ContributionPause, OneTimeDeposit } from "@/packages/shared/types"

type InputsMessages = {
  startNow: string
  quickStarts: readonly string[]
  validationErrors: string
  inputPlaceholders: {
    initial: string
    monthly: string
    annualReturn: string
  }
  configuring: string
  calculating: string
  initialCapital: string
  initialCapitalHelp: string
  monthlyContribution: string
  duration: string
  selectDuration: string
  year: string
  years: string
  durationHelp: string
  annualReturn: string
  returnRanges: readonly string[]
  autoReinvest: string
  autoReinvestHelp: string
  toggleReinvest: string
  calculateSimulation: string
  saveScenario: string
  startDate: string
  today: string
  startDateHelp: string
  advancedSettings: string
  advancedSettingsHelp: string
  compounding: string
  inflation: string
  annualFee: string
  contributionGrowth: string
  withdrawalTax: string
  compoundingOptions: {
    monthly: string
    annual: string
    daily: string
  }
  presetsTitle: string
  presets: {
    etfStarter: string
    balanced: string
    growth: string
  }
  events: {
    title: string
    depositsTitle: string
    pausesTitle: string
    add: string
    emptyDeposits: string
    emptyPauses: string
    month: string
    amount: string
    start: string
    end: string
    helper: string
  }
}

type InputsPanelProps = {
  messages: InputsMessages
  showErrors: boolean
  translatedInputErrors: string[]
  isCalculating: boolean
  initial: number
  initialInput: string
  onInitialChange: (event: ChangeEvent<HTMLInputElement>) => void
  onInitialBlur: () => void
  hasInitialError: boolean
  monthly: number
  monthlyInput: string
  onMonthlyChange: (event: ChangeEvent<HTMLInputElement>) => void
  onMonthlyBlur: () => void
  hasMonthlyError: boolean
  years: number
  onYearsChange: (value: number) => void
  annualPctInput: string
  onAnnualPctChange: (event: ChangeEvent<HTMLInputElement>) => void
  onAnnualPctBlur: () => void
  hasAnnualPctError: boolean
  reinvest: boolean
  onReinvestChange: (value: boolean) => void
  inputErrorsCount: number
  onCalculate: () => void
  onSaveScenario: () => void
  presetActions: {
    etfStarter: () => void
    balanced: () => void
    growth: () => void
  }
  quickStartActions: (() => void)[]
  startDate: string
  onStartDateChange: (value: string) => void
  onSetToday: () => void
  compounding: CompoundingMode
  onCompoundingChange: (value: CompoundingMode) => void
  inflationPctInput: string
  onInflationChange: (value: string) => void
  onInflationBlur: () => void
  annualFeePctInput: string
  onAnnualFeeChange: (value: string) => void
  onAnnualFeeBlur: () => void
  stepUpAnnualPctInput: string
  onStepUpAnnualPctChange: (value: string) => void
  onStepUpAnnualPctBlur: () => void
  taxOnWithdrawPctInput: string
  onTaxOnWithdrawPctChange: (value: string) => void
  onTaxOnWithdrawPctBlur: () => void
  oneTimeDeposits: OneTimeDeposit[]
  contributionPauses: ContributionPause[]
  onAddDeposit: () => void
  onUpdateDepositMonth: (index: number, value: number) => void
  onUpdateDepositAmount: (index: number, value: number) => void
  onRemoveDeposit: (index: number) => void
  onAddPause: () => void
  onUpdatePauseStart: (index: number, value: number) => void
  onUpdatePauseEnd: (index: number, value: number) => void
  onRemovePause: (index: number) => void
  maxMonth: number
}

export function InputsPanel({
  messages,
  showErrors,
  translatedInputErrors,
  isCalculating,
  initial,
  initialInput,
  onInitialChange,
  onInitialBlur,
  hasInitialError,
  monthly,
  monthlyInput,
  onMonthlyChange,
  onMonthlyBlur,
  hasMonthlyError,
  years,
  onYearsChange,
  annualPctInput,
  onAnnualPctChange,
  onAnnualPctBlur,
  hasAnnualPctError,
  reinvest,
  onReinvestChange,
  inputErrorsCount,
  onCalculate,
  onSaveScenario,
  presetActions,
  quickStartActions,
  startDate,
  onStartDateChange,
  onSetToday,
  compounding,
  onCompoundingChange,
  inflationPctInput,
  onInflationChange,
  onInflationBlur,
  annualFeePctInput,
  onAnnualFeeChange,
  onAnnualFeeBlur,
  stepUpAnnualPctInput,
  onStepUpAnnualPctChange,
  onStepUpAnnualPctBlur,
  taxOnWithdrawPctInput,
  onTaxOnWithdrawPctChange,
  onTaxOnWithdrawPctBlur,
  oneTimeDeposits,
  contributionPauses,
  onAddDeposit,
  onUpdateDepositMonth,
  onUpdateDepositAmount,
  onRemoveDeposit,
  onAddPause,
  onUpdatePauseStart,
  onUpdatePauseEnd,
  onRemovePause,
  maxMonth,
}: InputsPanelProps) {
  const quickStarts = messages.quickStarts.map((label, index) => ({
    label,
    action: quickStartActions[index],
  }))

  const presets = [
    { label: messages.presets.etfStarter, apply: presetActions.etfStarter },
    { label: messages.presets.balanced, apply: presetActions.balanced },
    { label: messages.presets.growth, apply: presetActions.growth },
  ]

  return (
    <>
      {(initial === 0 || monthly === 0) && (
        <div className="max-w-7xl mx-auto px-4 md:px-6 pb-3">
          <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm dark:border-blue-800 dark:bg-blue-900/20">
            <Rocket className="h-4 w-4" />
            <span>{messages.startNow}</span>
            <div className="ml-auto flex gap-2">
              {quickStarts.map((quickStart) =>
                quickStart.action ? (
                  <Button key={quickStart.label} size="sm" variant="outline" onClick={quickStart.action}>
                    {quickStart.label}
                  </Button>
                ) : null
              )}
            </div>
          </div>
        </div>
      )}

      {showErrors && translatedInputErrors.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <div className="mb-2 flex items-center gap-2 text-red-700 dark:text-red-300">
            <Target className="h-4 w-4" />
            <span className="font-semibold">{messages.validationErrors}</span>
          </div>
          <ul className="space-y-1 text-sm text-red-600 dark:text-red-400">
            {translatedInputErrors.map((error) => (
              <li key={error} className="flex gap-2">
                <span>•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <section id="params">
        <Card className="border shadow-lg">
          <CardHeader className="border-b bg-slate-50 dark:bg-slate-800">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" /> {messages.configuring}
              </div>
              {isCalculating && (
                <div className="flex items-center gap-2 text-blue-600">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-sm">{messages.calculating}</span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  <Target className="h-4 w-4 text-green-600" /> {messages.initialCapital}
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    min={0}
                    value={initialInput}
                    onChange={onInitialChange}
                    onBlur={onInitialBlur}
                    className={`h-11 pl-8 ${hasInitialError ? "border-red-300 focus:border-red-500" : "focus:border-blue-500"}`}
                    placeholder={messages.inputPlaceholders.initial}
                    aria-label={messages.initialCapital}
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">€</span>
                </div>
                <p className="text-xs text-slate-500">{messages.initialCapitalHelp}</p>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  <Calendar className="h-4 w-4 text-blue-600" /> {messages.monthlyContribution}
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    min={0}
                    value={monthlyInput}
                    onChange={onMonthlyChange}
                    onBlur={onMonthlyBlur}
                    className={`h-11 pl-8 ${hasMonthlyError ? "border-red-300 focus:border-red-500" : "focus:border-blue-500"}`}
                    placeholder={messages.inputPlaceholders.monthly}
                    aria-label={messages.monthlyContribution}
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">€</span>
                </div>
                <div className="space-y-2">
                  <Slider
                    value={[monthly]}
                    min={0}
                    max={2000}
                    step={25}
                    onValueChange={(value) => onMonthlyChange({ target: { value: String(value[0]) } } as ChangeEvent<HTMLInputElement>)}
                  />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>€0</span>
                    <span className="font-medium text-blue-600">€{monthly}</span>
                    <span>€2,000</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  <Calendar className="h-4 w-4 text-purple-600" /> {messages.duration}
                </Label>
                <Select value={String(years)} onValueChange={(value) => onYearsChange(Number(value))}>
                  <SelectTrigger>
                    <div className="flex h-11 w-full items-center">
                      <SelectValue placeholder={messages.selectDuration} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 3, 5, 10, 15, 20, 25, 30, 40, 50].map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year} {year === 1 ? messages.year : messages.years}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">{messages.durationHelp}</p>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  <Percent className="h-4 w-4 text-yellow-600" /> {messages.annualReturn}
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    step={0.1}
                    min={-50}
                    max={50}
                    value={annualPctInput}
                    onChange={onAnnualPctChange}
                    onBlur={onAnnualPctBlur}
                    className={`h-11 pr-8 ${hasAnnualPctError ? "border-red-300 focus:border-red-500" : "focus:border-blue-500"}`}
                    placeholder={messages.inputPlaceholders.annualReturn}
                    aria-label={messages.annualReturn}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">%</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  {messages.returnRanges.map((range) => (
                    <span key={range}>{range}</span>
                  ))}
                </div>
              </div>

              <div className="space-y-4 md:col-span-2">
                <div className="flex items-center justify-between rounded-lg border bg-slate-50 p-4 dark:bg-slate-800">
                  <div>
                    <Label className="text-sm font-semibold">{messages.autoReinvest}</Label>
                    <p className="mt-1 text-xs text-slate-500">{messages.autoReinvestHelp}</p>
                  </div>
                  <Switch checked={reinvest} onCheckedChange={onReinvestChange} aria-label={messages.toggleReinvest} />
                </div>

                <div className="flex gap-3">
                  <Button
                    className="h-11 flex-1 gap-2 bg-blue-600 text-white hover:bg-blue-700"
                    disabled={inputErrorsCount > 0 || isCalculating}
                    onClick={onCalculate}
                  >
                    <Calculator className="h-4 w-4" /> {isCalculating ? messages.calculating : messages.calculateSimulation}
                  </Button>
                  <Button variant="outline" className="h-11 gap-2" onClick={onSaveScenario} disabled={inputErrorsCount > 0}>
                    <Plus className="h-4 w-4" /> {messages.saveScenario}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">{messages.presetsTitle}</Label>
                  <div className="flex flex-wrap gap-2">
                    {presets.map((preset) => (
                      <Button key={preset.label} type="button" variant="outline" size="sm" onClick={preset.apply}>
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Label className="min-w-40">{messages.startDate}</Label>
                  <div className="flex flex-1 items-center gap-3">
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(event) => onStartDateChange(event.target.value)}
                      className="h-10"
                      aria-label={messages.startDate}
                    />
                    <Button type="button" variant="outline" className="shrink-0" onClick={onSetToday}>
                      {messages.today}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-slate-500">{messages.startDateHelp}</p>

                <div className="space-y-4 rounded-xl border bg-slate-50 p-4 dark:bg-slate-800/60">
                  <div>
                    <Label className="text-sm font-semibold">{messages.advancedSettings}</Label>
                    <p className="mt-1 text-xs text-slate-500">{messages.advancedSettingsHelp}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">{messages.compounding}</Label>
                      <Select value={compounding} onValueChange={(value) => onCompoundingChange(value as CompoundingMode)}>
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">{messages.compoundingOptions.monthly}</SelectItem>
                          <SelectItem value="annual">{messages.compoundingOptions.annual}</SelectItem>
                          <SelectItem value="daily">{messages.compoundingOptions.daily}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">{messages.inflation}</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          step={0.1}
                          value={inflationPctInput}
                          onChange={(event) => onInflationChange(event.target.value)}
                          onBlur={onInflationBlur}
                          className="h-10 pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">{messages.annualFee}</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          step={0.1}
                          value={annualFeePctInput}
                          onChange={(event) => onAnnualFeeChange(event.target.value)}
                          onBlur={onAnnualFeeBlur}
                          className="h-10 pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">{messages.contributionGrowth}</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          step={0.1}
                          value={stepUpAnnualPctInput}
                          onChange={(event) => onStepUpAnnualPctChange(event.target.value)}
                          onBlur={onStepUpAnnualPctBlur}
                          className="h-10 pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">{messages.withdrawalTax}</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          step={0.1}
                          value={taxOnWithdrawPctInput}
                          onChange={(event) => onTaxOnWithdrawPctChange(event.target.value)}
                          onBlur={onTaxOnWithdrawPctBlur}
                          className="h-10 pr-8"
                          disabled={reinvest}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">%</span>
                      </div>
                    </div>
                  </div>

                  <EventsPanel
                    oneTimeDeposits={oneTimeDeposits}
                    contributionPauses={contributionPauses}
                    onAddDeposit={onAddDeposit}
                    onUpdateDepositMonth={onUpdateDepositMonth}
                    onUpdateDepositAmount={onUpdateDepositAmount}
                    onRemoveDeposit={onRemoveDeposit}
                    onAddPause={onAddPause}
                    onUpdatePauseStart={onUpdatePauseStart}
                    onUpdatePauseEnd={onUpdatePauseEnd}
                    onRemovePause={onRemovePause}
                    maxMonth={maxMonth}
                    messages={messages.events}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  )
}
