# Mahjong Time European Classical — external V1 configuration stress test

Status: **external paper validation of `ClassicalProfileConfigV1`**  
Date checked: **16 September 2026**  
Related design: `CLASSICAL_PROFILE_CONFIG_MATRIX.md`, `CLASSICAL_PROFILE_CONFIG_V1.md`, `CLASSICAL_PROFILE_CONFIG_EXAMPLES.md`  
Implementation issue: **#219**

## 1. Purpose

This is deliberately a **blind fifth-profile test**.

The V1 Classical/Western configuration model was derived from BMJA, provisional Thompson & Maloney Western, Outside the Box and Buzzard 2000. Mahjong Time's European Classical implementation was **not** used to design that model.

The test question is therefore:

> Can an independently encountered Classical/Western-adjacent rules profile be expressed through the already-designed V1 vocabulary without inventing another scorer or redesigning the abstraction around it?

This document does **not** propose Mahjong Time as a canonical authority for all European Classical Mahjong. It tests the architecture against a concrete published implementation.

## 2. Source status and boundaries

Primary source set used for this paper test:

- https://www.mahjongtime.com/mahjong-game-info.html
- https://www.mahjongtime.com/european-classical-mahjong-rules.html
- https://www.mahjongtime.com/european-classical-mahjong-rules-2.html
- https://www.mahjongtime.com/european-classical-mahjong-rules-3.html
- https://www.mahjongtime.com/european-classical-mahjong-rules-4.html
- https://www.mahjongtime.com/european-classical-mahjong-scoring.html
- https://www.mahjongtime.com/european-classical-mahjong-scoring-3.html

Mahjong Time describes this ruleset as based on classical Chinese Mah Jong and calls it **European Classical Mahjong**. For Mahjong Reference provenance it should be treated as a **named secondary/implementation source**, not as proof that every European Classical table uses these rules.

The site's scoring page 2 (`european-classical-mahjong-scoring-2.html`) could not be retrieved during this pass. Where that missing page may contain Flower/Season scoring detail, this test records **unknown** rather than importing values from BMJA, Buzzard or another source.

## 3. Classification key

- **DIRECT FIT** — existing V1 value/selector/preset shape can express the rule.
- **EXISTING CAPABILITY — SEMANTIC CHECK** — current vocabulary appears to contain the right concept, but exact predicate/event equivalence must be proven before binding it.
- **NEW REUSABLE RULE** — real source evidence exposes a scoring concept absent from V1; add the smallest reusable primitive once.
- **NEW FINITE PRESET/OPTION** — the config architecture is correct, but a real second enum/preset value is now justified.
- **SOURCE UNCERTAIN** — the available source set does not establish the value/semantics safely.
- **OUT OF PRODUCT SCOPE** — physical-play procedure belongs in rules/reference content, not the scoring/table companion runtime.

## 4. Ordinary points and additive bonuses

Mahjong Time's published table uses the same ordinary Classical point skeleton already identified across the existing profiles.

| Source rule | Mahjong Time value | V1 mapping | Result |
|---|---:|---|---|
| Pung of simples, exposed / concealed | 2 / 4 | `points.pung.minor` | **DIRECT FIT** |
| Pung of terminals/Winds/Dragons, exposed / concealed | 4 / 8 | `points.pung.major` | **DIRECT FIT** |
| Kong of simples, exposed / concealed | 8 / 16 | `points.kong.minor` | **DIRECT FIT** |
| Kong of terminals/Winds/Dragons, exposed / concealed | 16 / 32 | `points.kong.major` | **DIRECT FIT** |
| pair of own Wind / round Wind / Dragon | 2 | `points.pairs.*` | **DIRECT FIT** |
| going out | +20 | `points.mahjong` | **DIRECT FIT** |
| self-drawn last tile | +2 | `points.selfDrawLiveWall` | **DIRECT FIT** |
| concealed hand | +10 | no current additive concealed-hand field | **NEW REUSABLE RULE** |
| out on pair | +2 | set both `bonuses.completedPairMinor` and `bonuses.completedPairMajor` to `2` | **DIRECT FIT** |
| out on one-chance Chow | +2 | close to `onlyPossibleTile`, but source semantics are narrower and structural | **EXISTING CAPABILITY — SEMANTIC CHECK** |

