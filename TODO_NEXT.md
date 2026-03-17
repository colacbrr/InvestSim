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
7. [ ] Add tests for:
   - baseline simulation
   - reinvest vs withdraw
   - inflation
   - fees
   - IRR
   - required monthly contribution
   - years to target
   - delay cost
8. [ ] Add URL serialization for the main state.
9. [ ] Break `app/simulator/page.tsx` into focused domain components.
10. [ ] Add a compact mobile layout for the new insights panels.
11. [ ] Add explanatory UI copy for:
    - FIRE number
    - safe withdrawal rate
    - delay cost

## Nice To Do Soon

12. [ ] Add preset profiles: conservative, balanced, growth.
13. [ ] Add one-time deposit events.
14. [ ] Add contribution pause periods.
15. [ ] Add retirement withdrawal phase.
16. [ ] Add tests and route wiring for a real API endpoint.
17. [ ] Add phone publishing helper inspired by `Remote-Terminal`.

## Stable Now

- `pnpm lint`
- `pnpm build`
- `pnpm exec tsc --noEmit`

## Do Not Rush

- Monte Carlo before tests
- account system before persistence
- huge backend before the component/API boundary is clean
- too many charts before mobile is stable
