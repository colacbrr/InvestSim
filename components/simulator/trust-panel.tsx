"use client"

import { ShieldCheck } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type TrustMessages = {
  title: string
  modelVersionTitle: string
  modelVersionBody: string
  assumptionsTitle: string
  assumptions: readonly string[]
  limitationsTitle: string
  limitations: readonly string[]
}

export function TrustPanel({ messages }: { messages: TrustMessages }) {
  return (
    <section id="trust">
      <Card className="overflow-hidden rounded-2xl border-0 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-emerald-50 dark:from-slate-800 dark:to-slate-700">
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" /> {messages.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="rounded-xl border bg-emerald-50/70 p-4 dark:bg-emerald-900/10">
            <div className="mb-1 text-xs text-slate-500">{messages.modelVersionTitle}</div>
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{messages.modelVersionBody}</div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <h4 className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                {messages.assumptionsTitle}
              </h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {messages.assumptions.map((item) => (
                  <li key={item} className="rounded-lg border bg-white p-3 dark:bg-slate-800">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                {messages.limitationsTitle}
              </h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {messages.limitations.map((item) => (
                  <li key={item} className="rounded-lg border bg-white p-3 dark:bg-slate-800">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
