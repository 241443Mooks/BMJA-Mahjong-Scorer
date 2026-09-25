# Atlas v0.2 batch 3 — exact treatment-reference validation

Status: **completed binding-resolution check for #354 batch 3**  
Base runtime: `efe2cec955f973a28a5e982160f3b6e39593606a`

Batch 3 adds the remaining current BMJA, Outside-the-Box and Buzzard treatment identities not already represented in batches 1–2.

## BMJA 1.0 — 4 / 4 newly covered references resolve

Binding authority: `artifacts/mahjong-scorer/src/scoring/special-hands.ts` → `bmjaSpecialHandBindings`.

- `bmja@1.0:buried-treasure`
- `bmja@1.0:earths-blessing`
- `bmja@1.0:gathering-plum-blossom`
- `bmja@1.0:plucking-moon`

## Outside the Box 0.1 — 1 / 1 newly covered reference resolves

Binding authority: `artifacts/mahjong-scorer/src/game/outside-the-box-catalogue.ts`.

- `outside-the-box@0.1:buried-treasure`

This completes learner-content identity coverage of all **33 current OTB fixed special-hand bindings** across batches 1–3.

## Buzzard 2000 0.1 — 6 / 6 newly covered references resolve

Binding authority: `artifacts/mahjong-scorer/src/game/buzzard-2000.ts`.

- `buzzard-2000@0.1:all-winds-and-dragons`
- `buzzard-2000@0.1:three-winds-and-fourth-wind-pair`
- `buzzard-2000@0.1:earths-blessing` — local name `East's First Discard`
- `buzzard-2000@0.1:heads-and-tails` — local name `All Ones and Nines`
- `buzzard-2000@0.1:four-concealed-pung-kong-hand` — local name `Concealed Pungs/Kongs`
- `buzzard-2000@0.1:east-thirteenth-consecutive-mahjong`

This completes learner-content identity coverage of all **10 current Buzzard special-hand bindings** across batches 1 and 3.

## Result

**11 / 11 newly covered batch-3 treatment identities resolve to current executable bindings.**

Combined coverage is now **93 / 146 current Classical treatments**.

All **18 BMJA**, **33 Outside the Box**, and **10 Buzzard** exact treatment identities are represented. The remaining **53 uncovered treatments are Thompson & Maloney Western-only catalogue entries**.

Semantic caveats remain intact. In particular, Buzzard `Three Winds and a Pair` remains a learner-visible source/runtime limitation because the primary source permits a related incomplete/non-winning limit result that the current winning-only detector does not represent.
