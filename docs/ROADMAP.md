# Roadmap

This file is the compressed implementation roadmap for `InvestSim`.

For the long-form version, see:

- [TOP_200_IMPROVEMENTS.md](/home/brr/Documents/Github-Projects/personal_research/InvestSim/TOP_200_IMPROVEMENTS.md)
- [V1_PLUS_BACKEND_120.md](/home/brr/Documents/Github-Projects/personal_research/InvestSim/V1_PLUS_BACKEND_120.md)

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
- a first bilingual `ro/en` UI layer
- deterministic test coverage for the current math engine
- smoother numeric input handling for controlled number fields
- shareable URL state for core simulator parameters
- JSON scenario import/export
- one-time deposits and contribution pauses
- scenario duplication and reordering
- a first in-app trust/model panel
- CI for `lint`, `test`, and `build`

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

Status:

- core math extraction done
- first test suite added and passing
- next pressure point is still page-size and UI separation

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
- continue moving hardcoded UI copy into translation dictionaries
- Tailscale-style remote test workflow
- performance discipline as the page grows

Status:

- local persistence done
- URL state done
- JSON scenario import/export done
- scenario workflow is now stronger with duplicate and reorder

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

Status:

- one-time deposits done
- pause periods done
- accumulation + withdrawal phases still pending

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

## Phase 7: Users, Auth, and Cloud Sync

Goals:

- keep the fast local-first simulator workflow
- add optional accounts and multi-device continuity
- introduce backend complexity only after the v1 surface is stable

Priority items:

- define a real data model
- add auth
- add cloud-synced scenarios
- add version history and shared links
- add user preferences and multi-device restore

## Recommended Next 10 Tasks

1. Finish breaking the simulator page into smaller components.
2. Expand translation coverage and keep strings out of page logic.
3. Improve compact mobile treatment for summary and scenario cards.
4. Add accumulation + withdrawal phases.
5. Add a cleaner event editor UX for deposits and pauses.
6. Add route/API alignment with the shared simulation engine.
7. Add stronger solver explanation copy and formula references.
8. Add a phone testing / publish helper inspired by `Remote-Terminal`.
9. Create the first `DATA_MODEL.md` for future auth + DB work.
10. Start the first backend boundary only after the v1 UI surface is stable.
