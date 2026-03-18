# Deployment

`InvestSim` can be deployed for external testers with `GitHub Actions` and
`Vercel`.

This fits the current repo because:

- the app uses `Next.js` App Router
- the app includes API routes
- the repo already validates in GitHub Actions

`GitHub Pages` is not a fit because this repo is not a static export.

## Production Behavior

The current scenario backend writes to:

```text
.local-data/scenarios.json
```

That works locally, but is not reliable on ephemeral/serverless deployments.

Because of that, production now defaults to:

- simulator state persisted in browser `localStorage`
- imported and saved scenarios kept in the tester browser
- remote scenario API sync disabled unless explicitly enabled

This is enough for a tester round focused on bugs, unclear flows, and mobile UX.

## GitHub Secrets

Add these repository secrets in GitHub:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Vercel Environment Variables

For the current tester deployment:

```text
NEXT_PUBLIC_ENABLE_REMOTE_SCENARIO_SYNC=false
```

If you later add a real persistent backend, change it to:

```text
NEXT_PUBLIC_ENABLE_REMOTE_SCENARIO_SYNC=true
```

## GitHub Actions Flow

The CI workflow now does:

1. install dependencies
2. lint
3. test
4. build
5. deploy to Vercel on `push` to `main`

The deploy job runs only after validation succeeds.

## First-Time Setup

1. Create a Vercel project for the repo.
2. Add the three Vercel secrets in GitHub.
3. In Vercel, set `NEXT_PUBLIC_ENABLE_REMOTE_SCENARIO_SYNC=false`.
4. Push to `main`.
5. Wait for the GitHub Actions workflow to finish.
6. Share the Vercel production URL with testers.

## Current Limitation

Tester scenarios remain per browser/device. For durable multi-device storage,
the next step is a real database-backed repository, not filesystem writes.
