# Mahjong Reference

**Mahjong Reference** is a free, browser-based **Mahjong table companion** for scoring hands, tracking a whole game, understanding settlement and keeping the rules your table actually uses attached to the game.

**Live:** https://mahjong.smooks.co.uk

No signup is required. Current table play is local-first: an in-progress game is recovered in the same browser rather than depending on an account, network connection or server-side scorer.

> **Your Mahjong table companion.**  
> Score a hand, track the whole game, understand settlement and use the rules your table actually plays.

The project is deliberately **table-first, evidence-first and transparent about rules confidence**.

> **Explain rather than guess. Unknown evidence stays unknown.**

![Mahjong Reference visual hand scorer](artifacts/mahjong-scorer/public/help/screenshots/hand-builder-ordinary-desktop.png)

## Current product

### Supported playable profiles

| Rules context | Public status | Current support boundary |
| --- | --- | --- |
| **British / BMJA-style** | **Stable** | Established hand scoring, special hands, fishing, settlement and game progression. |
| **Western — Thompson & Maloney** | **Provisional scorer** | Companion special-hand catalogue is source-verified; ordinary rules remain provisional pending the exact source audit in #121. |
| **Club rules** | **Configured profile** | Configured local profile with its own specials, Goulash behaviour and incident/liability handling. Public naming stays generic. |

Mahjong is not one universal ruleset. The selected profile is explicit and the exact profile/version is persisted once a game begins.

Mahjong Reference is independent. It is **not an official British Mah-Jong Association product and does not claim BMJA endorsement**.

### Whole-game Table Companion

`/game` manages a four-player game hand by hand:

- rules/profile selection before play;
- East/dealer and prevailing-Wind progression;
- winner/draw handling;
- manual scores and detailed calculated hand scores in the same game;
- rules-aware **Who pays whom** settlement;
- running balances and confirmed history;
- undo/correction;
- same-browser recovery;
- final standings;
- Summary and Full game records through browser Print / Save as PDF.

Rules-specific entry routes (`/game/british`, `/game/western`, `/game/club`) may preselect a profile for a **new** game. They never silently mutate a recovered game.

### Hand scoring

`/hand` uses the same profile-aware scoring domain without requiring a full game. It supports visual tile/set entry, exposed/concealed state, Flowers and Seasons, partial losing-hand evidence, special/irregular layouts where supported, winning context, conservative unknown handling and an auditable score breakdown.

A hand scorer opened from a tracked game inherits that game's profile and trusted table context.

### Rules, learning and help

Useful public routes include:

| Route | Purpose |
| --- | --- |
| `/rules` | Supported rules hub |
| `/rules/british` | British / BMJA-style reference |
| `/rules/western` | Thompson & Maloney reference + provisional boundary |
| `/mahjong-rules-compared` | Broad comparison of major Mahjong traditions |
| `/mahjong-settlement` | Hand score → settlement → running-total explanation |
| `/gameplay-basics` | British gameplay basics |
| `/guide` | British scoring guide |
| `/special-hands` | British special-hand catalogue |
| `/scoring-examples` | Test-backed worked examples and practice |
| `/help` | Product-wide User Guide & Help |
| `/how-it-works` | Visual journey from choosing rules to keeping a game record |
| `/about` | Project purpose, trust, sources, privacy and attribution |

British learning material remains explicitly British; multi-profile scoring support does not turn those pages into generic Mahjong authority.

## Product principles

### Evidence over assumption

A rule is applied only when tiles, trusted game context or an explicit answer provide enough evidence. Missing information is not filled in merely because a favourable interpretation looks plausible.

### Scoring and settlement are separate

```text
Hand evidence
    ↓
Hand score
    ↓
Rules-aware settlement transactions
    ↓
Net balance changes
```

A hand's score is not automatically the amount a player pays or receives.

### Local-first table play

Current free play does not require an account, cloud game database or server-side scoring engine. Future account/Plus work must preserve this property: backend, billing or AI failure must not stop the physical game.

### Exact rules identity matters

Readable profile names are presentation. Saved/replayed game truth retains exact rules identity/version so later changes cannot silently reinterpret an old game.

