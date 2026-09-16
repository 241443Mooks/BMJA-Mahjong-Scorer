# Mahjong rules source register

This register records the main sources identified in the 9 September 2026 research pass, their authority level, intended use and remaining verification gaps.

It is intentionally conservative. A source can be useful without being authoritative for every rule it mentions.

## Authority levels

| Level | Meaning |
|---|---|
| A | Governing body, competition authority or formally approved rules source |
| B | Published primary/reference work for a recognised rules tradition |
| C | Named club/tutor primary source for that club's own rules |
| D | Secondary specialist/historical cross-check only |

## Current register

| ID | Source | Authority | Intended use | Status / gap |
|---|---|---:|---|---|
| `bmja-approved-site` | BMJA-approved British rules reference — https://mahjongbritishrules.wordpress.com/ | A | Canonical British/BMJA implementation reference | Verified for current scorer baseline |
| `bmja-scoring` | Working out the scores — https://mahjongbritishrules.wordpress.com/scoring/working-out-the-scores/ | A | Ordinary British scoring and doublings | Verified |
| `bmja-special-hands` | Special hands — https://mahjongbritishrules.wordpress.com/scoring/special-hands/ | A | BMJA-recognised special-hand catalogue | Verified |
| `bmja-settlement` | Settling up — https://mahjongbritishrules.wordpress.com/scoring/settling-up/ | A | Winner/loser settlement and East treatment | Verified |
| `bmja-qa` | Playing-the-game Q&A — https://mahjongbritishrules.wordpress.com/questions/playing-the-game/ | A | Edge cases, exposure, fishing, Goulash and home-rule clarifications | Verified as approved/author-informed clarification layer |
| `tm-game-illustrated` | Patricia A. Thompson & Betty Maloney, *The Game of Mah Jong Illustrated* | B | Western baseline rules: ordinary play, scoring, settlement, progression | **Primary evidence still needed/needs checking** |
| `tm-companion` | Patricia A. Thompson & Betty Maloney, *The Mah Jong Player's Companion* (1997, ISBN 978-0864178916) | B | Supplementary special-hand catalogue, names, values and indexes | Partial source available from supplied photographs; not a complete rules text |
| `otb-guide-2026-09` | Outside the Box Mahjong guide supplied by Rachel, 9 Sep 2026 | C | Named Outside the Box club profile and local rules | Strong primary club source; several interpretation questions remain |
| `outside-the-box-site` | Outside the Box — https://www.outsidetheboxltd.co.uk/ | C | Club identity, attribution and public context | Verified for identity/context, not rules details |
| `buzzard-2000-classical` | Jonathan Buzzard, *Mah-Jongg: the Game and How To Play It* (last modified 30 Mar 2000) — http://www.buzzard.me.uk/jonathan/MahJongg.html | D | Named historical British/Western Classical profile; scoring, settlement, progression and table procedure | **Primary snapshot recovered 16 Sep 2026** as a 13-page downloaded/printed PDF. SHA-256 `76b7548f8a8708473340a65bfaf810c99188b95a37311ce6127676588f20b0a5`. Page-level scoring/limit/settlement/progression/penalty evidence is now implementation-ready in `BUZZARD_2000_RULE_EVIDENCE.md`. |
| `wrc-rules` | World Riichi Championship rules — https://www.worldriichi.org/wrc-rules | A | Future canonical Riichi profile | Strong source; pin exact rules edition when implemented |
| `hkma-rules` | Hong Kong Mahjong Association rules — https://www.hkmahjong.org/rules?lang=en | A | Future named Hong Kong profile | Strong source; avoid genericising all HK play from one codification |
| `mcr-ema` | Mahjong Competition Rules PDF — https://mahjong-europe.org/portal/images/docs/mcr_EN.pdf | A | Future Chinese Official / MCR profile | Strong formal rules source |
| `mil` | Mahjong International League — https://mahjong-mil.org/ | A | Competition taxonomy/context across MCR, Riichi, Sichuan | Contextual authority; use discipline-specific rulebook for implementation details |
| `nmjl` | National Mah Jongg League — https://www.nationalmahjonggleague.org/ | A | American/NMJL profile identity and annual-card authority | Public site confirms annual card model; full current rulebook/card requires separate lawful source/access |
| `sloperama-bibliography` | Sloperama Mahjong FAQ/bibliography — https://www.sloperama.com/mjfaq/mjfaq03.html | D | Historical/bibliographic cross-check for Western literature | Secondary only; never override primary sources |

