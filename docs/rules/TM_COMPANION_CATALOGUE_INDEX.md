# Thompson & Maloney Companion catalogue index — pass 1

## Pass 4H implementation — Knitting audits and Imperial Jade

**Knitting** (p.20; synopsis pp.57, 59): seven pairs of the same number in two suits, worth 500 (200 fishing), with no exposure marker. The BMJA `knitting` predicate was not safe to reuse: it permits a broader multi-suit arrangement and does not require the complete pure loose layout. T&M therefore uses the neutral structural canonical pattern `two-suit-knitting`, which requires exactly two suits and seven cross-suit same-rank pair units; repeated rank-pairs remain permitted within physical-copy limits.

**Triple Knitting** (p.20; synopsis p.57): four same-rank three-suit sets plus a Knitting pair, worth 500 (200 fishing), with no exposure marker. The existing BMJA `triple-knitting` predicate does not enforce the complete pure loose layout, so it was not safe to reuse exactly. T&M uses the neutral `three-suit-knitting-with-pair` pattern: four three-suit same-rank units plus a two-suit same-rank pair, with repeated triplet ranks and pair-rank overlap permitted where physical copies allow.

**Imperial Jade** (p.36; synopsis p.58): T&M differs structurally from BMJA: BMJA `imperial-jade` requires four Pung/Kong groups, while T&M permits one Chow among the three Bamboo melds. T&M uses `green-dragon-meld-with-green-bamboo-melds-and-pair-one-chow`: a Green Dragon Pung/Kong, three Bamboo melds, and a Bamboo pair; all Bamboo ranks are green (2, 3, 4, 6, 8), with at most one Chow and that Chow necessarily Bamboo 234. It is 2000 / 800 fishing. Its two-dot treatment permits exposed Pungs/Kongs at full value; an exposed permitted Chow alone does not reduce the value.

## Pass 4G implementation — Dragon hybrids and own-wind context wave

Four evidence-backed entries are now bound in `western-tm@0.1` (61 bindings total): Dragonfly (`three-dragon-singles-with-one-meld-in-each-suit-and-suited-pair`), Dragon's Teeth (`red-white-dragon-pungs-with-seven-tile-character-or-circle-run-pair`), Little Brother (`four-chows-three-suits-with-own-wind-pair`), and Hovering Angel (`own-wind-meld-with-dragon-pair-and-three-suit-chows`).

- Dragonfly — p.31 / synopsis p.58; hybrid: loose GRW singles, a represented Pung/Kong in each suit, and a represented suited pair; 1,000 / 400. One dot permits only the represented Pungs/Kongs and halves to 500 / 200 when one is exposed.
- Dragon's Teeth — pp.12/33 / synopsis pp.56/58; hybrid: represented Red and White **Pungs** (not Kongs), plus loose Character or Circle 1–7 or 2–8 and one duplicated run tile; 1,000 / 400. Two dots retain full exposed value.
- Dragon's Gates — **SOURCE CONFLICT — BLOCKED pending detail-page review.** Synopsis p.56 gives 1,000 / 400; synopsis p.58 gives 1,500 / 600. Both agree on the structure and one-dot exposure-half treatment. Inspect detail pp.12 and/or 34 before implementation; do not infer a score from recurrence, category, or neighbouring bands.
- Little Brother — p.17 / synopsis p.56; grouped: exactly four Chows covering Bamboo, Characters and Circles, plus the player's own-Wind pair; 1,000 / 400. This uses `context.playerWind`, never prevailing wind, and has no Pung/Kong exposure rule.
- Hovering Angel — pp.17/41 / synopsis pp.56/59; grouped: one Chow in each suit, the player's own-Wind Pung/Kong, and a Dragon pair; 1,000 / 400. It uses `context.playerWind`; neither synopsis occurrence has a red dot, so a represented exposed own-Wind Pung/Kong is ineligible. Exposed Chows do not affect this Pung/Kong-only rule.

The existing explicit-profile fishing path now carries its existing `GameContext` through completed-candidate detection. This is necessary for truthful own-wind fishing and does not introduce a second context mechanism or alter BMJA bindings.

