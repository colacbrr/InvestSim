"use client"

import type { LucideIcon } from "lucide-react"

type NavItem = {
  id: string
  label: string
  Icon: LucideIcon
}

type SimulatorNavListProps = {
  items: NavItem[]
  onSelect: (id: string) => void
  className?: string
  buttonClassName?: string
}

export function SimulatorNavList({
  items,
  onSelect,
  className = "space-y-1 text-sm",
  buttonClassName = "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
}: SimulatorNavListProps) {
  return (
    <nav className={className}>
      {items.map(({ id, label, Icon }) => (
        <button key={id} onClick={() => onSelect(id)} className={buttonClassName}>
          <Icon className="h-4 w-4 shrink-0" />
          {label}
        </button>
      ))}
    </nav>
  )
}
