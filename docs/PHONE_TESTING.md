# Phone Testing Guide

This file explains how to test `InvestSim` on a phone in a way that matches how
the project is likely to be used in practice: quick access, narrow screens, and
real touch interactions.

The intended long-term workflow is very similar to the `Remote-Terminal`
project:

- run the app locally on the laptop
- expose it safely to the phone through Tailscale or another controlled path
- validate the real mobile UX instead of trusting desktop responsive emulation

## Why Phone Testing Matters Here

`InvestSim` is already partially mobile-aware:

- it has a mobile drawer
- it has dense chart areas
- it uses sliders and form controls that can behave differently on touch screens
- it has multiple summary/action regions that can get cramped on narrow widths

This makes real phone testing much more important than for a static marketing
site.

## Minimum Phone Testing Workflow

### 1. Start the dev server

From the repo root:

```bash
cd /home/brr/Documents/Github-Projects/personal_research/InvestSim
pnpm dev
```

### 2. Make it reachable from the phone

There are several ways to do this, but the preferred direction is:

- keep the app local on the laptop
- expose it only through Tailscale or a controlled tunnel

Good options:

- Tailscale Serve
- a Tailscale-accessible LAN bind
- another authenticated tunnel you control

Avoid:

- exposing the dev server directly to the public internet
- forwarding router ports for a dev server

## Suggested Tailscale-Oriented Workflow

The clean target workflow is:

1. run the Next.js app locally
2. bind it safely
3. publish it through Tailscale
4. open it on the phone while connected to the same tailnet

This repo does not yet include an `InvestSim`-specific publish helper, but it
should in a later pass.

## What To Test On Phone

### Navigation

- does the mobile drawer open and close reliably?
- can you reach all major sections quickly?
- does scrolling feel manageable on long pages?

### Inputs

- can numeric fields be edited without weird cursor jumps?
- are sliders easy to use with a thumb?
- do labels remain visible near the active control?
- are validation errors understandable on a small screen?

### Charts

- are chart legends readable?
- are tooltips usable with touch?
- do axes become cluttered?
- does horizontal overflow happen?

### Summary Cards

- do KPI cards remain readable on small widths?
- are key outcomes visible without too much scrolling?
- do long values wrap badly?

### Scenario Comparison

- can saved scenarios be inspected without layout breaking?
- do action buttons remain easy to tap?
- does the comparison table become unusable on narrow screens?

### Notes / Methodology

- does the notes area remain usable with the on-screen keyboard?
- do keyboard-open states hide important actions?

## Recommended Test Cases

### Case 1: Empty beginner flow

- initial = `0`
- monthly = `200`
- years = `10`
- annual return = `8`

Check:

- quick-start nudges
- KPI clarity
- chart readability

### Case 2: Large long-term scenario

- initial = `10000`
- monthly = `1000`
- years = `30`
- annual return = `10`

Check:

- long numbers on summary cards
- chart label density
- export button accessibility

### Case 3: Risk / stress input

- annual return = `-10`
- years = `5`

Check:

- validation and messaging
- negative or low-growth visual behavior

### Case 4: Scenario-heavy mode

- save at least 4 scenarios
- enable comparison

Check:

- scenario grid wrap
- comparison chart readability
- comparison table overflow

## Device Checklist

Test at least:

- one iPhone width
- one Android width
- one small landscape mode

If possible, also test:

- low-power mode
- dark mode
- slow network

## What Desktop Emulation Will Miss

Desktop responsive mode is useful, but it does not fully replace phone testing.
It often misses:

- touch target feel
- on-screen keyboard overlap
- inertial scrolling issues
- Safari-specific layout oddities
- real tooltip and chart interaction behavior

## Recommended Future Improvement

This repo should eventually add:

- `docs/REMOTE_TESTING.md`
- a small helper script to publish the local app through Tailscale
- a repeatable phone QA checklist tied to releases