## Pass 4F implementation — Wind-family hybrid catalogue wave

Five p.57 entries are now bound in `western-tm@0.1`: Windy Ones (`wind-pair-with-three-suit-rank-one-melds`), Windy Nines (`wind-pair-with-three-suit-rank-nine-melds`), Windvane (`wind-pair-with-one-meld-in-each-suit`), Three Sisters (`wind-pair-with-three-suit-rank-three-melds`), and Seven Brothers (`wind-pair-with-three-suit-rank-seven-melds`). Each is 1,000 winning / 400 fishing; p.58 independently corroborates the Windy Ones and Windy Nines values.

Their shared canonical hybrid representation is three represented suited Pungs/Kongs (one per suit), a represented Wind pair, and three loose distinct Winds: the pair and singles together contain ESWN with exactly the pair Wind duplicated. Windy Ones, Nines, Three Sisters and Seven Brothers fix the meld rank to 1, 9, 3 and 7 respectively; Windvane deliberately leaves its three suited ranks independent. One-dot entries allow represented Pungs/Kongs and halve to 500 / 200 when exposed. Windvane has no red dot, so represented Pungs/Kongs must remain concealed.

The fixed-rank forms truthfully overlap Windvane; scoring selects one 1,000-point special rather than stacking both. The family earned a small profile-local hybrid fishing seam: with explicit bindings, a 13-tile hand may retain represented sets plus loose tiles (and no remaining tiles), then appends the completing tile to loose tiles for canonical detection. Legacy BMJA fishing retains its mixed-representation guard.

Status: research/evidence artefact for issue #87.  
Source: Patricia A. Thompson & Betty Maloney, *The Mah Jong Player's Companion* (1997).

This pass indexes the supplied photographs of the 1997 book, especially the **Full Synopsis of Special Hands** on pp. 56–60. It is deliberately an evidence/crosswalk layer, not executable catalogue data yet.

## 1. Pinned edition

From the supplied copyright/publication page:

- authors: Patricia A. Thompson and Betty Maloney;
- copyright: 1997;
- first published: 1997 by Kangaroo Press;
- publisher/imprint context: Kangaroo Press / Simon & Schuster Australia;
- ISBN: `978-0-86417-891-6`;
- printed in China through Colorcraft Ltd., Hong Kong.

The contents page places:

- Short List — p. 6;
- Full Synopsis of Special Hands — p. 56;
- Runs — p. 9;
- Chows — p. 15;
- Pairs — p. 20;
- Winds — p. 26;
- Dragons — p. 31;
- All Honours — p. 44;
- One Suit — p. 47;
- Two Suits — p. 50;
- Three Suits — p. 51;
- Bamboo Suit — p. 52;
- Bamboos with Dragons — p. 54;
- Counters and Points System — p. 55;
- Circle Suit / Character Suit / Pungs and Kongs — p. 60–61.

The book itself describes the Full Synopsis as a condensed quick-reference guide to the hands.

## 2. Source notation and score bands

Page 4 defines these abbreviations used throughout the synopsis:

- `P/K` — Pung or Kong;
- `Pr` — pair;
- `N/I` — not illustrated;
- `L` — limit;
- `ESWN` — one of each Wind;
- `GRW` — one of each Dragon (green, red, white).

Page 4 also defines the fixed score bands:

| Band | Winning | Fishing |
|---|---:|---:|
| Half limit | 500 | 200 |
| Limit | 1,000 | 400 |
| Middle limit | 1,500 | 600 |
| Double limit | 2,000 | 800 |

The synopsis also contains `Calculate` entries. Therefore the Western binding model cannot ultimately assume every special hand has a fixed numeric winning value.

### Exposure markers

Page 4 explains the red-dot markers used by the synopsis:

- two red dots: Pungs may be exposed;
- one red dot: Pungs may be exposed, but the score is halved.

Absence of a dot is therefore meaningful and must not be treated as equivalent to exposed play without checking the detailed hand page.

For implementation, preserve the source marker as evidence before normalising it into an `exposurePolicy`.

