# Buzzard 2000 British/Western Classical — compatibility crosswalk

Status: **implementation-preparation / source-backed crosswalk**  
Issue: #175  
Source profile: Jonathan Buzzard, *Mah-Jongg: the Game and How To Play It*, last modified 30 March 2000  
Working source ID: `buzzard-2000-classical`

## Conclusion

Buzzard 2000 is a **good adjacent-profile candidate**, but it is not merely another catalogue file.

The current platform already provides much of the right low-level shape:

- four players and wind seats;
- versioned `RulesProfileRef`;
- classical Chow/Pung/Kong/pair tile representation;
- exposed/concealed sets;
- Flowers/Seasons;
- win-source evidence including discard, wall, loose/replacement tile, last wall/discard and robbing Kong;
- classical points/doubles/special-hand machinery;
- non-winner scores;
- transaction-based settlement;
- dealer/East + prevailing-wind progression as a strategy.

However, a faithful Buzzard profile requires several **game-state/procedure extensions** that must remain profile-local: Standing Hand, a 14-tile dead-wall/Loose Tile lifecycle, source-specific claim priority, dangerous-discard liability, incomplete limit achievements, and penalty semantics.

Therefore:

> **Buzzard should reuse the classical scoring platform, but receive its own profile scoring policy, progression/procedure strategy and liability/settlement policy. Do not fork the application or duplicate the whole scorer.**

## Current-code baseline inspected

The current implementation already separates useful concerns:

- `RulesProfileRef { id, version }` is persisted in `GameSetup`;
- `GameRuleset` supplies `scoreHand`, `settleRound`, `progressGame` and optional `prepareRound`;
- `MahjongHand` separates structural sets/tiles from contextual scoring;
- settlement emits explicit payer→payee transactions;
- local persistence reconstructs a game by replaying stored setup + round inputs.

Current limitations relevant to Buzzard:

- `HandOutcome` currently supports only one winner or draw;
- `HandMode` is currently `normal | goulash` and is not a generic declaration/state system;
- incidents are a fixed union primarily shaped by BMJA/Outside-the-Box;
- settlement transaction reasons and `eastMultiplier` are currently classical/BMJA-specific;
- current hand evidence has `originalCall`, but not a locked Standing Hand declaration/lifecycle;
- current game state does not model wall/dead-wall/replacement-tile inventory.

## Compatibility matrix

| Buzzard domain | Current platform fit | Decision |
|---|---|---|
| 4 players / seat winds | Direct | Reuse |
| Prevailing wind | Direct primitive | Reuse, but verify Buzzard progression strategy independently |
| 13/14-tile ordinary hand structure | High | Reuse structural primitives |
| Chow/Pung/Kong/pair | High | Reuse |
| exposed/concealed set state | High | Reuse |
| Flowers/Seasons | High | Reuse basic tile metadata; value/event policy is profile-specific |
| classical intrinsic points | High grammar fit | Reuse scorer primitives through Buzzard bindings/policy after transcription |
| additive bonuses then doubles then limit | High grammar fit | Reuse/extend classical calculation pipeline, source-bind exact order/tests |
| special hands | High registry fit | Reuse canonical predicates where structurally verified; profile-local names/values/eligibility |
| last-wall/replacement/rob-Kong win evidence | Existing evidence categories exist | Reuse event primitives after exact semantic verification |
| loser hand scores | Current round input already stores all players' scores | Reuse |
| pairwise loser-to-loser settlement | Current BMJA engine structurally close | Reuse settlement infrastructure, not automatically the BMJA formula |
| East payment multiplier | Existing settlement field | Reuse only if source crosswalk confirms exact semantics |
| East retains after East win | Current BMJA progression matches | Reuse strategy only after exact source verification |
| East retains after dead hand | Current BMJA progression matches | Reuse strategy only after exact source verification |
| non-East win rotates dealer | Current BMJA progression structurally matches | Reuse/verify |
| Standing Hand | Missing | **Build profile-local declaration/state** |
| locked discard behaviour after Standing declaration | Missing | **Build legality/state transition** |
| +100 Standing Hand reward | Scoring can add points, but declaration evidence missing | Add Buzzard scoring rule over Standing state |
| 14 tiles remain unused / dead wall | Missing table-state concept | **Build profile-owned wall/dead-wall state when full playable support begins** |
| Loose Tiles/replacements | win method exists, inventory lifecycle does not | Extend shared event/table primitives; Buzzard strategy owns semantics |
| claim priority including timing | not represented in final score/game ledger | Build only to degree Table Companion actively tracks claims; reference otherwise |
| multiple simultaneous win claims resolved by turn priority | current outcome is single-winner, which matches resolved result but not claim event | Store resolved winner for scoring; add claim-event evidence only if enforcing table procedure |
| promoted Kong can be robbed | win event exists | Reuse after source binding |
| concealed Kong cannot be robbed | current generic event model does not encode legality | Buzzard legality rule |
| incomplete Four Wind / Three Dragon limit achievements | current scoring assumes player hand records, but special result can be independent of winner | Extend profile scoring result/record semantics; do not assume `limit => winner` |
| dangerous-discard liability | OTB has a cannon-style incident but shape is club-specific | Extract/generalize liability evidence only if semantics genuinely shared; Buzzard gets own trigger policy |
| liability suppresses loser-to-loser settlement | current settlement can be replaced per profile | Buzzard settlement policy |
| penalties / dead hands / false Mahjong | fixed incident union is insufficient | Profile-owned procedure incidents or generic tagged procedure-event envelope |

