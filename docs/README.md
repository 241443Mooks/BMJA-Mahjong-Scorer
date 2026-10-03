# Documentation

This directory is organised by **authority and purpose**. Do not treat every document as equally current.

## Current sections

| Section | Purpose | Authority |
| --- | --- | --- |
| [`product/`](product/) | Current product, platform, analytics, growth, Plus, i18n and screenshot decisions | Current where the named task/issue points to it |
| [`rules/`](rules/) | Rules evidence, provenance, source registers, profile crosswalks and rules-platform contracts | Rules/scoring authority alongside executable tests/code |
| [`research/`](research/) | Product discovery, pain mining, jobs and opportunity evidence | Evidence/input, not executable product truth |
| [`content/`](content/) | Source records for public copy/pages that have already shipped or evolved | Historical content reference; live code/site wins |
| [`video-series/`](video-series/) | Video scripts and production plans | Production authority for the named video task |
| [`archive/`](archive/) | Superseded product/UX planning retained for archaeology | Never current implementation authority |

## Current authority map

For a bounded task, start with the named issue or PR. Then use only the relevant authority:

- **Live product priorities:** issue #105.
- **Dated restart point:** `product/WHATS_NEXT_ROADMAP.md`.
- **Durable Table Companion direction:** `product/TABLE_COMPANION_TRANSFORMATION.md`.
- **Search/acquisition strategy:** `product/SEO_GROWTH_STRATEGY.md`.
- **Structured reference knowledge:** `product/REFERENCE_KNOWLEDGE_ARCHITECTURE.md` and #251. Public pages are views over source/runtime-backed concepts, profile treatments, relationships and evidence; they are not a wiki or a second rules database.
- **Machine-readable rules truth:** #399 is the completed governed source → evidence → semantic identity → exact profile treatment → runtime architecture; #440's bounded Classical/MCR corpus expansion is complete (317 subjects, 380 claims, 378 treatments, zero unknown treatment states).
- **Rules comparison/profile reporting:** #296 owns the shared comparison direction; #405 consumes the same profile × dimension contract for one-profile human-readable reports. #406 established the shared substrate and is complete.
- **Ruleset authoring/compiler:** #447 records the future source-document → structured-claims → reviewed candidate-profile pipeline; it is parked, not current authority for implementation.
- **Analytics/privacy measurement:** `product/ANALYTICS_MEASUREMENT_PLAN.md` and #246.
- **Plus/accounts/cloud:** `product/MAHJONG_REFERENCE_PLUS_ARCHITECTURE.md`, supporting `PLUS_*` docs and #206.
- **Rules/scoring:** relevant `rules/` source/evidence files, `BMJA_RULES_REFERENCE.md`, executable tests and the named profile issue.
- **Reference research staging:** `rules/encyclopaedia/` and #251. Source-local inventory is evidence; canonical cross-family identity must come from reviewed executable/source truth.
- **Rules rollout/history:** #275 tracks the shared-platform/Buzzard/MCR/Riichi sequence; exact family issues own implementation.
- **Durable product history:** root `CHANGELOG.md`.

## Branch and release boundary

`main` is the production line.

The cross-family rules platform, permanent parity/replay harness, current caller cutover, Buzzard 2000 and MCR/WMO 2006 `0.1` are **already promoted and live on `main`**. The old `integration/rules-platform-v1` train is historical and must not be restarted as an active delivery branch.

MCR `0.1` Provisional is implemented for hand scoring and Table Companion; experienced-player review remains its `1.0` gate.

The Classical hybrid evidence-first hand-entry programme (#386), rules-truth architecture (#399), and bounded truth-corpus expansion (#440) are complete. Riichi preflight #491 is also complete: A is a small runtime-registration gap tracked by #494; B passes with no B0 prerequisite. The public assurance surfaces and score-to-evidence explanation work are live; see the changelog for merged milestones.

For programme state, use #105 and the dated `product/WHATS_NEXT_ROADMAP.md` rather than freezing child-issue sequencing into this file.

## Decision hierarchy

When sources appear to conflict, prefer:

1. the explicit current task/issue contract;
2. executable code/tests for current production behaviour;
3. the relevant current product/rules authority document;
4. later merged evidence/hardening over older planning;
5. `archive/` only for historical context.

Unknown Mahjong semantics remain explicit. Do not fill gaps from similarly named rules, another Mahjong family, old draft prose or model memory.

## Why the archive exists

This project has moved quickly from a British scorer to a rules-aware Table Companion, then to a multi-grammar rules platform, evidence-first hand interpretation and structured Mahjong knowledge. Earlier plans are still useful for understanding decisions, but leaving them beside current contracts made the repository look more ambiguous than it is.

`archive/` preserves that history without asking future maintainers or coding agents to guess whether it still governs the product.