## 3. Catalogue size and unique-name inventory

The supplied Full Synopsis photographs on pp. 56–60 contain **84 unique named hands** after de-duplicating repeated appearances under multiple structural categories.

This is a source inventory, not yet a claim that all 84 require distinct canonical detectors.

### Runs / Chows / early structural groups

- Run, Pung & Pair — detail p. 9
- Gates of Heaven — p. 9 / also p. 47
- Confused Gates — p. 9 / also p. 51
- Wriggly Snake — p. 10 / also p. 27
- Hachi Ban — pp. 10, 25, 30, 32
- Guardian Winds — pp. 10, 39
- Wriggly Dragon — pp. 11, 31
- Five Odd Honours — pp. 11, 38
- Guardian Dragons — pp. 10/11, 39
- Grand Sequence — pp. 11, 40
- Dragon's Tail — pp. 12, 41
- Dragon's Gates — pp. 12, 34
- Dragon's Teeth — pp. 12, 33
- Greta's Garden — pp. 13, 38
- Greta's Dragon — pp. 13, 38
- Red Lantern — pp. 13, 40
- Gertie's Garter — pp. 14, 20, 50
- Yin Yang — pp. 14, 50
- Big Robert — p. 14
- Moon at Bottom of Well — pp. 15, 47, 60
- Three Philosophers — p. 15
- Crazy Chows — p. 16
- Little Robert — p. 16
- Windy Chow — pp. 18, 26
- Chop Suey — pp. 18, 26
- Chow Mien — pp. 18, 26
- Hovering Angel — pp. 17, 41
- Little Brother — p. 17
- Apple Blossom — pp. 19, 33
- The Professors — p. 19
- Chow Chow — pp. 15, 56/59 one-suit grouping

### Pairs / Winds

- Knitting — pp. 20, 50
- Triple Knitting — pp. 20, 51
- Sparrow's Sanctuary — pp. 21, 48, 53
- Heavenly Twins — pp. 21, 48
- Seven Twins — p. 22
- All Pair — p. 22
- All Pair Honours — pp. 22, 44
- Golden Gates — pp. 25, 34
- All Pair Jade — pp. 23, 32, 52
- All Pair Ruby Jade — pp. 23, 32, 53
- Dragonette — pp. 24, 39
- Windfall — pp. 24, 27
- Dragon's Breath — pp. 24, 31
- Windy Dragons — pp. 25, 46
- Windy Ones — pp. 28, 45
- Windy Nines — pp. 28, 45
- Windvane — p. 28
- Three Sisters — p. 29
- Seven Brothers — p. 29
- Civil War — p. 30
- Up You Go — not illustrated
- Down You Go — not illustrated
- Four Blessings — p. 30

### Dragons / honours / suit-colour families

- Dragonfly — p. 31
- Three Great Scholars — p. 33
- Green Jade — pp. 35, 53
- Red Coral — pp. 35, 60
- White Opal — pp. 35, 60
- Imperial Jade — pp. 36, 52
- Lily of the Valley — pp. 36, 52
- Lillypilly — pp. 36, 60
- Red Waratah — p. 34
- Ruby Jade — pp. 37, 54
- Royal Ruby — pp. 37, 54
- Red Lily — pp. 37, 54
- Unique Wonder — p. 44
- All Honour Hand — p. 44
- All Winds and Dragons — p. 46
- Heads and Tails — pp. 45, 51
- Dragon's Run — not illustrated
- Ordinary Mah Jong — p. 42
- Sunrise — p. 42
- Sunset — p. 42
- Numbers in Parallel — p. 43
- Numbers Doubled — p. 43
- Purity — p. 48
- Chinese Odds — p. 49
- Odds & Evens — not illustrated
- Robin — not illustrated
- Blue Mountains — not illustrated
- White Elephant — not illustrated
- Driven Snow — not illustrated
- Dragon's Scales — not illustrated

## 4. High-confidence factual records from the synopsis

These records are sufficiently clear in the supplied synopsis photographs to drive the first implementation batch.

