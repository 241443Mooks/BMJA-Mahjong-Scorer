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
- Other major rules families (Hong Kong, Riichi, MCR, American/NMJL) reuse many tile patterns but use materially different scoring grammars and settlement systems.

This is a research conclusion, not yet an implementation decision.

## Files

### Pass 1 — preserve the research baseline

- [RESEARCH_BASELINE_2026-09-09.md](./RESEARCH_BASELINE_2026-09-09.md) — preserved findings from the 9 September 2026 deep research pass.
- [RULESET_LANDSCAPE.md](./RULESET_LANDSCAPE.md) — high-level comparison of recognised rules families and where they differ architecturally.
- [SOURCE_REGISTER.md](./SOURCE_REGISTER.md) — sources, authority level, intended use and open verification gaps.

### Pass 2 — turn research into rule-level evidence

- [PROVENANCE_MODEL.md](./PROVENANCE_MODEL.md) — stable rule/pattern IDs, evidence statuses, source locators, versioning and implementation gates.
- [BMJA_WESTERN_OTB_CROSSWALK.md](./BMJA_WESTERN_OTB_CROSSWALK.md) — first rule-level crosswalk for British/BMJA, Thompson & Maloney Western and Outside the Box.
- [SPECIAL_HANDS_PROVENANCE.md](./SPECIAL_HANDS_PROVENANCE.md) — initial canonical-pattern and profile-binding map for shared and Western/OTB special hands.

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

Pass 2 introduces explicit evidence states:

- `verified`
- `verified-club`
- `needs-primary-source`
- `needs-club-confirmation`
- `secondary-only`
- `conflict`

The project should not turn unverified research into executable scoring rules merely because a likely relationship is convenient for implementation.

A key architecture finding is now explicit:

> **A canonical hand pattern must not contain its score.**

The active rules profile should bind local name, score, fishing value, exposure policy and provenance to that pattern.

`Three Great Scholars` is the reference example: BMJA, Thompson & Maloney and Outside the Box recognise the same broad hand identity but the documented values are not identical.

## Product implication

The emerging product opportunity is broader than a scorer with a few house-rule toggles. Mahjong Reference may eventually support:

- named, versioned rules profiles;
- reusable canonical hand/pattern definitions;
- profile-specific scoring bindings;
- named club profiles composed from established rules plus documented local overrides;
- public comparison/reference content showing where rules come from and how variants differ.

The first implementation target remains conservative: preserve current BMJA behaviour, verify a Western baseline, then prove the model using Outside the Box as a real club profile.

## Current evidence priorities

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

## Likely next pass

Pass 3 should use the evidence model to reshape the project plan rather than changing scoring code immediately. Likely work:

1. rewrite issue #51 from speculative “house-rule switches” into a versioned rules-profile architecture issue;
2. create implementation child issues for canonical patterns, BMJA migration, Western baseline and Outside the Box;
3. define the zero-behaviour-change BMJA migration acceptance tests;
4. identify the first cross-profile golden fixtures from `SPECIAL_HANDS_PROVENANCE.md`.
