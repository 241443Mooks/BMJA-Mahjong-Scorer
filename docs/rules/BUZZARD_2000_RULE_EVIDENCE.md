# Buzzard 2000 British/Western Classical — rule evidence ledger

Status: **source-complete for scoring/table-companion design**  
Issue: #175  
Implementation child: #217  
Working source ID: `buzzard-2000-classical`  
Source: Jonathan Buzzard, *Mah-Jongg: the Game and How To Play It*, last modified 30 March 2000  
Canonical URL: `http://www.buzzard.me.uk/jonathan/MahJongg.html`

## Source snapshot recovered — 16 September 2026

A printed/downloaded PDF copy of the canonical Buzzard page is now held as the implementation evidence snapshot.

- 13 pages;
- page heading identifies the source and states `Last modified on 30th March 2000`;
- local PDF SHA-256: `76b7548f8a8708473340a65bfaf810c99188b95a37311ce6127676588f20b0a5`;
- the live URL returning HTTP 502 no longer blocks implementation because exact page-level source evidence is available from this snapshot.

This source remains a **named historical profile**, not an authority over modern BMJA or every Western/Classical table.

## Product scope matters

Mahjong Reference is a **scoring and table-running companion**. It does not play the physical game for the players.

Therefore the implementation only needs to know the facts required to:

1. calculate each player's score from the completed/entered hand and relevant table evidence;
2. calculate settlement, including liability/penalty overrides;
3. advance East, seats and prevailing wind;
4. record a dead hand/draw when the table tells us one occurred.

The app does **not** need to simulate the wall, police every draw/discard, enforce claim priority in real time, or prove that a Standing Hand remained locked. Those procedures belong in the rules/reference layer unless a future product requirement explicitly changes scope.

## Core implementation conclusion

Buzzard is mostly a **classical profile composition over capabilities already present**.

Conceptually:

> **Start with the existing classical/BMJA scoring and table primitives; keep the identical rules; add Buzzard-only rules; amend the few rules whose values/conditions differ; remove BMJA-only rules; then add two small table-companion seams for Buzzard-specific non-winner limits and settlement incidents.**

This is a profile/configuration job, not a new engine family.

## A. Ordinary hand values — direct reuse

Source: PDF pages 9–10, “THE SCORES AND HOW TO CALCULATE THEM”.

| Rule ID | Buzzard value | Implementation |
|---|---:|---|
| `score.base.chow` | 0 | REUSE |
| `score.base.pung.simple.exposed` | 2 | REUSE |
| `score.base.pung.simple.concealed` | 4 | REUSE |
| `score.base.pung.major.exposed` | 4 | REUSE |
| `score.base.pung.major.concealed` | 8 | REUSE |
| `score.base.kong.simple.exposed` | 8 | REUSE |
| `score.base.kong.simple.concealed` | 16 | REUSE |
| `score.base.kong.major.exposed` | 16 | REUSE |
| `score.base.kong.major.concealed` | 32 | REUSE |
| `score.base.pair.dragon` | 2 | REUSE |
| `score.base.pair.own-wind` | 2 | REUSE |
| `score.base.pair.round-wind` | 2 | REUSE |
| `score.base.bonus-tile` | 4 per Flower/Season | REUSE |

“Major” here covers terminal suit tiles and Winds/Dragons in the source table.

## B. Doubles — mostly menu selection from the existing classical rules

Source: PDF page 10 “DOUBLES”, plus page 11 “NOTES ON SCORING”.

### All hands

| Rule | Buzzard | Delta from current BMJA implementation |
|---|---|---|
| Pung/Kong of own Wind | ×2 | KEEP |
| Pung/Kong of Wind of Round | ×2 | KEEP |
| Pung/Kong of any Dragon | ×2 | KEEP |
| Own Season or Flower | ×2 | KEEP |
| Four Seasons or Four Flowers | ×8 | AMEND bouquet treatment; source lists this separately from own-tile double |

The source says that where several doubles occur, they are cumulative. A golden fixture must explicitly pin the cumulative treatment when a complete Flower/Season set also contains the player's own tile rather than silently importing BMJA's bouquet convention.

### Winner only

| Rule | Buzzard | Delta |
|---|---|---|
| Snatching a Kong | ×2 | KEEP existing rob-Kong event double |
| One suit + Winds/Dragons | ×2 | KEEP |
| Ones/Nines + Winds/Dragons | ×2 | KEEP all-major-family double |
| Entirely one suit | ×8 | AMEND predicate: Buzzard does not restrict this to Pungs/Kongs |
| Original Hand | ×8 | ADD/PROFILE-BIND; also a limit hand below |
| All Winds and Dragons | ×8 | ADD/PROFILE-BIND; also a limit hand below |
| Winning by Pairs: Pungs/Kongs + pair, no Chows | ×2 | KEEP no-Chows/all-Pungs-family double |
| All Chows + a non-scoring pair | ×2 | ADD |
| Last drawable wall tile | ×2 | KEEP existing last-wall win evidence |
| Loose Tile win | ×2 | KEEP existing loose-tile win evidence |

