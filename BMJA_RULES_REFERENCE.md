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

## Standard set scoring

### Chows

- Exposed chow: 0 points.
- Concealed chow: 0 points.

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
| Buried Treasure | 1,000 | Partial — winner and 400 fishing implemented; final-winning-tile concealment exception still needs richer provenance |
| Knitting | 500 | Implemented — winner and 200 fishing |
| Triple Knitting | 500 | Implemented — winner and 200 fishing |
| Imperial Jade | 1,000 | Implemented — winner and 400 fishing |
| Gates of Heaven | 1,000 | Partial — winner and 400 fishing implemented; final-winning-tile claim exception still needs richer provenance |
| Wriggling Snake | 1,000 | Implemented — winner and 400 fishing |

### Missing event-dependent specials

These cannot be identified reliably from a final tile photograph alone because they depend on timing, draw source or event sequence:

- Heaven’s Blessing.
- Earth’s Blessing.
- Gathering the Plum Blossom from the Roof.
- Plucking the Moon from the Bottom of the Sea.
- Twofold Fortune.

Tracked in issue #4.

## Known special-hand gaps

### Fishing

**Implemented.** Special fishing is represented independently from Original Call and only applies to a non-winning hand. The player does not select or name a target special. The scorer automatically enumerates every legal playing-tile completion and tests each completed hand against every supported special. The required tile may be dead; availability in the wall is not part of fishing eligibility.

Every matching special and every possible completing tile are retained in the score result and shown in the scorer. Where patterns overlap, each lawful fishing interpretation is calculated independently and the highest score is used. Equal-scoring alternatives remain visible, with one deterministic interpretation supplying the shared score.

Irregular hands are entered as the 13 tiles currently held. Grouped hands retain complete sets and identify the exact incomplete group currently held: a single waiting to become a pair, a pair waiting to become a pung, or a pung waiting to become a kong. This avoids treating a completed special with `isWinner = false` as fishing.

Published values implemented:

- Purity: the basic score doubled three times, or intrinsic value if greater.
- All Pair Honours, Knitting and Triple Knitting: 200.
- Supported 1,000-point tile-pattern specials: 400.
- Three Great Scholars, All Winds and Dragons, and Four Blessings Hovering over the Door: 400 or intrinsic value if greater.

Flowers and Seasons are handled separately. Under fixed special fishing, their points and qualifying own-tile/bouquet doubles apply only to the bonus subtotal. The published North example for Thirteen Unique Wonders therefore scores `400 + (8 × 2) = 416`.

**Purity interpretation:** the source says both “double three times or intrinsic value, if greater” and that, when the higher intrinsic route is chosen, doubling applies to the basic score of the whole hand. The engine interprets that route as applying Purity’s three doubles plus qualifying bonus doubles to the combined playing-tile and bonus base. The ordinary separated-bonus Purity calculation remains the alternative, and the higher result is selected.

### Winning-tile provenance

The current hand model does not always know which exact tile completed the hand or which set/pair it completed. This affects exceptions for hands such as Buried Treasure and Gates of Heaven.

Gates of Heaven is therefore currently recognized from a fully concealed 14-tile
special layout. The BMJA exception allowing the final pung to be claimed remains
out of scope until winning-tile provenance is represented.

Tracked in issue #3.

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
- #3 Model winning-tile provenance for special-hand exceptions.
- #4 Add event-based BMJA special hands.
- #6 Add detailed end-of-game report.
- #7 Add shared tile inventory and availability warnings.
- #8 Add photo-based tile recognition.

## Copyright / wording note

This project should continue to paraphrase rule descriptions in its own language and link to the underlying source rather than reproducing substantial passages from the rulebook or website. The aim is an implementation reference and clearer learner guide, not a replacement copy of the source material.
