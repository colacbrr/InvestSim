# TODO Next

This is the active execution list, not the long-range dream list.

## Must Do Next

1. [x] Extract `simulate()` into `lib/simulation/engine.ts`.
2. [x] Extract IRR logic into `lib/simulation/irr.ts`.
3. [x] Extract goal solver logic into `lib/simulation/solvers.ts`.
4. [x] Expand shared types in `packages/shared/types.ts`.
5. [x] Add local persistence for:
   - scenarios
   - notes
   - assumptions
   - targets
6. [x] Add local start-date auto-selection and real calendar labels on the timeline.
7. [x] Add first bilingual UI pass with `ro/en` language switching.
8. [x] Add tests for:
   - baseline simulation
   - reinvest vs withdraw
   - inflation
   - fees
   - IRR
   - required monthly contribution
   - years to target
   - delay cost
9. [x] Add URL serialization for the main state.
10. [~] Break `app/simulator/page.tsx` into focused domain components.
11. [x] Expand translation coverage and remove remaining hardcoded UI strings.
12. [~] Add a compact mobile layout for the new insights panels.
13. [x] Add explanatory UI copy for:
    - FIRE number
    - safe withdrawal rate
    - delay cost
14. [x] Add JSON export/import for scenarios.
15. [x] Add one-time deposit events.
16. [x] Add contribution pause periods.
17. [ ] Add accumulation + withdrawal phases.
18. [x] Add CI for `lint`, `test`, and `build`.
19. [x] Create `DATA_MODEL.md` for the future auth + DB layer.

## Nice To Do Soon

20. [x] Add preset profiles: conservative, balanced, growth.
21. [ ] Add retirement withdrawal phase.
22. [x] Add tests and route wiring for a real API endpoint.
23. [ ] Add phone publishing helper inspired by `Remote-Terminal`.
24. [ ] Add auth and cloud-synced scenario storage after local UX is clean.

## Stable Now

- `pnpm lint`
- `pnpm test`
- `pnpm build`
- `pnpm exec tsc --noEmit`
- GitHub Actions CI for `lint`, `test`, `build`

## Do Not Rush

- Monte Carlo before tests
- account system before persistence
- huge backend before the component/API boundary is clean
- too many charts before mobile is stable
