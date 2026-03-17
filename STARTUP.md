# Startup Guide

This file explains how to run `InvestSim`, what to verify first, and which
parts of the codebase matter most when you start working on it.

## Purpose

`InvestSim` is a Next.js app for long-horizon investing simulations. The main
product surface is the simulator page, not the landing page.

Primary route:

```text
/simulator
```

## Prerequisites

- `Node.js` 18+ recommended
- `pnpm` recommended because the repo already uses `pnpm-lock.yaml`

If `pnpm` is not installed:

```bash
npm install -g pnpm
```

## Install

From the repo root:

```bash
cd /home/brr/Documents/Github-Projects/personal_research/InvestSim
pnpm install
```

## Run In Development

```bash
pnpm dev
```

Default local address:

```text
http://localhost:3000
```

Main pages:

- `http://localhost:3000/`
- `http://localhost:3000/simulator`

## Core Commands

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm exec tsc --noEmit
```

Notes:

- linting now uses `eslint.config.mjs` with flat config
- the repo currently builds cleanly with `pnpm build`
- type checking is verified with `pnpm exec tsc --noEmit`

## Current Architecture Entry Points

Read these first if you want to understand the app quickly:

1. [app/simulator/page.tsx](/home/brr/Documents/Github-Projects/personal_research/InvestSim/app/simulator/page.tsx)
2. [packages/shared/types.ts](/home/brr/Documents/Github-Projects/personal_research/InvestSim/packages/shared/types.ts)
3. [lib/simulation/engine.ts](/home/brr/Documents/Github-Projects/personal_research/InvestSim/lib/simulation/engine.ts)
4. [lib/simulation/irr.ts](/home/brr/Documents/Github-Projects/personal_research/InvestSim/lib/simulation/irr.ts)
5. [lib/simulation/solvers.ts](/home/brr/Documents/Github-Projects/personal_research/InvestSim/lib/simulation/solvers.ts)
6. [lib/simulation/validation.ts](/home/brr/Documents/Github-Projects/personal_research/InvestSim/lib/simulation/validation.ts)
7. [lib/simulation/format.ts](/home/brr/Documents/Github-Projects/personal_research/InvestSim/lib/simulation/format.ts)
8. [app/page.tsx](/home/brr/Documents/Github-Projects/personal_research/InvestSim/app/page.tsx)
9. [app/api/routes/simulate.ts](/home/brr/Documents/Github-Projects/personal_research/InvestSim/app/api/routes/simulate.ts)

## What Exists Today

The app already supports:

- deterministic investment simulation with initial capital and monthly contributions
- reinvest vs withdraw behavior
- monthly / annual / daily compounding modes
- annual fee, inflation, and contribution step-up assumptions
- target amount solver
- years-to-target solver
- FIRE number and supported-income estimation
- delay-cost analysis
- scenario saving and comparison
- CSV export
- browser-local persistence for the working simulator state
- local auto-selected start date based on the user timezone
- real calendar dates on the chart timeline derived from the chosen start date

## Local Testing Checklist

After opening `/simulator`, verify these first:

1. Change initial capital, monthly contribution, years, and annual return.
2. Confirm KPI cards and charts update without errors.
3. Confirm validation appears for bad values.
4. Toggle reinvest on and off and confirm results change.
5. Change advanced assumptions like inflation, fees, and step-up rate.
6. Save at least one scenario and reload it.
7. Refresh the page and confirm state persistence works.
8. Export a CSV and confirm it downloads.
9. Change the start date and confirm the chart labels move to real calendar dates.

## Phone Testing

If you want to test on phone:

1. Run `pnpm dev`.
2. Expose the app through a safe path such as Tailscale Serve or another controlled tunnel.
3. Open `/simulator` on the phone.

Recommended checks:

1. Header actions fit on narrow screens.
2. Sliders are usable by touch.
3. Advanced settings remain readable.
4. Scenario cards do not overflow badly.
5. Charts remain legible on smaller widths.
6. The mobile drawer opens and closes cleanly.

## Known Current Gaps

- `app/simulator/page.tsx` is still too large and should be split into components
- there are no real automated tests yet for the extracted simulation modules
- the API route is still not the main math execution path
- URL-based scenario sharing does not exist yet

## Recommended Next Work

1. Add tests for `lib/simulation/*`.
2. Add URL serialization for the main simulator state.
3. Break the simulator page into focused UI components.
4. Align the API route with the shared simulation engine.

## Validation Status

At the current checkpoint:

- `pnpm lint` passes
- `pnpm build` passes
- `pnpm exec tsc --noEmit` passes

## Related Docs

- [README.md](/home/brr/Documents/Github-Projects/personal_research/InvestSim/README.md)
- [docs/APP_OVERVIEW.md](/home/brr/Documents/Github-Projects/personal_research/InvestSim/docs/APP_OVERVIEW.md)
- [docs/ARCHITECTURE.md](/home/brr/Documents/Github-Projects/personal_research/InvestSim/docs/ARCHITECTURE.md)
- [docs/MATH_MODEL.md](/home/brr/Documents/Github-Projects/personal_research/InvestSim/docs/MATH_MODEL.md)
- [docs/PHONE_TESTING.md](/home/brr/Documents/Github-Projects/personal_research/InvestSim/docs/PHONE_TESTING.md)
- [docs/ROADMAP.md](/home/brr/Documents/Github-Projects/personal_research/InvestSim/docs/ROADMAP.md)
- [docs/KNOWN_LIMITATIONS.md](/home/brr/Documents/Github-Projects/personal_research/InvestSim/docs/KNOWN_LIMITATIONS.md)
- [docs/PERFORMANCE_PRINCIPLES.md](/home/brr/Documents/Github-Projects/personal_research/InvestSim/docs/PERFORMANCE_PRINCIPLES.md)
- [TODO_NEXT.md](/home/brr/Documents/Github-Projects/personal_research/InvestSim/TODO_NEXT.md)
