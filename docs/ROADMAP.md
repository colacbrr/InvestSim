# Roadmap

This file is the compressed implementation roadmap for `InvestSim`.

For the long-form version, see:

- [TOP_200_IMPROVEMENTS.md](/home/brr/Documents/Github-Projects/personal_research/InvestSim/TOP_200_IMPROVEMENTS.md)

## Current Reality

The project already has real simulator logic, but most of it is concentrated in
one large page component.

That means the best next work is not random feature growth. It is:

1. documentation and clarity
2. math extraction and tests
3. cleaner app boundaries
4. mobile and phone workflow refinement
5. only then deeper finance modeling

The app now also has:

- advanced assumptions exposed in the UI
- target-based goal solving
- FIRE-style planning
- delay-cost analysis

That is a good product step, but it increases the pressure to separate math from
presentation and keep rendering fast.

## Phase 1: Make The Repo Understandable

- add a proper `README.md`
- add startup and architecture docs
- add math assumptions docs
- document phone testing
- document known limitations

Status:

- `README.md` added
- `STARTUP.md` added
- `docs/APP_OVERVIEW.md` added
- `docs/ARCHITECTURE.md` added
- `docs/MATH_MODEL.md` added
- `docs/PHONE_TESTING.md` added

## Phase 2: Extract and Stabilize the Math

Goals:

- remove simulation logic from the page component
- create shared input/output schemas
- add unit tests for formulas and edge cases

Priority items:

- extract `simulate()`
- extract `computeIRRFromRows()`
- extract goal-solver logic
- extract FIRE / delay-cost helpers
- extract validation
- extract CSV export
- add test coverage for deterministic cases

## Phase 3: Improve Product Trust

Goals:

- make users understand what the model means
- make assumptions visible
- make limitations explicit

Priority items:

- add tooltips and explanations
- add clearer assumptions UI
- add formula-source / trust panel
- add warnings for unrealistic assumptions
- add “confidence / approximation” language around FIRE and goal outputs

## Phase 4: Improve Real Usage

Goals:

- make the app work better on phone
- improve persistence and sharing
- make scenario workflows less fragile

Priority items:

- local persistence
- URL sharing
- narrow-screen scenario redesign
- chart improvements for touch devices
- Tailscale-style remote test workflow
- performance discipline as the page grows

## Phase 5: Make It a Serious Financial Tool

Goals:

- move beyond a deterministic toy simulator
- support multi-phase plans
- support better realism

Priority items:

- one-time deposits
- pauses and contribution schedules
- accumulation + withdrawal phases
- fee drag and inflation sensitivity
- solver tools for target amount / target date / required return

## Phase 6: Make It a Large Project

Goals:

- support stochastic modeling
- support multi-asset portfolios
- support user workspaces and reporting

Priority items:

- Monte Carlo
- historical backtests
- multi-asset allocation
- portfolio metrics
- report generation
- persistence and collaboration

## Recommended Next 10 Tasks

1. Extract the math engine from `app/simulator/page.tsx`.
2. Add tests for simulation and IRR.
3. Add tests for goal solver, FIRE, and delay-cost logic.
4. Expand `packages/shared/types.ts`.
5. Replace the current API route with a cleaner validated route.
6. Add local scenario persistence.
7. Add shareable URL state.
8. Add a better mobile chart strategy.
9. Add Tailscale-oriented remote test helper script.
10. Add fee / inflation / solver explanation panels.

