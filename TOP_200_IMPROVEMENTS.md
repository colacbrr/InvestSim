# InvestSim Top 200 Improvements

This file is a working roadmap for turning `InvestSim` from a promising local
simulator into a serious financial modeling product.

The current repo already has:

- a Next.js app shell
- a large client-side simulator page
- support for fees, inflation, step-up contributions, CSV export, scenarios,
  chart views, and approximate IRR
- mobile drawer navigation

The biggest gaps are:

- math engine structure and testability
- product trust and explanation
- mobile and phone-first usability
- backend/API shape and persistence
- realistic investing workflows beyond a single toy simulation

Difficulty legend:

- `S`: Starter
- `M`: Medium
- `H`: Hard
- `X`: Expert / long-horizon

Status legend:

- `[ ]` not started
- `[~]` in progress
- `[x]` done

## 1-50: Foundation and Fast Wins

1. [ ] `S` Add a real `README.md` with project purpose, scope, screenshots, and setup.
2. [ ] `S` Rename the app consistently to `InvestSim` instead of mixed `FinApp` / `InvestSim Pro`.
3. [ ] `S` Add an architecture section explaining what is client-side vs future server-side.
4. [ ] `S` Extract the simulation engine from `app/simulator/page.tsx` into `lib/simulation/`.
5. [ ] `S` Extract formatting helpers into `lib/format/`.
6. [ ] `S` Define a single canonical `SimulationInput` type in `packages/shared/types.ts`.
7. [ ] `S` Define a canonical `SimulationOutput` type in `packages/shared/types.ts`.
8. [ ] `S` Remove duplicated inline types where shared types should exist.
9. [ ] `S` Add unit tests for the `simulate()` function.
10. [ ] `S` Add tests for `computeIRRFromRows()`.
11. [ ] `S` Add tests for invalid input cases.
12. [ ] `S` Add snapshot tests for CSV export shape.
13. [ ] `S` Add edge-case tests for zero contributions and zero years.
14. [ ] `S` Add tests for negative return scenarios.
15. [ ] `S` Add tests for annual vs monthly compounding consistency.
16. [ ] `S` Add tests for fee handling.
17. [ ] `S` Add tests for inflation-adjusted real-value math.
18. [ ] `S` Add tests for non-reinvested gains.
19. [ ] `S` Add tests for step-up annual contribution logic.
20. [ ] `S` Create a `docs/math-assumptions.md`.
21. [ ] `S` Document which formulas are exact and which are approximations.
22. [ ] `S` Add an explanation tooltip for IRR/TIR.
23. [ ] `S` Add an explanation tooltip for nominal vs real return.
24. [ ] `S` Add an explanation tooltip for annual fee drag.
25. [ ] `S` Add an explanation tooltip for reinvest vs withdraw mode.
26. [ ] `S` Replace magic numbers with named constants.
27. [ ] `S` Add a global app settings store for currency, locale, and theme.
28. [ ] `S` Make the home page actually reflect simulator value instead of generic finance text.
29. [ ] `S` Add an “About the model” section to the simulator page.
30. [ ] `S` Add a “Not financial advice” but actually useful disclaimer.
31. [ ] `S` Add a “Known limitations” section.
32. [ ] `S` Add empty-state polish for charts, scenarios, and notes.
33. [ ] `S` Improve mobile spacing and tap targets across the simulator.
34. [ ] `S` Add sticky summary cards on mobile.
35. [ ] `S` Add desktop keyboard shortcuts for reset, add scenario, export.
36. [ ] `S` Add a one-click “copy share summary” button.
37. [ ] `S` Add URL query serialization for current simulator state.
38. [ ] `S` Add restore-from-URL support.
39. [ ] `S` Add local persistence with `localStorage`.
40. [ ] `S` Add a “restore last session” prompt on first load.
41. [ ] `S` Add a “duplicate scenario” button.
42. [ ] `S` Add scenario reordering.
43. [ ] `S` Add color selection for scenarios.
44. [ ] `S` Add scenario notes separate from app-level notes.
45. [ ] `S` Add a compact mobile scenario card layout.
46. [ ] `S` Add form-level validation summaries before calculation.
47. [ ] `S` Add inline validation on blur, not only on submit/show errors.
48. [ ] `S` Add sliders and numeric input sync guards to prevent jumpiness.
49. [ ] `S` Add accessible labels and `aria-describedby` for every input.
50. [ ] `S` Add a quick-start preset picker: ETF growth, balanced, conservative, high-risk.