### Finding: concealed-hand points

V1 currently models a **concealed-hand double**, including eligibility variants, but not an **additive concealed-hand point award**.

Mahjong Time independently demonstrates that those are separate scoring dimensions: its page lists `Concealed hand 10` as a bonus-point rule and separately lists `Fully concealed hand x1` in the winner-only doubles section.

The smallest reusable addition is therefore conceptually:

```text
bonus.concealed-hand: number
```

This is exactly the kind of numeric rule the V1 model is intended to absorb; it does not justify profile-specific scorer code.

### Finding: one-chance Chow is not automatically Buzzard `onlyPossibleTile`

Mahjong Time explicitly gives +2 for going out on a one-chance Chow and gives examples of edge/closed Chow waits. Buzzard's source-backed V1 candidate is a broader `onlyPossibleTile` scoring fact.

Do **not** merge these rules by label alone.

Before #219 generalises the predicate, determine whether the existing evidence model can safely express both through one stable wait predicate with profile-local eligibility, or whether Classical V1 needs a narrower registered predicate/evidence ID such as a one-chance-Chow wait.

This is a predicate/evidence question, not a reason to add a bespoke Mahjong Time scorer.

## 5. Doubles

| Source rule | Mahjong Time | V1 mapping | Result |
|---|---:|---|---|
| Pung/Kong of own Wind | x2 | `doubles.ownWindSet = 1` | **DIRECT FIT** |
| Pung/Kong of round Wind | x2 | `doubles.prevailingWindSet = 1` | **DIRECT FIT** |
| Pung/Kong of Dragon | x2 | `doubles.dragonSet = 1` | **DIRECT FIT** |
| fully concealed winning hand | x2 | `doubles.concealedHand` | **DIRECT FIT** |
| Chow hand, no Pungs/Kongs/value pair | x2 | `doubles.allChowsNonScoringPair = 1` | **DIRECT FIT** |
| Pung hand / no Chows | x2 | `doubles.noChows = 1` | **DIRECT FIT** |
| all terminals and honours | x2 | `doubles.allMajors = 1` | **DIRECT FIT** |
| one suit + honours | x2 | `doubles.mixedOneSuitHonours = 1` | **DIRECT FIT** |
| one suit only | x8 | `pureSuit.predicateId = pure-suit-any-standard-meld`, `doubles = 3` | **DIRECT FIT** |
| win on last wall tile | x2 | `doubles.winningMethod.lastWall = 1` | **DIRECT FIT** |
| win on last discard | x2 | `doubles.winningMethod.finalDiscard = 1` | **DIRECT FIT** |
| win on supplement tile | x2 | likely existing Classical loose/supplement-tile event family | **EXISTING CAPABILITY — SEMANTIC CHECK** |
| robbing the Kong | x2 | `doubles.winningMethod.robKong = 1` | **DIRECT FIT** |

### Architecture result

Two rules that Buzzard helped expose before implementation — `allChowsNonScoringPair` and the broader pure-suit predicate that permits Chows — are immediately reused by this previously unseen profile.

That is strong evidence that those additions are reusable Classical vocabulary rather than Buzzard-specific accommodation.

### Supplement tile caution

Mahjong Time defines supplement tiles through its replenishing Dead Wall procedure. The current V1/Buzzard vocabulary uses a Classical `looseTile` winning-method concept.

The two look closely related, but exact eligibility must be checked before assigning the same stable rule ID, especially because Mahjong Time also allows Flowers/Seasons to draw replacements from the Dead Wall.

## 6. Limit hands and canonical-pattern binding

Mahjong Time lists these as 500-point limit hands:

1. All Green;
2. Four Kongs;
3. Hidden Treasure;
4. Three Great Scholars;
5. Big Four Winds;
6. Little Four Winds;
7. All Honours;
8. All Terminals;
9. Nine Gates;
10. Thirteen Orphans;
11. Heavenly Hand;
12. Earthly Hand.

