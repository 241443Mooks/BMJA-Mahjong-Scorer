# Mahjong Reference — British Mahjong Video Series

This directory contains the planned evergreen screen-recording series for Mahjong Reference. The reusable brand is **Mahjong Reference**; every scoring demonstration should state that its rules context is **British / BMJA-style** and use `mahjong.smooks.co.uk` as its CTA.

The first five videos deliberately describe **one shared four-player hand** rather than five unrelated demos.

The table context is:

- prevailing Wind: **East**
- players: **East, South, West and North**
- **South goes Mah Jong**
- South wins by an ordinary discard
- each player's score is built in the detailed scorer
- Video 5 brings the four verified scores together in the full-game scorer and explains settlement

This lets the series teach both halves of British Mahjong scoring:

1. **score each player's hand**; then
2. **settle the hand between all four players**.

## Series map

| Video | Player | Teaching focus | Verified/planned score |
| --- | --- | --- | ---: |
| 01 | South — winner | Basic points → doubles → final score; exposed vs concealed minor Pungs; Dragon Pung; Chow; ordinary pair; Mah Jong bonus | **60** |
| 02 | East — non-winner | Partial losing-hand evidence; major Wind Pung; minor Kong; Dragon pair; own + prevailing Wind doubles | **56** |
| 03 | West — non-winner | Flowers/Seasons; own Flower double; major vs minor Pungs; own-Wind pair | **40** |
| 04 | North — non-winner | Kong scoring; concealed minor Kong; Dragon Pung double; own-Wind pair | **44** |
| 05 | Settlement | Winner payments, East doubling, loser-to-loser score differences, zero-sum settlement | Uses all four scores |

---

# Shared canonical hand

## South — winner — 60

Context:

- player Wind: South
- prevailing Wind: East
- winner: yes
- winning method: ordinary discard

Hand:

- exposed Pung of 4 Bamboo = 2 points
- concealed Pung of 7 Circles = 4 points
- exposed Pung of Red Dragons = 4 points + 1 double
- Chow of 2–3–4 Characters = 0 points
- pair of 5 Bamboo = 0 points
- going Mah Jong = 20 points

Calculation:

`2 + 4 + 4 + 20 = 30 points`

`30 × 2 = 60`

Full script: `01-south-winning-hand.md`

---

## East — non-winner — 56

Context:

- player Wind: East
- prevailing Wind: East
- non-winner
- deliberately **partial evidence** rather than a reconstructed 13-tile hand

Entered evidence:

- exposed Pung of East Winds = 4 points
- exposed Kong of 6 Bamboo = 8 points
- pair of Red Dragons = 2 points

Doubles:

- Pung/Kong of own Wind = 1 double
- Pung/Kong of prevailing Wind = 1 double

Because East is both the player's Wind and the prevailing Wind, the same East-Wind Pung earns **two distinct doubles**.

Calculation:

`4 + 8 + 2 = 14 points`

`14 × 4 = 56`

Teaching purpose:

- show that a losing player does not need to reconstruct every irrelevant loose tile;
- introduce **partial evidence** as legitimate input;
- introduce a Kong without making it the main topic;
- show how game context changes scoring;
- show that own Wind and prevailing Wind can both apply to the same set.

Planned script: `02-east-partial-hand.md`

---

## West — non-winner — 40

Context:

- player Wind: West
- prevailing Wind: East
- non-winner
- partial evidence

Entered evidence:

- exposed Pung of 1 Characters = 4 points — 1 is a major/terminal tile
- concealed Pung of 5 Circles = 4 points — concealed minor Pung
- exposed Pung of 4 Bamboo = 2 points — exposed minor Pung
- pair of West Winds = 2 points — own-Wind pair
- Flower 3 = 4 points
- Season 2 = 4 points

Double:

- Flower 3 matches West (East=1, South=2, West=3, North=4) = 1 double

Season 2 still scores its normal 4 bonus points, but it is South's Season rather than West's, so it gives West no double.

Calculation:

`4 + 4 + 2 + 2 + 4 + 4 = 20 points`

`20 × 2 = 40`

Teaching purpose:

- explain that 1s and 9s are major even though they are suited tiles;
- reinforce exposed/concealed Pung values;
- explain own-Wind pairs;
- introduce Flowers and Seasons as bonus tiles outside the normal structural hand;
- explain the own Flower/Season numbering relationship.

Planned script: `03-west-bonus-tiles.md`

---

## North — non-winner — 44

Context:

- player Wind: North
- prevailing Wind: East
- non-winner
- partial evidence

Entered evidence:

- concealed Kong of 7 Characters = 16 points — concealed minor Kong
- exposed Pung of Green Dragons = 4 points + 1 double
- pair of North Winds = 2 points — own-Wind pair

Calculation:

`16 + 4 + 2 = 22 points`

`22 × 2 = 44`

Teaching purpose:

- make Kong scoring the main concept;
- show that a Kong contains four physical tiles but occupies one completed set;
- contrast Kong values with the Pungs already seen in earlier videos;
- reinforce Dragon-set doubles;
- reinforce own-Wind pair scoring.

Planned script: `04-north-kongs.md`

---

# Video 05 — settlement

Use the exact scores produced by Videos 1–4:

| Wind | Outcome | Hand score |
| --- | --- | ---: |
| East | non-winner | 56 |
| South | **winner** | **60** |
| West | non-winner | 40 |
| North | non-winner | 44 |

The settlement engine is pairwise:

1. every loser pays the winner the winner's score;
2. the three non-winners then settle the differences between their own hand scores;
3. **any payment involving East is doubled**.

## Winner payments

South won with 60.

- East → South: base 60, doubled because East is involved = **120**
- West → South: **60**
- North → South: **60**

South therefore receives **240** from the winner-payment stage.

## Settlement between the non-winners

Non-winner scores:

- East 56
- North 44
- West 40

East vs West:

- difference = 16
- West pays East
- doubled because East is involved
- West → East = **32**

East vs North:

- difference = 12
- North pays East
- doubled because East is involved
- North → East = **24**

North vs West:

- difference = 4
- West pays North
- East is not involved
- West → North = **4**

## Net changes

| Wind | Net change |
| --- | ---: |
| South | **+240** |
| East | **-64** |
| West | **-96** |
| North | **-80** |

Check:

`240 - 64 - 96 - 80 = 0`

This is a useful settlement example because it demonstrates both forms of East doubling:

- East's payment to the winner is doubled;
- score-difference payments to/from East are also doubled.

It also demonstrates that **hand score and settlement change are different things**. East has the highest losing hand at 56, but East's settlement is still affected strongly by the East multiplier.

Planned script: `05-settlement.md`

---

# Production conventions

All videos in this series should use:

- real Mahjong Reference UI, with its British / BMJA-style rules context visible;
- screen recording rather than physical tiles;
- SMooks' own voice recorded separately from the screen capture;
- light editing only;
- exact tile/rule language rather than vague descriptions;
- verified scorer outputs before narration is finalised;
- a quiet CTA to `mahjong.smooks.co.uk`;
- no official-BMJA or guaranteed-accuracy claims.

Each hand should be entered in the live/current scorer once immediately before recording to confirm that the displayed breakdown still matches the canonical series plan.

The detailed scripts should describe the exact screen action and exact teaching point, e.g.:

> This is a Pung of 4 Bamboo. Suited tiles 2 through 8 are minor tiles. An exposed Pung of minor tiles is worth 2 points.

Avoid placeholders such as:

> This set scores more because it is concealed.

The purpose is to produce evergreen teaching material, not merely product demonstration footage.