## Rules expansion and platform work

The project is now deliberately separating **rules evidence**, **scoring grammar**, **profile configuration**, **settlement** and **table progression** rather than stretching the current British-shaped runtime into a universal rules switchboard.

Research completed on 16 September 2026 stress-tested the architecture against Classical/Western profiles plus Hong Kong, MCR, Taiwanese, Riichi, Sanma, Zung Jung and American/NMJL-style play. The resulting direction is:

```text
universal profile envelope
        +
shared Mahjong primitives where semantics genuinely match
        +
a small number of scoring grammars
        +
family/profile configuration
        =
deterministic versioned rules profile
```

The four current scoring-grammar families under design are:

1. **Classical points + doubles** — BMJA, Thompson & Maloney, Club/OTB, Buzzard and related Classical profiles;
2. **Pattern accumulator** — MCR, Hong Kong, Taiwanese, Zung Jung with family-specific combination/qualification/value policies;
3. **Riichi han + fu** — Riichi and Sanma variants;
4. **Target catalogue** — American/NMJL-style versioned catalogue matching.

### Protected implementation branch

Cross-family rules-platform implementation is staged on:

`integration/rules-platform-v1`

Issue **#227** is the programme gate. Its bounded implementation tickets are #229–#236. The first two intentionally do not change production callers:

- **#229** — add the universal type/schema vocabulary beside the current runtime;
- **#230** — implement typed registries/capability metadata and fail-closed compatibility checks.

`main` remains the production line until parity and cutover gates are complete. Do not merge the integration branch into `main` merely because individual architecture slices pass.

### Future rules profiles

- **Buzzard 2000 British/Western Classical** — primary-source evidence and Classical configuration crosswalk are implementation-ready; implementation now belongs to #217/#219–#221.
- **Mahjong Competition Rules (MCR)** — retained in #176 as the first separate pattern-accumulator implementation programme; full source-linked 81-pattern/exclusion fixtures remain future correctness work.
- **Riichi — EMA 2025** — architecture gate is passed in #202; source-linked yaku/fu/payment fixtures remain the next correctness gate before broad scorer implementation.
- **Thompson & Maloney ordinary rules** — #121 remains evidence-blocked until the exact intended edition is available.

## Plus / account direction

The free product remains account-free. The optional paid programme is documented under #206 and its product/architecture records.

Current product rule:

> **Free should still let the table play. Plus should remember and remove work.**

The planned Plus layers are deliberately separated: account/auth foundation, cloud saves/preferences, Stripe subscription entitlement, an auditable service-credit ledger, and voice only after the voice interpretation proof succeeds.

Voice follows this boundary:

```text
speech
→ transcription / structured interpretation
→ strict validated hand evidence
→ selected deterministic rules engine
→ Accept / Edit
```

The language model is not a second Mahjong scoring authority.

## Documentation authority

Start with:

