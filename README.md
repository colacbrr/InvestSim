# InvestSim

`InvestSim` is a Next.js investment simulator focused on long-horizon personal
finance planning.

The current app already supports:

- monthly contribution simulation
- optional initial capital of `0`
- annual return assumptions
- reinvest vs withdraw behavior
- monthly / annual / daily compounding modes in the simulation engine
- exposed annual fee, inflation, and contribution step-up assumptions
- CSV export
- saved comparison scenarios
- local persistence for scenarios, notes, assumptions, and planning targets
- shareable URL state for the main simulator parameters
- local start date auto-selection based on the user timezone
- real calendar dates on the simulation timeline
- bilingual UI foundation with `ro/en` language switching
- responsive charts and a mobile drawer UI
- approximate annual IRR / TIR calculation
- goal solver for target portfolio size
- estimated years-to-target solver
- simple FIRE number and supported-income estimation
- “cost of waiting” analysis for delayed start scenarios
- first extracted simulator UI components under `components/simulator/`
- deterministic math tests with `Vitest`
- smoother numeric form input handling for controlled number fields
- one-time deposit events
- contribution pause periods
- scenario import/export in JSON
- trust / model explanation panel in the UI

The project is still early, but the simulator is real. The main gap right now
is not “whether there is any math,” but how clearly that math and product
behavior are documented and structured.

## Start Here

1. Read [STARTUP.md](/home/brr/Documents/Github-Projects/personal_research/InvestSim/STARTUP.md) to run the app locally.
2. Read [docs/APP_OVERVIEW.md](/home/brr/Documents/Github-Projects/personal_research/InvestSim/docs/APP_OVERVIEW.md) to understand what the app currently does.
3. Read [docs/ARCHITECTURE.md](/home/brr/Documents/Github-Projects/personal_research/InvestSim/docs/ARCHITECTURE.md) to navigate the codebase.
4. Read [docs/MATH_MODEL.md](/home/brr/Documents/Github-Projects/personal_research/InvestSim/docs/MATH_MODEL.md) to understand the simulator assumptions and current formulas.
5. Read [docs/PHONE_TESTING.md](/home/brr/Documents/Github-Projects/personal_research/InvestSim/docs/PHONE_TESTING.md) for real mobile testing guidance.
6. Read [docs/DEPLOYMENT.md](/home/brr/Documents/Github-Projects/personal_research/InvestSim/docs/DEPLOYMENT.md) for the GitHub Actions + Vercel deployment flow.
7. Read [docs/ROADMAP.md](/home/brr/Documents/Github-Projects/personal_research/InvestSim/docs/ROADMAP.md) for the compressed execution order.
8. Read [docs/KNOWN_LIMITATIONS.md](/home/brr/Documents/Github-Projects/personal_research/InvestSim/docs/KNOWN_LIMITATIONS.md) for current constraints.
9. Read [docs/PERFORMANCE_PRINCIPLES.md](/home/brr/Documents/Github-Projects/personal_research/InvestSim/docs/PERFORMANCE_PRINCIPLES.md) for speed and UX guardrails.
10. Read [TODO_NEXT.md](/home/brr/Documents/Github-Projects/personal_research/InvestSim/TODO_NEXT.md) for the active implementation checklist.
11. Read [TOP_200_IMPROVEMENTS.md](/home/brr/Documents/Github-Projects/personal_research/InvestSim/TOP_200_IMPROVEMENTS.md) for the long-range roadmap.
12. Read [V1_PLUS_BACKEND_120.md](/home/brr/Documents/Github-Projects/personal_research/InvestSim/V1_PLUS_BACKEND_120.md) for the actual phased execution plan for `v1` and the first backend/user expansion.
13. Read [DATA_MODEL.md](/home/brr/Documents/Github-Projects/personal_research/InvestSim/DATA_MODEL.md) for the first real auth/cloud-sync database design.

## Current Stack

- Framework: `Next.js`
- Language: `TypeScript`
- UI: `React`, `Tailwind CSS`, `Radix UI`
- Charts: `recharts`
- Linting: `ESLint` flat config
- Testing: `Vitest`
- CI: `GitHub Actions`

## Repository Layout