## 51-100: Product Quality and Better Math

51. [ ] `M` Split the giant simulator page into sections/components.
52. [ ] `M` Create `SimulationInputsPanel`.
53. [ ] `M` Create `SimulationSummaryPanel`.
54. [ ] `M` Create `SimulationChartsPanel`.
55. [ ] `M` Create `ScenarioComparisonPanel`.
56. [ ] `M` Create `AssumptionsPanel`.
57. [ ] `M` Create `NotesPanel`.
58. [ ] `M` Create `PhoneControlPanel` variant for narrow screens.
59. [ ] `M` Use route segments so `/simulator` can support tabs without one huge client file.
60. [ ] `M` Add a backend simulation endpoint using App Router route handlers instead of ad hoc file placement.
61. [ ] `M` Validate API input with `zod`.
62. [ ] `M` Move simulation requests to a shared server-safe module.
63. [ ] `M` Add server-side integration tests for the simulation endpoint.
64. [ ] `M` Add a deterministic seed option for stochastic future models.
65. [ ] `M` Add support for one-time deposits on arbitrary months.
66. [ ] `M` Add support for pauses in monthly contributions.
67. [ ] `M` Add support for contribution holidays.
68. [ ] `M` Add support for annual bonus deposits.
69. [ ] `M` Add support for withdrawal plans after retirement date.
70. [ ] `M` Add support for accumulation and decumulation phases.
71. [ ] `M` Add portfolio glide-path modeling by age or year.
72. [ ] `M` Add inflation-linked contribution growth as a separate option from salary step-up.
73. [ ] `M` Add tax wrappers: taxable, tax-deferred, tax-free.
74. [ ] `M` Add capital-gains tax assumptions by jurisdiction profile.
75. [ ] `M` Add dividend yield as a separate parameter from capital appreciation.
76. [ ] `M` Add dividend reinvest toggle distinct from total-return mode.
77. [ ] `M` Add TER / fund expense ratio as an explicit fund-level concept.
78. [ ] `M` Add transaction cost modeling.
79. [ ] `M` Add periodic rebalancing costs.
80. [ ] `M` Add contribution timing choice: start of month vs end of month.
81. [ ] `M` Add date-accurate daily compounding instead of approximate monthly conversion only.
82. [ ] `M` Add sensitivity analysis around annual return, inflation, and fees.
83. [ ] `M` Add break-even contribution charts.
84. [ ] `M` Add “how much do I need monthly to reach X” solver.
85. [ ] `M` Add “when will I reach X” solver.
86. [ ] `M` Add “what return is required for X” solver.
87. [ ] `M` Add fee impact visualization over long horizons.
88. [ ] `M` Add inflation erosion visualization.
89. [ ] `M` Add “wealth in today’s money” as a first-class metric.
90. [ ] `M` Add CAGR and money-weighted return side by side.
91. [ ] `M` Add drawdown metrics once stochastic paths exist.
92. [ ] `M` Add monthly and annual return tables.
93. [ ] `M` Add downloadable PDF report generation.
94. [ ] `M` Add print-friendly report mode.
95. [ ] `M` Add chart image export.
96. [ ] `M` Add portfolio allocation pie/bar chart for multi-asset scenarios.
97. [ ] `M` Add a compare-two-scenarios diff mode with highlighted deltas.
98. [ ] `M` Add explicit confidence labels around approximations.
99. [ ] `M` Add a “trust panel” listing formula source, assumptions, and version.
100. [ ] `M` Add versioned simulation schema so old saved scenarios can migrate cleanly.

## 101-150: Mobile, Remote, and Workflow Expansion