| T&M hand | Synopsis locator | Compact factual structure | Winning | Fishing | Exposure marker | Initial canonical relation |
|---|---|---|---:|---:|---|---|
| Three Great Scholars | p. 58; detail p. 33 | sets of all three Dragons plus the remaining set/pair structure | 1,500 | 600 | two-dot marker visible | existing `three-great-scholars`; already implemented by #86 |
| Unique Wonder | p. 58; detail p. 44 | all four Winds + all three Dragons + 1 and 9 of every suit, with one tile duplicated | 2,000 | 800 | none visible | existing `thirteen-unique-wonders`; structural identity is strong |
| All Pair Honours | pp. 57–58; detail p. 22/44 | seven pairs made from Winds, Dragons and/or terminal suit tiles | 1,000 | 400 | none visible | existing `all-pair-honours`; structural identity is strong |
| Four Blessings | p. 58; detail p. 30 | four Wind Pungs/Kongs plus a pair | 1,500 | 600 | two-dot marker visible | existing `four-blessings`; structural identity is strong |
| All Winds and Dragons | p. 58; detail p. 46 | four Pungs/Kongs plus a pair, all Winds/Dragons | 1,000 | 400 | two-dot marker visible | existing `all-winds-and-dragons`; structural identity is strong |
| Heads and Tails | p. 58; detail p. 45 | four Pungs/Kongs plus a pair, all suit terminals | 1,000 | 400 | two-dot marker visible | existing `heads-and-tails`; structural identity is strong |

These six are the safest current cross-profile cases because their synopsis definitions can be compared directly with existing canonical predicates without inventing a new detector.

Implementation status: #87 binds Unique Wonder, All Pair Honours, Four Blessings,
All Winds and Dragons, and Heads and Tails in `western-tm@0.1`. The page and
edition locators in the table remain the provenance for those bindings.

### Phase 2 implementation status

The following five 1997 Companion structures are implemented as new, neutral
canonical patterns and are bound only in `western-tm@0.1`, each at 1,000 / 400:

| T&M hand | Synopsis/detail locator | Canonical pattern ID |
|---|---|---|
| Wriggly Dragon | p. 56; detail p. 11 / 31 | `wriggly-dragon` |
| Hachi Ban | pp. 10, 25, 30 and 32 | `hachi-ban` |
| Dragonette | p. 57; detail pp. 24, 39 | `dragonette` |
| Windfall | p. 57; detail pp. 24, 27 | `windfall` |
| All Pair Ruby Jade | p. 57; detail pp. 23, 32, 53 | `all-pair-ruby-jade` |

These patterns are not BMJA members. The unresolved entries below remain
unverified or unimplemented; Phase 2 does not alter their status.

The detail pages verify Hachi Ban as one concealed 1,000 / 400 hand: a 1–8 or
2–9 run in one suit plus three distinct pairs of Winds or three distinct pairs
of Dragons. The examples on pp. 10, 25, 30 and 32 are valid choices within that
rule, not different scoring variants.

### Golden Gates

Source: 1997 Companion detail p. 25. Implemented for `western-tm@0.1` as
the neutral canonical pattern `golden-gates`: four pairs of 2, 4, 6 and 8 in
one suit, with a Pung/Kong of that suit's 1 or 9 and its corresponding Dragon
(Bamboo/Green, Characters/Red, Circles/White). The concealed value is 1,000
and fishing value 400. The detail page permits either Pung/Kong to be exposed,
at 500 and fishing 200. This is the reference implementation for the first
profile-local exposure-value binding seam; the detector itself carries no
profile or score data.

### Pass 4A implementation status

The following fixed, concealed-only entries are implemented for
`western-tm@0.1`. Their synopsis has no exposure marker, so this pass adds no
exposure policy or implied exposure permission. Each uses a neutral canonical
ID and the existing profile-local fixed fishing binding path.

