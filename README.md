# British Mahjong Scorer

A free, browser-based British Mahjong scoring calculator and companion for **scoring games and hands, learning the rules, and understanding why a score applies**.

The project is designed to be useful at the table without requiring players to learn the scoring engine first. Where the entered tiles and game context provide enough evidence, the scorer detects patterns automatically and explains them in plain English.

## Live site

**https://mahjong.smooks.co.uk**

## What it does

### Score a complete game

- four-player British Mahjong game scoring
- manual or calculated hand scores
- East / prevailing-Wind progression
- winner and loser settlement, including East doubling
- running balances, hand ledger and undo
- local recovery of an in-progress game after refresh or browser restart
- enriched hand-by-hand game history with settlement explanations and detailed hand evidence where recorded
- completed-game final standings
- Full game record or compact Game summary through the browser Print / Save as PDF flow

### Score an individual hand

- visual tile entry using real Mahjong tile artwork
- Pungs, Kongs, Chows and pairs
- arbitrary Remaining tiles for unfinished losing hands
- partial-evidence scoring for losing hands without forcing every irrelevant loose tile to be entered
- Flowers and Seasons, including their own-Wind relationships
- irregular special-hand layouts where normal sets do not fit
- winning-tile provenance where a rule genuinely depends on the final tile
- automatic points, doubles, special-hand and fishing calculations
- compact contextual explanations for patterns that actually apply
- conservative scoring when required event information is unknown

### Learn British Mahjong

The site also includes learner-facing pages for:

- gameplay basics
- scoring basics and a beginner guide
- the tile families
- Flowers, Seasons and their Wind relationships
- a visual catalogue of supported special hands
- plain-English explanations alongside the scorer

The guiding principle is:

> **Explain the game; do not make the player learn the scoring engine.**

## Product approach

British Mahjong Scorer is intentionally beginner-first and browser-first.

- Infer scoring facts from the hand where it is safe to do so.
- Ask the player only for information that cannot be inferred reliably.
- Treat “I’m not sure” conservatively rather than inventing evidence.
- Allow partial losing-hand evidence to be scored without presenting it as a complete reconstruction.
- Keep the main scoring flow focused on the hand being played; the full rule catalogue lives in the learner/reference pages.
- Keep current game recovery local to the browser rather than requiring an account or cloud service.
- Keep the canonical game ledger as the source of truth for printable game records rather than creating a second report engine.
- Prefer small, testable rule changes with explicit source and interpretation notes.

## Rules and accuracy

The project implements the British Mahjong rules used by this scorer, based primarily on the published material at **https://mahjongbritishrules.wordpress.com/**.

The engineering rule reference is maintained in [`BMJA_RULES_REFERENCE.md`](BMJA_RULES_REFERENCE.md). It records implemented rules, project interpretations, known ambiguities, source links and test/fixture coverage.

Scoring coverage and implementation notes are also tracked in [`artifacts/mahjong-scorer/SCORING_AUDIT.md`](artifacts/mahjong-scorer/SCORING_AUDIT.md).

This project is **independent and is not an official British Mah-Jong Association publication**. Public-facing rule explanations are project-owned paraphrases rather than reproductions of source material.

## Technology

The user-facing scorer is built with:

- React
- TypeScript
- Vite
- Vitest
- pnpm workspaces
- browser `localStorage` for in-progress game recovery

The production site is deployed as a static web application on Cloudflare Pages.

## Run locally

This is a pnpm workspace. From the repository root:

```sh
pnpm install
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/mahjong-scorer dev
```

Then open the local Vite URL shown in the terminal.

## Test and verify

For the scorer:

```sh
pnpm --filter @workspace/mahjong-scorer test
pnpm run typecheck
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/mahjong-scorer build
```

The production build output is written to:

```text
artifacts/mahjong-scorer/dist/public
```

The scorer keeps its Vite + React architecture. Its build additionally writes
route-specific static HTML metadata for the public pages, so search and social
crawlers do not need to run the app to read titles, descriptions, canonicals or
social previews. Cloudflare Pages serves each extensionless static route file
(for example, `guide.html` at `/guide`) before its default SPA fallback handles
other direct links.

## Search indexing after deployment

After the SEO changes are deployed, the owner should verify the site in Google
Search Console (DNS verification through Cloudflare is preferred), submit
`https://mahjong.smooks.co.uk/sitemap.xml`, and request indexing for `/`,
`/guide`, `/special-hands`, `/gameplay-basics` and `/hand`. The same sitemap
should be submitted in Bing Webmaster Tools, and Cloudflare Crawler Hints /
IndexNow can be enabled if available. Submission does not guarantee immediate
indexing or ranking.

## Repository guides

Useful project documents include:

- [`BMJA_RULES_REFERENCE.md`](BMJA_RULES_REFERENCE.md) — engineering rule source of truth
- [`docs/PRODUCT_CONTENT_PLAN.md`](docs/PRODUCT_CONTENT_PLAN.md) — product-guide, features, USP and deeper content architecture
- [`docs/BEGINNER_GUIDE_CONTENT.md`](docs/BEGINNER_GUIDE_CONTENT.md) — learner guide content
- [`docs/SPECIAL_HAND_CATALOGUE_CONTENT.md`](docs/SPECIAL_HAND_CATALOGUE_CONTENT.md) — special-hand catalogue content
- [`docs/GAMEPLAY_BASICS_CONTENT.md`](docs/GAMEPLAY_BASICS_CONTENT.md) — gameplay-basics content
- [`docs/ABOUT_THIS_PROJECT_CONTENT.md`](docs/ABOUT_THIS_PROJECT_CONTENT.md) — project/about content
- [`docs/TILE_ASSET_DECISION.md`](docs/TILE_ASSET_DECISION.md) — Mahjong artwork source and attribution decision

## Current development areas

The core scoring, learner pages, local game recovery, site navigation and printable canonical game record are in place. Larger future areas currently include:

- shared physical tile inventory / availability warnings
- optional photo-based tile recognition
- exploration of a lightweight solo practice mode
- richer background product/help content described in [`docs/PRODUCT_CONTENT_PLAN.md`](docs/PRODUCT_CONTENT_PLAN.md)

See the GitHub issues for the current implementation backlog and acceptance criteria.

## Artwork

Mahjong tile artwork is sourced from `xhokir/riichi-mahjong-tiles`, based on `FluffyStuff/riichi-mahjong-tiles`, and is used under CC BY 4.0. The project pins the artwork locally rather than hot-linking it at runtime.

See [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) and [`docs/TILE_ASSET_DECISION.md`](docs/TILE_ASSET_DECISION.md) for attribution and licence details.

## Licence

Project source code authored for British Mahjong Scorer is licensed under the **MIT License**. See [`LICENSE`](LICENSE).

Original learner guides, explanatory copy, project documentation and other written content are not covered by the MIT License unless explicitly stated otherwise. Copyright (c) 2026 SMooks. All rights reserved unless otherwise stated.

Third-party materials keep their own licences and attribution requirements. See [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

## Support the project

If British Mahjong Scorer is useful to you, you can support its continued development at:

**https://buymeacoffee.com/sharronmo**