### Remove BMJA-only scoring behaviour from Buzzard

Do not inherit a rule merely because it exists in the current BMJA profile.

For Buzzard specifically:

- generic “fully concealed hand” is **not** listed as an ordinary double; instead concealed Pungs/Kongs form one of the named limit hands;
- `originalCall` is **not** Standing Hand and must not be reused as if they were identical;
- no separate generic final-discard double is stated in this source.

## C. Winner additive bonuses

Source: PDF page 10 “BONUS SCORES”, clarified by page 11 notes.

| Rule ID | Buzzard value | Delta |
|---|---:|---|
| `score.bonus.mahjong` | +20 | KEEP |
| `score.bonus.self-draw` | +2 | KEEP |
| `score.bonus.only-possible` | +2 | ADD evidence toggle/inference |
| `score.bonus.standing` | +100 | ADD evidence toggle |
| `score.bonus.no-chows` | +10 | ADD; this is in addition to the no-Chows/all-Pungs double where applicable |
| `score.bonus.scoreless` | +10 | ADD |
| `score.bonus.last-wall` | +10 | ADD; existing event double still applies |
| `score.bonus.loose-tile` | +10 | ADD; existing event double still applies |

The source says bonuses are added **before** the hand is multiplied by doubles.

For product scope, `Standing Hand`, `only possible tile`, `last wall tile` and `Loose Tile` are final scoring facts the player/table can supply. We do not need to reconstruct the preceding play sequence.

## D. Limit hands

Source: PDF page 11 “The following ten hands are Limit Hands”.

The source states these score the agreed limit irrespective of ordinary scoring value:

1. all Winds and Dragons;
2. Pungs/Kongs of three Winds + pair of the fourth + any final set;
3. Original Hand;
4. winning with East Wind's first discard;
5. all Ones and Nines;
6. Pungs/Kongs of at least three Dragons;
7. concealed Pungs/Kongs;
8. Thirteen Odd Majors;
9. Calling Nine Tile Hand;
10. East Wind's thirteenth consecutive Mahjong.

Implementation shape:

- REUSE canonical structural detectors where exact structure matches;
- CONFIGURE Buzzard limit value rather than hard-coding a universal number;
- ADD small event/context evidence for Original Hand, East's first discard and East's thirteenth consecutive Mahjong;
- ADD/ADAPT profile bindings for Buzzard's exact structural conditions.

### Limit amount

Source: PDF page 8 says players should agree a maximum and gives **600 points as an example** (“say, 600”), with East able to receive double.

Therefore:

- Buzzard has a table-configured limit;
- 600 is a sensible source-derived default/example, **not a universal mandatory constant**;
- persisted game setup should retain the chosen limit.

## E. The one unusual scoring seam: non-winner limits

Source: PDF pages 11–12.

The Four-Wind-family hand and the Three-Dragon hand are exceptional: the source says these can score the limit against the other two losers even when incomplete/non-winning. The player still pays the actual winner normally.

This means Buzzard proves one small generalisation we genuinely need:

> **A special/limit hand result must not universally imply `isWinner === true`.**

This is a scoring/table settlement concern, not gameplay simulation.

## F. Settlement — direct reuse for the ordinary case

Source: PDF page 8 “SETTLEMENT OF SCORES”.

Ordinary settlement is the same shape already implemented for BMJA:

- each loser pays the winner the winner's score;
- the losers then settle pairwise score differences;
- whenever East is one side of a payment, the amount is doubled.

Therefore ordinary Buzzard settlement should REUSE the existing transaction engine and be proven with Buzzard source fixtures rather than reimplemented.

## G. Progression — direct reuse

Source: PDF page 7 Rules 11–14.

- dead hand: no scoring; East remains East;
- East wins: East remains East;
- East loses: South becomes East;
- once every player has held and lost East, prevailing wind advances East → South → West → North;
- the source describes a complete game as four rounds.

This matches the existing classical/BMJA progression strategy closely enough to REUSE it, with Buzzard-specific golden fixtures.

The companion only needs the table's resolved outcome (`win` or `draw/dead hand`). It does not need to count physical wall tiles to decide whether the real table is dead.

## H. Standing Hand — scoring evidence, not simulated play

Source: PDF page 7 Rule 10.

A Calling player may declare Standing Hand after the source-defined first-turn point; the hand is then locked and a completed Standing Hand gains +100.