## Source-specific notes

### BMJA-approved British rules

The current scorer already targets BMJA-style British Mahjong. Until a deliberate source-policy change is made, the approved British rules reference remains the implementation authority for:

- intrinsic set/pair values;
- ordinary doublings;
- limit handling;
- recognised special hands;
- exposure rules;
- fishing;
- settlement;
- East doubling;
- Goulash;
- clarifications captured in the approved Q&A.

A future architecture refactor must preserve current BMJA behaviour exactly before adding other profiles.

### Thompson & Maloney — The Game of Mah Jong Illustrated

This is the largest current evidence dependency.

The project should acquire or inspect the relevant edition before treating a Thompson & Maloney Western profile as complete.

Priority topics to verify:

- tile set and setup;
- dealing and turn structure;
- calling rules;
- Chow restrictions, if any;
- intrinsic point table;
- doublings;
- Flowers/Seasons;
- special-hand relationship to ordinary scoring;
- fishing semantics;
- exposed/concealed treatment;
- winner settlement;
- non-winner/loser settlement;
- East/dealer treatment;
- draws;
- Goulash;
- penalties/procedure;
- game/round progression.

Until those are checked, use `needs-primary-source` rather than inferring the Western baseline from the Companion.

### Thompson & Maloney — The Mah Jong Player's Companion

The supplied copy is highly valuable for:

- special-hand names;
- winning/fishing values;
- hand taxonomy/index membership;
- identifying which hands recur across Western/British/club sources;
- detecting pattern/value divergence between profiles.

It should **not** be treated as the complete Western rules source.

Copyright guardrail:

- do not reproduce the book's prose, illustrations or tables wholesale;
- use it to establish facts, names, values, source provenance and comparison points;
- write Mahjong Reference explanations, examples and diagrams independently.

### Outside the Box guide

The guide is authoritative for the Outside the Box club's documented rules, subject to clarification by Rachel where wording is ambiguous.

Pages 12–14 and the issue transcription now resolve the complete photographed
special-hand inventory (33 unique hands), four explicit T&M binding overrides,
the ordinary point table, settlement, Goulash state/legality and incident facts.
The implementation-facing record is
`OUTSIDE_THE_BOX_PROFILE_CROSSWALK.md`.

Genuine outstanding questions:

1. Do Little/Big Dragon and Little/Big Wind bonuses stack with individual set doubles?
2. Does Grand Sequence require a suited pair, excluding the broader current Western pattern?
3. Does All Pair Ruby Jade permit any Bamboo ranks or only the T&M red/green subset?
4. What are Purity's exact winning, fishing and exposure fields, whose photographed table alignment is unclear?

Do not generalise a club rule into "Western Mahjong" without independent Western-source support.

### Buzzard 2000 British/Western Classical

Treat Buzzard 2000 as a **named historical profile**, not as an authority over modern BMJA or all Western Mahjong.

On 16 September 2026 a printed/downloaded 13-page PDF copy of the canonical Buzzard page was recovered and retained as the implementation snapshot. Its heading identifies *Mah-Jongg: the Game and How To Play It* and states `Last modified on 30th March 2000`. The snapshot SHA-256 is recorded above.

This resolves the previous primary-source gap for:

- ordinary Pung/Kong/pair and Flower/Season values;
- winner bonuses and doubles;
- the ten limit hands;
- loser/non-winner Wind/Dragon limit behaviour;
- ordinary settlement and East doubling;
- East/prevailing-wind progression;
- dangerous-discard liability;
- false-Mahjong and incorrect-hand consequences;
- Standing Hand and physical procedure reference material.

The implementation-facing evidence ledger is `BUZZARD_2000_RULE_EVIDENCE.md`.

Product-scope guardrail: Mahjong Reference scores and runs the real table; it does not need to simulate Buzzard wall construction, draw/discard history, claim timing or Standing-Hand lock enforcement. Those remain rules/reference content unless a future product decision changes scope.

The main remaining interpretation fixture is whether the source's separately listed own Flower/Season double and complete-set ×8 treatment cumulate when both apply. Do not silently inherit the BMJA bouquet convention.

### American / NMJL

The official annual card is a sold, copyrighted product.

For future product work:

- pin the rules/catalogue year explicitly;
- do not scrape or reproduce current card content without permission/licensing;
- investigate licensed data, user-owned-card workflows or generic matcher support;
- keep rules-engine support separate from copyrighted catalogue distribution.

## Historical conclusion currently safe to state

The evidence supports:

> British/BMJA Mahjong is a standardised British branch of the broader Western/classical Mahjong tradition.

The evidence does **not** support:

> BMJA derives from Thompson & Maloney.

BMJA predates Thompson & Maloney's principal Western reference works.

## Pass 2 — rule-level evidence model

The source register now feeds three pass-2 research artefacts:

- `PROVENANCE_MODEL.md`
- `BMJA_WESTERN_OTB_CROSSWALK.md`
- `SPECIAL_HANDS_PROVENANCE.md`

For each rule or special hand, the evidence model now expects:

- stable rule/pattern ID;
- source/profile;
- source locator (URL section, page, edition or temporary photo/guide locator);
- status such as `verified`, `verified-club`, `needs-primary-source`, `needs-club-confirmation`, `secondary-only` or `conflict`;
- relation to another profile (`identical`, `subset`, `superset`, `override`, `alias`, `unique`, `unknown`);
- implementation impact;
- unresolved ambiguity.

The first crosswalk intentionally leaves Western ordinary-game rules marked `needs-primary-source` until *The Game of Mah Jong Illustrated* is checked.

## Remaining evidence backlog

### Western baseline

Still obtain/index exact evidence for:

- ordinary intrinsic scoring;
- Chows/calling rules;
- doubles;
- Flowers/Seasons;
- settlement, especially loser-to-loser settlement;
- East/dealer treatment;
- fishing semantics;
- Goulash;
- penalties;
- progression.

### Companion indexing

For each production-used special hand, record:

- edition/year;
- exact page;
- local hand name;
- structural synopsis;
- winning value;
- fishing value;
- exposure rule.

### BMJA locator refinement

The approved BMJA source family is already authoritative, but exact heading-level locators should still be added for:

- penalties;
- Goulash sub-rules;
- progression;
- exposure edge cases.

### Outside the Box confirmation

Resolve the questions listed above before treating the first club profile as version 1.0; do not reopen points, settlement, Goulash or penalty questions already resolved by the supplied guide.

### Buzzard 2000

The previous source-recovery backlog is complete. Remaining work is implementation preparation rather than evidence recovery:

1. encode page-linked golden fixtures;
2. pin the complete Flower/Season + own-tile cumulative-double interpretation explicitly;
3. compose the profile using KEEP / ADD / AMEND / REMOVE rules;
4. preserve cross-profile isolation.

## Likely next pass

Use the pass-2 evidence model to reshape the implementation backlog:

1. keep versioned rules-profile architecture as the umbrella;
2. promote only bounded, dependency-ready implementation children;
3. define zero-behaviour-change BMJA regression tests;
4. define cross-profile golden fixtures;
5. keep wider disciplines documented but out of immediate implementation scope until their own evidence gates are ready.
