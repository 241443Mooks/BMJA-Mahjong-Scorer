# MCR 2006 correctness corpus — completion audit

Status: **research-complete / implementation handoff ready**  
Issue: #176  
Profile target: `mcr-wmo-2006@0.x`  
Authority: WMO *Mahjong Competition Rules*, first edition / first printing July 2006 (Green Book), distributed/referenced by EMA as the detailed MCR rules authority.

## Purpose

This document closes the pre-code research gate for the Mahjong Reference / Table Companion MCR profile.

The product boundary is deliberately narrow:

```text
resolved physical hand + score-relevant context
→ lawful MCR score
→ settlement transactions
→ next table state
```

Mahjong Reference does not simulate the wall, turns, claims, calls or referee procedure. It records only physical-table facts that can change scoring, settlement or progression.

The question for #176 is therefore not “have we modelled every action in MCR?” It is:

> Can engineering implement a deterministic MCR scorer/game recorder without having to rediscover the rules?

The answer after this audit is **yes**.

---

## 1. Source identity audit

Pinned authority:

- World Mahjong Organization, *Mahjong Competition Rules*;
- first edition / first printing July 2006;
- Green Book;
- English edition distributed/referenced by the European Mahjong Association;
- repo source ID `mcr-ema`.

The EMA MCR page continues to identify the 2006 Green Book as the detailed MCR rules source.

A later formal rules edition must become a new profile/version. It must not silently alter `mcr-wmo-2006` games.

Result: **PASS**.

---

## 2. Catalogue audit — 81 / 81 fan

`MCR_FAN_CATALOGUE_2006.md` contains all 81 fan in formal order.

Every binding records:

- stable project ID;
- MCR fan name;
- point value;
- independent detector synopsis;
- minimum evidence category;
- Green Book locator.

The catalogue therefore supplies the complete source-bound data contract from 88-point fan down to 1-point fan and Flower Tiles.

Research does **not** require 81 separately hand-authored example hands. Engineering acceptance does require positive detector coverage for every binding when the scorer is implemented.

Result: **PASS**.

---

## 3. Interaction / non-combination audit

MCR interaction is intentionally represented in two layers rather than as a guessed 81×81 exclusion matrix.

### Layer A — general counting principles

Green Book §3.9.1 defines five evaluator-wide principles:

1. Non-Repeat;
2. Non-Separation;
3. Non-Identical;
4. High-versus-Low;
5. Account-Once.

These govern interactions that cannot be truthfully represented as simple pairwise `cannotCombineWith` metadata.

### Layer B — source-owned fan-specific relationships

The catalogue separately records fan-specific inclusion/exclusion/event rules where the formal fan definition adds a special relationship.

The explicit interaction transcription covers the high-risk families including:

- Wind / Dragon hierarchy;
- concealed-hand hierarchy;
- Pung / Kong hierarchy;
- pair / irregular-hand implication rules;
- Chow hierarchy and repeated-pattern counting;
- flush / terminal / simple / honor composition implications;
- wait restrictions;
- Last Tile Draw / Self-Drawn;
- replacement-tile distinctions;
- Robbing the Kong / Last Tile;
- Melded Hand / Single Wait;
- Flowers after qualification.

The unusual formal wording around fan 14 (Quadruple Chow) and fan 15 (Four Pure Shifted Pungs) has been explicitly treated as source-owned rather than “corrected” from English pattern names. General Non-Repeat still applies independently to structurally implied lower fan.

No remaining interaction is marked `research-required` for the scorer handoff. If implementation exposes a contradiction with the pinned source, it returns to source review rather than being guessed in code.

Result: **PASS**.

---

## 4. Evidence completeness audit

`MCR_SCORE_EVIDENCE_CONTRACT.md` proves that most of the apparent complexity is derivable from the submitted hand.

### Derivable from tile/group evidence

Includes:

- winning structure;
- legal decompositions;
- Chow/Pung/Kong/pair structure;
- exposure/concealment;
- suit/rank/honor composition;
- ordinary and irregular structural fan;
- Kong and concealed-Pung counts;
- shifted/double/triple set relationships;
- Tile Hog;
- waits reconstructed from the pre-win state when the winning tile is known.

### Trusted tracked-game context

Includes:

- player identity;
- seat wind;
- prevailing wind;
- current dealer;
- discarder identity for a discard win;
- profile/version.

### Small external evidence set

Only facts not safely derivable or already held by the game need confirmation:

