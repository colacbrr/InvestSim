"use client"

type QuickStatsCardProps = {
  label: string
  totalValue: string
  roiLabel: string
  className?: string
}

export function QuickStatsCard({
  label,
  totalValue,
  roiLabel,
  className = "",
}: QuickStatsCardProps) {
  return (
    <div className={`bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border p-3 dark:from-green-900/20 dark:to-blue-900/20 ${className}`.trim()}>
      <div className="mb-1 text-xs text-slate-600 dark:text-slate-400">{label}</div>
      <div className="text-sm font-bold text-green-600 dark:text-green-400">{totalValue}</div>
      <div className="text-xs text-slate-500">{roiLabel}</div>
    </div>
  )
}