The **configuration architecture fits without change**:

```text
canonical pattern detector
+ profile-local enabled binding
+ local name
+ configured-limit score model
+ provenance
```

Several patterns already have strong canonical candidates in `SPECIAL_HANDS_PROVENANCE.md`, including Thirteen Orphans, Nine Gates, Three Great Scholars, Big Four Winds/Four Blessings, Four Kongs/Fourfold Plenty, Heavenly Hand and Earthly Hand.

However, pattern identity must still be proven structurally, not by name. In particular:

- `All Green` ↔ existing green-family patterns needs predicate comparison;
- `Hidden Treasure` ↔ Buried Treasure needs exact concealed/exposure comparison;
- `All Honours` needs exact canonical predicate comparison;
- `All Terminals` needs exact canonical predicate comparison;
- Little Four Winds should bind to a canonical structural pattern rather than be inferred from the display name.

These are normal catalogue/provenance tasks. They do **not** expose a missing configuration concept.

## 7. Limit value and settlement

Mahjong Time states that its listed limit hands have a **500-point base value**.

It then gives the expected Classical East multiplier:

- East winner: each opponent pays 1000;
- non-East winner: East pays 1000 and the other two opponents pay 500.

It also explicitly states that losers settle score differences among themselves, with East doubling applying to those transactions.

V1 mapping:

```text
limit.default = 500
settlement.preset = classical-pairwise
settlement.loserToLoser = true
settlement.eastMultiplier = 2
```

Result: **DIRECT FIT**.

For this named Mahjong Time implementation, 500 is source-backed. This does not make 500 a universal European Classical limit.

## 8. Flowers / Seasons

The rules pages explicitly support either:

- 144 tiles including Flowers and Seasons; or
- 136 tiles without Flowers and Seasons.

That maps naturally to the existing `bonusTiles.enabled` concept and to future base-profile overrides.

Result: **DIRECT FIT for enable/disable**.

The retrieved scoring source did not establish the Flower/Season point/double values because scoring page 2 was unavailable during this pass.

Result for Flower/Season scoring values: **SOURCE UNCERTAIN**.

Do not fill those fields by inheritance from BMJA/Buzzard merely because the rest of the ordinary point table looks familiar.

## 9. Progression — genuine new finite option

This is the clearest external pressure test result.

Mahjong Time says:

- seating winds rotate after **each hand**;
- seating winds also rotate after a **dead hand**;
- there are four prevailing-wind rounds: East, South, West and North;
- the full game contains **16 hands**.

That is materially different from the current `classical-east-cycle` preset used by BMJA/Buzzard, where East retention depends on the hand outcome.

V1 already made progression a registered finite preset rather than an arbitrary program:

```text
progression: {
  preset: 'classical-east-cycle'
}
```

The external test therefore does **not** require a new progression architecture. It just proves that the enum needs a second real value when this profile is implemented, conceptually something like:

```text
'rotate-every-hand-four-round'
```

Exact naming should be chosen during implementation.

Classification: **NEW FINITE PRESET/OPTION**.

This is a positive validation of the V1 design: the abstraction anticipated finite strategy variation before this fifth profile was examined.

## 10. Physical-play rules remain out of runtime scope

Mahjong Time documents detailed procedure for:

- wall construction and breach;
- a replenishing 14-tile Dead Wall;
- supplement-tile draws;
- Chow/Pung/Kong claim priority;
- competing win claims;
- Kong declaration and promotion;
- exposed/concealed Kong handling.

These are valuable reference/help facts, but under the current Mahjong Reference product boundary they do not justify building a simulator or claim arbiter.

Classification: **OUT OF PRODUCT SCOPE for scoring runtime**, except where a final resolved fact such as `supplement-tile win` is needed for scoring.

## 11. Paper profile sketch

This is deliberately incomplete where the source is incomplete. It is an architecture test, not a publishable profile.

