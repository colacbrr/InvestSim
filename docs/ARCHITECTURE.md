# Architecture

## High-Level Structure

The repo is currently a small Next.js application with one main feature route.

```text
app/
  page.tsx                   Landing page
  simulator/page.tsx         Main simulator UI and state orchestration
  api/routes/simulate.ts     Minimal API route

components/ui/
  Reusable UI primitives built on Radix/Tailwind

lib/simulation/
  engine.ts                  Core deterministic simulation engine
  format.ts                  Currency/date formatting, CSV export, local date helpers
  irr.ts                     Approximate annual IRR calculation
  solvers.ts                 Goal solver, years-to-target, FIRE helpers
  validation.ts              Input constraints for the simulator UI

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
- [app/simulator/page.tsx](/home/brr/Documents/Github-Projects/personal_research/InvestSim/app/simulator/page.tsx)
  still owns orchestration, persistence, and the whole visual surface

This is a real improvement because math changes are now isolated from most UI
work. The remaining debt is mostly component extraction and API alignment.

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

## Persistence Status

The simulator now persists its core browser state in `localStorage`. That
currently includes:

- primary investment parameters
- advanced assumptions
- saved scenarios
- notes
- planning targets like FIRE and delay settings
- chosen start date for the simulation timeline

This is the right intermediate step before URL state or server-side
persistence.

## Tooling Status

The repo now uses ESLint flat config through
[eslint.config.mjs](/home/brr/Documents/Github-Projects/personal_research/InvestSim/eslint.config.mjs)
instead of the deprecated `next lint` path.

At this checkpoint:

- lint passes
- build passes
- type check passes

## API Status

[app/api/routes/simulate.ts](/home/brr/Documents/Github-Projects/personal_research/InvestSim/app/api/routes/simulate.ts)
exists, but the core simulator is still client-side. That means:

- frontend and backend logic are not yet aligned around one shared math engine
- API types are not yet the real source of truth
- testing the math independently is harder than it should be

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