| T&M hand | Synopsis/detail locator | Canonical pattern ID | Winning / fishing | Detector distinction |
|---|---|---|---:|---|
| Confused Gates | p. 56; detail pp. 9, 51 | `run-two-to-eight-with-one-and-nine-pungs` | 1,000 / 400 | 2–8 run has its pair inside the run; 111 and 999 are in the other distinct suits |
| Five Odd Honours | p. 56; detail pp. 11, 38 | `full-suit-run-with-five-distinct-honours` | 500 / 200 | exactly one 1–9 suit run and five distinct honours |
| Greta's Garden | p. 56; detail pp. 13, 38 | `suit-run-one-to-seven-with-all-honours` | 1,000 / 400 | 1–7 run plus every Wind and Dragon |
| Sparrow's Sanctuary | p. 57; detail pp. 21, 48, 53 | `four-bamboo-one-and-five-green-bamboo-pairs` | 1,500 / 600 | four Bamboo 1 tiles, with only the specified five green Bamboo pairs |
| Heavenly Twins | p. 57; detail pp. 21, 48 | `seven-pairs-one-suit` | 1,000 / 400 | seven pairs in exactly one suit; honours excluded |
| All Pair | p. 57; detail p. 22 | `seven-pairs-one-suit-with-honours` | 500 / 200 | seven pairs with at most one suited family; unlike `all-pair-honours`, honours are permitted but not required |
| Dragon's Breath | p. 57; detail pp. 24, 31 | `dragon-pair-with-five-suited-pairs` | 1,000 / 400 | all Dragons represented with exactly one Dragon pair, plus five single-suit pairs |

### Pass 4B implementation status

The following p.56 synopsis rows are implemented only in `western-tm@0.1`.
Each is 1,000 / 400 and has no red-dot exposure marker. Its binding therefore
uses the explicit concealed-Pung/Kong policy `exposure: { allowed: false }`.
The canonical detector remains visibility-neutral.

| T&M hand | Canonical pattern ID | Structure |
|---|---|---|
| Run, Pung & Pair | `run-one-to-nine-with-same-suit-pung-and-pair` | 123 + 456 + 789, Pung/Kong and pair all in one suit |
| Guardian Winds | `run-one-to-nine-with-wind-pung-and-pair` | 1–9 run, Wind Pung/Kong and Wind pair |
| Guardian Dragons | `run-one-to-nine-with-dragon-pung-and-pair` | 1–9 run, Dragon Pung/Kong and Dragon pair |
| Grand Sequence | `run-one-to-nine-with-honour-pung-and-any-pair` | 1–9 run, Wind/Dragon Pung/Kong and any pair |

The source specifies P/K for Run, Pung & Pair, but under the standard
four-copy tile constraint the Kong form has no physically legal realisation
when the P/K is in the same suit as the complete 1–9 run. Runtime therefore
accepts the Pung realisation only.

Reusable rule earned: fixed profile bindings can explicitly forbid represented
exposed Pung/Kong groups without putting profile visibility rules into the
canonical detector.

### Pass 4D implementation status

The following nineteen evidenced Companion entries are implemented only in
`western-tm@0.1`. Canonical IDs state the tile structure; names, values,
fishing values and visibility rules remain binding-local. Two-dot rows use
`exposure: { allowed: true }`; Dragon's Tail has the one-dot normalisation
shown below. A Pung-only source term is retained as Pung-only in its detector.

