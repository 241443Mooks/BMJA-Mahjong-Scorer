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

Known outstanding questions:

1. Do Little/Big Dragon and Little/Big Wind bonuses stack with individual set doubles or replace them?
2. How exactly should exposed half/full special-hand values be interpreted?
3. Which non-BMJA hands are imported unchanged from Western sources and which, if any, are locally modified?
4. What is the exact cannon/liability settlement order when multiple liability conditions could apply?

Do not generalise a club rule into "Western Mahjong" without independent Western-source support.

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

## Next-pass work

The next research-documentation pass should convert this source register into a **rule-level provenance matrix**.

For each rule or special hand, capture:

- stable rule/pattern ID;
- source/profile;
- exact source locator (URL section, page, edition);
- status: `verified`, `needs-primary-source`, or `needs-club-confirmation`;
- whether the rule is identical, a subset, an override or unique to the profile;
- implementation impact;
- unresolved ambiguity.

That matrix should become the evidence input for the eventual rules-profile architecture and golden test suite.
