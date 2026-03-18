"use client"

import { Copy, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type NotesMessages = {
  personalNotes: string
  notesPlaceholder: string
  characters: string
  copy: string
}

type NotesPanelProps = {
  notes: string
  onNotesChange: (value: string) => void
  onCopyNotes: () => void
  messages: NotesMessages
}

export function NotesPanel({ notes, onNotesChange, onCopyNotes, messages }: NotesPanelProps) {
  return (
    <section id="notes">
      <Card className="overflow-hidden rounded-2xl border-0 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" /> {messages.personalNotes}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <textarea
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
            placeholder={messages.notesPlaceholder}
            rows={8}
            maxLength={500}
            className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm transition-all focus:border-blue-500 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {notes.length}/500 {messages.characters}
            </span>
            <Button variant="outline" onClick={onCopyNotes} disabled={!notes} className="gap-1">
              <Copy className="h-3 w-3" /> {messages.copy}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
