"use client"

import { AlertCircle, CheckCircle, FileText } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type AssumptionsMessages = {
  title: string
  assumptionsTitle: string
  assumptionsList: readonly string[]
  tipsTitle: string
  tips: readonly (readonly [string, string])[]
  warningTitle: string
  warningBody: string
}

type AssumptionsPanelProps = {
  messages: AssumptionsMessages
}

export function AssumptionsPanel({ messages }: AssumptionsPanelProps) {
  return (
    <section id="assumptions">
      <Card className="overflow-hidden rounded-2xl border-0 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-green-50 dark:from-slate-800 dark:to-slate-700">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" /> {messages.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div>
            <h4 className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-300">
              {messages.assumptionsTitle}
            </h4>
            <ul className="space-y-2 text-sm">
              {messages.assumptionsList.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20">
            <h4 className="mb-2 text-sm font-bold text-blue-700 dark:text-blue-300">{messages.tipsTitle}</h4>
            <div className="grid grid-cols-1 gap-4 text-xs text-blue-600 dark:text-blue-400 md:grid-cols-2">
              {messages.tips.map(([title, body]) => (
                <div key={title}>
                  <strong>{title}</strong> {body}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-xs text-slate-500 dark:border-yellow-800 dark:bg-yellow-900/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
              <div>
                <strong className="text-yellow-700 dark:text-yellow-400">{messages.warningTitle}</strong>{" "}
                {messages.warningBody}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
