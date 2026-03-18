# InvestSim Top 120 Roadmap

This file compresses the current `v1 finalization` work and the first `user/db`
expansion into one execution list.

Scope:

- `100` product and engineering items to make `InvestSim` feel like a serious,
  finished `v1`
- `20` backend / user / database items for the first real multi-device product
  step after `v1`

Status legend:

- `[ ]` not started
- `[~]` in progress
- `[x]` done

Difficulty legend:

- `S` starter
- `M` medium
- `H` hard

## V1 Finalization: 1-100

### 1-20: Core Stability and Architecture

1. [x] `S` Extract the core simulation engine into `lib/simulation/engine.ts`.
2. [x] `S` Extract IRR logic into `lib/simulation/irr.ts`.
3. [x] `S` Extract solver helpers into `lib/simulation/solvers.ts`.
4. [x] `S` Extract validation into `lib/simulation/validation.ts`.
5. [x] `S` Add shared simulation-related types.
6. [x] `S` Add local persistence for simulator state.
7. [x] `S` Add language persistence for `ro/en`.
8. [x] `S` Add current startup and architecture docs.
9. [~] `M` Break `app/simulator/page.tsx` into focused UI components.
10. [x] `M` Extract a dedicated `SimulationInputsPanel`.
11. [x] `M` Extract a dedicated `SimulationInsightsPanel`.
12. [x] `M` Extract a dedicated `SimulationChartsPanel`.
13. [x] `M` Extract a dedicated `ScenarioComparisonPanel`.
14. [x] `M` Extract a dedicated `AssumptionsPanel`.
15. [x] `M` Extract a dedicated `NotesPanel`.
16. [~] `M` Remove remaining duplicated presentation logic from the page file.
17. [x] `S` Replace remaining hardcoded UI text with translation keys.
18. [x] `S` Clean up remaining mixed `FinApp` naming where it still appears.
19. [x] `S` Add a canonical simulation constants file.
20. [ ] `S` Add migration-safe version tags for persisted simulator state.

### 21-40: Math Confidence and Testing

21. [x] `S` Add deterministic engine tests.
22. [x] `S` Add IRR tests.
23. [x] `S` Add solver tests.
24. [x] `S` Add validation tests.
25. [ ] `S` Add tests for zero-year edge cases.
26. [ ] `S` Add tests for negative return paths.
27. [ ] `S` Add tests for daily vs monthly vs annual compounding consistency.
28. [ ] `S` Add tests for CSV export shape.
29. [x] `S` Add tests for one-time deposit support once implemented.
30. [x] `S` Add tests for contribution pause support once implemented.
31. [ ] `S` Add tests for withdrawal-phase logic.
32. [ ] `M` Add tests for inflation-adjusted withdrawal cases.
33. [ ] `M` Add tests for tax drag behavior.
34. [ ] `M` Add regression tests for scenario load/save behavior.
35. [ ] `M` Add performance-oriented simulation benchmark cases.
36. [ ] `S` Document exact vs approximate formulas.
37. [ ] `S` Add an IRR explanation tooltip.
38. [ ] `S` Add a nominal vs real return explanation.
39. [ ] `S` Add a fee drag explanation.
40. [ ] `S` Add reinvest vs withdraw explanation copy.

### 41-60: UX Polish and Responsiveness

41. [x] `S` Fix numeric input glitchiness when deleting or replacing values.
42. [ ] `S` Add inline validation on blur for advanced fields.
43. [ ] `S` Add `aria-describedby` and richer accessible help text for inputs.
44. [ ] `S` Add empty states for every major panel.
45. [ ] `S` Add a “restore last session” prompt.
46. [ ] `S` Add desktop keyboard shortcuts for reset/export/save.
47. [ ] `S` Add a one-click summary copy button.
48. [x] `S` Add scenario duplication.
49. [x] `S` Add scenario reordering.
50. [ ] `S` Add scenario color editing.
51. [ ] `S` Add per-scenario notes.
52. [ ] `M` Add a compact mobile scenario card layout.
53. [ ] `M` Add a sticky mobile summary strip.
54. [ ] `M` Add a better touch-first chart legend pattern.
55. [ ] `M` Add chart zoom or focused-range controls.
56. [ ] `M` Add smoother heavy updates with targeted transitions where needed.
57. [x] `S` Add a quick-start preset picker.
58. [x] `S` Add conservative / balanced / growth presets.
59. [ ] `S` Add a better reset flow per section, not only global reset.
60. [ ] `S` Add a compact “phone summary view”.

