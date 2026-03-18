"use client"

import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ContributionPause, OneTimeDeposit } from "@/packages/shared/types"

type EventsMessages = {
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

type EventsPanelProps = {
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
  messages: EventsMessages
}

export function EventsPanel({
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
  messages,
}: EventsPanelProps) {
  return (
    <div className="space-y-4 rounded-xl border bg-white/70 p-4 dark:bg-slate-900/30">
      <div className="space-y-1">
        <Label className="text-sm font-semibold">{messages.title}</Label>
        <p className="text-xs text-slate-500">{messages.helper}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">{messages.depositsTitle}</Label>
            <Button type="button" variant="outline" size="sm" onClick={onAddDeposit}>
              <Plus className="mr-1 h-3 w-3" />
              {messages.add}
            </Button>
          </div>
          <div className="space-y-2">
            {oneTimeDeposits.length === 0 ? (
              <p className="rounded-lg border border-dashed p-3 text-xs text-slate-500">{messages.emptyDeposits}</p>
            ) : (
              oneTimeDeposits.map((deposit, index) => (
                <div
                  key={`deposit-${index}`}
                  className="grid grid-cols-1 gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_auto]"
                >
                  <Input
                    type="number"
                    min={1}
                    max={maxMonth || 600}
                    value={deposit.month}
                    onChange={(event) => onUpdateDepositMonth(index, Number(event.target.value) || 1)}
                    placeholder={messages.month}
                  />
                  <Input
                    type="number"
                    min={0}
                    value={deposit.amount}
                    onChange={(event) => onUpdateDepositAmount(index, Number(event.target.value) || 0)}
                    placeholder={messages.amount}
                  />
                  <Button type="button" variant="outline" onClick={() => onRemoveDeposit(index)}>
                    ×
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">{messages.pausesTitle}</Label>
            <Button type="button" variant="outline" size="sm" onClick={onAddPause}>
              <Plus className="mr-1 h-3 w-3" />
              {messages.add}
            </Button>
          </div>
          <div className="space-y-2">
            {contributionPauses.length === 0 ? (
              <p className="rounded-lg border border-dashed p-3 text-xs text-slate-500">{messages.emptyPauses}</p>
            ) : (
              contributionPauses.map((pause, index) => (
                <div
                  key={`pause-${index}`}
                  className="grid grid-cols-1 gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_auto]"
                >
                  <Input
                    type="number"
                    min={1}
                    value={pause.startMonth}
                    onChange={(event) => onUpdatePauseStart(index, Number(event.target.value) || 1)}
                    placeholder={messages.start}
                  />
                  <Input
                    type="number"
                    min={1}
                    value={pause.endMonth}
                    onChange={(event) => onUpdatePauseEnd(index, Number(event.target.value) || pause.startMonth)}
                    placeholder={messages.end}
                  />
                  <Button type="button" variant="outline" onClick={() => onRemovePause(index)}>
                    ×
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
