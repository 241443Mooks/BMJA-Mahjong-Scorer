# Mahjong Reference

**Mahjong Reference** is a free, browser-based **Mahjong table companion** for scoring one hand, tracking a complete four-player game, understanding settlement and using the supported rules your table actually plays.

**Live:** https://mahjong.smooks.co.uk

No signup is required. An in-progress game is recovered locally in the same browser rather than through an account or cloud-sync service.

> **Your Mahjong table companion.**
> Score a hand, track the whole game, understand settlement and use the rules your table actually plays.

The project is deliberately **table-first, evidence-first, browser-first and transparent about rules confidence**.

> **Explain the game. Do not make the player learn the scoring engine.**

> **Never invent missing evidence. Calculate what can be supported, ask only when necessary, and treat unknown facts conservatively.**

![Mahjong Reference visual hand scorer](artifacts/mahjong-scorer/public/help/screenshots/hand-builder-ordinary-desktop.png)

## Rules currently supported

Mahjong is not one universal ruleset. Mahjong Reference keeps the selected rules profile explicit and persists the exact profile/version once a game begins.

| Rules context | Public status | Current support boundary |
| --- | --- | --- |
| **British / BMJA-style** | **Stable** | Established hand scoring, special hands, fishing, settlement and game progression. |
| **Western — Thompson & Maloney** | **Provisional scorer** | Companion special-hand catalogue is source-verified. Ordinary play, scoring, settlement and progression remain under source review. |
| **Club rules** | **Configured profile** | A configured local club profile with its own specials, Goulash behaviour and incident/liability handling. Public naming stays generic. |

British / BMJA-style is the stable baseline. Western is deliberately available before every ordinary-rule domain is fully verified, but the product says so rather than presenting provisional behaviour as settled authority.

Mahjong Reference is independent. It is **not an official British Mah-Jong Association product and does not claim BMJA endorsement**.

## What is shipped

### Track a complete four-player game

`/game` is the primary whole-game workspace. It manages the table hand by hand rather than acting as a simple total calculator.

- choose a supported rules context before starting a new game;
- four-player setup with starting Winds;
- East/dealer and prevailing-Wind progression;
- winner and draw handling;
- manual numeric scores and detailed calculated hand scores in the same game;
- rules-aware settlement from the selected profile;
- live **Who pays whom** transaction explanations;
- net changes and running balances;
- zero-sum settlement confirmation where supplied by the rules engine;
- hand-by-hand ledger/history;
- undo/correction support;
- local recovery after refresh, tab closure or browser restart;
- final standings;
- **Game summary** and **Full game record** through the browser Print / Save as PDF flow;
- printed rules profile/version provenance and a generated date.

The confirmed game ledger is the source of truth for both the live history and printable record. The product does not build a second report model that can drift away from the game itself.

Rules-specific entry routes use the same game engine:

- `/game/british`
- `/game/western`
- `/game/club`

These routes may preselect rules for a **new** game. They never silently mutate a recovered game, and the exact rules profile/version is locked once play begins.

### Score an individual hand

`/hand` uses the same profile-aware scoring architecture without requiring a full game.

- select British / BMJA-style, Western — Thompson & Maloney or Club rules;
- visual tile entry using locally pinned Mahjong artwork;
- Pungs, Kongs, Chows and pairs;
- exposed and concealed state;
- Flowers and Seasons;
- Remaining tiles for unfinished losing hands;
- **partial-evidence scoring** without forcing a losing player to reconstruct irrelevant tiles;
- complete-hand validation and whole-hand inference where enough evidence exists;
- irregular/special layouts where the active profile supports them;
- winner/non-winner context and winning method;
- winning-tile provenance where a rule genuinely depends on it;
- supported points, doubles, special hands and fishing;
- event-sensitive questions only where required;
- conservative handling of `I'm not sure` / unknown evidence;
- clear score breakdowns and detected-pattern explanations.

