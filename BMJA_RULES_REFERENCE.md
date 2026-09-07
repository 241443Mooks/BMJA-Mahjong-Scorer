# BMJA Rules Reference

This document is the project’s working engineering reference for British Mah-Jong Association (BMJA) scoring and game progression.

It is **not an official BMJA publication**. It paraphrases the rules currently used by this project so that implementation choices, tests and known ambiguities are visible in one place.

## Source hierarchy

Primary current implementation source:

- Mah-Jong British Rules — https://mahjongbritishrules.wordpress.com/
- Scoring overview — https://mahjongbritishrules.wordpress.com/scoring/
- Working out scores — https://mahjongbritishrules.wordpress.com/scoring/working-out-the-scores/
- Special hands — https://mahjongbritishrules.wordpress.com/scoring/special-hands/
- Settling up — https://mahjongbritishrules.wordpress.com/scoring/settling-up/
- Questions on playing the game — https://mahjongbritishrules.wordpress.com/questions/playing-the-game/
- Corrections and clarifications — https://mahjongbritishrules.wordpress.com/books/ktg-corrections-and-clarifications/

The site states that it explains the BMJA rules, is based on the 3rd edition of *Mah-Jong (Know the Game)* by Gwyn Headley and Yvonne Seeley, and that the original site was launched with BMJA approval and endorsed by the authors. Where the website documents a later clarification from the authors, this project should prefer that clarification over an ambiguous older wording.

## Rule-status convention

Use these markers when extending this document:

- **Implemented** — represented in production scoring/game logic and covered by tests.
- **Partial** — some of the BMJA rule is implemented, but a known condition or exception is missing.
- **Planned** — accepted project requirement but not yet implemented.
- **Ambiguous** — source material requires an explicit project interpretation.

## Tile classes

- Minor tiles: suited tiles 2–8.
- Major tiles: suited 1s and 9s, plus Winds and Dragons.
- Honour tiles: Winds and Dragons.
- Bonus tiles: Flowers and Seasons.

## Hand size and unfinished hands

**Implemented.** Flowers and Seasons do not occupy playing-tile slots. A
non-winning hand contains 13 structural playing tiles and a winning hand
contains 14. Each completed Kong is represented by four physical copies but
occupies three structural slots, so every represented Kong adds one physical
tile above the 13/14 base.

For an ordinary non-winning hand, completed sets and pairs are entered as
groups. Every other playing tile is entered individually under **Remaining
tiles**. Those tiles may form any combination of singles, pairs or unfinished
sequences; the hand does not have to be fishing. Remaining tiles do not score
as completed sets, but they do count for hand composition, special-hand
eligibility, copy limits and automatic fishing.

The separate loose-tile layout remains available for whole irregular special
patterns. It cannot be mixed with grouped sets or Remaining tiles.

## Standard set scoring

### Chows

- Exposed chow: 0 points.
- Concealed chow: 0 points.
- A normal grouped hand may contain at most one chow.
- Named special-hand sequences such as The Gates of Heaven and The Wriggling Snake are entered as special layouts and are not counted as chows.

### Pungs

| Tile class | Exposed | Concealed |
| --- | ---: | ---: |
| Minor | 2 | 4 |
| Major | 4 | 8 |

### Kongs

| Tile class | Exposed | Concealed |
| --- | ---: | ---: |
| Minor | 8 | 16 |
| Major | 16 | 32 |

### Honour pairs

- Dragon pair: 2 points.
- Pair of own Wind: 2 points.
- Pair of prevailing Wind: 2 points.
- If own Wind and prevailing Wind are the same, both awards apply.

### Bonus tiles

- Each Flower: 4 points.
- Each Season: 4 points.

### Mah-Jong bonuses

- Declaring Mah-Jong: 20 points.
- Winning by drawing from the live wall: 2 additional points.

## Doubles

The scorer should keep doubles separate from base points and explain each applied double.

General doubles include qualifying sets of Dragons, own Wind, prevailing Wind, own Flower/Season, complete Flower/Season bouquets, and Original Call.

Winner-only doubles include BMJA conditions such as no chows, one suit with honours, all majors, fully concealed hand, loose-tile win, last-wall win, final-discard win and robbing a kong.

Ordinary hands are capped at the configured limit, normally 1,000 points.

## Special-hand scoring principles

Special hands are not treated as ordinary hands with every normal double stacked on top.

For fixed-value special hands below the 1,000-point limit, Flowers and Seasons are scored separately. Eligible bonus-tile doubles apply to the bonus-tile subtotal, not to the fixed special-hand value. The published clarification also allows a final-discard double to affect the bonus-tile subtotal in this situation.

Purity is different: it is a three-doubles scoring mode rather than a fixed 500- or 1,000-point value.

