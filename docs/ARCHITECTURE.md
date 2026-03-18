# Architecture

## High-Level Structure

The repo is currently a small Next.js application with one main feature route.

```text
app/
  page.tsx                   Landing page
  simulator/page.tsx         Main simulator UI and state orchestration
  api/simulate/route.ts      Simulation API route
  api/scenarios/...          Scenario persistence routes

components/ui/
  Reusable UI primitives built on Radix/Tailwind

components/simulator/
  Emerging extracted simulator-specific UI components

lib/simulation/
  engine.ts                  Core deterministic simulation engine
  format.ts                  Currency/date formatting, CSV export, local date helpers
  irr.ts                     Approximate annual IRR calculation
  request.ts                 Shared simulation request builders
  solvers.ts                 Goal solver, years-to-target, FIRE helpers
  validation.ts              Input constraints for the simulator UI

lib/server/
  scenario-repository.ts     Persistence boundary and payload/summary helpers
  file-scenario-repository.ts Development file-backed repository adapter

packages/shared/
  Shared TypeScript types used by UI and simulation modules
```

## Actual Current Logic Boundary

The business logic boundary is better than it was, but the page boundary is
still too large.

Today:

- [packages/shared/types.ts](/home/brr/Documents/Github-Projects/personal_research/InvestSim/packages/shared/types.ts)
  owns the shared domain types
- [lib/simulation/engine.ts](/home/brr/Documents/Github-Projects/personal_research/InvestSim/lib/simulation/engine.ts)
  owns deterministic accumulation math
- [lib/simulation/irr.ts](/home/brr/Documents/Github-Projects/personal_research/InvestSim/lib/simulation/irr.ts)
  owns IRR approximation
- [lib/simulation/solvers.ts](/home/brr/Documents/Github-Projects/personal_research/InvestSim/lib/simulation/solvers.ts)
  owns goal and FIRE helper math
- [lib/simulation/validation.ts](/home/brr/Documents/Github-Projects/personal_research/InvestSim/lib/simulation/validation.ts)
  owns input constraints
- [lib/simulation/format.ts](/home/brr/Documents/Github-Projects/personal_research/InvestSim/lib/simulation/format.ts)
  owns display/export formatting and local calendar date helpers
- [lib/simulation/request.ts](/home/brr/Documents/Github-Projects/personal_research/InvestSim/lib/simulation/request.ts)
  owns canonical simulation request construction across client and server flows
- [lib/server/scenario-repository.ts](/home/brr/Documents/Github-Projects/personal_research/InvestSim/lib/server/scenario-repository.ts)
  owns the scenario persistence boundary
- [lib/server/file-scenario-repository.ts](/home/brr/Documents/Github-Projects/personal_research/InvestSim/lib/server/file-scenario-repository.ts)
  provides the current development persistence adapter
- [app/simulator/page.tsx](/home/brr/Documents/Github-Projects/personal_research/InvestSim/app/simulator/page.tsx)
  still owns orchestration, persistence, language state, and the whole visual surface

This is a real improvement because math changes are now isolated from most UI
work. The remaining debt is mostly component extraction and eventually swapping
the development repository adapter for a real database-backed implementation.

The current direction is intentionally:

1. local-first simulator
2. tested math
3. split UI
4. shareability and import/export
5. only then auth, users, and cloud persistence

## Intended Better Architecture

The likely next clean target architecture is:

```text
app/
  simulator/page.tsx
  api/simulate/route.ts

lib/simulation/
  engine.ts
  format.ts
  irr.ts
  solvers.ts
  validation.ts

components/simulator/
  inputs-panel.tsx
  summary-panel.tsx
  insights-panel.tsx
  charts-panel.tsx
  scenario-panel.tsx
  assumptions-panel.tsx

packages/shared/
  types.ts
  schema.ts
```

## Current UI Composition

The simulator page has these visible sections:

- header with export/reset
- desktop sidebar
- mobile drawer
- validation banner
- parameter configuration card
- KPI summary cards
- chart section
- scenario comparison section
- notes and methodology section

This is already enough surface area that component extraction would pay off
immediately.

The extraction is no longer hypothetical. The repo already contains:

- [mobile-drawer.tsx](/home/brr/Documents/Github-Projects/personal_research/InvestSim/components/simulator/mobile-drawer.tsx)
- [summary-section.tsx](/home/brr/Documents/Github-Projects/personal_research/InvestSim/components/simulator/summary-section.tsx)
- [simulator-nav-list.tsx](/home/brr/Documents/Github-Projects/personal_research/InvestSim/components/simulator/simulator-nav-list.tsx)
- [quick-stats-card.tsx](/home/brr/Documents/Github-Projects/personal_research/InvestSim/components/simulator/quick-stats-card.tsx)
- [scenario-comparison-panel.tsx](/home/brr/Documents/Github-Projects/personal_research/InvestSim/components/simulator/scenario-comparison-panel.tsx)
- [assumptions-panel.tsx](/home/brr/Documents/Github-Projects/personal_research/InvestSim/components/simulator/assumptions-panel.tsx)
- [charts-panel.tsx](/home/brr/Documents/Github-Projects/personal_research/InvestSim/components/simulator/charts-panel.tsx)
- [insights-panel.tsx](/home/brr/Documents/Github-Projects/personal_research/InvestSim/components/simulator/insights-panel.tsx)
- [events-panel.tsx](/home/brr/Documents/Github-Projects/personal_research/InvestSim/components/simulator/events-panel.tsx)
- [trust-panel.tsx](/home/brr/Documents/Github-Projects/personal_research/InvestSim/components/simulator/trust-panel.tsx)

## Persistence Status

The simulator now persists its core browser state in `localStorage`. That
currently includes:

- primary investment parameters
- advanced assumptions
- saved scenarios
- notes
- planning targets like FIRE and delay settings
- chosen start date for the simulation timeline
- chosen UI language

This is the right intermediate step before URL state or server-side
persistence.

The app also now supports:

- URL-based restoration of the main simulator state
- JSON scenario import/export
- scenario duplication and reordering

## Tooling Status

The repo now uses ESLint flat config through
[eslint.config.mjs](/home/brr/Documents/Github-Projects/personal_research/InvestSim/eslint.config.mjs)
instead of the deprecated `next lint` path.

At this checkpoint:

- lint passes
- tests pass
- build passes
- type check passes
- CI runs lint, test, and build in GitHub Actions

## i18n Direction

The intended localization model is:

- one repo
- one shared simulation engine
- translated UI dictionaries
- browser-language default with user override
- no separate Romanian and English repos

## API Status

[app/api/simulate/route.ts](/home/brr/Documents/Github-Projects/personal_research/InvestSim/app/api/simulate/route.ts)
exists as a real stateless compute route, and the repo now also includes:

- [app/api/scenarios/route.ts](/home/brr/Documents/Github-Projects/personal_research/InvestSim/app/api/scenarios/route.ts)
- [app/api/scenarios/[id]/route.ts](/home/brr/Documents/Github-Projects/personal_research/InvestSim/app/api/scenarios/[id]/route.ts)
- [app/api/scenarios/[id]/versions/route.ts](/home/brr/Documents/Github-Projects/personal_research/InvestSim/app/api/scenarios/[id]/versions/route.ts)

The main calculator is still local-first for responsiveness, while saved
scenario comparison and server-side scenario persistence now have a real API
path and shared request contract.

## Shared Types

[packages/shared/types.ts](/home/brr/Documents/Github-Projects/personal_research/InvestSim/packages/shared/types.ts)
now contains the app's core shared simulation types. It should eventually grow
further to define:

- input schema
- output schema
- scenario schema
- report/export schema

## Styling Direction

Global styling is light and generic right now. The visual system is functional,
but not product-specific. The app uses:

- Tailwind CSS
- Radix-based UI primitives
- Recharts for data visualization

This means the project can evolve quickly, but should eventually gain:

- a stronger visual identity
- explicit design tokens for finance-specific UI states
- dedicated chart theming and mobile-first chart decisions

## Backend Direction

The repo is not yet a user-backed app. The intended next backend architecture
layer is:

- auth
- user preferences
- scenario persistence
- scenario version history
- shared links

That work is intentionally postponed until the `v1` UI, math trust, and state
sharing layer are cleaner. The tracking doc for that phase is
[V1_PLUS_BACKEND_120.md](/home/brr/Documents/Github-Projects/personal_research/InvestSim/V1_PLUS_BACKEND_120.md).

The first concrete schema plan for that layer now lives in
[DATA_MODEL.md](/home/brr/Documents/Github-Projects/personal_research/InvestSim/DATA_MODEL.md).
