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

- [RESEARCH_BASELINE_2026-09-09.md](./RESEARCH_BASELINE_2026-09-09.md) — preserved findings from the 9 September 2026 deep research pass.
- [RULESET_LANDSCAPE.md](./RULESET_LANDSCAPE.md) — high-level comparison of recognised rules families and where they differ architecturally.
- [SOURCE_REGISTER.md](./SOURCE_REGISTER.md) — sources, authority level, intended use and open verification gaps.

A detailed rule-by-rule provenance matrix will be added in a later pass. That matrix should distinguish **verified**, **needs primary source** and **needs club confirmation** at rule level.

## Research principles

1. Prefer governing bodies and formal rulebooks for standardised disciplines.
2. Prefer published primary/reference works for Western/classical rules where no single governing body exists.
3. Treat club guides as authoritative only for that named club/profile.
4. Keep rule facts separate from hand names, scores and UI wording.
5. Record source edition/version wherever rules can change.
6. Do not synthesise multiple variants into a fake universal rule.
7. Preserve uncertainty explicitly rather than resolving it by guesswork.
8. Keep copyrighted source material as research evidence; write original explanations, tables and diagrams for Mahjong Reference.

## Product implication

The emerging product opportunity is broader than a scorer with a few house-rule toggles. Mahjong Reference may eventually support:

- named, versioned rules profiles;
- reusable canonical hand/pattern definitions;
- profile-specific scoring bindings;
- named club profiles composed from established rules plus documented local overrides;
- public comparison/reference content showing where rules come from and how variants differ.

The first implementation target remains conservative: preserve current BMJA behaviour, verify a Western baseline, then prove the model using Outside the Box as a real club profile.