When a hand scorer is opened from a running game, it inherits that game's rules and cannot switch profiles independently.

British scorer results can link to the established British learning references. Western and Club results keep their scorer explanations but do **not** route users into British rule pages as though those pages were authoritative for another profile.

### Understand settlement

`/mahjong-settlement` explains the difference between:

```text
Hand scores
    ↓
Rules-aware settlement transactions
    ↓
Net change for each player
    ↓
Running game totals
```

The page uses an engine-backed British/BMJA-style example and makes the rules boundary explicit. It does not present one settlement model as universal Mahjong law.

### Understand the rules context

The public rules layer separates **which rules are being described** from **whether Mahjong Reference can score them**.

- `/rules` — supported rules hub;
- `/rules/british` — stable British / BMJA-style reference;
- `/rules/western` — Thompson & Maloney profile, including its provisional ordinary-rule boundary;
- `/mahjong-rules-compared` — broad comparison across major Mahjong traditions.

The configured Club profile is selectable in the tools without exposing a specific club name publicly.

### Learn British Mahjong alongside the scorer

The current learner/reference library is still intentionally **British-specific**. It has not been relabelled as generic Mahjong merely because the scoring tools now support more than one profile.

| Route | Purpose |
| --- | --- |
| `/gameplay-basics` | British Mahjong gameplay basics |
| `/guide` | British scoring guide |
| `/special-hands` | British special-hand catalogue |
| `/scoring-examples` | Test-backed British worked examples and practice |
| `/help` | Practical product help and how-tos |
| `/how-it-works` | Product flow from evidence to score, settlement and record |
| `/about` | Project purpose, trust, sources, privacy and attribution |

Legacy learner aliases redirect to the canonical pages:

- `/beginner-guide` → `/guide`
- `/special-hand-catalogue` → `/special-hands`

## Product and trust model

### Evidence over assumption

A rule is applied only when the entered tiles, game context or explicit answer provide enough evidence.

When evidence is missing, the scorer should:

- calculate only what can be supported;
- ask a short question if the missing fact genuinely matters; or
- omit the uncertain pattern or bonus.

It should not manufacture the most favourable interpretation.

### Partial, complete and invalid evidence are different states

For losing hands, entering fewer than the full structural tile count is not automatically an error.

- **Partial evidence** can score directly evidenced sets, pairs and bonus tiles.
- **Complete evidence** can unlock whole-hand and fishing inference where supported by the active profile.
- **Invalid evidence** remains blocked where the entered hand is structurally impossible or contradictory.

### Manual scores remain manual

A numeric score entered by a player is valid game input, but the application never pretends that it verified a hand that was not entered in detail.

Printed/history records distinguish between calculated detailed hands, partial detailed evidence and manually entered scores.

### Rules identity is durable

Public UI uses readable names such as **British / BMJA-style**, **Western — Thompson & Maloney** and **Club rules**. Internally, the game persists an exact rules profile/version so recovery, settlement, history and printing continue under the same executable rules.

### Local-first recovery

The current game is stored in browser `localStorage` and replay-validated when recovered.

There is currently:

- no user account requirement;
- no cloud game database;
- no cross-device game sync;
- no server-side scoring engine.

This keeps ordinary table use low-friction while making the recovery boundary clear.

## Rules evidence and provenance

Rules evidence is intentionally kept separate from marketing/product copy.

Start with the documentation map:

- [`docs/README.md`](docs/README.md) — documentation authority map;
- [`docs/product/TABLE_COMPANION_TRANSFORMATION.md`](docs/product/TABLE_COMPANION_TRANSFORMATION.md) — current Table Companion product direction;
- [`docs/rules/`](docs/rules/) — rules evidence, provenance, crosswalks and future-ruleset architecture;
- [`BMJA_RULES_REFERENCE.md`](BMJA_RULES_REFERENCE.md) — British/BMJA engineering rules reference;
- [`artifacts/mahjong-scorer/SCORING_AUDIT.md`](artifacts/mahjong-scorer/SCORING_AUDIT.md) — scoring implementation/audit record.

