# Documentation map

This directory contains a mixture of current product direction, rules evidence, shipped-product records and historical planning. Use this map to avoid treating every document as equally current.

## Current product direction

- `product/TABLE_COMPANION_TRANSFORMATION.md` — canonical public-product direction and #105 delivery plan. **Start here for current product/route decisions.**
- GitHub issue #105 — umbrella implementation tracker for the Table Companion transformation.

## Rules and provenance

- `rules/` — durable evidence, provenance, crosswalks and future-ruleset architecture.
- `BMJA_RULES_REFERENCE.md` at repository root — engineering source for BMJA rules behaviour.
- `artifacts/mahjong-scorer/SCORING_AUDIT.md` — implementation/scoring coverage record.

Rules/provenance documents may intentionally preserve uncertainty, source status and historical research. Do not simplify those distinctions merely to make the repository tidier.

## Current implementation guidance

- `../Agents.md` — repository operating guardrails for implementation work.
- `../README.md` — repository front door and shipped-product overview. It should be kept aligned with the current public product as #105 lands.
- `product/SCREENSHOT_LIBRARY.md` — canonical catalogue and operating rules for deterministic reusable product screenshots used by Help, How It Works and future product guidance.

## Shipped-product/content records

Documents such as `PRODUCT_HANDBOOK.md`, `FEATURES_CONTENT.md`, `HELP_CONTENT.md`, `HOW_IT_WORKS_CONTENT.md`, `MARKETING_COPY_BANK.md`, and earlier content plans record how existing public pages and product claims were developed. They remain useful evidence and archaeology, but they are **not** the authority for new product direction when they conflict with the Table Companion plan.

## Historical / superseded planning

Older files such as `PRODUCT_DIRECTION.md` and `PRODUCT_CONTENT_PLAN.md` describe earlier product assumptions, including a primarily British-only scorer and possible future companion directions. Preserve them as historical context until they are deliberately archived, but do not use them to override current #105 decisions.

## Decision hierarchy

When documents disagree, use this order:

1. current merged implementation and tests for what the product actually does;
2. current rules/provenance evidence for rule truth and confidence;
3. `product/TABLE_COMPANION_TRANSFORMATION.md` + #105 for current public-product direction;
4. `Agents.md` for implementation discipline;
5. older planning/content documents for historical context only.

If a proposed change would alter scoring/rules behaviour, do not infer the answer from product copy. Resolve it through the relevant rules evidence and tests.