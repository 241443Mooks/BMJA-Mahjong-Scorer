# Changelog

This file records meaningful changes to **Mahjong Reference** at product-milestone level. It is intentionally shorter than the commit, branch and pull-request history.

## Unreleased

### Added

### Changed

- Aligned the homepage around **Play → Rules → Learn → Trust**, with plain-language supported-rules status, a quieter Features entry point and lower-prominence About/Support links. [#172](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/172)

### Fixed

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