101. [ ] `M` Add proper PWA support for phone installation.
102. [ ] `M` Add offline mode for saved scenarios and recent reports.
103. [ ] `M` Add app icons, splash screen, and mobile install metadata.
104. [ ] `M` Add a narrow-screen chart mode with simplified legends.
105. [ ] `M` Add thumb-friendly scenario editing sheets.
106. [ ] `M` Add a swipeable card-based summary layout for phone.
107. [ ] `M` Add a “commuter mode” with one-handed input ergonomics.
108. [ ] `M` Add dark/light/system theme switching.
109. [ ] `M` Add high-contrast accessibility theme.
110. [ ] `M` Add haptic-friendly interaction ideas if wrapped later for mobile.
111. [ ] `M` Add session save indicators so users trust autosave.
112. [ ] `M` Add account-less anonymous cloud sync via share links first.
113. [ ] `M` Add authenticated accounts later only when needed.
114. [ ] `M` Add “phone summary view” for checking plan status quickly on Tailscale.
115. [ ] `M` Add “desktop analysis view” with denser tables and bigger charts.
116. [ ] `M` Add responsive report layouts that work well over Remote-Terminal testing workflows.
117. [ ] `M` Add a dev doc explaining how to run the app through Tailscale on phone.
118. [ ] `M` Add a helper script similar to `Remote-Terminal` for local app publishing via Tailscale Serve.
119. [ ] `M` Add an `InvestSim` dev dashboard URL helper that prints the phone URL.
120. [ ] `M` Add a “safe local bind + Tailscale publish” workflow for testing on Windows and Linux.
121. [ ] `M` Add a Windows setup guide for local dev.
122. [ ] `M` Add a Linux setup guide for local dev.
123. [ ] `M` Add cross-platform scripts for install, lint, test, and dev.
124. [ ] `M` Add a remote QA checklist for phone testing.
125. [ ] `M` Add touch-device-specific bugs checklist.
126. [ ] `M` Add device snapshots for iPhone narrow widths.
127. [ ] `M` Add device snapshots for Android widths.
128. [ ] `M` Add landscape mode refinement for tablets and foldables.
129. [ ] `M` Add a “present to client” mode with simplified narrative output.
130. [ ] `M` Add “advisor mode” with assumptions sidebar and editable talking points.
131. [ ] `M` Add multiple currencies with localized formatting.
132. [ ] `M` Add FX assumptions for investing in one currency and spending in another.
133. [ ] `M` Add shareable scenario comparison URLs.
134. [ ] `M` Add signed report links if a backend persists reports later.
135. [ ] `M` Add basic analytics for which features users actually open.
136. [ ] `M` Add structured error telemetry.
137. [ ] `M` Add remote crash diagnostics for phone-only failures.
138. [ ] `M` Add a “report wrong math” feedback action.
139. [ ] `M` Add release notes inside the app.
140. [ ] `M` Add onboarding that explains compounding, fees, and inflation.
141. [ ] `M` Add a glossary of investment terms.
142. [ ] `M` Add a scenario library for common life stages.
143. [ ] `M` Add educational callouts when users choose unrealistic settings.
144. [ ] `M` Add warnings when annual return assumptions are overly optimistic.
145. [ ] `M` Add warnings when contribution plans exceed probable income.
146. [ ] `M` Add a retirement-age wizard.
147. [ ] `M` Add a FIRE-style target planner.
148. [ ] `M` Add goal buckets: emergency fund, house, retirement, education.
149. [ ] `M` Add target-date visualizations and milestone checkpoints.
150. [ ] `M` Add reminders or calendar export for contribution goals.

## 151-175: Deeper Quant and Finance Modeling