### 61-80: Shareability, Trust, and Product Clarity

61. [x] `M` Add URL serialization for the main scenario state.
62. [x] `M` Add restore-from-URL logic.
63. [ ] `M` Add scenario comparison share URLs.
64. [x] `M` Add export/import of scenario JSON.
65. [ ] `S` Add an “About the model” panel in the app.
66. [ ] `S` Add a “Known limitations” panel in the app.
67. [ ] `S` Add a useful disclaimer in the UI.
68. [ ] `S` Add formula source/version info in the app.
69. [ ] `S` Add explicit labels for approximation-heavy outputs.
70. [ ] `S` Add warnings for unrealistic annual return assumptions.
71. [ ] `S` Add warnings for extreme fees.
72. [ ] `S` Add warnings for unrealistic monthly contributions.
73. [ ] `S` Add a glossary panel for investing terms.
74. [x] `S` Add explanatory copy for FIRE number.
75. [x] `S` Add explanatory copy for safe withdrawal rate.
76. [x] `S` Add explanatory copy for delay cost.
77. [x] `M` Add a trust panel with formula version and assumptions.
78. [ ] `M` Add release notes inside the app.
79. [ ] `M` Add example scenarios for beginners.
80. [ ] `M` Add a compare-against-baseline mode.

### 81-100: Serious V1 Finance Features

81. [x] `M` Add one-time deposit events.
82. [x] `M` Add paused contribution periods.
83. [ ] `M` Add annual bonus contributions.
84. [ ] `M` Add accumulation + withdrawal phases.
85. [ ] `M` Add retirement decumulation modeling.
86. [ ] `M` Add contribution timing choice: start vs end of month.
87. [ ] `M` Add inflation-linked contribution growth.
88. [ ] `M` Add fee impact visualization.
89. [ ] `M` Add inflation erosion visualization.
90. [ ] `M` Add “wealth in today’s money” as a first-class metric.
91. [ ] `M` Add required-return solver.
92. [ ] `M` Add break-even contribution views.
93. [ ] `M` Add Monte Carlo as the first advanced realism mode.
94. [ ] `M` Add volatility input for stochastic simulations.
95. [ ] `M` Add sequence-of-returns risk visualization.
96. [ ] `M` Add printable report mode.
97. [ ] `M` Add PDF report export.
98. [ ] `S` Add chart image export.
99. [x] `M` Add CI for `lint`, `test`, and `build`.
100. [ ] `M` Add a Tailscale-friendly phone testing helper script inspired by `Remote-Terminal`.

## Backend / User / DB Expansion: 101-120

101. [x] `M` Add a real backend data model document.
102. [ ] `M` Add `users` table or model.
103. [ ] `M` Add `user_preferences` table or model.
104. [ ] `M` Add `scenarios` table or model.
105. [ ] `M` Add `scenario_versions` table or model.
106. [ ] `M` Add `scenario_tags` table or model.
107. [ ] `M` Add `shared_links` table or model.
108. [ ] `M` Add authentication with email magic link.
109. [ ] `M` Add Google sign-in.
110. [ ] `S` Add profile preferences: language, currency, locale.
111. [ ] `M` Move scenario persistence from local-only to local + cloud sync.
112. [ ] `M` Add multi-device scenario sync for phone and desktop.
113. [ ] `S` Add favorites / pinned scenarios.
114. [ ] `S` Add folders or collections for saved scenarios.
115. [ ] `S` Add scenario tags and filtering.
116. [ ] `M` Add private share links.
117. [ ] `M` Add public read-only share links.
118. [ ] `M` Add scenario version history.
119. [ ] `M` Add cloud backup for user settings and saved scenarios.
120. [ ] `H` Add collaboration-ready sharing model with comments or review notes.

## Recommended Execution Order

If the goal is `finish v1 cleanly`, the best order is:

1. Finish the component split.
2. Finish translation cleanup.
3. Improve compact mobile layouts for summary and scenario workflows.
4. Add accumulation + withdrawal phases.
5. Improve event editor UX and validation.
6. Add route/API alignment for the shared simulation engine.
7. Preserve CI discipline while continuing feature work.
8. Add the phone testing / publish helper.
9. Only then start auth and DB work.

If the goal is `turn it into a product after v1`, start backend with:

1. `DATA_MODEL.md`
2. auth
3. `users`
4. `user_preferences`
5. `scenarios`
6. local + cloud sync
