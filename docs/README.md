# Documentation map

This directory contains current product/architecture decisions, rules evidence, research, shipped-product records and historical planning. **Do not treat every document as equally current.**

## Start here

Choose the authority that matches the work:

- **What the product currently does:** merged code/tests on `main` + root `README.md`.
- **Live programme priorities:** GitHub issue **#105**.
- **Table Companion product direction:** `product/TABLE_COMPANION_TRANSFORMATION.md`.
- **Search/SEO growth strategy:** `product/SEO_GROWTH_STRATEGY.md` — current Search Console evidence, acquisition clusters, canonical query/page ownership and prioritised quick wins.
- **Analytics/privacy measurement:** `ANALYTICS_MEASUREMENT_PLAN.md` + issue **#246**. This includes the current PostHog cookieless traffic-classification caveat and reporting rules.
- **Plus/accounts/cloud/billing direction:** `product/MAHJONG_REFERENCE_PLUS_ARCHITECTURE.md`, the supporting `PLUS_*` / cloud-contract docs and issue **#206**.
- **Rules truth/provenance:** `rules/`, `../BMJA_RULES_REFERENCE.md` and the relevant source register/crosswalk.
- **Cross-family rules-platform implementation:** issue **#227** and the exact normative documents named by its child ticket on `integration/rules-platform-v1`.
- **Implementation discipline:** `../Agents.md`.

## Current branch boundary

`main` is the production line.

The cross-family rules-platform migration is intentionally staged on:

`integration/rules-platform-v1`

That branch contains the implementation contract developed through #228, the senior-review hardening contract from #237 and the registry audit from #238. Those documents are normative for #229–#236 even though they are not yet promoted to production `main`.

Do **not** copy fragments of those contracts back into an implementation ticket from memory. Read the exact files named by the issue from the integration branch.

## Product research and discovery

- `research/` — evidence-led product discovery, pain mining, Jobs-to-be-Done clusters and opportunity hypotheses.
- Research is input to product decisions, not scoring/rules authority and not implementation authority by itself.
- Use the chain `user evidence -> job/pain cluster -> opportunity hypothesis -> product decision -> GitHub issue -> implementation`.

## Rules and provenance

- `rules/` — durable evidence, provenance, crosswalks and future-ruleset architecture.
- `../BMJA_RULES_REFERENCE.md` — engineering source for BMJA behaviour.
- `../artifacts/mahjong-scorer/SCORING_AUDIT.md` — current scoring implementation/audit record.

Important current rules records on `main` include:

- the Classical/Western configuration model and examples;
- Buzzard 2000 primary-source evidence/crosswalk;
- MCR and Riichi architecture/source records;
- European Classical and eight-ruleset architecture stress tests.

Rules/provenance documents may intentionally preserve uncertainty, source status and unresolved questions. Do not “tidy” those distinctions away.

## Product/platform records

Useful current records include:

- `ANALYTICS_MEASUREMENT_PLAN.md` — analytics purpose, privacy boundaries, event taxonomy, validation rules and known provider caveats;
- `product/SEO_GROWTH_STRATEGY.md` — evidence-led SEO/acquisition strategy, Search Console opportunity set and route/query ownership;
- `product/SCREENSHOT_LIBRARY.md` — canonical deterministic product screenshot library;
- `product/MAHJONG_REFERENCE_PLUS_ARCHITECTURE.md` — Free/Plus, identity, billing and local-first invariants;
- `product/PLUS_IMPLEMENTATION_BACKLOG.md` — bounded Plus concerns;
- `product/PLUS_REUSE_MAP.md` / `product/PLUS_LEGO_STACK.md` — reuse-before-build guidance;
- `product/CROSS_PROFILE_CLOUD_GAME_CONTRACT.md` — neutral versioned cloud-game envelope;
- `product/I18N_FOUNDATION.md` — multilingual UI/public-route foundation;
- `product/RULESET_BUILD_SEQUENCE.md` — staged rules-family implementation sequence.

### Analytics caveat authority

The current PostHog implementation is deliberately cookieless. As verified on 17 September 2026, PostHog's query-time traffic classifier can label genuine cookieless JavaScript pageviews as `Automation` / `no_user_agent` because the raw user-agent property it expects is absent. Do not introduce a `Traffic type = Regular` reporting filter, treat that combination as positive bot evidence, or add raw user-agent capture merely to make the classifier label cleaner without first reviewing `ANALYTICS_MEASUREMENT_PLAN.md` and issue #246.

## Shipped-product/content records

Documents such as `PRODUCT_HANDBOOK.md`, `FEATURES_CONTENT.md`, `HELP_CONTENT.md`, `HOW_IT_WORKS_CONTENT.md`, `MARKETING_COPY_BANK.md` and earlier content plans preserve useful shipped-copy/design history. They are **not** current product authority when they conflict with the live product or current programme map.

## Historical / superseded planning

Older files such as `PRODUCT_DIRECTION.md` and `PRODUCT_CONTENT_PLAN.md` describe earlier assumptions, including a primarily British-only scorer. Preserve them as archaeology unless a deliberate archive/delete task says otherwise, but do not use them to override current decisions.

Closed/superseded PR branches are also not authority. In particular, the useful ideas from superseded design PRs #222 and #224 were consolidated into later merged contracts; implementation should not revive those branches.

## Decision hierarchy

When sources disagree, use this order:

1. current merged implementation and tests for what the production product actually does;
2. current source/provenance evidence for Mahjong rule truth and confidence;
3. the active issue/PR execution contract for the named task;
4. for #227 work, the normative integration-branch rules-platform docs named by that ticket;
5. current product/platform architecture docs + programme issues (#105/#206 as relevant), including `product/SEO_GROWTH_STRATEGY.md` for acquisition decisions;
6. `Agents.md` for repository execution discipline;
7. `research/` for evidence and hypotheses;
8. older planning/content documents for historical context only.

If a proposed change alters scoring/rules behaviour, do not infer the answer from product copy, historical planning or user-interface similarity. Resolve it through the relevant rules evidence and tests.
