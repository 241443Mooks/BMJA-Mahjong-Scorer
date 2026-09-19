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
- **Durable Table Companion direction:** `product/TABLE_COMPANION_TRANSFORMATION.md`.
- **Search/acquisition strategy:** `product/SEO_GROWTH_STRATEGY.md`.
- **Structured reference / Encyclopaedia product architecture:** `product/REFERENCE_KNOWLEDGE_ARCHITECTURE.md` and #251. Public pages should be views over source/runtime-backed concept and profile-treatment data, not a wiki or a second rules database.
- **Analytics/privacy measurement:** `product/ANALYTICS_MEASUREMENT_PLAN.md` and #246.
- **Plus/accounts/cloud:** `product/MAHJONG_REFERENCE_PLUS_ARCHITECTURE.md`, supporting `PLUS_*` docs and #206.
- **Rules/scoring:** relevant `rules/` source/evidence files, `BMJA_RULES_REFERENCE.md`, executable tests and the named profile issue.
- **Encyclopaedia research staging:** `rules/encyclopaedia/` and #251. 251A1 is profile-local source inventory only; cross-family concept matching waits for executable Buzzard/MCR/Riichi profiles.
- **Rules-platform migration:** #227 plus the exact normative files named by #229–#236 on `integration/rules-platform-v1`.
- **Durable product history:** root `CHANGELOG.md`.

## Branch boundary

`main` is the production line.

The cross-family rules-platform migration is staged on `integration/rules-platform-v1`. Its design/hardening documents are intentionally branch-specific until the migration passes parity/cutover gates. Do not reconstruct or override those contracts from older `main` planning notes.

Current implementation order remains:

```text
#229 universal types/schemas
→ #230 typed registries/capabilities
→ review what implementation taught us
→ #231 resolver/fingerprint
→ later #227 slices
```

MCR and Riichi correctness research is already source-pinned; implementation belongs to #241 and #244 after the shared platform prerequisites exist.

## Decision hierarchy

When sources appear to conflict, prefer:

1. the explicit current task/issue contract;
2. executable code/tests for current production behaviour;
3. the relevant current product/rules authority document;
4. later merged evidence/hardening over older planning;
5. `archive/` only for historical context.

Unknown Mahjong semantics remain explicit. Do not fill gaps from similarly named rules, another Mahjong family, old draft prose or model memory.

## Why the archive exists

This project has moved quickly from a British scorer to a rules-aware Table Companion and then toward a multi-grammar rules platform. Earlier plans are still useful for understanding decisions, but leaving them beside current contracts made the repository look more ambiguous than it is.

`archive/` preserves that history without asking future maintainers or Codex to guess whether it still governs the product.