# InvestSim Data Model

This document defines the first real backend data model for `InvestSim`.

The goal is not to overbuild a generic finance platform. The goal is to support:

- optional user accounts
- local-first scenario editing
- cloud sync for saved scenarios
- scenario version history
- private/public sharing
- migration safety as the simulator model evolves

## Design Principles

1. Keep the simulator local-first.
2. Treat scenarios as user-owned documents.
3. Preserve historical scenario versions instead of mutating blindly.
4. Separate current scenario metadata from versioned scenario content.
5. Store the exact simulation assumptions payload as structured JSON close to the shared TypeScript shape.
6. Version persisted payloads explicitly so future math/model changes are survivable.

## Current Domain Inputs

The current scenario shape in
[types.ts](/home/brr/Documents/Github-Projects/personal_research/InvestSim/packages/shared/types.ts)
already includes:

- initial capital
- monthly contribution
- years
- annual return
- reinvest / withdraw behavior
- compounding mode
- annual fee
- inflation
- annual contribution step-up
- withdrawal tax
- one-time deposits
- contribution pauses
- display color
- optional note

That means the backend model should treat `scenario content` as a versioned
simulation document, not as a handful of flat numeric columns only.

## Entity Overview

Core entities:

1. `users`
2. `user_preferences`
3. `scenarios`
4. `scenario_versions`
5. `scenario_tags`
6. `scenario_tag_links`
7. `shared_links`

Optional later entities:

1. `sessions` or auth-provider-owned session data
2. `audit_events`
3. `scenario_collaborators`
4. `comments`

## Recommended Tables

### `users`

Purpose:
- identity root for all private user-owned data

Recommended fields:
- `id` `uuid` primary key
- `email` `text` unique nullable
- `display_name` `text` nullable
- `avatar_url` `text` nullable
- `auth_provider` `text` nullable
- `auth_provider_subject` `text` nullable
- `created_at` `timestamptz` not null
- `updated_at` `timestamptz` not null
- `last_seen_at` `timestamptz` nullable
- `deleted_at` `timestamptz` nullable

Notes:
- keep soft delete support from the start
- if auth is delegated to a provider, keep only stable identity linkage here

### `user_preferences`

Purpose:
- stable user-level UI preferences, separate from scenarios

Recommended fields:
- `user_id` `uuid` primary key references `users(id)`
- `language` `text` not null default `'en'`
- `currency` `text` not null default `'EUR'`
- `locale` `text` not null default `'en-US'`
- `timezone` `text` nullable
- `default_start_date_mode` `text` not null default `'today'`
- `created_at` `timestamptz` not null
- `updated_at` `timestamptz` not null

Notes:
- this should not contain scenario content
- keep this small and migration-safe

### `scenarios`

Purpose:
- the current user-facing scenario record and ownership metadata

Recommended fields:
- `id` `uuid` primary key
- `user_id` `uuid` not null references `users(id)`
- `title` `text` not null
- `slug` `text` nullable
- `color` `text` not null
- `is_favorite` `boolean` not null default `false`
- `archived_at` `timestamptz` nullable
- `latest_version_id` `uuid` nullable unique
- `created_at` `timestamptz` not null
- `updated_at` `timestamptz` not null
- `last_opened_at` `timestamptz` nullable

Notes:
- `scenarios` is the stable identity
- actual simulator payload lives in `scenario_versions`
- `latest_version_id` should point to the newest accepted version row

### `scenario_versions`

Purpose:
- immutable historical versions of the simulator payload

Recommended fields:
- `id` `uuid` primary key
- `scenario_id` `uuid` not null references `scenarios(id)`
- `version_number` `integer` not null
- `schema_version` `integer` not null
- `source` `text` not null
- `payload` `jsonb` not null
- `summary` `jsonb` nullable
- `created_by_user_id` `uuid` nullable references `users(id)`
- `created_at` `timestamptz` not null

Recommended unique/index rules:
- unique `scenario_id, version_number`
- index `scenario_id, created_at desc`
- optional GIN index on `payload`

Notes:
- `payload` should mirror the shared scenario/simulation request shape closely
- `schema_version` is critical for future migrations
- `summary` may store derived metadata like final value, contribution total, years, return, and last-used mode for fast lists
- `source` can be values like `manual_edit`, `import_json`, `duplicate`, `migration`, `autosave`

### `scenario_tags`

Purpose:
- reusable user-owned tags for organization

Recommended fields:
- `id` `uuid` primary key
- `user_id` `uuid` not null references `users(id)`
- `name` `text` not null
- `color` `text` nullable
- `created_at` `timestamptz` not null

Recommended unique/index rules:
- unique `user_id, lower(name)`

### `scenario_tag_links`

Purpose:
- many-to-many join between scenarios and tags

Recommended fields:
- `scenario_id` `uuid` not null references `scenarios(id)`
- `tag_id` `uuid` not null references `scenario_tags(id)`
- `created_at` `timestamptz` not null

