# Changelog

This file records meaningful changes to **Mahjong Reference** at product-milestone level. It is intentionally shorter than the commit, branch and pull-request history.

## Unreleased

### Added

- Expanded the source-local reference inventory to **626 concepts across 18 rules/source corpora**, while deliberately keeping cross-family equivalence work held until executable profile identities exist. [#265](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/265)
- Defined the structured-reference architecture for #251: human pages are views over a source/runtime-backed concept, profile-treatment, relationship and evidence layer rather than a wiki or second prose rules database. The same verified records are intended to support future scorer links, comparisons and grounded AI/voice explanations. [#281](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/281)

### Changed

- Reframed the repository front door and documentation authority map around durable programme boundaries rather than short-lived child-issue sequencing.

## 2026-09-17 — Source-correct expansion and measurement baseline

### Added

- Completed the source-pinned **MCR 2006** pre-code correctness corpus: all 81 fan, evidence requirements, interaction/qualification rules, Flowers treatment, settlement/progression and golden fixtures. Runtime implementation is now the bounded #241 handoff. [#242](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/242)
- Completed the source-pinned **EMA Riichi 2025** pre-code correctness corpus: yaku/yakuman catalogue, dora, fu, value/payment rules, ten official worked examples, settlement/progression and completeness audit. Runtime implementation is now #244. [#245](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/245)
- Added privacy-conscious, cookieless PostHog Cloud EU analytics with SPA pageviews, a deliberately small semantic-event boundary, a public `/privacy` page and an in-repo measurement plan. [#248](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/248)

### Changed

- Aligned the completed MCR corpus with the rules-platform registry/Lego vocabulary without reopening architecture; MCR Flowers remain a post-qualification bonus and progression alone owns dealer movement. [#243](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/243)
- Documented the verified PostHog cookieless traffic-classification caveat so genuine `Automation + no_user_agent + cookieless=true` pageviews are treated as unclassified rather than filtered as bots. [#249](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/249)
- Reorganised repository documentation by authority/purpose, reduced the README to a case-study/front-door, and archived superseded planning without discarding evidence.

## 2026-09-16 — Rules-platform and repository readiness

### Added

- Recovered and page-bound the Buzzard 2000 primary source, turning the future British/Western Classical profile into an implementation-ready KEEP / ADD / AMEND / REMOVE crosswalk rather than a speculative new scorer. [#218](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/218)
- Defined a repeatable Classical/Western configuration model so BMJA, provisional T&M, Club/OTB and Buzzard can converge on shared typed configuration, canonical pattern bindings and profile-local values instead of copied scorers. [#223](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/223)
- Stress-tested the Classical configuration against an external European Classical profile and identified the reusable additive concealed-hand bonus plus progression/source gaps without widening the runtime speculatively. [#225](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/225)
- Stress-tested the wider rules architecture across eight external Mahjong profiles and established four scoring-grammar families: Classical points/doubles, pattern accumulators, Riichi han/fu and versioned target catalogues. [#226](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/226)

### Changed

- Added one shared, intentionally small product footer across public/reference/learning pages, kept active game/hand workspaces uncluttered, and promoted the search-friendly raster favicon declaration. [#216](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/216)
- Checkpointed repository authority so `main` remains the production line while the cross-family rules-platform migration is staged behind #227 on `integration/rules-platform-v1` until parity/cutover gates pass.

### Fixed

- Kept manual table-score entry calm while typing or editing multi-digit values by requiring an explicit **Review settlement** action before the settlement workspace appears; progression still requires **Record hand and advance**. [#191](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/191)
- Closed the bounded manual WCAG audit findings around Escape focus restoration, recovered-game status contrast, recorded-tile semantics, live error announcements, outcome selected state and confirmation before discarding a recoverable game. [#194](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/194) [#195](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/195) [#196](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/196) [#197](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/197) [#198](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/198) [#199](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/199)

## 2026-09-15 — Plus and cross-profile development readiness

### Added

- Defined the Mahjong Reference Plus Phase 0 contract: existing scoring/table play stays free and account-free, Plus is subscription-based convenience, and metered voice/services use a separate auditable credit ledger. [#213](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/213)
- Completed a reuse-before-build Plus implementation package covering Cloudflare/Hono, D1/Drizzle, Better Auth Email OTP, Stripe-hosted billing, cloud-game versioning, service credits, i18n and bounded implementation slices. [#214](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/214)
- Defined a neutral cross-profile cloud-game contract so future rules families add validated replay codecs/engines rather than forcing the current BMJA-shaped in-memory state into permanent cloud storage. [#214](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/214)
- Resolved the major EMA Riichi 2025 architecture questions while keeping the next correctness gate source-linked yaku/fu/payment fixtures rather than broad implementation. [#214](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/214)

### Changed

- Checkpointed the repository README/programme map after the Table Companion consolidation so the remaining priorities became evidence-led validation, voice exploration, paid-platform readiness and rules expansion rather than another broad UI rewrite. [#190](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/190)

## 2026-09-14 — Accessible, guided and crawlable Table Companion

### Added

- Promoted deterministic product screenshots into a reusable **10-state Table Companion library**, including distinct score-result and pre-confirmation **Who pays whom** captures for Help, How It Works and User Guide reuse. [#161](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/161)

### Changed

- Aligned final public SEO and crawl output with the settled Table Companion route model, including real prerendered route content, rules-aware product metadata and task-led internal links. [#171](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/171)
- Rebuilt **How It Works** as an eight-stage visual table journey from choosing rules through scoring, settlement, continued play, game history and saving a record, using the canonical deterministic product screenshot library. [#163](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/163)
- Promoted **User Guide & Help** into a product-wide Table Companion support surface, with first-class navigation and a clear hand-off from How It Works while keeping British learning and rules content distinct. [#179](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/179)
- Aligned the homepage around **Play → Rules → Learn → Trust**, with plain-language supported-rules status, a quieter Features entry point and lower-prominence About/Support links. [#172](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/172)

### Fixed

- Made horizontally scrollable reference and tile regions keyboard-accessible only when they actually overflow, with visible focus treatment. [#178](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/178)
- Aligned public Rules, Help, Learn and reference-page text colours with WCAG 2.2 AA contrast requirements. [#177](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/177)
- Fixed audited WCAG 2.2 AA zoom and contrast failures in game setup, hand scoring, settlement and retained game information, without changing scoring or table behaviour. [#174](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/174)

## 2026-09-14 — Table Companion interaction refinement

### Changed

- Refocused an active game into a compact table workspace that keeps the current rules, hand, East, prevailing Wind and balances visible while the table plays. [#152](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/152)
- Reworked detailed hand entry around one reusable picker and compact **Hand so far** summaries instead of a growing form. [#153](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/153)
- Made the phone game workspace and Table tools safer in portrait and landscape, and made Summary and Full print behaviour deliberate. [#155](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/155)
- Moved loose Remaining tiles into a compact disclosure within **Hand so far**, while preserving partial-hand and Goulash blank evidence. [#157](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/157)
- Refreshed the global explanatory pages and repository front door around the rules-aware **Mahjong Table Companion** rather than the earlier British-only calculator description. [#143](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/143) [#145](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/145)

## 2026-09-13 — Rules-aware whole-game foundation

### Added

- Added versioned rules-aware entry for British / BMJA-style, provisional Western — Thompson & Maloney, and configured Club rules while keeping the exact chosen rules with a saved game. [#133](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/133)
- Added public `/rules`, `/rules/british` and `/rules/western` reference routes with clear support and source-status boundaries. [#137](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/137)
- Added a live **Who pays whom** preview, clearer running table state and the canonical `/mahjong-settlement` explainer without changing settlement arithmetic. [#139](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/139)
- Added a generated date to printed game records. [#140](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/140)
- Added the first configured Club profile, including its documented ordinary scoring, special-hand membership, Goulash mode and end-of-round incidents/liability, with validation evidence retained in the rules corpus. [#122](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/122) [#123](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/123) [#124](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/124) [#125](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/125) [#126](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/126) [#127](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/127)

### Changed

- Repositioned the public shell around **Your Mahjong table companion**, with clearer Play / Rules / Learn navigation and more readable table-use text. [#135](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/135)
- Tightened rules-aware presentation so British-only learning links do not leak into Western or Club scoring results and provisional Western status remains explicit. [#142](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/142)
- Removed obsolete Replit/workspace scaffold and documented which repository sources are current authority versus historical context. [#128](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/128) [#129](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/129) [#131](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/131)

## 2026-09-12 — Western rules and catalogue expansion

### Added

- Introduced a versioned rules-profile model and separated canonical hand recognition from profile-specific names, values and catalogue membership while preserving BMJA behaviour. [#94](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/94) [#96](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/96) [#97](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/97)
- Added provisional `western-tm@0.1`, reusing shared ordinary behaviour only where explicitly marked provisional and allowing profile-local special-hand and fishing values. [#98](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/98)
- Indexed, implemented and certified the Thompson & Maloney *Mah Jong Player's Companion* special-hand catalogue: 84 unique source hands represented through 85 profile bindings. [#99](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/99) [#120](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/120)
- Preserved a durable rules research and provenance corpus covering British/BMJA, Western, Club and future Mahjong-family boundaries. [#81](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/81) [#82](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/82) [#90](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/90) [#92](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/92) [#93](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/93)

## 2026-09-09 — Learning, reference and product identity

### Added

- Added reciprocal links between scoring tools and learner/reference content, including stable public anchors for special hands. [#75](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/75)
- Added safe shareable special-hand examples and a crawlable `/scoring-examples` hub with worked and practice modes backed by the real scorer. [#77](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/77) [#78](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/78)
- Added a responsive instructional screenshot system with deterministic Mobile, Tablet and Desktop captures for eight core tasks. [#52](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/52) [#56](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/56) [#58](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/58)
- Added real scorer screenshots to the original How It Works flow. [#59](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/59)
- Added shared route metadata, sitemap, robots, canonical and structured-data infrastructure for discoverability. [#62](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/62)

### Changed

- Adopted **Mahjong Reference** as the global product brand while keeping ruleset-specific pages and scorer context explicit. [#80](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/80)

## 2026-09-07 — Scoring, learning and game-record foundation

### Added

- Completed the initial BMJA special-hand set, automatic special-hand fishing, winning-tile provenance and event-based special hands. [#11](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/11) [#12](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/12) [#13](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/13) [#16](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/16)
- Added learner-facing guides, the visual special-hand catalogue, homepage entry points, About and Gameplay Basics. [#18](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/18) [#19](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/19)
- Added unfinished/partial losing-hand support, including loose Remaining tiles and conservative scoring when some information is unknown. [#22](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/22) [#30](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/30)
- Added same-browser in-progress game recovery and safe return/exit behaviour. [#23](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/23) [#24](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/24)
- Added contextual scoring-pattern explanations and a more usable mobile hand-entry flow. [#25](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/25) [#28](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/28)
- Added printable **Full game record** and **Game summary** views from the same confirmed game history. [#32](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/32)
- Added the first route-specific static SEO/crawl output, including canonical metadata, sitemap and robots support. [#31](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/31)
- Added Features, Help and How It Works content/pages and integrated them into the site. [#33](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/33) [#39](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/39) [#40](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/40) [#41](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/41) [#42](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/42)
- Added the first public Mahjong-rules comparison page and contextual links into it. [#45](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/45) [#46](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/46) [#47](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/47)

## Workflow

- Add a concise entry under **Unreleased** for a merged change that materially affects players, testers or future maintenance.
- Roll **Unreleased** into a dated, named milestone when the product reaches a coherent checkpoint.
- Do not list every commit, branch, test refactor or typo here; link to the relevant PR or issue when detail is useful.
- Working branches are temporary. Once merged and verified, their durable history is the commit/PR plus this changelog where the change is significant.

The initial prototype predates the merged pull-request history reconstructed here; this changelog deliberately does not invent details that are not supported by the repository record.
