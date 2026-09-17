# MCR scoring evidence contract

Status: **source-linked pre-implementation contract**  
Issue: #176  
Target profile: `mcr-wmo-2006@0.x`  
Authority: World Mahjong Organization, *Mahjong Competition Rules*, first edition / first printing July 2006 (“Green Book”), English edition distributed by the European Mahjong Association (`mcr-ema`).

## Product boundary

Mahjong Reference is **not an MCR gameplay referee or simulator**.

It scores a physical hand after the table has resolved what happened, records the resulting payments, and advances the game state. It does not need to enforce draw order, claim timing, wall building, Chow/Pung/Kong priority, replacement-tile procedure, false calls, or tournament etiquette in real time.

A physical-table fact belongs in scorer evidence only when it can change:

1. whether the submitted winning hand qualifies for a fan;
2. the lawful Basic Points total;
3. discard-vs-self-draw payment routing; or
4. dealer / prevailing-wind / game progression after the recorded hand.

Tournament penalties and referee decisions are separate from deterministic hand scoring. If the product later records one, it should be a manual/profile-owned score adjustment with provenance, not something inferred from tile entry.

## Source anchors

The implementation-facing Green Book anchors are:

- §3.4.2–3.4.8 — hand/round/game, prevalent wind, seat wind and dealer identity/progression;
- §3.4.22–3.4.24 — valid win, self-draw and discard win;
- §3.6.2 — dealer/dice move after the hand ends;
- §3.7.2 — permitted ordinary and irregular winning structures and the two win methods;
- §3.8 / §3.8.1 — 81 fan catalogue;
- §3.9.1 — 8-point qualification, Basic/Extra/Penalty Points, settlement and five counting principles;
- §3.11.6.6 — false-Hu minimum explicitly states the 8-point threshold excludes Flower points;
- Appendix 1 — fan definitions, inclusion/exclusion examples and scoring examples.

The 2006 A5 Green Book has also been visually checked against the WMO-branded scan. Secondary mirrors/references may assist transcription but do not override the pinned source.

## Minimal hand-evaluation input

Conceptually:

```ts
type McrHandEvidence = {
  groups: readonly GroupEvidence[];
  pairOrIrregularTiles: readonly TileEvidence[];
  winningTile: TileId;
  flowerCount: number;
};

type McrScoreContext = {
  seatWind: Wind;
  prevailingWind: Wind;
  winSource: 'discard' | 'self-draw';
  specialWinEvent?:
    | 'last-wall-draw'
    | 'last-discard'
    | 'kong-replacement'
    | 'flower-replacement'
    | 'rob-kong';
  lastCopyOfTile?: boolean;
};
```

The exact runtime type belongs to the rules-platform implementation. This document defines the **facts**, not final TypeScript spelling.

## What is derivable from the submitted hand

Do not ask the player to confirm facts the scorer can calculate from complete tile/group evidence.

Derive:

- standard four-sets-plus-pair structure;
- Seven Pairs;
- Thirteen Orphans;
- Greater/Lesser Honors and Knitted Tiles;
- suit/rank/honor composition;
- Chow/Pung/Kong structure;
- exposed vs concealed groups;
- number and type of Kongs;
- concealed-Pung/Kong counts;
- flush / half-flush / terminal / honor / simple composition;
- shifted/double/triple Chow and Pung relationships;
- Tile Hog;
- All Types;
- whether the hand is fully melded or contains no melded sets;
- candidate legal decompositions;
- Edge / Closed / Single Wait **from the pre-win 13-tile state reconstructed using the recorded winning tile**, rather than asking the user to name the wait.

Where one final hand supports multiple legal decompositions, the MCR combination policy must evaluate lawful alternatives and select the highest lawful score under §3.9.1. It must not rely on how the user happened to group tiles in the UI if another legal decomposition scores differently.

## Facts supplied by trusted game context

When scoring inside a tracked game, the application should already know:

- player identity;
- seat wind;
- prevailing wind;
- current dealer/East;
- which player supplied the winning discard, if the outcome is a discard win;
- the current profile/version.

Do not ask these again unless the game state genuinely lacks them.

For standalone hand scoring, seat and prevailing wind are optional prompts shown only because fan 60/61 can depend on them.

## Facts that may require player confirmation

### Winning method

Needed for:

