# Atlas v0.2 batch 1 — exact treatment-reference validation

Status: **completed manual binding-resolution check for the first #354 structured proof batch**  
Base runtime: `efe2cec955f973a28a5e982160f3b6e39593606a`

The first learner proof contains **36 unique exact treatment `referenceId`s**. Each was checked against the current profile binding source that feeds `specialHandTreatmentsForProfile()`.

This validation proves identity resolution only. It does not upgrade any unresolved relationship or source/runtime discrepancy recorded by #351/#352.

## BMJA 1.0 — 11 / 11 resolve

Binding authority: `artifacts/mahjong-scorer/src/scoring/special-hands.ts` → `bmjaSpecialHandBindings`.

| referenceId | current binding |
|---|---|
| `bmja@1.0:thirteen-unique-wonders` | present |
| `bmja@1.0:four-blessings` | present |
| `bmja@1.0:imperial-jade` | present |
| `bmja@1.0:wriggling-snake` | present |
| `bmja@1.0:all-pair-honours` | present |
| `bmja@1.0:heavens-blessing` | present |
| `bmja@1.0:twofold-fortune` | present |
| `bmja@1.0:three-great-scholars` | present |
| `bmja@1.0:knitting` | present |
| `bmja@1.0:triple-knitting` | present |
| `bmja@1.0:gates-of-heaven` | present |

## Thompson & Maloney Western 0.1 — 12 / 12 resolve

Binding authority: `artifacts/mahjong-scorer/src/game/western-tm-catalogue.ts`.

| referenceId | current binding |
|---|---|
| `western-tm@0.1:thirteen-unique-wonders` | present |
| `western-tm@0.1:four-blessings` | present |
| `western-tm@0.1:green-dragon-meld-with-green-bamboo-melds-and-pair-one-chow` | present |
| `western-tm@0.1:wriggling-snake-any-pair` | present |
| `western-tm@0.1:all-pair-honours` | present |
| `western-tm@0.1:seven-pairs-one-suit-with-honours` | present |
| `western-tm@0.1:seven-pairs-one-suit` | present |
| `western-tm@0.1:seven-pairs-all-from-wall` | present |
| `western-tm@0.1:three-great-scholars` | present |
| `western-tm@0.1:two-suit-knitting` | present |
| `western-tm@0.1:three-suit-knitting-with-pair` | present |
| `western-tm@0.1:western-gates-of-heaven` | present |

## Outside the Box 0.1 — 9 / 9 resolve

Binding authority: `artifacts/mahjong-scorer/src/game/outside-the-box-catalogue.ts`.

| referenceId | current binding |
|---|---|
| `outside-the-box@0.1:thirteen-unique-wonders` | present |
| `outside-the-box@0.1:four-blessings` | present |
| `outside-the-box@0.1:imperial-jade` | present |
| `outside-the-box@0.1:wriggling-snake` | present |
| `outside-the-box@0.1:wriggling-snake-any-pair` | present |
| `outside-the-box@0.1:all-pair-honours` | present |
| `outside-the-box@0.1:three-great-scholars` | present |
| `outside-the-box@0.1:knitting` | present |
| `outside-the-box@0.1:triple-knitting` | present |

## Buzzard 2000 0.1 — 4 / 4 resolve

Binding authority: `artifacts/mahjong-scorer/src/game/buzzard-2000.ts`.

| referenceId | current binding |
|---|---|
| `buzzard-2000@0.1:thirteen-unique-wonders` | present as local name `Thirteen Odd Majors` |
| `buzzard-2000@0.1:heavens-blessing` | present as local name `Original Hand` |
| `buzzard-2000@0.1:three-great-scholars` | present as local name `Three Dragons` |
| `buzzard-2000@0.1:one-suit-nine-gates-any-completion` | present as local name `Calling Nine Tile Hand` |

## Result

**36 / 36 unique first-batch treatment references resolve to current executable bindings.**

The unresolved status of Buzzard Thirteen Odd Majors, Original Hand and Three Dragons; BMJA/OTB Knitting; Triple Knitting; and the OTB Three Great Scholars qualification remains unchanged. Resolution of an exact binding is not evidence that the source/runtime semantics are complete or equivalent across profiles.
