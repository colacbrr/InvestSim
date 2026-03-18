# Math Model

## Scope

This file documents the current simulation behavior as implemented in
[app/simulator/page.tsx](/home/brr/Documents/Github-Projects/personal_research/InvestSim/app/simulator/page.tsx).

It does not claim the model is final or exhaustive. The goal is to make the
current behavior explicit so later refactors and tests have a stable reference.

## Inputs Used By The Current Engine

The simulator currently accepts or internally supports:

- initial capital
- monthly contribution
- number of months
- annual return rate
- reinvest toggle
- start date
- compounding mode
- annual fee percentage
- inflation percentage
- tax on withdrawn gains
- annual contribution step-up percentage
- one-time deposit events by month
- contribution pause periods by month range

In the UI today, only some of these are fully exposed.
The current UI now exposes most of them directly, along with target and FIRE
style planning inputs that sit on top of the deterministic engine.

## Current Contribution Timing

Contributions are modeled at the beginning of each month.

The code path is:

1. compute contribution for the month
2. add contribution to balance
3. apply growth logic
4. apply monthly fee factor
5. if not reinvesting, remove positive monthly gains from the balance and treat
   them as withdrawn gains after tax

This is important because beginning-of-month vs end-of-month contribution timing
changes final outcomes.

## Monthly Growth Conversion

The engine converts annual return to an effective monthly rate using:

```text
monthlyRate = (1 + annualRate)^(1/12) - 1
```

That is a reasonable effective-rate conversion for compounded growth.

## Fee Modeling

Annual fees are converted to a monthly multiplicative factor:

```text
feeFactor = (1 - annualFeePct)^(1/12)
```

That means fees are applied to assets under management each month after growth.

## Inflation Modeling

Inflation is used to compute a deflator:

```text
deflator(month) = (1 + inflationRate)^(month / 12)
```

Real wealth is then approximated as:

```text
realWealth = nominalWealth / deflator(month)
```

This produces a “today’s money” style estimate.

## Reinvest vs Withdraw Mode

### Reinvest

If reinvest is enabled:

- gains remain in the portfolio
- future growth compounds on prior gains

### Withdraw

If reinvest is disabled:

- only positive monthly gains are withdrawn
- tax is applied to those withdrawn gains
- withdrawn gains accumulate separately from the portfolio balance
- total wealth becomes:

```text
portfolio balance + withdrawn net gains
```

This is a useful approximation, but not yet a full withdrawal-plan engine.

## Step-Up Contributions

The engine supports annual step-up of monthly contributions:

```text
monthlyContribution * (1 + stepUpRate)^(yearsPassed)
```

This is useful for modeling salary growth or gradually increasing investment
discipline.

## One-Time Deposits

The engine now supports one-time deposits on specific months.

Current behavior:

1. identify deposits scheduled for the current month
2. add them to the balance before growth
3. count them as contributions in cumulative contribution tracking

This is useful for bonuses, inheritance, or planned lump-sum top-ups.

## Contribution Pause Periods

The engine now supports pause ranges for monthly contributions.

Current behavior:

1. determine whether the current month falls inside any pause period
2. if yes, recurring monthly contribution for that month becomes `0`
3. one-time deposits can still be added in paused months

This is useful for career breaks, unemployment stress tests, or temporary cash
diversion.

## Output Rows

Each month produces a row containing:

- display month label
- numeric month index
- total value
- cumulative contributions
- cumulative gains
- monthly gain
- real value

These rows drive:

- the charts
- CSV export
- some comparison views

## IRR / TIR Approximation

The current `computeIRRFromRows()` implementation:

- builds monthly cash flows
- uses a bounded search / bisection-style approach on the monthly rate
- converts the resulting monthly rate back to an annualized rate

This is good enough for a practical approximation, but should eventually be:

- separated into its own module
- tested carefully
- documented with edge-case behavior

## Goal Solver

The app now includes a deterministic target solver layer.

It currently answers:

- what monthly contribution is required to reach a target amount in the chosen
  time horizon
- how many years are needed to reach a target amount at the current
  contribution rate

The current implementation uses repeated simulation calls and binary-search-like
search where appropriate. This is acceptable for the current scale, but should
eventually move into a dedicated solver module with tests.

## FIRE / Supported Income Layer

The app now includes a simple FIRE-style estimate based on:

```text
fireNumber = annualExpenses / safeWithdrawalRate
```

and

```text
supportedAnnualIncome = finalPortfolio * safeWithdrawalRate
```

This is intentionally simple and educational. It is not yet a full retirement
success model.

## Cost Of Waiting

The app also estimates the cost of delaying the investment start by a chosen
number of years.

Current approach:

- run the current simulation over the full horizon
- run a shorter-horizon delayed-start version
- compare end values

This gives a strong educational comparison, but it is still deterministic and
depends on the fixed annual return assumption.

## Validation Rules

Current validation includes:

- no negative initial capital
- no negative monthly contribution
- years must be in a fixed reasonable range
- annual return is clamped to a bounded range

These are UX and sanity guards, not economic guarantees.

## Current Known Math Limits

- returns are assumed constant in the main deterministic simulation
- no volatility path or Monte Carlo engine exists yet
- no sequence-of-returns risk modeling exists yet
- taxes are simplified
- fees are simplified
- inflation is constant
- the FIRE layer is simplified
- the goal solver is deterministic, not probability-based
- there is no jurisdiction-specific treatment
- no lot accounting or account wrapper logic exists yet

## What Needs To Be Tested First

The first math tests worth adding are:

1. zero return, zero fee, zero inflation baseline
2. positive return with reinvest on
3. positive return with reinvest off
4. annual fee drag
5. inflation-adjusted real value
6. step-up contribution growth
7. IRR approximation sanity for known cash-flow cases
8. required monthly contribution solver
9. years-to-target solver
10. cost-of-waiting calculation
