"use client"

import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, Percent, Target, TrendingUp } from "lucide-react"

type SummaryMessages = {
  totalContrib: string
  totalGains: string
  totalValue: string
  totalRoi: string
  totalContribution: string
  multiplier: string
  irr: string
  eachEuroBecomes: string
  irrReinvest: string
  irrWithdraw: string
}

export function SummarySection({
  fmtCurrency,
  totalContrib,
  totalGains,
  totalValue,
  yieldPct,
  initial,
  monthly,
  months,
  irrAnnual,
  reinvest,
  messages,
}: {
  fmtCurrency: (value: number) => string
  totalContrib: number
  totalGains: number
  totalValue: number
  yieldPct: number
  initial: number
  monthly: number
  months: number
  irrAnnual: number | null
  reinvest: boolean
  messages: SummaryMessages
}) {
  const cards = [
    {
      title: messages.totalContrib,
      value: fmtCurrency(totalContrib),
      Icon: Target,
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600",
    },
    {
      title: messages.totalGains,
      value: fmtCurrency(totalGains),
      Icon: TrendingUp,
      bgColor: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-600",
    },
    {
      title: messages.totalValue,
      value: fmtCurrency(totalValue),
      Icon: DollarSign,
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
      textColor: "text-indigo-600",
    },
    {
      title: messages.totalRoi,
      value: `${yieldPct > 0 ? "+" : ""}${yieldPct.toFixed(1)}%`,
      Icon: Percent,
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      textColor: "text-yellow-600",
    },
  ]

  return (
    <section id="summary">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {cards.map(({ title, value, Icon, textColor, bgColor }) => (
          <Card key={title} className={`${bgColor} border transition-shadow duration-200 hover:shadow-lg`}>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium opacity-70">{title}</p>
                  <p className="text-xl font-bold md:text-2xl">{value}</p>
                </div>
                <div className={`grid size-10 place-items-center rounded-lg bg-white shadow-sm md:size-12 ${textColor}`}>
                  <Icon className="h-5 w-5 md:h-6 md:w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
        <div className="rounded-lg border bg-white p-4 shadow-sm dark:bg-slate-800">
          <div className="mb-1 text-slate-600 dark:text-slate-400">{messages.totalContribution}</div>
          <div className="font-bold">{fmtCurrency(initial + monthly * months)}</div>
          <div className="mt-1 text-xs text-slate-500">
            Initial: {fmtCurrency(initial)} + {months} × {fmtCurrency(monthly)}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm dark:bg-slate-800">
          <div className="mb-1 text-slate-600 dark:text-slate-400">{messages.multiplier}</div>
          <div className="font-bold text-green-600">{(totalValue / Math.max(totalContrib, 1)).toFixed(2)}×</div>
          <div className="mt-1 text-xs text-slate-500">
            {messages.eachEuroBecomes.replace("{value}", fmtCurrency(totalValue / Math.max(totalContrib, 1)))}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm dark:bg-slate-800">
          <div className="mb-1 text-slate-600 dark:text-slate-400">{messages.irr}</div>
          <div className="font-bold text-blue-600">{irrAnnual !== null ? (irrAnnual * 100).toFixed(1) : "n/a"}%</div>
          <div className="mt-1 text-xs text-slate-500">
            {reinvest ? messages.irrReinvest : messages.irrWithdraw}
          </div>
        </div>
      </div>
    </section>
  )
}