- Self-Drawn (fan 80);
- Fully Concealed Hand (fan 56);
- Concealed Hand (fan 62);
- settlement routing.

Use the resolved round outcome where available.

### Special winning event

Only ask when relevant. The Green Book distinguishes:

- Last Tile Draw (fan 44);
- Last Tile Claim (fan 45);
- Out with Replacement Tile after a Kong (fan 46);
- Robbing the Kong (fan 47);
- ordinary self-draw;
- Flower-replacement self-draw, which may score Self-Drawn but **not** Out with Replacement Tile.

One finite event field is preferable to several contradictory booleans.

### Last copy of tile

Fan 58, Last Tile, is not the same as the last wall tile. It means the winning tile was the final copy of that tile kind available, established by visible discards/exposures at the real table.

Because Mahjong Reference is not required to track every discard, standalone scoring may ask one confirmation such as:

> Was the winning tile the last visible copy of that tile?

Active game tracking may infer it only if the product later possesses complete trustworthy visibility data. Do not manufacture that history merely for this fan.

### Flowers

For scoring, the engine needs the **number of Flowers retained by the winner**, not their individual season/plant identity. Every Flower scores one point under fan 81.

Flower points are post-qualification bonus points: §3.11.6.6 explicitly states that the minimum 8 points required for a valid Hu are counted **without Flower points**.

A win on a Flower replacement is treated as a self-drawn win for fan 80 but is not fan 46 Out with Replacement Tile.

## Evidence the scorer does not need

For the current Table Companion scope, do **not** require or persist merely to score MCR:

- wall-break dice;
- current wall position;
- full draw/discard history;
- exact Chow/Pung/Kong call timestamps;
- claim-priority history;
- who physically announced a call first;
- exposed-tile orientation showing the discarder;
- umpire identity;
- tournament clock;
- physical seat-rotation logistics;
- detailed foul detection history.

If the real table resolves one of those matters and it affects the score, record only the resolved score-relevant outcome (for example `rob-kong`), not the whole procedure that led to it.

## Win legality boundary

Mahjong Reference should validate only legality needed to accept a score:

```text
permitted winning structure
+
qualifying non-Flower fan >= 8
+
valid score-relevant winning method/event evidence
=
scoreable MCR win
```

It is not required to determine whether the physical player called Hu in time, touched a tile early, spoke incorrectly or otherwise committed tournament-procedure faults.

## Settlement evidence

Once the deterministic scorer produces Basic Points `B`:

### Discard win

- discarder → winner: `8 + B`;
- each other non-winner → winner: `8`.

### Self-draw

- each of the three non-winners → winner: `8 + B`.

Settlement consumes the accepted score result plus the resolved win source. It does not rescore the hand.

## Progression evidence

The product only needs enough state to advance the table after a recorded hand.

The Green Book defines:

- four players / four wind seats;
- dealer = current East;
- after a hand ends, dealer passes regardless of whether East won;
- a round completes when everyone has been dealer once;
- a complete game consists of East, South, West and North rounds.

Therefore the architecture mapping remains:

```text
progression.always-pass
game-end.four-round-always-pass
```

A draw does **not** trigger a Classical/BMJA-style East repeat. It is still the end of a hand for progression purposes.

Tournament time limits and Table Points (4/2/1/0 ranking points after a session) are competition administration, not required for ordinary Table Companion game progression unless deliberately added as a separate tournament mode.

## Penalties

The Green Book has an extensive foul/penalty system. It is outside automatic MCR scoring scope.

The only penalty facts needed by the deterministic score contract are negative correctness fixtures such as:

- fewer than 8 non-Flower fan is not a legal Hu;
- wrong structural tile count is not a scoreable Hu.

Do not build automatic foul policing into the MCR scorer. A future tournament feature may record a referee-decided adjustment separately.

## Required implementation behaviour

1. Ask only for score-relevant facts not already derivable or held in trusted game context.
2. Keep structural/event predicates score-neutral.
3. Keep the 81 MCR fan as profile-owned catalogue bindings.
4. Apply the five §3.9.1 counting principles, not blind summation.
5. Separate the non-Flower qualifying subtotal from Flower bonus points.
6. Keep scoring and settlement separate.
7. Keep progression separate from both.
8. Fail closed when required event/context evidence is unknown; never award the favourable fan by assumption.