Fishing matters. BMJA assigns special fishing values to many special hands when another player goes Mah-Jong. These are not equivalent to Original Call and are modelled separately.

## Special hands

### Currently implemented or largely implemented

| Special hand | Winner treatment | Current project status |
| --- | --- | --- |
| Purity | Basic score doubled three times | Implemented — winner and verified one-tile-away fishing, including the greater intrinsic option |
| All Pair Honours | 500 | Implemented — winner and 200 fishing |
| Thirteen Unique Wonders | 1,000 | Implemented — winner and 400 fishing, including multiple possible waits |
| All Winds and Dragons | 1,000 | Implemented — winner and greater of 400 fishing or intrinsic value |
| Heads and Tails | 1,000 | Implemented — winner and 400 fishing |
| Fourfold Plenty | 1,000 | Implemented — winner and 400 fishing |
| Three Great Scholars | 1,000 | Implemented — winner and greater of 400 fishing or intrinsic value |
| Four Blessings Hovering over the Door | 1,000 | Implemented — winner and greater of 400 fishing or intrinsic value |
| Buried Treasure | 1,000 | Implemented — winner (including the provenance-verified final pung/pair claim exception) and 400 fishing |
| Knitting | 500 | Implemented — winner and 200 fishing |
| Triple Knitting | 500 | Implemented — winner and 200 fishing |
| Imperial Jade | 1,000 | Implemented — winner and 400 fishing |
| Gates of Heaven | 1,000 | Implemented — winner (including the provenance-verified terminal final-pung claim exception) and 400 fishing |
| Wriggling Snake | 1,000 | Implemented — winner and 400 fishing |
| Heaven’s Blessing | 1,000 | Implemented — inferred for East from “Mah Jong in original deal” |
| Earth’s Blessing | 1,000 | Implemented — requires confirmation that a non-East winner used East’s first discard |
| Gathering the Plum Blossom from the Roof | 1,000 | Implemented — inferred from a replacement winning 5 Circles |
| Plucking the Moon from the Bottom of the Sea | 1,000 | Implemented — inferred from a last-wall winning 1 Circles |
| Twofold Fortune | 1,000 | Implemented — requires confirmation of the two-Kong replacement sequence |

### Event-dependent specials

**Implemented without a full turn history.** The scorer stores only the event
facts needed beyond the completed hand, winning method and winning-tile
provenance.

- Heaven’s Blessing is inferred when East selects “Mah Jong in original deal.”
  It has no separately drawn or claimed winning tile and cannot include a
  Flower/Season replacement.
- Earth’s Blessing is available only to a non-East discard winner. A short
  question records whether the tile was East’s first discard.
- Gathering the Plum Blossom from the Roof is inferred when a replacement
  (loose) winning tile is 5 Circles.
- Plucking the Moon from the Bottom of the Sea is inferred when the last wall
  tile is the winning 1 Circles.
- Twofold Fortune is available only for a replacement-tile winner whose hand
  contains at least two Kongs. A short question records whether one Kong’s
  replacement completed another Kong and the next replacement completed
  Mah Jong.

For the two questions, “No” and “I’m not sure” retain no event evidence and the
hand is scored conservatively. The questions do not name the special hands.
Event-only specials do not make an otherwise unsupported tile layout valid.

### Irregular-hand entry

Standard sets remain the default hand-building route. The individual-tile
special layout is available through the beginner-facing “My hand doesn’t fit
normal sets” action rather than as an equal default mode.

In the irregular layout, tapping an already-entered loose tile removes that
single occurrence, including on touch/mobile devices. The entered tiles remain
keyboard controls, so Enter or Space also removes the selected occurrence.
Switching between Standard sets and the irregular layout preserves each mode’s
draft so changing entry route does not silently discard work.

## Known special-hand gaps

### Fishing

**Implemented.** Special fishing is represented independently from Original Call and only applies to a non-winning hand. The player does not select or name a target special. The scorer automatically enumerates every legal playing-tile completion and tests each completed hand against every supported special. The required tile may be dead; availability in the wall is not part of fishing eligibility.

Every matching special and every possible completing tile are retained in the score result and shown in the scorer. Where patterns overlap, each lawful fishing interpretation is calculated independently and the highest score is used. Equal-scoring alternatives remain visible, with one deterministic interpretation supplying the shared score.

Irregular hands are entered as the 13 tiles currently held. Ordinary grouped
hands retain their completed sets and the actual individual Remaining tiles.
For each possible four-copies-safe draw, the scorer partitions the Remaining
tiles plus that draw into legal concealed pairs, pungs and at most one chow,
combines that interpretation with the completed groups, and runs the existing
special detectors. An existing pair may also be completed into a pung when
the drawn tile matches it. The ungrouped 13-tile irregular route continues to
test the completed 14-tile layout directly.

