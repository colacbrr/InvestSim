"use client"

import { useEffect, useState } from "react"

import {
  detectPreferredLanguage,
  LANGUAGE_STORAGE_KEY,
  messages,
  type Language,
} from "@/lib/i18n/messages"

export default function HomePage() {
  const [language, setLanguage] = useState<Language>(() => detectPreferredLanguage())

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  }, [language])

  const t = messages[language]

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe,_#f8fafc_45%,_#e2e8f0)] px-6 py-16 text-slate-900">
      <div className="mx-auto flex min-h-[80vh] max-w-5xl items-center">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="inline-flex items-center rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-sm font-medium text-blue-700 backdrop-blur">
                {t.appName}
              </div>
              <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 p-1 text-xs font-semibold text-slate-600 backdrop-blur">
                <span className="px-2">{t.languageLabel}</span>
                <button
                  type="button"
                  onClick={() => setLanguage("ro")}
                  className={`rounded-full px-3 py-1 ${language === "ro" ? "bg-slate-900 text-white" : "text-slate-600"}`}
                >
                  {t.languageRo}
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`rounded-full px-3 py-1 ${language === "en" ? "bg-slate-900 text-white" : "text-slate-600"}`}
                >
                  {t.languageEn}
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
                {t.home.title}
              </h1>
              <p className="max-w-2xl text-lg text-slate-600">
                {t.home.subtitle}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="/simulator"
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-700"
              >
                {t.home.trySimulator}
              </a>
              <a
                href="/simulator#insights"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-800 transition-colors hover:bg-slate-50"
              >
                {t.home.viewTools}
              </a>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {t.home.cards.map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm font-medium text-slate-700 shadow-sm backdrop-blur">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <aside className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-2xl shadow-slate-300/30 backdrop-blur">
            <h2 className="text-xl font-bold text-slate-950">{t.home.firstCheck}</h2>
            <div className="mt-5 space-y-4">
              {t.home.firstCheckItems.map(([title, body]) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-900">{title}</div>
                  <div className="mt-1 text-sm text-slate-600">{body}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-slate-950 p-4 text-sm text-slate-200">
              {t.home.mainRoute}
              <div className="mt-2 font-mono text-blue-300">/simulator</div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
