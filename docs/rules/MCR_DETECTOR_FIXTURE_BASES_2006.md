# MCR 2006 detector fixture bases

Status: **authoritative companion to `MCR_DETECTOR_PREDICATES_2006.md` for #299**  
Issue: #303

## Purpose

The 81-row predicate table normally gives an exact hand fragment or complete fixture directly. A few context/event rows deliberately say “Any valid hand” because the fan is independent of the tile pattern. This file makes those shared recipes deterministic rather than leaving test authors to invent a hand.

## Notation

Use the notation defined in `MCR_DETECTOR_PREDICATES_2006.md`.

All final hands below include the recorded winning tile in `freeTiles`, as required by the #302 input contract.

## `BASE-EVENT`

Use this exact structurally complete ordinary hand for context/event-only detector tests unless a row supplies a more specific hand:

```text
fixedGroups: []
freeTiles representing:
  C123
  D456
  B789
  C777
  pair D55
winningTile: D5
flowerCount: 0
seatWind: east
prevailingWind: south
lastVisibleCopy: false unless the fixture overrides it
```

The recipe may produce unrelated ordinary candidates. That is acceptable: a #299 positive detector fixture asserts presence/absence of the target candidate, not the final lawful score after #300 interaction.

Use `BASE-EVENT` for:

- fan 44 Last Tile Draw, with `winSource=self-draw`, `resolvedWinEvent=last-wall-draw`;
- fan 45 Last Tile Claim, with `winSource=discard`, `resolvedWinEvent=last-discard`;
- fan 46 Out with Replacement Tile, with `winSource=self-draw`, `resolvedWinEvent=kong-replacement`;
- fan 47 Robbing the Kong, with `winSource=discard`, `resolvedWinEvent=rob-kong`;
- fan 58 Last Tile, with `lastVisibleCopy=true` and any source-compatible win source/event;
- fan 80 Self-Drawn, with `winSource=self-draw`. Positive boundary cases must cover `resolvedWinEvent=none`, `last-wall-draw`, `kong-replacement`, and `flower-replacement`. Candidate detection still emits Self-Drawn for those self-drawn events; #300 applies any source-owned non-combination such as Last Tile Draw not combining with Self-Drawn.

For event rows, keep `lastVisibleCopy=false` unless Last Tile itself is the target so the tests do not accidentally conflate fan 58 with the wall-event fan.

## `BASE-Q8`

Use the existing golden Q002 construction as the deterministic Flower-positive base:

```text
fixedGroups:
  KM(C5)
freeTiles representing:
  C222
  D333
  B444
  pair EE
winningTile: E
flowerCount: 1
context:
  winSource=self-draw
  resolvedWinEvent=none
  seatWind=south
  prevailingWind=west
  lastVisibleCopy=false
```

Choose the non-value Wind context above so the pair cannot create a Wind-Pung fan. The intended non-Flower candidate subtotal is the existing Q002 pattern family:

```text
All Pungs    6
Melded Kong  1
Self-Drawn   1
--------------
qualifying   8
```

Fan 81 then contributes `+1` only at the post-qualification bonus stage.

The corresponding negative qualification proof remains `MCR-Q001` in `MCR_GOLDEN_FIXTURES_2006.md`: Flower points never rescue a seven-point non-Flower hand.

## Handoff rule

Where the predicate table says “Any valid hand” for fan 44, 45, 46, 47, 58 or 80, it means `BASE-EVENT` with the row-specific context override above. Where fan 81 says “otherwise qualifying hand”, it means `BASE-Q8`.

This companion therefore closes the positive-fixture recipe to a deterministic input for all 81 bindings without adding new scoring semantics.
