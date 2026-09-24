# MCR 2006 correctness corpus — completion audit

Status: **research-complete / executable-predicate handoff ready**\
Original research issue: #176\
Predicate-correction issue: #303\
Profile target: `mcr-wmo-2006@0.x`

Authority: World Mahjong Organization, *Mahjong Competition Rules*, first edition / first printing July 2006 (“Green Book”), English edition. The English edition states that a translation/different-understanding dispute is settled against the original Chinese edition; implementation must stop for source review rather than guess if such an ambiguity remains material.

## Purpose and correction history

This document audits whether engineering can implement the Mahjong Reference / Table Companion MCR profile without rediscovering or guessing the rules.

The product boundary remains:

```text
resolved physical hand + score-relevant context
→ lawful MCR score
→ settlement transactions
→ next table state
```

The original #176 audit correctly established source identity, the 81-fan index, evidence scope, interaction principles, qualification, settlement and progression. It was, however, too optimistic when it described the corpus as “implementation handoff ready”: the first bounded #299 preflight demonstrated that concise detector synopses were not sufficient to implement every detector and every positive fixture without rereading the source or making semantic choices.

Issue #303 corrects that gap. `MCR_DETECTOR_PREDICATES_2006.md` now provides the executable-predicate layer between the concise catalogue and runtime code.

Result: **the handoff claim is now predicate-ready, not merely catalogue-index ready.**

---

## 1. Source identity audit

Pinned authority:

- World Mahjong Organization, *Mahjong Competition Rules*;
- first edition / first printing July 2006;
- Green Book;
- repo source identity `source.mcr-ema-green-book-2006` / `mcr-ema` as already used by the profile corpus.

The source contains:

- the permitted winning structures in §3.7.2;
- the complete 81-fan table in §3.8.1;
- the five basic-point counting principles in §3.9.1;
- Appendix 1 definitions, examples and inclusion/exclusion notes;
- the explicit rule that the eight-point minimum excludes Flower points in §3.11.6.6.

A later formal edition must be a new profile/version and must not silently alter `mcr-wmo-2006`.

Result: **PASS**.

---

## 2. Catalogue and executable-predicate audit — 81 / 81 fan

`MCR_FAN_CATALOGUE_2006.md` remains the concise source-bound index. It records all 81 fan in formal order with stable binding ID, name, point value, evidence category and Green Book locator.

`MCR_DETECTOR_PREDICATES_2006.md` now adds, for every one of those 81 bindings:

- stage classification;
- implementation-ready predicate;
- required evidence;
- candidate-occurrence model;
- deterministic positive fixture recipe;
- detector-boundary notes;
- retained §3.8.1 / Appendix 1 locator.

It also pins the cases that blocked the first #299 attempt:

- the exact Reversible Tiles set;
- the `147 / 258 / 369` one-to-one knitted suit assignment;
- the Greater-vs-Lesser Honors and Knitted boundary;
- complete permitted irregular structures;
- pre-win reconstruction and exact Edge / Closed / Single Wait gates;
- repeated candidate occurrence identity;
- Chicken Hand as later fallback semantics;
- Flower Tiles as post-qualification bonus semantics.

Result: **PASS — 81/81 predicate contracts and 81/81 positive/correct-stage fixture recipes are now research-owned.**

---

## 3. Decomposition-ready evidence audit

The original evidence contract correctly required alternate lawful decompositions and wait reconstruction, but the first production input shape represented the hand as already-resolved groups. #302 corrected that substrate before detector implementation.

The source-facing runtime boundary is now:

```text
fixed declared groups
+ ungrouped free/concealed tile multiset
+ recorded winning tile
+ Flower count
+ separate trusted context
```

This permits:

- ordinary decomposition enumeration independent of UI grouping;
- irregular structure recognition;
- deterministic removal of one winning-tile occurrence to reconstruct the pre-win hand;
- physical multiplicity validation across fixed and free tiles;
- retained exposure state for melded groups and declared concealed Kongs.

Result: **PASS**.

---

## 4. Interaction / non-combination audit

MCR interaction remains deliberately split from detection.

### General §3.9.1 principles

The evaluator must implement:

1. Non-Repeat;
2. Non-Separation;
3. Non-Identical;
4. High-versus-Low;
5. Account-Once.

These cannot truthfully be reduced to a guessed pairwise exclusion matrix.

### Source-owned specific relationships

The catalogue/golden corpus retain named inclusion/exclusion rules for the high-risk families, including Wind/Dragon hierarchy, Chow/Pung/Kong hierarchy, concealed-hand hierarchy, terminal/honor composition, waits, replacement events, Last Tile, and Flowers.