| T&M hand | Locator | Canonical pattern ID | Winning / fishing | Source marker and normalised exposure | Physical-realisation note |
|---|---|---|---:|---|---|
| Dragon's Tail | pp. 12, 41; 56, 59 | `full-suit-run-with-honour-pung-and-opposite-honour-pair` | 1,000 / 400 | one dot; exposed 500 / 200 | ordinary five-set shape |
| All Pair Jade | pp. 23, 32, 52; 57, 60 | `all-pair-green-dragon-and-bamboo` | 1,000 / 400 | none | seven loose pairs; Green Dragon may occupy one or two pairs |
| Windy Dragons | pp. 25, 46; 57, 58 | `four-wind-pairs-with-two-dragon-melds` | 1,000 / 400 | two dots; exposed full | four pairs and two Dragon melds |
| Red Coral | pp. 35, 60; 58, 60 | `red-dragon-pung-with-character-melds` | 1,000 / 400 | two dots; exposed full | Red Dragon group remains Pung-only |
| White Opal | pp. 35, 60; 58, 60 | `white-dragon-pung-with-circle-melds` | 1,000 / 400 | two dots; exposed full | White Dragon group remains Pung-only |
| Chinese Odds | p. 49; 59 | `one-suit-odd-melds` | 500 / 200 | two dots; exposed full | grouped five-set shape |
| Odds & Evens | p. 60 | `two-odd-suits-and-one-even-suit` | 1,000 / 400 | none | complete loose 5 + 5 + 4 layout |
| Robin | p. 60 | `four-chows-three-suits-one-two-one` | 500 / 200 | none | four Chows and pair |
| Numbers in Parallel | p. 43; 59 | `parallel-suit-rank-melds-with-honours` | 1,500 / 600 | two dots; exposed full | one logical meld per suit |
| Blue Mountains | p. 60 | `green-dragon-pung-with-blue-circle-melds` | 1,000 / 400 | two dots; exposed full | Green Dragon group remains Pung-only |
| White Elephant | p. 60 | `white-dragon-meld-with-even-circle-melds` | 1,000 / 400 | two dots; exposed full | even Circle ranks 2,4,6,8; White Dragon permits Pung/Kong |
| Driven Snow | p. 60 | `white-dragon-pung-with-odd-character-melds` | 1,000 / 400 | two dots; exposed full | White Dragon group remains Pung-only |
| Dragon's Scales | p. 60 | `red-dragon-pung-with-even-character-melds` | 1,000 / 400 | two dots; exposed full | Red Dragon group remains Pung-only |
| Green Jade | pp. 35, 53; 58, 60 | `green-dragon-pung-with-bamboo-melds` | 1,000 / 400 | two dots; exposed full | source's red-or-green Bamboo family does not add a distribution rule |
| Lily of the Valley | pp. 36, 52; 58, 60 | `green-and-white-dragon-melds-with-green-bamboo` | 2,000 / 800 | two dots; exposed full | green Bamboo ranks 2,3,4,6,8 |
| Red Waratah | p. 34; 58 | `red-and-green-dragon-pungs-with-three-suits` | 1,000 / 400 | two dots; exposed full | three suited groups and Red Dragon remain Pung-only |
| Royal Ruby | pp. 37, 54; 58, 60 | `red-dragon-meld-with-red-bamboo-melds` | 2,000 / 800 | two dots; exposed full | red Bamboo ranks 1,5,7,9 |
| Red Lily | pp. 37, 54; 58, 60 | `red-and-white-dragon-melds-with-red-bamboo` | 2,000 / 800 | two dots; exposed full | red Bamboo ranks 1,5,7,9 |
| Ruby Jade | pp. 37, 54; 58, 60 | `red-and-green-dragon-melds-with-bamboo` | 1,000 / 400 | two dots; exposed full | source does not state a stronger red/green distribution rule |

### Pass 4E implementation status

The following eight evidence-complete Companion entries are implemented only in
`western-tm@0.1`. Their canonical IDs describe structure; names, values and
fishing values are profile-local. The synopsis shows no exposure marker; where
a hand represents a Pung/Kong, the established normalization does not grant
that group exposed eligibility.

