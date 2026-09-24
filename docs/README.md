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
- **Reference research staging:** `rules/encyclopaedia/` and #251. 251A1 is a source-local inventory; cross-family concept matching remains held until Riichi also has an executable identity.
- **Rules-platform migration:** #227 is the architecture umbrella and #275 is the rollout tracker. Exact child-issue contracts on `integration/rules-platform-v1` govern implementation.
- **Durable product history:** root `CHANGELOG.md`.

## Branch and release boundary

`main` is the production line.

The cross-family rules-platform implementation, permanent parity/replay harness and caller cutover are complete on `integration/rules-platform-v1`. Buzzard and MCR public profiles are implemented there. Issue #323 owns reconciliation with production `main` and the later deliberate promotion. Do not treat implementation-complete staging as already released.

The durable migration shape is:

```text
completed platform and profile implementation on integration
→ #323 reconcile production main into integration
→ certify combined tree
→ separate production promotion PR
```

For programme state, use #275 and #105 rather than freezing a child-issue roadmap into this file.

MCR 0.1 Provisional is implemented for hand scoring and Table Companion; experienced-player review remains its 1.0 gate. Riichi correctness research is complete, while runtime implementation remains future work.

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