```text
identity:
  id: mahjong-time-european-classical
  family: classical-western
  status: provisional/secondary-source implementation profile

limit:
  default: 500

points:
  ordinary Pung/Kong/pair table: classical-standard
  mahjong: 20
  selfDrawLiveWall: 2
  Flower/Season scoring: SOURCE CHECK REQUIRED

bonuses:
  concealedHand: 10                  # NEW reusable numeric rule
  completedPairMinor: 2
  completedPairMajor: 2
  oneChanceChow / onlyPossibleTile: SEMANTIC CHECK REQUIRED

doubles:
  ownWindSet: 1
  prevailingWindSet: 1
  dragonSet: 1
  concealedHand: 1
  allChowsNonScoringPair: 1
  noChows: 1
  allMajors: 1
  mixedOneSuitHonours: 1
  robKong: 1
  lastWall: 1
  finalDiscard: 1
  supplement/looseTile: SEMANTIC CHECK REQUIRED

pureSuit:
  predicateId: pure-suit-any-standard-meld
  doubles: 3

specialHands:
  12 source-local configured-limit bindings

bonusTiles:
  enabled: source permits true or false
  scoring values: SOURCE CHECK REQUIRED

settlement:
  preset: classical-pairwise
  loserToLoser: true
  eastMultiplier: 2

progression:
  preset: NEW finite rotate-every-hand / four-round strategy
```

## 12. Stress-test result

### What survived unchanged

The V1 structural model cleanly accommodates:

- the ordinary Pung/Kong/pair table;
- ordinary winner points;
- pair-completion points;
- almost all ordinary doubles;
- independent winning-method doubles;
- concealed-hand double eligibility;
- all-Chows/no-value-pair scoring;
- no-Chows scoring;
- all-major and mixed-one-suit scoring;
- broad pure-suit scoring;
- configurable limit value;
- East multiplier;
- loser-to-loser settlement;
- optional bonus-tile use;
- canonical special-hand detector + profile binding architecture;
- configured-limit special-hand treatment;
- finite progression strategy selection.

### Definite new reusable vocabulary

Only one ordinary scoring concept is definitely absent from the current V1 paper contract:

```text
bonus.concealed-hand: number
```

### Needs semantic resolution, not architecture redesign

Two source concepts need predicate/event comparison before reuse:

1. one-chance Chow +2 vs the current `onlyPossibleTile` concept;
2. supplement-tile win vs the current Classical `looseTile` event concept.

If either is structurally different, add the smallest new registered predicate/evidence ID once.

### One newly justified finite option

Progression needs a second registered preset for rotate-every-hand / fixed four-round play.

No arbitrary progression DSL or bespoke profile function is justified.

### Source gap

Flower/Season scoring values remain unknown in this source pass because one Mahjong Time scoring page could not be retrieved. Do not invent them.

## 13. Conclusion for #219

**The external test supports the V1 architecture.**

Mahjong Time European Classical was not part of the design sample, yet it is overwhelmingly expressible through the same data/configuration model.

Most importantly:

- Buzzard-driven reusable additions are already reused by the fifth profile;
- the first new profile does not demand a scorer fork;
- the main new scoring discovery is another simple numeric rule;
- the progression difference is exactly the kind of finite preset V1 anticipated;
- remaining uncertainty is predicate/source verification, not a conceptual failure of the model.

### #219 implementation note

Do **not** expand #219 into a Mahjong Time implementation.

Before/during the Buzzard configuration refactor, Codex should merely preserve room for these findings:

1. do not hard-code `progression.preset` as if `classical-east-cycle` were the only possible Classical strategy;
2. make the ordinary rule registry capable of adding numeric rules such as `bonus.concealed-hand` without profile-specific callbacks;
3. keep wait/event predicates behind stable IDs so `onlyPossibleTile` and supplement/Loose-Tile semantics can be refined without changing the config architecture;
4. keep special-hand identity separate from profile-local naming/value so the Mahjong Time catalogue can later bind to canonical patterns after predicate verification.

The implementation proof remains Buzzard. This fifth-profile test is evidence that the abstraction should remain small and registry-backed rather than becoming a universal rules DSL.
