# Analytics measurement plan

Status: initial implementation

This document defines what Mahjong Reference measures, why it measures it, and the privacy boundaries that analytics code must preserve.

## Purpose

Analytics should answer product questions that cannot be answered reliably from search rankings or anecdotal feedback alone:

- Which pages bring people into Mahjong Reference?
- Which pages do people visit next?
- Do visitors move from learning/reference content into the hand scorer or whole-game Table Companion?
- Which supported rules profiles are deliberately selected?
- Where do future Table Companion workflows lose users before completion?

Analytics is not intended to identify individual visitors or reconstruct their Mahjong hands.

## Provider and hosting

Mahjong Reference uses PostHog Cloud EU for web and product analytics.

Project configuration:

- production URL: `https://mahjong.smooks.co.uk`
- project timezone: Europe/London
- IP storage disabled/anonymised at project level
- cookieless server hash mode enabled
- session replay disabled
- console capture disabled
- performance capture disabled
- heatmaps disabled
- surveys disabled
- dead-click capture disabled

Client configuration:

- `cookieless_mode: 'always'`
- `person_profiles: 'never'`
- interaction `autocapture: false`
- SPA/page navigation pageviews enabled with `capture_pageview: 'history_change'`
- session recording disabled
- exception capture disabled
- performance capture disabled
- feature-flag requests disabled while the site does not use them

The public PostHog project token is client configuration, not a secret credential. Personal API keys must never be committed.

## Current measurements

### Automatic pageviews

PostHog records page navigation so aggregate entry pages, exit pages and paths through the site can be analysed.

Useful examples:

- `/` → `/rules` → `/rules/british` → `/hand`
- search landing page → `/scoring-examples` → `/hand`
- `/mahjong-settlement` → `/game`

Pageviews are the primary source for site-path analysis.

### `ruleset_selected`

Emitted only when a visitor deliberately changes the selected rules profile in the product UI.

Allowed properties:

- `ruleset`: public ruleset slug such as `british`, `western`, or a configured public profile slug

Do not attach player names, hand data, free text or stable visitor identifiers.

## Planned semantic events

Add these only when there is a reliable success point in the product code. A button click is not necessarily a successful outcome.

| Event | Meaning | Candidate properties |
| --- | --- | --- |
| `scorer_started` | Standalone scorer workflow intentionally opened | ruleset, mode |
| `hand_entry_started` | Detailed hand entry intentionally begun | ruleset, game/standalone context |
| `hand_scored` | A valid hand calculation produced | ruleset, winner/non-winner, entry mode |
| `score_accepted` | A detailed score was applied back to a game | ruleset |
| `game_started` | A valid four-player game was created | ruleset, game length |
| `hand_completed` | A game hand was successfully confirmed | ruleset, outcome, ordinal hand number |
| `settlement_viewed` | A completed settlement was presented | ruleset, outcome |
| `game_completed` | The game reached its configured end state | ruleset, game length, hands played |

Numeric scores, balances, tile identities and player-entered names are not needed for these questions and should not be captured.

## Prohibited analytics data

Do not send any of the following to analytics:

- player names
- free-text input
- full or partial tile/hand contents
- saved game records
- clipboard contents
- stable account/user identifiers unless a future account system has a separately reviewed analytics design
- raw IP addresses
- email addresses or contact details

If a proposed event seems to require any of these, stop and redesign the measurement question first.

## Product questions and analyses

Once enough traffic exists, maintain a small set of repeatable analyses:

1. **Site paths** — top entry pages and common next steps.
2. **Content → product** — which reference/learning pages lead to `/hand` or `/game`.
3. **Ruleset interest** — deliberate `ruleset_selected` events by profile and source page.
4. **Table Companion funnel** — when semantic game events are added: game started → first hand completed → later hand completed → game completed.
5. **Scorer funnel** — when semantic scorer events are added: scorer started → hand scored → score accepted (for game-linked scoring).

Do not create dashboards merely because data exists. Each saved chart should answer a product decision question.

## Validation checklist

Before deployment:

- build, typecheck and tests pass
- analytics failure cannot break gameplay
- prerendered routes include the analytics loader
- `/privacy` is reachable from full and compact footers

After deployment:

- verify `$pageview` arrives from the production hostname
- verify navigation between public routes produces distinct pageviews
- verify a deliberate rules-profile change produces `ruleset_selected`
- confirm no session recordings are created
- inspect event properties for unexpected player-entered or free-text data
- create baseline path/funnel insights only after the corresponding events exist

## Cloudflare Web Analytics

Cloudflare Web Analytics can be enabled separately as a simple independent traffic baseline. It is not required for PostHog path analysis and should not delay the PostHog implementation. Keep the two systems conceptually separate: Cloudflare for broad traffic visibility; PostHog for product paths and deliberately designed events.

## References

- PostHog React/web analytics installation: https://posthog.com/docs/web-analytics/installation/react
- PostHog JavaScript configuration: https://posthog.com/docs/libraries/js/config
- PostHog privacy controls: https://posthog.com/docs/product-analytics/privacy
- PostHog cookieless tracking: https://posthog.com/tutorials/cookieless-tracking
