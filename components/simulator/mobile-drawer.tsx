"use client"

import React, { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export function MobileDrawer({
  open,
  onClose,
  children,
  title,
  closeLabel,
  ariaLabel,
}: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  title: string
  closeLabel: string
  ariaLabel: string
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
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
      <div className="fixed left-0 top-0 h-full w-72 bg-white shadow-xl dark:bg-slate-950" aria-label={ariaLabel}>
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Button variant="outline" onClick={onClose} aria-label={closeLabel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
