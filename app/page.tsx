export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe,_#f8fafc_45%,_#e2e8f0)] px-6 py-16 text-slate-900">
      <div className="mx-auto flex min-h-[80vh] max-w-5xl items-center">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-6">
            <div className="inline-flex items-center rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-sm font-medium text-blue-700 backdrop-blur">
              InvestSim
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
                Simulează investiții, obiective și scenarii de independență financiară.
              </h1>
              <p className="max-w-2xl text-lg text-slate-600">
                Calculezi contribuții lunare, randament, inflație, comisioane, FIRE number și costul de a amâna startul.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="/simulator"
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-700"
              >
                Încearcă simulatorul
              </a>
              <a
                href="/simulator#insights"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-800 transition-colors hover:bg-slate-50"
              >
                Vezi instrumentele
              </a>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                "Scenarii comparative",
                "Target solver și FIRE",
                "Persistență locală și export CSV",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm font-medium text-slate-700 shadow-sm backdrop-blur">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <aside className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-2xl shadow-slate-300/30 backdrop-blur">
            <h2 className="text-xl font-bold text-slate-950">Ce verifici prima dată</h2>
            <div className="mt-5 space-y-4">
              {[
                ["Contribuții", "Setezi capital inițial, contribuție lunară, durată și randament."],
                ["Ipoteze", "Adaugi inflație, comisioane, step-up anual și compunere."],
                ["Obiective", "Compari target amount, ani până la obiectiv și venit FIRE estimat."],
                ["Export", "Salvezi scenarii și exporți CSV pentru comparații rapide."],
              ].map(([title, body]) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-900">{title}</div>
                  <div className="mt-1 text-sm text-slate-600">{body}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-slate-950 p-4 text-sm text-slate-200">
              Ruta principal:
              <div className="mt-2 font-mono text-blue-300">/simulator</div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
