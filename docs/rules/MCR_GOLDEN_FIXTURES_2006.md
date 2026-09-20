# MCR 2006 golden fixture corpus

Status: **pre-code correctness contract**  
Issue: #176  
Target profile: `mcr-wmo-2006@0.x`

Authority: WMO *Mahjong Competition Rules* 2006 (“Green Book”), especially §3.7–3.9, §3.11.6.6 and Appendix 1.

This is the implementation oracle for the future MCR scorer. It deliberately tests only the Table Companion boundary:

```text
resolved physical hand + score-relevant context
→ lawful MCR fan score
→ settlement transactions
→ next table state
```

It does **not** test wall building, draw turns, claim timing, announcements, umpire procedure or automatic foul policing.

## Fixture notation

Suit names:

- `C` = Characters;
- `B` = Bamboo;
- `D` = Dots;
- `WE/WS/WW/WN` = East/South/West/North Wind;
- `DR/DG/DW` = Red/Green/White Dragon.

Examples:

```text
C123       Chow 1-2-3 Characters
C222       Pung of 2 Characters
C5555(km)  melded Kong of 5 Characters
C5555(kc)  concealed Kong of 5 Characters
pair WE    pair of East Winds
```

Unless a fixture explicitly says otherwise:

- the submitted hand is structurally complete;
- no Flower tiles are present;
- no special win event applies;
- the winning tile is **not** the last visible copy of its kind;
- seat/prevailing winds do not create an extra Wind Pung fan;
- exposure state is exactly as stated;
- the scorer must still enumerate alternate lawful decompositions where the tiles permit them.

`SOURCE EXAMPLE` means the expected fan combination is stated by the Green Book Appendix example. `CONSTRUCTED` means the hand is a deterministic test case derived from the formal definitions/counting rules.

---

# A. Catalogue / interaction fixtures

## MCR-F001 — Quadruple Chow + lower composition fan

Type: `SOURCE EXAMPLE SHAPE / CONSTRUCTED EXACT TILES`

```text
C123 C123 C123 C123 pair C44
win: discard, two-sided/no wait fan
```

Expected counted fan:

```text
Quadruple Chow 48
Full Flush      24
Lower Four      12
All Chows        2
------------------
qualifying      86
Basic Points    86
```

Must **not** count:

- Pure Triple Chow (implied lower identical-Chow fan; Non-Repeat principle);
- Pure Double Chow;
- Tile Hog;
- No Honors;
- One Voided Suit.

The Appendix example for Quadruple Chow explicitly combines it with Full Flush, Lower Four and All Chows. The source's unusual explicit non-combination wording does not permit the implied lower identical-Chow fan to be re-added: §3.9.1 Non-Repeat still applies.

## MCR-F002 — Pure Terminal Chows suppress implied fan

Type: `CONSTRUCTED; DIRECT APPENDIX DEFINITION/EXCLUSIONS`

```text
C123 C123 C789 C789 pair C55
win: discard
```

Expected:

```text
Pure Terminal Chows 64
qualifying          64
Basic Points        64
```

Must not count:

- Seven Pairs;
- Full Flush;
- All Chows;
- Pure Double Chow;
- Two Terminal Chows;
- No Honors / One Voided Suit through generic composition leakage.

## MCR-F003 — Seven Pairs discard win

Type: `CONSTRUCTED`

```text
C11 C22 D33 D44 B55 B66 WEWE
win: discard
```

Expected counted fan:

```text
Seven Pairs 24
qualifying  24
Basic       24
```

Must not count Concealed Hand or Single Wait. `Fully Concealed Hand` applies only when the Seven Pairs hand is self-drawn.

## MCR-F004 — Big Four Winds + All Honors

Type: `SOURCE-BOUND COMBINATION`

```text
WEWEWE WSWSWS WWWWWW WNWNWN pair DRDR
win: discard
```

Expected counted high fan:

```text
Big Four Winds 88
All Honors     64
```

Expected subtotal: `152` unless the exact submitted context creates another non-suppressed fan.

Must not additionally count:

- Big Three Winds;
- All Pungs;
- Prevalent Wind;
- Seat Wind;
- Pung of Terminals or Honors.

The Dragon pair does not create Dragon Pung.

## MCR-F005 — All Terminals allows two Double Pung instances

Type: `SOURCE EXAMPLE PRINCIPLE`

Construct four terminal Pungs using two matching ranks across suits, plus a terminal pair, so that two distinct Double Pung relationships are present without violating tile multiplicity.

Expected:

```text
All Terminals 64
Double Pung    2
Double Pung    2
----------------
qualifying    68
```

This fixture protects the difference between an implied lower fan (suppressed) and a distinct independently countable occurrence permitted by the source example.

## MCR-F006 — interaction text that looks structurally surprising remains source-owned

Type: `POLICY FIXTURE`