## What can probably be implemented with little new scoring code

The **hand-value grammar** is the strongest reuse area.

A future Buzzard scorer should aim to compose:

```text
shared tile/group model
+ canonical structural predicates
+ classical intrinsic-point rules
+ Buzzard bonus/double/special bindings
+ Buzzard limit policy
= Buzzard hand value
```

Do not duplicate BMJA's entire `scoreHand`. Extend the classical scorer only where Buzzard exposes a real grammar difference.

Before code, transcribe the source into stable rule bindings for:

- set/pair point values;
- Flowers/Seasons;
- winner bonuses;
- doubles;
- special/limit hands;
- calculation order;
- exposure/concealment effects.

## What is genuinely new product behaviour

### Standing Hand

Do **not** map Standing Hand to current `originalCall`.

The source describes a later declaration after initial play which locks future hand changes and changes scoring. It therefore needs its own state, conceptually:

```text
standingHand?: {
  declared: true
  declaredAtTurnOrDiscard: ...
  locked: true
}
```

The exact persisted shape can be chosen during implementation, but the semantic distinction is fixed.

### Dead-wall / Loose Tile lifecycle

The current game can score a win identified as `loose-tile`, but it does not know whether the table has reached the final 14 unused tiles or which replacement tiles remain.

For a hand calculator, final-event evidence may be enough.

For a **fully playable Table Companion**, Buzzard needs a profile-owned hand/table snapshot capable of answering:

- how many live-wall tiles remain;
- whether a replacement Loose Tile was created/drawn;
- whether the source's final 14-tile boundary has been reached;
- whether the deal ends as a dead hand.

This should not be forced into the ordinary `MahjongHand` tile grouping object.

### Liability

Represent liability as a settlement-routing fact, not a modified hand score.

A future generic liability event should be able to identify:

- liable player;
- beneficiary/winner;
- rule trigger ID;
- whether liability replaces other payers or supplements them;
- source/profile provenance.

Buzzard's dangerous-discard rule then becomes one policy over that evidence.

## Proposed first profile identity

Do not create the production identity until the remaining scoring transcription is complete.

Working engineering identity:

```text
buzzard-2000-classical@0.x
```

Final public label should retain both provenance and family, for example:

> British/Western Classical — Buzzard 2000

Never expose this as generic `Traditional Mahjong` or universal `Western Mahjong`.

## Implementation order

1. source-register entry + rule IDs/locators;
2. scoring-table/doubles/special-hand transcription;
3. golden hand-value fixtures;
4. provisional profile using existing classical scorer where possible;
5. Buzzard settlement/progression fixtures;
6. Standing Hand state;
7. dead-wall/Loose Tile lifecycle for full-table support;
8. dangerous-discard liability and penalties;
9. cross-profile regression;
10. real-player/source review before public `playable` status.

## Build-size judgement

Buzzard is **not** a new scoring engine family.

Expected engineering shape:

- low-to-medium work for hand scoring once source facts are fully transcribed;
- medium work for full playable table semantics because Standing Hand/dead-wall/liability are genuine new state.

This makes Buzzard a sensible first architecture stress test before MCR or Riichi.

## Remaining evidence gaps before implementation

The issue/source capture is sufficient to establish architecture, but implementation still needs exact locators for:

- all ordinary point values and doubles;
- Flowers/Seasons scoring details;
- complete special-hand values/conditions;
- exact settlement/East multipliers;
- exact dangerous-discard triggers;
- full dealer/round progression text;
- all penalty/dead-hand consequences.

Unknowns stay unknown. Do not fill them from BMJA simply because the grammar is similar.

## Promotion gate

Open a bounded implementation issue only when the crosswalk has enough exact source locators to tell Codex which mechanics are:

- **REUSE** existing classical primitives;
- **CONFIGURE** Buzzard values/bindings;
- **ADAPT** settlement/progression/liability;
- **BUILD** Standing/dead-wall/procedure state.