Recommended key:
- primary key `scenario_id, tag_id`

### `shared_links`

Purpose:
- controlled external sharing of a specific scenario version

Recommended fields:
- `id` `uuid` primary key
- `scenario_id` `uuid` not null references `scenarios(id)`
- `scenario_version_id` `uuid` not null references `scenario_versions(id)`
- `created_by_user_id` `uuid` not null references `users(id)`
- `token_hash` `text` not null unique
- `visibility` `text` not null
- `allow_discovery` `boolean` not null default `false`
- `expires_at` `timestamptz` nullable
- `revoked_at` `timestamptz` nullable
- `created_at` `timestamptz` not null
- `last_accessed_at` `timestamptz` nullable

Notes:
- share the version, not “whatever the scenario becomes later”
- store hashed tokens, not plaintext tokens
- `visibility` can start with `private`, `link_readonly`, `public_readonly`

## JSON Payload Shape

`scenario_versions.payload` should be close to this shape:

```json
{
  "schemaVersion": 1,
  "scenario": {
    "name": "Balanced 20y",
    "color": "#3b82f6",
    "note": "Main ETF plan"
  },
  "simulation": {
    "initial": 5000,
    "monthly": 400,
    "years": 20,
    "annualPct": 6,
    "reinvest": true,
    "compounding": "monthly",
    "annualFeePct": 0.4,
    "inflationPct": 2.5,
    "stepUpAnnualPct": 0,
    "taxOnWithdrawPct": 10,
    "oneTimeDeposits": [],
    "contributionPauses": []
  },
  "ui": {
    "startDate": "2026-03-18"
  }
}
```

Notes:
- keep version metadata outside the inner simulation object too
- do not mix user-level preferences into this payload

## Why Split `scenarios` And `scenario_versions`

This split solves several problems:

- users can edit a scenario without losing history
- sharing can target a stable version
- migrations can rewrite payloads into new versions
- sync conflicts can be resolved at the version layer
- list pages can load current scenario metadata quickly without scanning full version history

Without this split, version history and sharing become awkward quickly.

## Local-First Sync Model

The app should remain usable without login. Recommended sync behavior:

1. Keep current browser `localStorage` state as the immediate working copy.
2. When a logged-in user saves, create or update a cloud `scenario`.
3. Persist a new `scenario_version` for meaningful edits, not necessarily every keystroke.
4. Store a client-generated local id and last synced cloud version id in local metadata.
5. On reconnect or login, reconcile local unsynced scenarios into cloud scenarios.

Recommended conflict policy for `v1`:

- last-write-wins for scenario metadata
- append-only version creation for payload conflicts
- show “restored conflicting copy” instead of destructive merge if needed

This is much simpler and safer than collaborative live editing.

## Migration Strategy

Every persisted scenario payload should include:

- `schema_version` at the row level
- `schemaVersion` inside the JSON payload if useful for exports/imports

Recommended migration rules:

1. Never silently reinterpret old payloads without a schema version.
2. Add pure migration functions in code for `v1 -> v2`, `v2 -> v3`, etc.
3. Prefer writing a new `scenario_version` after migration instead of mutating old historical rows.
4. Preserve imported raw payloads only if needed for debugging; otherwise normalize immediately.

## Summary Snapshot

`scenario_versions.summary` is optional but useful for fast lists and share cards.

Recommended fields inside `summary`:

- `finalValue`
- `totalContrib`
- `totalGains`
- `yieldPct`
- `years`
- `annualPct`
- `monthly`
- `initial`
- `inflationPct`
- `compounding`
- `reinvest`

This avoids rerunning the full engine for every scenario card in future list views.

## Security Notes

- never trust client-provided ownership ids
- never store share tokens in plaintext
- validate all simulation payloads on the server using the shared validation layer
- rate-limit public share endpoints
- keep readonly share links separate from editable authenticated scenario routes

## Suggested API Surface

First practical backend routes after auth:

1. `GET /api/scenarios`
2. `POST /api/scenarios`
3. `GET /api/scenarios/:id`
4. `PATCH /api/scenarios/:id`
5. `POST /api/scenarios/:id/versions`
6. `GET /api/scenarios/:id/versions`
7. `POST /api/shared-links`
8. `GET /api/shared/:token`

The existing `POST /api/simulate` route remains a separate stateless compute endpoint.

## Recommended Implementation Order

1. Add auth.
2. Add `users`.
3. Add `user_preferences`.
4. Add `scenarios`.
5. Add `scenario_versions`.
6. Add local-to-cloud sync metadata and sync flow.
7. Add tags.
8. Add share links.

## Explicit Non-Goals For V1

- collaborative real-time editing
- portfolio transaction ledgers
- broker integrations
- tax-lot accounting
- highly normalized event tables before the payload stabilizes

For now, versioned JSON payloads are the right tradeoff.