For Quadruple Chow and Four Pure Shifted Pungs, use the **formal 2006 non-combination wording plus the five §3.9.1 principles**. Do not “correct” the policy from pattern names alone.

Acceptance:

- Chinese/English formal text from the later trilingual rulebook confirms the same unusual named exclusions;
- implied lower fan are still suppressed by Non-Repeat even when not named in the per-fan sentence;
- implementation stores the source-owned rule, not a guessed typo repair.

---

# B. Qualification / Flower fixtures

## MCR-Q001 — seven non-Flower points plus Flowers is not a legal Hu

Type: `CONSTRUCTED NEGATIVE`

```text
C222 D333 B444 C555 pair WEWE
all Pungs; at least one set melded
win: self-draw
Flowers: 2
```

Choose exposure so no concealed-hand fan applies and the hand has no other composition fan.

Expected non-Flower fan:

```text
All Pungs   6
Self-Drawn  1
-------------
qualifying  7
```

Flowers would be `+2` **only after qualification**, therefore:

```text
legal Hu: false
qualification subtotal: 7
Flower bonus: not permitted to rescue the Hu
```

This is directly protected by §3.11.6.6: the 8-point minimum excludes Flower points.

## MCR-Q002 — exactly eight non-Flower points, then Flowers add to Basic Points

Type: `CONSTRUCTED POSITIVE`

```text
C222 D333 B444 C5555(km) pair WEWE
win: self-draw
Flowers: 2
```

Choose exposure/context to avoid any other fan.

Expected:

```text
All Pungs    6
Melded Kong  1
Self-Drawn   1
--------------
qualifying   8  -> legal Hu
Flowers      2  -> post-qualification
Basic Points 10
```

The score result must expose both `qualifyingSubtotal = 8` and `postQualificationBonus = 2` rather than flattening Flowers before legality is decided.

## MCR-Q003 — Chicken Hand is an 8-point fallback, not “zero plus eight” alongside other fan

Type: `CONSTRUCTED`

```text
C123 (melded)
C678
D345
B789
pair WEWE
win: discard on a two-sided/non-single wait
```

Context must avoid Seat/Prevalent Wind scoring and Last Tile.

Expected:

```text
other non-Flower fan: none
Chicken Hand: 8
qualifying: 8
Basic: 8
```

If any other ordinary non-Flower fan is detected, Chicken Hand must not also be added.

---

# C. Event / evidence fixtures

## MCR-E001 — Last Tile Draw replaces ordinary Self-Drawn fan

Use the MCR-Q003 neutral hand shape but resolve the win event as:

```text
winSource: self-draw
specialWinEvent: last-wall-draw
```

Expected:

```text
Last Tile Draw 8
Self-Drawn     0 (suppressed by source rule)
```

No full wall history is required. The physical table supplies the resolved event.

## MCR-E002 — Flower replacement is self-draw, not Out with Replacement Tile

Use an otherwise qualifying hand with:

```text
winSource: self-draw
specialWinEvent: flower-replacement
```

Expected:

- `Self-Drawn` may count;
- `Out with Replacement Tile` must **not** count.

The player does not need to describe wall/replacement procedure beyond the resolved event.

## MCR-E003 — Kong replacement can score Out with Replacement Tile

Use an otherwise qualifying hand with:

```text
winSource: self-draw
specialWinEvent: kong-replacement
```

Expected candidate:

```text
Out with Replacement Tile 8
```

Apply any source-defined interaction with Self-Drawn through `interaction.mcr-2006-non-combination`; do not treat the two event names as independent arbitrary toggles.

## MCR-E004 — Robbing the Kong suppresses Last Tile

Use an otherwise neutral hand with:

```text
winSource: discard
specialWinEvent: rob-kong
lastCopyOfTile: true
```

Expected:

```text
Robbing the Kong 8
Last Tile        0 (source exclusion)
```

The product records the resolved `rob-kong` event; it does not reconstruct who attempted the Kong or police claim timing.

## MCR-E005 — Last Tile is a visible-copy fact, not the last wall tile

Two identical final hands and winning tiles:

```text
A: lastCopyOfTile = false
B: lastCopyOfTile = true
```

Expected score delta:

```text
B = A + Last Tile (4), unless another source exclusion suppresses it
```

No discard-history tracking is required for v1. Standalone scoring asks for confirmation when this fact can affect the result.

## MCR-E006 — wait fan are derived from pre-win hand, not user-selected labels

For Edge Wait, Closed Wait and Single Wait:

- remove the recorded winning tile from the final hand;
- enumerate all tile kinds that would legally complete the pre-win hand;
- award the 1-point wait fan only if the Green Book's exact sole-wait condition is met;
- if the same final hand can be completed in more than one way/tile kind, do not award a favourable wait merely because one decomposition looks like an edge/closed/single wait.

