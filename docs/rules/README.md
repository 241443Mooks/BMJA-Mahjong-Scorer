# Mahjong rules research

This directory is the durable evidence base for Mahjong Reference rules work.

It exists to keep **rules research, source authority and product architecture separate from implementation code**. The scorer should never silently turn an unverified convention, a club preference or a secondary description into a canonical rule.

## Current research position

As of 9 September 2026, the working model is:

- **British / BMJA Mahjong** is a standardised British branch of the wider Western/classical Mahjong tradition.
- It should **not** be described as derived from Patricia A. Thompson & Betty Maloney. BMJA predates their principal Western rules books.
- Thompson & Maloney's **The Game of Mah Jong Illustrated** is the key published Western rules reference identified by the research.
- Thompson & Maloney's **The Mah Jong Player's Companion** is a supplementary special-hand/reference catalogue, not a complete rules text.
- **Outside the Box** is a useful real-world club profile: British-style ordinary scoring plus a mixture of official British hands, additional Western hands and local conventions.
- Other major rules families reuse many tile/pattern concepts but often require materially different scoring and settlement strategies.

This remains an evidence-led working model, not permission to infer missing rules.

## Research/documentation passes

### Pass 1 — preserve the research baseline

- [RESEARCH_BASELINE_2026-09-09.md](./RESEARCH_BASELINE_2026-09-09.md) — preserved findings from the 9 September 2026 deep research pass.
- [RULESET_LANDSCAPE.md](./RULESET_LANDSCAPE.md) — high-level comparison of recognised rules families and scoring grammars.
- [SOURCE_REGISTER.md](./SOURCE_REGISTER.md) — sources, authority levels, intended use and open verification gaps.

### Pass 2 — turn research into rule-level evidence

- [PROVENANCE_MODEL.md](./PROVENANCE_MODEL.md) — stable rule/pattern IDs, evidence statuses, source locators, versioning and implementation gates.
- [BMJA_WESTERN_OTB_CROSSWALK.md](./BMJA_WESTERN_OTB_CROSSWALK.md) — first rule-level comparison for British/BMJA, Thompson & Maloney Western and Outside the Box.
- [SPECIAL_HANDS_PROVENANCE.md](./SPECIAL_HANDS_PROVENANCE.md) — canonical-pattern/profile-binding model and initial shared-hand provenance.

### Pass 3 / 4 — convert research into the delivery plan

These passes are represented in GitHub issues rather than additional rules documents:

- #51 — umbrella rules-profile architecture plan
- #83 — versioned rules-profile framework
- #84 — canonical Mahjong hand-pattern model
- #85 — BMJA migration with zero behaviour change
- #86 — verified Thompson & Maloney Western baseline
- #87 — Companion special-hand catalogue pack
- #88 — Outside the Box named club profile
- #89 — cross-ruleset golden tests and 10 October validation

### Pass 5 — protect the architecture for future disciplines

- [FUTURE_RULESET_ROADMAP.md](./FUTURE_RULESET_ROADMAP.md) — future ruleset taxonomy, shared primitives, separate scoring strategies, implementation order and design guardrails for Hong Kong, Riichi, MCR, American, Taiwanese, Singaporean/Malaysian and Sichuan families.

The central Pass 5 decision is:

> **Build a shared Mahjong platform with pluggable rules/scoring/settlement strategies, not one universal British scorer with an expanding collection of switches.**

The immediate product still focuses on BMJA → Western → Companion catalogue → Outside the Box. Pass 5 exists so today's abstractions do not block later disciplines.

### Pass 6 — public rules/reference content architecture

- [PUBLIC_RULES_CONTENT_ARCHITECTURE.md](./PUBLIC_RULES_CONTENT_ARCHITECTURE.md) — public rules hub structure, page templates, comparison model, scorer-support disclosure, source/provenance policy, internal linking, SEO guardrails and phased rollout.

The central Pass 6 decision is:

> **Mahjong Reference may explain a ruleset before it can score that ruleset, but it must always say which rules the scorer actually supports.**

The existing `/mahjong-rules-compared` route should be preserved as the broad comparison entry point rather than duplicated by a competing page.

First-wave public content is intentionally small:

- `/rules` hub;
- British/BMJA rules entry point;
- Western rules page after the Western evidence gate;
- strengthened `/mahjong-rules-compared`;
- `Which rules am I playing?` learner guide.

Reference-only pages for Riichi, MCR and a named Hong Kong profile can follow before their scorers exist, provided the support state is explicit.

### Preserved supplemental evidence

- [WESTERN_AUSTRALIAN_EVIDENCE_NOTES.md](./WESTERN_AUSTRALIAN_EVIDENCE_NOTES.md) — unique Max Robertson comparison, Australian current-practice and market-language evidence salvaged from superseded draft PR #73. Robertson remains research-only, not a current implementation target.

This supplemental note does not create a second research stream. Any fact promoted into executable scoring must still pass through the canonical source/provenance model above.

## Research principles

1. Prefer governing bodies and formal rulebooks for standardised disciplines.
2. Prefer published primary/reference works for Western/classical rules where no single governing body exists.
3. Treat club guides as authoritative only for that named club/profile.
4. Keep rule facts separate from hand names, scores and UI wording.
5. Record source edition/version wherever rules can change.
6. Do not synthesise multiple variants into a fake universal rule.
7. Preserve uncertainty explicitly rather than resolving it by guesswork.
8. Keep copyrighted source material as research evidence; write original explanations, tables and diagrams for Mahjong Reference.

## Evidence model

Pass 2 introduced explicit evidence states:

- `verified`
- `verified-club`
- `needs-primary-source`
- `needs-club-confirmation`
- `secondary-only`
- `conflict`

The project should not turn unverified research into executable scoring rules merely because a likely relationship is convenient for implementation.

A key architecture finding is:

> **A canonical hand pattern must not contain its score.**

The active rules profile should bind local name, score, fishing/ready treatment, exposure policy, catalogue membership and provenance to that pattern.

The executable `western-tm@0.1` profile is provisional. It currently reuses the BMJA-compatible British/Western base for ordinary scoring, validation, tile values, bonus tiles, doubles, wind treatment, settlement, progression and ordinary winner handling. These domains are recorded as **provisional-compatible**, not primary-source-verified identity. Its first verified different binding is Three Great Scholars (1,500 winning / 600 fishing, versus BMJA 1,000 / 400). Do not create `western-tm@1.0` while those executable provisional assumptions remain.

`Three Great Scholars` is the reference example: BMJA, Thompson & Maloney and Outside the Box recognise the same broad hand identity but the documented values are not identical.

## Architecture guardrails now established

The near-term rules-profile work must not assume that every future Mahjong discipline:

- uses 144 tiles;
- uses Flowers/Seasons;
- uses four groups plus a pair as its only winning grammar;
- scores with base points and doubles;
- has a concept equivalent to British fishing;
- treats the dealer like BMJA East;
- ends a hand immediately after one winner;
- can be represented safely by an unversioned `ruleset` string.

Where a future discipline changes the **mathematical grammar**, it should get a dedicated scoring strategy rather than being simulated through unrelated toggles.

## Immediate evidence priorities

Before a Western production profile is considered verified, inspect **The Game of Mah Jong Illustrated** for:

- ordinary scoring values;
- Chow/calling rules;
- doublings;
- Flowers/Seasons;
- settlement, especially loser-to-loser settlement;
- East/dealer treatment;
- fishing semantics;
- Goulash;
- penalties;
- progression.

Before an Outside the Box production profile is considered version 1.0, confirm with Rachel:

- Little/Big Dragon/Wind stacking;
- exposed half/full special-hand interpretation;
- which imported Western hands have local modifications;
- cannon/liability ordering;
- any ordinary-play difference from BMJA not yet captured.

## Six-pass programme status

The research/planning programme is now complete:

1. research baseline — complete;
2. provenance/crosswalk — complete;
3. umbrella architecture plan — complete;
4. bounded implementation issues — complete;
5. future-ruleset roadmap — complete;
6. public rules/reference architecture — complete.

The next step is not more broad architecture discovery. It is controlled implementation beginning with **#83** and **#84**, while continuing the specific evidence work needed to unblock **#86** and **#88**.