151. [ ] `H` Add Monte Carlo simulation with configurable volatility.
152. [ ] `H` Add geometric Brownian motion path generation.
153. [ ] `H` Add fat-tail return models instead of only normal assumptions.
154. [ ] `H` Add regime-based returns: bull, bear, sideways, crisis.
155. [ ] `H` Add sequence-of-returns risk modeling for retirement withdrawals.
156. [ ] `H` Add safe withdrawal rate experiments.
157. [ ] `H` Add failure probability under withdrawal plans.
158. [ ] `H` Add contribution stress tests under income shocks.
159. [ ] `H` Add inflation shock scenarios.
160. [ ] `H` Add fee drift and tax drag stress tests.
161. [ ] `H` Add portfolio correlation assumptions for multi-asset models.
162. [ ] `H` Add covariance-matrix-based portfolio simulation.
163. [ ] `H` Add efficient frontier exploration for custom portfolios.
164. [ ] `H` Add optimizer constraints for max asset weights.
165. [ ] `H` Add Sharpe, Sortino, and max drawdown metrics.
166. [ ] `H` Add historical-return backtest mode for known market series.
167. [ ] `H` Add historical inflation backtests.
168. [ ] `H` Add rolling-period analysis: 5y, 10y, 20y starts.
169. [ ] `H` Add real-vs-nominal return decomposition over time.
170. [ ] `H` Add dividend tax and withholding modeling for international ETFs.
171. [ ] `H` Add cost-basis tracking for taxable accounts.
172. [ ] `H` Add lot-based sale logic for withdrawals.
173. [ ] `H` Add pension contributions and employer match modeling.
174. [ ] `H` Add mortgage-vs-invest comparison engine.
175. [ ] `H` Add debt avalanche vs investing tradeoff analysis.

## 176-200: Big-Project / Platform Moves

176. [ ] `H` Add authentication and saved cloud workspaces.
177. [ ] `H` Add team / household scenarios with multiple contributors.
178. [ ] `H` Add advisor-client shared workspaces.
179. [ ] `H` Add audit history for scenario edits.
180. [ ] `H` Add collaborative notes on scenarios.
181. [ ] `H` Add role-based permissions for advisor, client, viewer.
182. [ ] `H` Add report templates for different financial goals.
183. [ ] `H` Add a recommendation engine that suggests better assumptions ranges.
184. [ ] `H` Add AI-assisted explanation of scenario results, but only grounded in the actual model output.
185. [ ] `H` Add natural-language query support like “what if I invest 500 EUR for 25 years?”
186. [ ] `H` Add scenario diff narratives that explain *why* results diverge.
187. [ ] `H` Add data import from brokerage CSVs.
188. [ ] `H` Add portfolio tracking against actual holdings.
189. [ ] `H` Add benchmark tracking against index funds.
190. [ ] `H` Add a rebalancing assistant for real portfolios.
191. [ ] `H` Add privacy-preserving local-first mode for sensitive users.
192. [ ] `X` Build a robust math engine package reusable outside the Next.js app.
193. [ ] `X` Build a formal assumptions catalog with jurisdiction presets.
194. [ ] `X` Add scenario simulation at household balance-sheet level, not just one investment stream.
195. [ ] `X` Add tax-year calendar modeling for country-specific rules.
196. [ ] `X` Add pension system modeling by country.
197. [ ] `X` Add stochastic income and career progression modeling.
198. [ ] `X` Add life-event planning: children, housing, sabbatical, relocation.
199. [ ] `X` Turn report output into a polished client-facing planning package.
200. [ ] `X` Turn `InvestSim` into a full decision-support platform rather than only a calculator.

## Recommended Order To Start

### Phase 1: Must-do

- 1, 4, 6, 7, 9-19, 20-25, 28, 37-40, 46-50

### Phase 2: Best product payoff

- 51-57, 60-70, 82-90, 101-120, 140-149

### Phase 3: What makes it serious

- 151-175

### Phase 4: What makes it a huge project

- 176-200

## Highest-Leverage 20

1. [ ] Extract the math engine from the page.
2. [ ] Add unit tests for the simulation core.
3. [ ] Add a proper shared schema for inputs and outputs.
4. [ ] Add a real README and product framing.
5. [ ] Add URL and local persistence for scenarios.
6. [ ] Add solver tools for target amount / target date / required return.
7. [ ] Add fee and inflation explanation layers.
8. [ ] Add a proper API route with validation.
9. [ ] Add PWA support and narrow-screen refinements.
10. [ ] Add shareable scenario URLs.
11. [ ] Add Tailscale-based phone testing workflow docs and helper script.
12. [ ] Add one-time deposits and contribution pause modeling.
13. [ ] Add accumulation + decumulation phases.
14. [ ] Add Monte Carlo simulation.
15. [ ] Add sequence-of-returns risk.
16. [ ] Add historical backtest mode.
17. [ ] Add portfolio / multi-asset modeling.
18. [ ] Add proper PDF report export.
19. [ ] Add account/workspace persistence.
20. [ ] Add advisor/client presentation mode.
