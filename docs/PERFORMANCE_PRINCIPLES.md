# Performance Principles

This project should stay fast even as the finance feature set grows.

## Non-Negotiables

- do not turn the simulator into a sluggish dashboard
- keep first interaction simple
- avoid expensive recalculation on every unrelated UI change
- keep mobile usable on average phones, not only desktops

## Practical Rules

1. Keep heavy finance logic out of the main render body.
2. Move simulation and solver functions into reusable modules.
3. Memoize derived outputs only where it actually prevents repeated work.
4. Avoid adding large libraries unless they replace a lot of custom code.
5. Prefer deterministic helpers over complex state machines when possible.
6. Keep chart count low on mobile.
7. Treat every new “panel” as a performance budget decision.
8. Prefer progressive disclosure over rendering everything at once.
9. Add persistence carefully so hydration stays clean.
10. If stochastic modeling is added, run it off the main interaction path.

## UI Guardrails

- summary first
- insight panels second
- heavy charts after that
- advanced controls collapsed or grouped

## Future Performance Watchlist

- Monte Carlo simulation
- large scenario comparison sets
- PDF/report generation
- persistent workspaces
- historical backtest charts

These are likely the first places where the app can become noticeably slower if
implemented casually.

