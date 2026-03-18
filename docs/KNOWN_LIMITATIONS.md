# Known Limitations

This file is intentionally blunt. The goal is to make the current constraints
visible so product decisions stay honest.

## Model Limits

- returns are deterministic in the main simulator
- there is no volatility or Monte Carlo path yet
- there is no sequence-of-returns risk layer
- inflation is modeled as constant
- fees are simplified
- taxes are simplified
- FIRE outputs are educational approximations, not retirement success analysis
- target solvers are deterministic, not probability-based

## Engineering Limits

- too much domain logic still lives in [app/simulator/page.tsx](/home/brr/Documents/Github-Projects/personal_research/InvestSim/app/simulator/page.tsx)
- there are no visible automated tests yet
- the API route is not yet the true system boundary
- state is still mostly session-local

## UX Limits

- charts are dense on phone
- advanced assumptions increase cognitive load
- there is no polished share-link UX yet, only URL-state serialization
- event editing for deposits and pauses is still basic and utilitarian

## Trust Limits

- the app is useful for planning intuition, not regulated advice
- formulas are still summarized at a high level, not proven step-by-step
- model versioning is visible in the UI, but not yet formalized as migration metadata

## What Must Improve Next

1. math extraction
2. tests
3. persistence
4. shareability
5. better mobile behavior