For the current product:

- rules/reference content should explain the declaration and lock requirement;
- the scorer needs only a `standingHand: true/false` scoring fact (or equivalent profile evidence field);
- the app does not need to monitor every subsequent draw/discard to police compliance.

Standing Hand remains distinct from BMJA `originalCall`.

## I. Liability and penalties — existing incident infrastructure with Buzzard policy

Source: PDF page 12 “ERRORS AND PENALTIES”.

### Dangerous discard / full-payment liability

If a player discards the tile that completes certain visibly dangerous special hands, that player pays the winner's losses on behalf of the other two players as well as their own. When this penalty is imposed, there is no loser-to-loser settlement.

Named source situations include:

- one-suit hand with three exposed Pungs;
- Three Dragon hand with two Dragon sets exposed;
- All Wind hand with three Wind sets exposed;
- Ones-and-Nines hand with three relevant sets exposed.

This is structurally very close to the existing OTB `cannon` settlement override. REUSE the incident/transaction pattern; CONFIGURE Buzzard's trigger labels and semantics. Because the companion is not watching discards, the table records that liability occurred and identifies the liable player.

### False Mahjong

If the player fully exposes an invalid Mahjong, they pay **double the limit to each of the other three players**. If the hand has not been completely exposed, the call may be withdrawn.

This is another profile-specific policy over the existing incident machinery.

### Incorrect tile count

Source: PDF page 7 Rule 12.

A hand with the wrong tile count is dead and cannot win. At settlement:

- too many tiles: player pays the others' scores without deducting their own;
- too few tiles: their own score is deducted first.

The current incident union already has an incorrect-hand concept; Buzzard needs its own settlement consequence rather than OTB's policy.

### Procedure-only errors

Wrong wall breach/deal and incorrect exposed combinations have procedural consequences in the source. These belong primarily in rules/reference content unless we later decide the Table Companion should explicitly record them.

## J. What we do **not** build for Buzzard v1

The source contains detailed physical-play procedure for wall construction, breach, Loose Tile replacement, claim timing/priority, Kong promotion and robbing, and Standing Hand restrictions.

Under the current Table Companion scope, do **not** build:

- wall/dead-wall simulator;
- draw/discard event log;
- real-time Chow/Pung/Kong legality enforcement;
- claim-priority arbitration;
- automated Standing-Hand lock enforcement;
- automatic dangerous-discard detection from a full discard history.

Keep those rules in reference/help content. Capture only the final facts needed to score and settle the real table.

## K. Implementation delta: “BMJA + / −”

This is the practical build model for #217.

### KEEP / REUSE

- tile/group model;
- ordinary Chow/Pung/Kong/pair points;
- Flowers/Seasons = 4 points each;
- +20 Mahjong and +2 self-draw;
- own/round Wind and Dragon doubles;
- mixed-one-suit and terminal/honour-family doubles;
- rob-Kong, last-wall and loose-tile event evidence/doubles;
- four-player winner/loser settlement;
- East payment doubling;
- East/seat/prevailing-wind progression;
- versioned profile/persistence/replay;
- transaction-based settlement;
- existing incident infrastructure shape.

### ADD

- +100 Standing Hand;
- +2 only-possible winning tile;
- +10 no Chows;
- +10 scoreless hand;
- +10 last-wall win;
- +10 Loose-Tile win;
- all-Chows + non-scoring-pair double;
- Buzzard limit-hand bindings;
- event evidence for East-first-discard / Original Hand / East 13th consecutive win;
- incomplete Four-Wind / Three-Dragon non-winner limit result;
- Buzzard liability/penalty policies.

### AMEND

- complete Flower/Season set = ×8 source rule, with cumulative-own-tile fixture explicitly pinned;
- pure one-suit ×8 predicate must allow Chows;
- configured table limit, with 600 as source example/default rather than universal constant.

### REMOVE / DO NOT INHERIT

- generic BMJA fully-concealed ordinary double;
- BMJA `originalCall` semantics;
- generic final-discard double unless independently source-backed for Buzzard;
- BMJA-only special-hand catalogue entries/values that are not in Buzzard.

## L. Readiness gate for #217

The source gate is now satisfied for a bounded implementation pass.

Before coding, turn the rows above into golden fixtures. The first implementation should be profile composition/policy over the existing classical engine, not a copied scorer.

The only remaining source-interpretation fixture that deserves explicit attention is cumulative Flower/Season doubling when a complete set also contains the player's own tile. Do not resolve that by silently inheriting BMJA behaviour.

## Product wording

> **British/Western Classical — Buzzard 2000**

Do not label this generic `Traditional Mahjong`, `Classical Mahjong` or universal `Western Mahjong`.