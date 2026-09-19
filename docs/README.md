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
- **Structured reference knowledge:** `product/REFERENCE_KNOWLEDGE_ARCHITECTURE.md` and #251. Public pages are views over source/runtime-backed concepts, profile treatments, relationships and evidence; they are not a wiki or a second rules database.
- **Analytics/privacy measurement:** `product/ANALYTICS_MEASUREMENT_PLAN.md` and #246.
- **Plus/accounts/cloud:** `product/MAHJONG_REFERENCE_PLUS_ARCHITECTURE.md`, supporting `PLUS_*` docs and #206.
- **Rules/scoring:** relevant `rules/` source/evidence files, `BMJA_RULES_REFERENCE.md`, executable tests and the named profile issue.
- **Reference research staging:** `rules/encyclopaedia/` and #251. 251A1 is a source-local inventory; cross-family concept matching remains held until executable Buzzard/MCR/Riichi identities exist.
- **Rules-platform migration:** #227 is the architecture umbrella and #275 is the rollout tracker. Exact child-issue contracts on `integration/rules-platform-v1` govern implementation.
- **Durable product history:** root `CHANGELOG.md`.

## Branch boundary

`main` is the production line.

The cross-family rules-platform migration is staged on `integration/rules-platform-v1`. Its design, implementation and hardening documents remain branch-specific until the migration passes its parity and caller-cutover gates. Do not reconstruct or override those contracts from older `main` planning notes.

The durable migration shape is:

```text
rules-platform contracts and executable foundation
→ #236 parity / replay gate
→ #274 caller cutover
→ merge only after the migration gates are satisfied
```

For the exact current state and next child issue, use #275 rather than freezing a step-by-step roadmap into this file.

MCR and Riichi correctness research is already source-pinned. Their implementation belongs to their named profile issues after the shared platform migration is ready for new-family execution.

## Decision hierarchy

When sources appear to conflict, prefer:

1. the explicit current task/issue contract;
2. executable code/tests for current production behaviour;
3. the relevant current product/rules authority document;
4. later merged evidence/hardening over older planning;
5. `archive/` only for historical context.

Unknown Mahjong semantics remain explicit. Do not fill gaps from similarly named rules, another Mahjong family, old draft prose or model memory.

## Why the archive exists

This project has moved quickly from a British scorer to a rules-aware Table Companion and then toward a multi-grammar rules platform and structured Mahjong knowledge layer. Earlier plans are still useful for understanding decisions, but leaving them beside current contracts made the repository look more ambiguous than it is.

`archive/` preserves that history without asking future maintainers or Codex to guess whether it still governs the product.