The predicate corpus additionally preserves occurrence identity rather than deduplicating by binding ID. This is required by source examples that count some lower fan more than once.

One further source arithmetic rule is now explicitly pinned for #300: Appendix 1 #57 states that one melded Kong plus one concealed Kong scores six points. The predicate corpus records the representation needed to preserve that result without inventing an 82nd fan.

Result: **PASS for source contract; executable interaction closure remains intentionally owned by #300.**

---

## 5. Evidence completeness audit

Derivable from submitted hand evidence:

- ordinary and irregular winning structures;
- lawful decompositions;
- Chow/Pung/Kong/pair structure;
- exposure/concealment;
- suit/rank/Honor composition;
- Kong and concealed-Pung counts;
- shifted/double/triple set relationships;
- Tile Hog and All Types;
- wait candidates from reconstructed pre-win state.

Trusted tracked-game context supplies facts already known to the product, such as seat wind, prevailing wind and win source.

The deliberately small external evidence set is:

- resolved win source/event where not already known;
- whether the winning tile was the final visible copy when Last Tile is material;
- Flower count;
- seat/prevailing wind only when not already held by a tracked game.

No full wall, discard, claim, call or referee history is required.

Result: **PASS**.

---

## 6. Qualification, Chicken Hand and Flowers audit

The profile order remains:

```text
ordinary non-Flower candidate detection
→ interaction / lawful interpretation
→ Chicken Hand fallback where appropriate
→ non-Flower qualifying subtotal
→ require >= 8
→ Flower bonus
→ Basic Points
```

The Green Book false-Hu rule expressly excludes Flower points from the minimum eight points.

Therefore:

- Chicken Hand is not an ordinary shape detector;
- Flower Tiles never enter the non-Flower subtotal;
- Flowers cannot rescue a sub-eight hand.

Named golden fixtures protect both sides of the eight-point boundary.

Result: **PASS**.

---

## 7. Event and wait audit

The finite resolved-event model covers:

- Last Tile Draw;
- Last Tile Claim;
- Kong replacement;
- Flower replacement;
- Robbing the Kong.

Last Tile is separately represented by the final-visible-copy fact.

The predicate corpus now fixes wait derivation as a pre-win property:

1. remove one recorded winning tile;
2. enumerate all legal winning tile faces;
3. require the recorded face to be the sole winning face;
4. classify Edge / Closed / Single by the winning tile's role in each lawful candidate interpretation.

The player is never asked to choose a favourable wait label.

Result: **PASS**.

---

## 8. Settlement and progression audit

Settlement remains downstream of accepted Basic Points `B`.

### Discard win

```text
discarder -> winner: 8 + B
other loser -> winner: 8
other loser -> winner: 8
```

### Self-draw

```text
each loser -> winner: 8 + B
```

Ordinary Table Companion progression remains:

```text
after every completed hand: dealer passes
four dealer positions: prevailing wind advances
East → South → West → North
completion of fourth North dealer position: game complete
```

Tournament clocks, umpire penalties and post-session Table Points remain outside deterministic hand scoring.

Result: **PASS**.

---

## 9. Correctness corpus coverage

The implementation-facing source contract is now:

1. `MCR_PROFILE_CROSSWALK.md` — profile boundary and implementation sequence;
2. `MCR_FAN_CATALOGUE_2006.md` — stable 81-fan index;
3. `MCR_DETECTOR_PREDICATES_2006.md` — 81/81 executable predicates, occurrence rules and positive fixture recipes;
4. `MCR_SCORE_EVIDENCE_CONTRACT.md` — minimum scorer/table evidence and product boundary;
5. `MCR_GOLDEN_FIXTURES_2006.md` — named integration/regression oracles;
6. this audit — research-handoff completeness check.

The previous statement that per-binding positive fixtures were merely an engineering test-generation task is superseded. The **test code** remains engineering work; the expected predicate and deterministic positive-fixture recipe are now part of the research contract.

Result: **PASS**.

---

## 10. Handoff decision

The source-research blocker exposed by the first #299 attempt is closed by #303.

Engineering may restart #299 only after this corrected corpus is reviewed and merged. #299 may implement candidate detection/evidence/decomposition from the pinned contracts, but it must still stop rather than guess if a real contradiction appears.

#300 remains responsible for the five counting principles, source-owned combination/suppression closure, Chicken Hand final fallback, highest-lawful interpretation, qualification and golden scoring closure.

No MCR runtime detector code is introduced by this research correction.

Any future discovery that changes scoring semantics must identify the source/version, update the corpus deliberately, and change the executable semantic revision/profile fingerprint where required by the rules platform.