```text
InvestSim/
├── app/
│   ├── api/simulate/route.ts
│   ├── api/scenarios/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── simulator/page.tsx
├── components/ui/
├── docs/
├── lib/
│   ├── server/
│   │   ├── file-scenario-repository.ts
│   │   └── scenario-repository.ts
│   └── simulation/
│       ├── engine.ts
│       ├── format.ts
│       ├── irr.ts
│       ├── request.ts
│       ├── solvers.ts
│       └── validation.ts
├── packages/shared/
├── DATA_MODEL.md
├── README.md
├── STARTUP.md
├── V1_PLUS_BACKEND_120.md
└── TOP_200_IMPROVEMENTS.md
```

## What Exists Today

The actual simulator UI still lives mostly inside
[app/simulator/page.tsx](/home/brr/Documents/Github-Projects/personal_research/InvestSim/app/simulator/page.tsx),
but the simulation math is now extracted into
[lib/simulation/engine.ts](/home/brr/Documents/Github-Projects/personal_research/InvestSim/lib/simulation/engine.ts),
[lib/simulation/irr.ts](/home/brr/Documents/Github-Projects/personal_research/InvestSim/lib/simulation/irr.ts),
[lib/simulation/solvers.ts](/home/brr/Documents/Github-Projects/personal_research/InvestSim/lib/simulation/solvers.ts),
[lib/simulation/format.ts](/home/brr/Documents/Github-Projects/personal_research/InvestSim/lib/simulation/format.ts),
and [lib/simulation/validation.ts](/home/brr/Documents/Github-Projects/personal_research/InvestSim/lib/simulation/validation.ts).

The component split has also started in
[components/simulator/](/home/brr/Documents/Github-Projects/personal_research/InvestSim/components/simulator),
but the page file is still the main orchestration hotspot.

That file contains:

- the main input state
- state hydration and persistence
- scenario save/load/remove behavior
- chart rendering
- notes and methodology UI

This is useful because the app is already functional, but it is also the main
technical debt hotspot. The math logic and presentation logic are too tightly
coupled.

## Current Verification Status

The repo has been checked locally with:

- `pnpm lint`
- `pnpm test`
- `pnpm build`
- `pnpm exec tsc --noEmit`

All four are now passing in the current repo state.

The repo now also includes CI in
[ci.yml](/home/brr/Documents/Github-Projects/personal_research/InvestSim/.github/workflows/ci.yml),
which runs:

- `pnpm lint`
- `pnpm test`
- `pnpm build`

## Language Strategy

`InvestSim` should stay as one repo, not separate Romanian and English repos.

The current direction is:

- one shared codebase
- domain logic and internal code kept language-neutral / English-leaning
- UI text translated at the presentation layer
- persisted language preference with browser-language fallback

That avoids product drift and duplicate maintenance while keeping the app ready
for more languages later.

## What The App Is Good For Right Now

- exploring how monthly investing compounds over time
- comparing several contribution / duration / return scenarios
- estimating what monthly contribution is needed for a target amount
- estimating how long a target will take at the current saving rate
- rough FIRE-style planning
- understanding the opportunity cost of delaying investing
- visualizing contribution vs gain growth
- exporting a simple CSV report
- rough educational planning

## What The App Is Not Good For Yet

- production-grade financial advice
- country-specific tax planning
- stochastic / Monte Carlo analysis
- real portfolio tracking
- audited, tested, reusable financial math
- multi-phase retirement withdrawal planning

## Immediate Documentation Goal

This documentation pass is meant to make the repo readable enough that the next
engineering passes can be done cleanly:

- add tests
- improve API boundaries
- break the page into focused components
- improve mobile and phone testing workflows
- keep the app fast while the finance feature surface grows

## Current Execution Strategy

The active implementation order is now:

1. finish the `v1` surface cleanly
2. keep the math trustworthy and tested
3. keep the UI responsive while splitting the large simulator page
4. add shareability and import/export
5. only then start the auth / user / DB layer

The concrete tracking document for that work is
[V1_PLUS_BACKEND_120.md](/home/brr/Documents/Github-Projects/personal_research/InvestSim/V1_PLUS_BACKEND_120.md).