Fishing is only reported when at least one legal completed interpretation
matches a supported special. A structurally complete but non-fishing losing
hand remains valid. Remaining tiles also participate in all-suit/honour
properties and the four-copy limit, preventing an omitted off-suit tile from
creating false Purity fishing.

Under corrected structural counting, adding a fourth tile to a represented
pung does not add the missing fourteenth structural slot. Fourfold Plenty
fishing is therefore recognized from four completed Kongs plus a single
waiting to become the pair, not from the old three-Kongs-plus-pung shortcut.

Published values implemented:

- Purity: the basic score doubled three times, or intrinsic value if greater.
- All Pair Honours, Knitting and Triple Knitting: 200.
- Supported 1,000-point tile-pattern specials: 400.
- Three Great Scholars, All Winds and Dragons, and Four Blessings Hovering over the Door: 400 or intrinsic value if greater.

Flowers and Seasons are handled separately. Under fixed special fishing, their points and qualifying own-tile/bouquet doubles apply only to the bonus subtotal. The published North example for Thirteen Unique Wonders therefore scores `400 + (8 × 2) = 416`.

**Purity interpretation:** the source says both “double three times or intrinsic value, if greater” and that, when the higher intrinsic route is chosen, doubling applies to the basic score of the whole hand. The engine interprets that route as applying Purity’s three doubles plus qualifying bonus doubles to the combined playing-tile and bonus base. The ordinary separated-bonus Purity calculation remains the alternative, and the higher result is selected.

### Winning-tile provenance

**Implemented.** A winning hand may retain the exact winning tile together with
either the stable id of its destination set/pair (and chow position where
applicable) or a loose-layout target. Absence explicitly means unknown.
Provenance is accepted only for a winner and only when the tile and destination
exist in the completed hand; stale metadata cannot enable an exception.

Buried Treasure remains valid when all groups are concealed. A discard or final
discard may instead expose only the provenance-selected final pung or pair.
Gates of Heaven keeps its exact 14-tile pattern; a discard or final-discard
completion qualifies only when loose-layout provenance identifies a 1 or 9 in
the Gates suit. Drawn completion keeps the ordinary concealed treatment.

## Settlement between four players

After a player goes Mah-Jong:

1. Each loser pays the winner the winner’s score.
2. If East is the winner, each payment to East is doubled.
3. If a non-East player wins, East pays that winner double.
4. The three non-winners then settle the differences between their own hand scores.
5. Any payment to or from East is doubled.

Settlement is zero-sum: the four net balance changes for a completed hand must total zero.

The score limit does not cap East’s payment multiplier. A settlement involving East can therefore exceed the nominal 1,000-point hand limit.

## Game progression

- East remains East after East wins.
- East remains East after a draw/wash-out.
- When a non-East player wins, seat Winds rotate anti-clockwise:
  - South becomes East.
  - East becomes North.
  - North becomes West.
  - West becomes South.
- The prevailing Wind advances after all four players have served as East for that prevailing-Wind cycle.
- An official full game proceeds through East, South, West and North prevailing Winds.
- The product also supports a shorter single-round mode, which ends after the first prevailing-Wind cycle returns East to the original starting-East player.

## Draws / wash-outs

Current project interpretation:

- No settlement transfers occur on a wash-out.
- East and seat Winds do not rotate.

The source explicitly supports East remaining unchanged after a draw. A separate published worked payment example for a wash-out has not been identified, so the no-transfer treatment should remain documented as a project interpretation unless a stronger source is found.

## Validation principles

- A completed settlement must be zero-sum.
- A normal completed hand must respect physical tile counts.
- Detailed-hand validation and special-hand detection should remain separate so that a pattern match cannot silently make an otherwise impossible hand valid.
- When the app lacks enough context to determine an event-dependent rule, it should ask the user rather than guess.

## Testing policy

For each rule added or changed:

1. Link the implementation decision to a source in this document.
2. Add focused unit tests for the isolated rule.
3. Add at least one complete-hand or game-level golden fixture where rules interact.
4. Prefer published worked examples as golden fixtures when available.
5. Do not change an expected test value merely to make current code pass; source interpretation comes first.

## Current backlog

- #1 Complete missing layout-based BMJA special hands.
- #2 Add BMJA special-hand fishing scores.
- #4 Add event-based BMJA special hands.
- #6 Add detailed end-of-game report.
- #7 Add shared tile inventory and availability warnings.
- #8 Add photo-based tile recognition.

## Copyright / wording note

This project should continue to paraphrase rule descriptions in its own language and link to the underlying source rather than reproducing substantial passages from the rulebook or website. The aim is an implementation reference and clearer learner guide, not a replacement copy of the source material.