This fixture is a detector/property test rather than one fixed hand.

---

# D. Settlement fixtures

Settlement uses accepted MCR **Basic Points** after qualification and Flowers. It does not recalculate fan.

Use four players `A` (winner), `B`, `C`, `D`.

## MCR-S001 — discard win, Basic Points 11

```text
winner: A
source: discard by B
Basic Points: 11
```

Expected transactions:

```text
B -> A : 19  (8 + 11)
C -> A : 8
D -> A : 8
```

Expected net:

```text
A +35
B -19
C -8
D -8
```

No East multiplier and no loser-to-loser settlement.

## MCR-S002 — self-draw, Basic Points 11

```text
winner: A
source: self-draw
Basic Points: 11
```

Expected:

```text
B -> A : 19
C -> A : 19
D -> A : 19
```

Net:

```text
A +57
B -19
C -19
D -19
```

## MCR-S003 — Flower points affect payment only after legal qualification

Take MCR-Q002:

```text
qualifying subtotal = 8
Flowers = 2
Basic Points = 10
```

Self-draw settlement therefore uses `8 + 10 = 18` from each loser, not `8 + 8` and not a pre-qualification value of 10.

## MCR-S004 — illegal sub-eight hand emits no normal win settlement

Take MCR-Q001 (`qualifying = 7`, Flowers 2).

Expected:

```text
legal = false
normal settlement transactions = []
```

Any tournament false-Hu penalty is an external/referee procedure, not automatically inferred by the hand scorer.

---

# E. Progression / game-end fixtures

These fixtures consume a **resolved hand outcome**, not live play actions.

## MCR-P001 — East wins; dealer still passes

```text
before: dealer = A / East
outcome: A wins
```

Expected:

```text
dealer after = B
seat winds rotate accordingly
prevailing wind unchanged unless this completes the dealer cycle
```

## MCR-P002 — non-East wins; dealer passes

```text
before: dealer = A
outcome: C wins
```

Expected `dealer after = B`.

Winner identity does not decide dealer retention.

## MCR-P003 — draw; dealer passes

```text
before: dealer = A
outcome: draw / no winner
```

Expected `dealer after = B`.

Do not import BMJA/Classical East-on-draw retention.

## MCR-P004 — fourth dealer completion advances prevailing wind

After the fourth hand/dealer position of East round resolves:

```text
prevailing wind: East -> South
next dealer cycle begins
```

Equivalent transitions apply South→West and West→North.

## MCR-P005 — final North-round dealer completion ends the game

After the fourth dealer position of the North round resolves:

```text
GameEndResult.complete = true
reason = mcr-four-rounds-complete
```

No tournament clock/table-point ranking logic is required to decide this ordinary Table Companion game end.

---

# F. Fail-closed / scope fixtures

## MCR-X001 — missing required external event evidence

If a candidate fan depends on `specialWinEvent` or `lastCopyOfTile` and the fact is unknown:

- do not award the fan;
- return a required-evidence prompt if the missing fact could materially change legality/score;
- never assume the favourable event.

## MCR-X002 — score cannot be reconstructed from fan names entered by a user

The UI may explain detected fan, but the scoring API consumes tile/evidence/context, not an arbitrary list of fan checkboxes. This prevents contradictory or impossible fan combinations from bypassing the interaction policy.

## MCR-X003 — tournament penalty is not a hand detector

A referee-decided penalty cannot be inferred from final tiles. If a future tournament mode records one, it must be an explicit manual/profile-owned adjustment with its own reason/provenance, outside `McrHandScoreResult` fan arithmetic.

## MCR-X004 — no live-procedure state is required merely to score

A valid scorer fixture must not fail because these are absent:

```text
wall position
claim timestamps
turn order history
full discard history
call announcement history
umpire decision log
```

Only the resolved score-relevant event facts defined in `MCR_SCORE_EVIDENCE_CONTRACT.md` are required.

---

# G. Implementation acceptance gate

Before an MCR scorer can be called playable:

1. all 81 bindings from `MCR_FAN_CATALOGUE_2006.md` exist;
2. every binding has at least one positive detector fixture and every non-trivial interaction has a suppression/combination fixture;
3. the five §3.9.1 principles have dedicated property/interaction tests;
4. Q001/Q002 prove Flowers cannot rescue a sub-eight Hu;
5. event fixtures prove the app asks for only the external facts it genuinely needs;
6. settlement fixtures pass using generic transactions;
7. progression fixtures pass without Classical dealer-retention logic;
8. current BMJA/T&M/Club parity remains unchanged;
9. source locators remain visible in test data or catalogue metadata so later source corrections are auditable.

This document is intentionally **stronger than a handful of demo hands**. The implementation must derive its correctness from the full catalogue + interaction corpus, with these fixtures acting as named regression oracles.