| T&M hand | Locator | Canonical pattern ID | Winning / fishing | Representation note |
|---|---|---|---:|---|
| Greta's Dragon | p. 13; pp. 56, 59 | `suit-run-one-to-seven-with-winds-and-dragon-pung` | 1,000 / 400 | complete loose 1–7 run, four Wind singles and one Dragon Pung |
| Dragon's Run | N/I detail; p. 59 | `full-suit-run-with-dragon-singles-and-wind-pair` | 1,500 / 600 | complete loose 1–9 run, three Dragon singles and a Wind pair |
| Yin Yang | pp. 14, 50; pp. 56, 60 | `two-suit-pairs-and-chows-one-two-five-six-nine` | 1,000 / 400 | complete loose two-suit layout; either suit may carry either half |
| Little Robert | p. 16; p. 56 | `three-suit-chows-with-suited-meld-and-pair` | 500 / 200 | grouped five-set shape; suited Pung/Kong and pair need not share a suit; represented Pung/Kong concealed-only |
| Moon at Bottom of Well | pp. 15, 47; pp. 56, 59 | `circle-chows-with-one-two-three-four-five-six-seven-eight-nine` | 1,000 / 400 | grouped Circle-only four-Chow shape containing 123, 456 and 789 |
| Windy Chow | pp. 18, 26; pp. 56, 57 | `wind-pair-with-three-suit-chows` | 500 / 200 | complete loose Wind pair/singles plus a Chow in every suit; truthfully overlaps Chop Suey and Chow Mein |
| Chop Suey | pp. 18, 26; pp. 56, 57 | `wind-pair-with-three-suit-one-two-three-chows` | 500 / 200 | complete loose 123-in-every-suit subset of Windy Chow; precedence prevents stacking |
| Chow Mein | pp. 18, 26; pp. 56, 57 | `wind-pair-with-three-suit-seven-eight-nine-chows` | 500 / 200 | complete loose 789-in-every-suit subset of Windy Chow; precedence prevents stacking |

## 5. Existing-detector candidates that must **not** be bound yet

### Wriggly Snake

T&M detail-page evidence confirms a complete 1–9 run in one suit + all four
Winds + **any tile paired**.

The current canonical detector is narrower: it expects the duplicated suited tile to be the 1 of the chosen suit.

Status: implemented for `western-tm@0.1` as the distinct canonical structural pattern
`wriggling-snake-any-pair`, bound locally as Wriggly Snake at 1,000 / 400.

The Companion detail evidence verifies that any tile in the 13-tile base structure
may be paired. This differs from the current BMJA `wriggling-snake` predicate, so
the predicates remain separate for now. They may only be consolidated if future
BMJA evidence shows that the current BMJA predicate itself is too narrow.

### Imperial Jade

T&M synopsis (pp. 58/60) permits the Dragon set plus three melds **including a Chow** and a pair, all using green Bamboo tiles.

The current BMJA canonical `imperial-jade` detector requires four Pung/Kong groups plus a pair and therefore excludes a Chow.

Status: `verified-structural-difference`.

Do not reuse the BMJA canonical predicate for the T&M binding without deciding whether:
- the canonical identity should broaden and BMJA apply a local restriction; or
- T&M and BMJA need separate canonical patterns.

### Knitting

T&M synopsis describes seven same-number cross-suit pairs using two suits.

The current detector should be checked for whether it accidentally permits a broader multi-suit arrangement across the whole hand.

Status: `needs-predicate-audit`.

### Triple Knitting

T&M synopsis describes four same-number triplets across three suits plus one knitting pair.

Current detector is plausibly shared but must be checked against the exact source definition.

Status: `needs-predicate-audit`.

### Gates of Heaven

The tile skeleton appears to align strongly with the existing detector (111 + 999 + 2–8 with one middle tile duplicated, one suit), but the current detector also contains completion/provenance restrictions inherited from BMJA.

Status: `shared-structure / needs-completion-rule-audit`.

### Purity

The inspected p.48 detail establishes one suit; four Pungs/Kongs plus a pair;
and that one Chow may replace one Pung/Kong. Its score is calculated, and the
one-dot marker permits represented Pung/Kong exposure at half score.

The current BMJA `isPurityHand` predicate is structurally narrower because it
permits no Chow. Western therefore uses the distinct neutral `purity-one-chow`
canonical pattern and a calculated profile binding with an explicit 0.5
exposure multiplier. Western fishing remains unresolved and unimplemented;
no fishing value is inferred. Its ordinary calculation remains
`provisional-compatible`, not verified-identical.

## 6. Source-level anomalies and conflicts to preserve

### Gertie's Garter synopsis conflict

The supplied synopsis photographs appear to give the same named/structured Gertie's Garter entry with different fixed values:

- p. 56 run grouping (detail p. 14): appears as 2,000 / 800;
- p. 57 pair grouping (detail p. 20): 1,000 / 400;
- p. 59 two-suit grouping points to detail p. 50.

