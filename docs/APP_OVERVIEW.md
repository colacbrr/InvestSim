# App Overview

## Product Intent

`InvestSim` is a personal investment planning app. The current implementation is
best understood as an advanced educational simulator rather than a full wealth
planning platform.

It is already capable of showing how recurring contributions, time, return
assumptions, and reinvestment behavior affect long-term outcomes.

## Main User Flow

The main flow is:

1. open `/simulator`
2. enter:
   - initial capital
   - monthly contribution
   - duration
   - annual return
   - advanced assumptions when needed
3. optionally toggle reinvestment
4. inspect KPI cards
5. inspect goal solver / FIRE / delay-cost insights
6. inspect charts
7. save scenarios for comparison
8. duplicate or reorder saved scenarios
9. export CSV or JSON if needed
10. switch interface language if needed

## Current Feature Surface

### Inputs

- initial capital
- monthly contribution
- duration in years
- annual return percentage
- reinvestment toggle
- start date
- compounding mode
- annual inflation
- annual fee
- annual contribution growth
- withdrawal tax assumption
- target portfolio amount
- target monthly expenses
- safe withdrawal rate
- delayed-start years
- UI language toggle (`ro` / `en`)
- one-time deposits
- contribution pause ranges
- quick presets

### Calculated Outputs

- total contributions
- total gains
- final portfolio value
- total ROI
- approximate annual IRR / TIR
- required monthly contribution for a chosen target
- estimated years needed to reach a chosen target
- estimated FIRE number
- estimated annual income supported by the final portfolio
- estimated cost of delaying the start
- month-by-month rows for charting and export
- trust-oriented explanatory panels for model assumptions and limitations

### Charts

- area chart
- line chart
- bar chart

### Scenario Tools

- save current input state as scenario
- compare several scenarios
- reload a saved scenario into the input form
- remove a scenario
- duplicate a scenario
- reorder scenarios
- keep advanced assumptions inside saved scenarios
- persist chosen UI language locally
- persist simulator working state locally
- export scenarios to JSON
- import scenarios from JSON

### Notes / Methodology

- assumptions block in the UI
- trust/model panel in the UI
- personal notes text area
- copy-to-clipboard for notes
- explicit educational framing for what the model can and cannot say

## Important Current Limitations

- the simulator page is still too large even though the math engine has been extracted
- the component split has started but is not finished
- there is no authenticated user model
- there is no backend-first calculation pipeline
- URL-based scenario comparison sharing is still missing
- the goal / FIRE tools are deterministic and simplified, not probabilistic

## Current Delivery Strategy

The project is now being driven in two layers:

1. finish a clean and credible `v1`
2. only then add the first real user/backend/database layer

The concrete implementation list for that is:

- [TODO_NEXT.md](/home/brr/Documents/Github-Projects/personal_research/InvestSim/TODO_NEXT.md)
- [V1_PLUS_BACKEND_120.md](/home/brr/Documents/Github-Projects/personal_research/InvestSim/V1_PLUS_BACKEND_120.md)

## Why This App Is Interesting

The interesting part is not the landing page. It is the math-capable simulator
route in [app/simulator/page.tsx](/home/brr/Documents/Github-Projects/personal_research/InvestSim/app/simulator/page.tsx),
which already combines:

- compounding logic
- real-value adjustments
- fee drag
- goal-based planning
- FIRE-style planning
- delay-cost framing
- comparison scenarios
- rough IRR estimation
- bilingual presentation support

That gives the project a strong base for becoming a much larger product.
