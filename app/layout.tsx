import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'InvestSim - Investment Planning Simulator',
  description: 'Simulare investiții, scenarii financiare, FIRE și planificare pe termen lung',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  )
}