The structure shown in the first two synopsis occurrences is materially the same (runs 1–7 in two suits).

Status: `conflict-needs-detail-pages`.

Do not choose a value by majority or convenience. Inspect pp. 14, 20 and 50 before implementation.

### `Calculate` hands

At least these synopsis entries use `Calculate` rather than a fixed value:

- All Honour Hand;
- Ordinary Mah Jong;
- Purity.

There may be additional calculated cases in the full detail pages.

Engineering consequence: #87 will eventually need a `scoreModel` that can distinguish fixed special values from ordinary/calculated scoring, but that seam should be added only when the first production hand requiring it is implemented.

## 7. Emerging binding model — evidence, not implementation mandate

The photographs now justify these profile-local dimensions:

```text
catalogue membership
local name
fixed winning value OR calculated score model
fishing value
exposure policy
source edition/page
evidence status
```

An eventual shape may resemble:

```ts
type WesternPatternBinding = {
  patternId: string;
  profile: RulesProfileRef;
  name: string;
  scoreModel:
    | { kind: 'fixed'; winning: number }
    | { kind: 'calculated' };
  fishingValue?: number;
  exposurePolicy?: 'concealed' | 'exposed-full' | 'exposed-half';
  evidence: SourceLocator[];
};
```

This is a research conclusion, not a request to generalise the runtime model before an evidenced hand needs each field.

## 8. First safe Codex implementation batch

Recommended first production batch after this evidence PR:

1. **Unique Wonder** → existing `thirteen-unique-wonders` detector → T&M 2,000 / 800.
2. **All Pair Honours** → existing `all-pair-honours` detector → T&M 1,000 / 400.
3. **Four Blessings** → existing `four-blessings` detector → T&M 1,500 / 600.
4. **All Winds and Dragons** → existing `all-winds-and-dragons` detector → T&M 1,000 / 400.
5. **Heads and Tails** → existing `heads-and-tails` detector → T&M 1,000 / 400.

Three Great Scholars remains the already-implemented reference binding from #86.

Why this batch:

- all five already have canonical detectors;
- their synopsis structures align strongly with those detectors;
- all have explicit fixed winning/fishing values;
- none requires the new calculated-score seam;
- the two-dot exposure cases are compatible with existing visibility-neutral detectors, so the batch can land without inventing a half-score exposure framework;
- together they exercise 1,000 / 1,500 / 2,000 fixed-value tiers.

### Required tests for that batch

For every binding:

- same canonical detector reused; no detector duplication;
- T&M local name and values are profile-local;
- BMJA value/membership remains unchanged;
- unbound T&M hands remain absent;
- fixed values above the ordinary 1,000 cap survive correctly;
- fishing value is profile-local.

Do not include Wriggly Snake, Imperial Jade, Knitting, Triple Knitting, Gates of Heaven or Purity in the first batch.

## 9. Next evidence requests — only when needed

The current photographs are enough for this pass and for the first Codex batch.

Targeted detail-page photographs are needed next only for ambiguity-resolution, especially:

- pp. 14, 20 and 50 — Gertie's Garter conflict;
- p. 36 / 52 — Imperial Jade Chow/exposure treatment;
- p. 20 — Knitting / Triple Knitting exact predicates;
- p. 9 / 47 — Gates of Heaven completion restrictions;
- p. 48 — Purity calculated-score treatment.

This keeps source capture demand-driven rather than requiring the whole book.

## 10. Pass-1 conclusion

The Full Synopsis is sufficient to establish a durable Western catalogue inventory and to start implementation safely.

The strongest architectural findings are:

1. the Companion catalogue contains **84 unique named hands** in the supplied full synopsis;
2. fixed values span 500/200, 1000/400, 1500/600 and 2000/800;
3. some entries are calculated rather than fixed-value;
4. exposure is profile-local rule data, including a half-score exposed state;
5. several familiar BMJA/T&M names are genuinely shared patterns;
6. several other same/similar names are **not structurally identical** to the current BMJA detector;
7. the next implementation work should therefore add evidence-backed bindings first and earn new scoring/exposure seams only from concrete catalogue cases.