- discard vs self-draw;
- winning tile;
- finite special win event where applicable;
- whether the winning tile was the last visible copy of that tile kind;
- Flower count;
- seat / prevailing wind only for standalone scoring when no tracked-game context exists.

No general wall/discard/call history is required.

Result: **PASS**.

---

## 5. Qualification and Flowers audit

The corpus separates:

```text
non-Flower qualifying fan subtotal
→ require >= 8
→ then add Flower points
→ Basic Points
```

This prevents Flower Tiles from rescuing an otherwise sub-eight Hu.

Golden fixtures include both:

- a seven-point non-Flower hand with Flowers that remains illegal;
- an exactly-eight non-Flower hand where Flowers then increase Basic Points.

Chicken Hand is also pinned as an 8-point fallback only when no other ordinary non-Flower fan exists.

Result: **PASS**.

---

## 6. Event scoring audit

Named fixture coverage exists for every distinct external-event mechanism needed by the product boundary:

- Last Tile Draw;
- Flower replacement;
- Kong replacement;
- Robbing the Kong;
- Last Tile as final visible copy;
- Edge / Closed / Single Wait derivation.

The product records the **resolved event**, not the live procedure that produced it.

Result: **PASS**.

---

## 7. Settlement audit

The scorer emits accepted Basic Points `B`; settlement consumes the accepted result without recalculating fan.

Pinned cases:

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

Golden fixtures include positive discard/self-draw cases, Flowers affecting accepted Basic Points, and an illegal sub-eight hand emitting no ordinary win settlement.

No East multiplier and no British loser-to-loser difference settlement.

Result: **PASS**.

---

## 8. Progression / game-end audit

For the ordinary Table Companion profile:

```text
after every completed hand: dealer passes
four dealer positions: prevailing wind advances
East → South → West → North
completion of fourth North dealer position: game complete
```

Fixture coverage includes:

- East wins;
- non-East wins;
- draw / no winner;
- round transition;
- final game completion.

Winner identity does not cause dealer retention.

Tournament clocks and post-session ranking/Table Points are outside ordinary game progression.

Result: **PASS**.

---

## 9. Procedure / penalty scope audit

The Green Book contains tournament procedure and penalties, but Mahjong Reference is not an automatic referee.

Therefore the deterministic scorer does not require:

- claim priority history;
- call timing;
- wall position;
- foul detection history;
- umpire identity/decision process;
- tournament clock.

A future tournament feature may record an already-decided adjustment as a separate manual/profile-owned transaction with provenance. It is not inferred from the final hand.

Result: **PASS / deliberately out of automatic scorer scope**.

---

## 10. Golden fixture coverage audit

`MCR_GOLDEN_FIXTURES_2006.md` covers the distinct behaviour families engineering must preserve:

| Behaviour family | Coverage |
|---|---|
| source-owned fan interaction | yes |
| general Non-Repeat / interpretation policy | yes |
| irregular / special structures | catalogue contract + implementation detector gate |
| alternate decomposition | evaluator/property-test gate |
| exactly-eight qualification | yes |
| sub-eight failure | yes |
| Flowers after qualification | yes |
| Chicken Hand fallback | yes |
| self-draw / discard context | yes |
| special winning events | yes |
| Last Tile | yes |
| wait derivation | yes |
| discard settlement | yes |
| self-draw settlement | yes |
| illegal-win settlement suppression | yes |
| dealer always passes | yes |
| draw progression | yes |
| round transition | yes |
| four-round game end | yes |
| missing external evidence fails closed | yes |
| tournament penalty excluded from fan arithmetic | yes |

The remaining requirement “positive detector fixture for every one of the 81 bindings” is an **engineering test-generation requirement**, not missing Mahjong research. The source-bound expected definition/value already exists for all 81.

Result: **PASS for research handoff**.

---

## 11. Handoff decision

Issue #176 has met its research completion definition.

Engineering can now proceed without reconstructing MCR research from scratch, once the shared rules-platform prerequisites are available.

The implementation contract is:

1. `MCR_PROFILE_CROSSWALK.md` — profile boundary and implementation sequence;
2. `MCR_FAN_CATALOGUE_2006.md` — all 81 source-bound fan;
3. `MCR_SCORE_EVIDENCE_CONTRACT.md` — minimum scorer/table evidence;
4. `MCR_GOLDEN_FIXTURES_2006.md` — regression oracles;
5. this audit — proof that research scope is closed rather than merely paused.

No MCR runtime code is introduced by #176.

Any future discovery that changes scoring semantics must identify the source/version, update the corpus deliberately, and change the executable semantic revision/profile fingerprint as required by the rules platform.