- [`docs/README.md`](docs/README.md) — documentation authority map;
- [`docs/ANALYTICS_MEASUREMENT_PLAN.md`](docs/ANALYTICS_MEASUREMENT_PLAN.md) — analytics purpose, privacy boundaries, event taxonomy and known provider/reporting caveats;
- [`docs/product/TABLE_COMPANION_TRANSFORMATION.md`](docs/product/TABLE_COMPANION_TRANSFORMATION.md) — durable Table Companion product direction;
- [`docs/product/MAHJONG_REFERENCE_PLUS_ARCHITECTURE.md`](docs/product/MAHJONG_REFERENCE_PLUS_ARCHITECTURE.md) — Plus product/architecture decisions;
- [`docs/rules/`](docs/rules/) — rules evidence, provenance, crosswalks and family architecture;
- [`BMJA_RULES_REFERENCE.md`](BMJA_RULES_REFERENCE.md) — British/BMJA engineering rules reference;
- [`artifacts/mahjong-scorer/SCORING_AUDIT.md`](artifacts/mahjong-scorer/SCORING_AUDIT.md) — current scoring implementation/audit record;
- [issue #105](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/105) — live programme map;
- [issue #227](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/227) — current rules-platform programme.

For #227 implementation, use the normative docs on `integration/rules-platform-v1` named by the individual ticket rather than reconstructing architecture from older main-branch planning files.

## Architecture and deployment

The current application uses:

- React;
- TypeScript;
- Vite;
- Tailwind CSS;
- Vitest;
- pnpm workspaces;
- browser `localStorage` for current local recovery.

Production is deployed on **Cloudflare Pages**. Current scoring remains deterministic client/domain logic.

Public-route SEO configuration lives in:

[`artifacts/mahjong-scorer/src/site-seo.json`](artifacts/mahjong-scorer/src/site-seo.json)

The build produces crawler-visible route content, metadata, canonical URLs, structured data, sitemap, robots and redirects from the same route/product sources rather than maintaining search-only copy.

### Analytics and privacy

Mahjong Reference uses **PostHog Cloud EU** for deliberately limited web/product measurement. The current implementation is cookieless, uses no PostHog person profiles, disables session replay and interaction autocapture, and is intended to measure aggregate navigation plus a small set of explicit product events. The live privacy explanation is available at `/privacy`; the implementation contract is [`docs/ANALYTICS_MEASUREMENT_PLAN.md`](docs/ANALYTICS_MEASUREMENT_PLAN.md) and tracked by [issue #246](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/246).

**Known reporting caveat, verified 17 September 2026:** PostHog's query-time bot/traffic classifier can label genuine cookieless JavaScript pageviews as `Automation` with `traffic_category = no_user_agent` because the raw user-agent property used by that classifier is absent, even when ordinary browser/device properties are present. For Mahjong Reference reporting, `Automation + no_user_agent + cookieless=true` must be treated as **unclassified**, not as positive bot evidence. Do **not** filter reporting to `Traffic type = Regular`, and do not add raw `navigator.userAgent` capture merely to improve this classifier without revisiting the privacy design.

## Run locally

From the repository root:

```sh
pnpm install
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/mahjong-scorer dev
```

## Test and verify

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

Keep these commands as the verification source of truth rather than freezing a test count into documentation.

### Regenerate the product screenshot library

```sh
pnpm --filter @workspace/mahjong-scorer screenshots:help
```

The deterministic screenshot library is documented in [`docs/product/SCREENSHOT_LIBRARY.md`](docs/product/SCREENSHOT_LIBRARY.md).

## Current direction — 16 September 2026

The core Table Companion, public consolidation, manual WCAG remediation/evidence programme, shared footer and search/crawl work are complete on `main`.

The active runway is deliberately narrower:

- implement #227 in bounded slices, beginning with #229 and #230 on the protected integration branch;
- pick up #231 only after #230 has taught us whether the registry contract needs adjustment;
- keep Buzzard implementation behind the shared platform work rather than building a parallel scorer architecture;
- continue MCR/Riichi source-linked fixture work separately from platform mechanics;
- continue the bounded voice interpretation proof in #147 without pulling payment/account work forward;
- keep the Plus programme implementation-ready but do not make ordinary free table play account-dependent;
- prepare for real-table validation on 10 October in #89;
- use Search Console and observed table behaviour, rather than speculative features, to choose subsequent product work;
- keep non-active ideas in the parking-lot index #167.

The umbrella programme map is [#105](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/105).

## Artwork and licence

Mahjong tile artwork is sourced from `xhokir/riichi-mahjong-tiles`, based on `FluffyStuff/riichi-mahjong-tiles`, and used under **CC BY 4.0**. The project pins artwork locally rather than hot-linking it at runtime.

See [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) and [`docs/TILE_ASSET_DECISION.md`](docs/TILE_ASSET_DECISION.md).

Project source code authored for Mahjong Reference is licensed under the **MIT License**. See [`LICENSE`](LICENSE).

Original learner guides, explanatory copy, project documentation and other written content are not covered by the MIT License unless explicitly stated otherwise. Copyright (c) 2026 SMooks. All rights reserved unless otherwise stated.

## Support the project

If Mahjong Reference is useful to you, support is available at:

**https://buymeacoffee.com/sharronmo**