The repository deliberately preserves uncertainty and source status where evidence is incomplete. Product copy must not silently upgrade provisional rules into verified authority.

## Architecture

The user-facing application is built with:

- React;
- TypeScript;
- Vite;
- Tailwind CSS;
- Vitest;
- pnpm workspaces;
- browser `localStorage` for local in-progress game recovery.

Production is a static web application deployed on **Cloudflare Pages**.

The rules architecture uses versioned profiles and profile-local scoring/catalogue behaviour rather than forcing materially different Mahjong traditions into one universal set of switches.

## Search, metadata and public routing

Public-route SEO configuration is centralised in:

[`artifacts/mahjong-scorer/src/site-seo.json`](artifacts/mahjong-scorer/src/site-seo.json)

The production build reuses that configuration to generate:

- route-specific crawler-visible HTML metadata;
- canonical URLs;
- Open Graph and Twitter metadata;
- structured data;
- `sitemap.xml`;
- `robots.txt`;
- Cloudflare Pages alias redirects.

`/game` remains the canonical full-game tracker destination. `/mahjong-settlement` owns the substantive settlement explainer. Rules-specific game entry routes are functional entry states into the same game tool rather than duplicate content products.

## Run locally

This is a pnpm workspace. From the repository root:

```sh
pnpm install
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/mahjong-scorer dev
```

Then open the local Vite URL shown in the terminal.

## Test and verify

From the repository root:

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm run typecheck
PORT=5173 BASE_PATH=/ pnpm run build
```

The production build output is written to:

```text
artifacts/mahjong-scorer/dist/public
```

The current merged product is covered by the full Vitest suite plus TypeScript and production/prerender build checks. Keep the commands above as the source of truth rather than freezing a test count into this README.

### Regenerate the instructional screenshot library

```sh
pnpm --filter @workspace/mahjong-scorer screenshots:help
```

The command starts the real app in deterministic demo states, captures Mobile/Tablet/Desktop instructional screenshots and fails if required product images are unresolved.

Do not manually edit or crop the committed Help screenshots. See [`artifacts/mahjong-scorer/public/help/screenshots/README.md`](artifacts/mahjong-scorer/public/help/screenshots/README.md).

## Current direction

The core Table Companion transformation is shipped. The immediate work is consolidation and evidence, not feature proliferation.

Current near-term priorities are:

- align remaining shared user-facing explanatory pages with the rules-aware Table Companion product truth;
- run a dedicated SEO/crawl/internal-linking pass after that copy is coherent;
- use Google Search Console/indexing data as evidence for subsequent content decisions;
- complete Thompson & Maloney ordinary-rule verification through #121 without overstating Western certainty in the meantime;
- use real-table validation, including #89, to decide whether paused ideas such as the rules diagnostic or exact profile-aware rule deep links deserve renewed priority;
- consider PWA/offline hardening later through #48.

The umbrella transformation tracker is [#105](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/105).

## Artwork

Mahjong tile artwork is sourced from `xhokir/riichi-mahjong-tiles`, based on `FluffyStuff/riichi-mahjong-tiles`, and used under **CC BY 4.0**.

The project pins the artwork locally rather than hot-linking it at runtime.

See [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) and [`docs/TILE_ASSET_DECISION.md`](docs/TILE_ASSET_DECISION.md) for attribution and licence details.

## Licence

Project source code authored for Mahjong Reference is licensed under the **MIT License**. See [`LICENSE`](LICENSE).

Original learner guides, explanatory copy, project documentation and other written content are not covered by the MIT License unless explicitly stated otherwise. Copyright (c) 2026 SMooks. All rights reserved unless otherwise stated.

Third-party materials keep their own licences and attribution requirements. See [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

## Support the project

If Mahjong Reference is useful to you, you can support its continued development at:

**https://buymeacoffee.com/sharronmo**
