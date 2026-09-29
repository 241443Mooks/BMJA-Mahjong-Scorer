# Issue #440B4A — Cohort A selection and implementation report

Status: **candidate selection recorded before authoring truth records**  
Base: `b3cd65b9e5911ba1f3e9362c7683feb85043a36c` (`origin/main`, PR #456 merged)  
Authority: merged `docs/rules/ISSUE_440B4_WESTERN_SPECIAL_HAND_PREFLIGHT.md`  
Profile: `western-tm@0.1`

## Candidate derivation

Cohort A is the audited Runs, Chows and irregular loose/hybrid source block, including the specifically named Wriggly, Knitting, Big Robert, Seven Twins, Chow Chow and Up You Go/Down You Go groups. The exact set below is selected by source/structure cohesion. Each ID was looked up in the merged 84-row matrix and confirmed `eligible-to-migrate` before record authoring.

**Selected count: 34.** All selected rows are eligible-to-migrate.

| Binding ID | Public name | Cohort A reason | Matrix classification |
|---|---|---|---|
| `wriggly-dragon` | Wriggly Dragon | Wriggly family: Wriggly pattern is explicitly assigned to Cohort A. | **eligible-to-migrate** |
| `wriggling-snake-any-pair` | Wriggly Snake | Wriggly family: Wriggly structure with any-base-tile duplication; explicitly part of the Wriggly family. | **eligible-to-migrate** |
| `hachi-ban` | Hachi Ban | Runs / irregular layout: A 1–8 or 2–9 run joined to loose honour pairs; run-based irregular structure. | **eligible-to-migrate** |
| `suit-run-one-to-seven-with-winds-and-dragon-pung` | Greta's Dragon | Runs / irregular layout: Complete loose 1–7 run with non-run completion tiles; irregular run layout. | **eligible-to-migrate** |
| `full-suit-run-with-dragon-singles-and-wind-pair` | Dragon's Run | Runs / irregular layout: Complete loose 1–9 run with loose Dragon singles and a Wind pair. | **eligible-to-migrate** |
| `two-suit-pairs-and-chows-one-two-five-six-nine` | Yin Yang | Chows / irregular layout: Two-suit loose arrangement built from Chows and pairs; no wind-family treatment. | **eligible-to-migrate** |
| `three-suit-chows-with-suited-meld-and-pair` | Little Robert | Chows: Three-suit Chows with one additional suited meld and pair. | **eligible-to-migrate** |
| `circle-chows-with-one-two-three-four-five-six-seven-eight-nine` | Moon at Bottom of Well | Chows: Circle-only four-Chow structure. | **eligible-to-migrate** |
| `run-two-to-eight-with-one-and-nine-pungs` | Confused Gates | Runs: A 2–8 run with terminal-suit Pungs. | **eligible-to-migrate** |
| `full-suit-run-with-five-distinct-honours` | Five Odd Honours | Runs / irregular layout: Complete 1–9 run with five loose honours. | **eligible-to-migrate** |
| `suit-run-one-to-seven-with-all-honours` | Greta's Garden | Runs / irregular layout: Complete 1–7 run with all seven honours. | **eligible-to-migrate** |
| `run-one-to-nine-with-same-suit-pung-and-pair` | Run, Pung & Pair | Runs: Explicit Run, Pung & Pair entry from the Run/Guardian/Grand Sequence block. | **eligible-to-migrate** |
| `run-one-to-nine-with-wind-pung-and-pair` | Guardian Winds | Runs: Explicit Guardian Winds entry from the Run/Guardian/Grand Sequence block. | **eligible-to-migrate** |
| `run-one-to-nine-with-dragon-pung-and-pair` | Guardian Dragons | Runs: Explicit Guardian Dragons entry from the Run/Guardian/Grand Sequence block. | **eligible-to-migrate** |
| `run-one-to-nine-with-honour-pung-and-any-pair` | Grand Sequence | Runs: Explicit Grand Sequence entry from the Run/Guardian/Grand Sequence block. | **eligible-to-migrate** |
| `full-suit-run-with-honour-pung-and-opposite-honour-pair` | Dragon's Tail | Runs / irregular layout: A 1–9 run combined with opposite honour meld/pair structure. | **eligible-to-migrate** |
| `four-chows-three-suits-one-two-one` | Robin | Chows: Four-Chow arrangement; Cohort A Chows category. | **eligible-to-migrate** |
| `western-gates-of-heaven` | Gates of Heaven | Runs / irregular layout: Complete loose one-suit terminal and 2–8 layout; uses the Western-specific predicate. | **eligible-to-migrate** |
| `two-suit-runs-one-to-seven` | Gertie's Garter | Runs: Two complete 1–7 suit runs. | **eligible-to-migrate** |
| `north-south-wind-melds-with-1861-and-1865-two-suit-layout` | Civil War | Irregular hybrid layout: Loose 1861/1865 tiles combined with North/South sets; not the Cohort B wind-pair family. | **eligible-to-migrate** |
| `two-to-eight-run-pair-with-terminal-meld-and-corresponding-dragon-meld` | Dragon's Gates | Runs / irregular hybrid: 2–8 run/pair plus terminal and Dragon melds; exact detail-page resolution is retained. | **eligible-to-migrate** |
| `one-to-seven-run-pair-with-red-dragon-and-own-wind-melds` | Red Lantern | Runs / irregular hybrid: 1–7 run/pair with context-qualified completion melds. | **eligible-to-migrate** |
| `three-suit-chows-with-mixed-chow-and-suited-pair` | Three Philosophers | Mixed Chows: Three ordinary Chows plus a loose Mixed Chow. | **eligible-to-migrate** |
| `four-mixed-chows-with-mixed-pair` | Crazy Chows | Mixed Chows: Four loose Mixed Chows and a Mixed Pair. | **eligible-to-migrate** |
| `white-dragon-meld-green-dragon-pair-with-three-mixed-chows` | Apple Blossom | Mixed Chows / irregular hybrid: Three loose Mixed Chows plus represented Dragon group/pair. | **eligible-to-migrate** |
| `three-mixed-chows-three-dragon-singles-own-wind-pair` | The Professors | Mixed Chows / irregular layout: Three loose Mixed Chows plus Dragon singles and own-Wind pair. | **eligible-to-migrate** |
| `two-suit-knitting` | Knitting | Knitting family: T&M-specific two-suit Knitting structure. | **eligible-to-migrate** |
| `three-suit-knitting-with-pair` | Triple Knitting | Knitting family: T&M-specific three-suit Knitting with pair. | **eligible-to-migrate** |
| `three-four-tile-suit-runs-with-honour-pair` | Big Robert | Big Robert variants: First distinct Big Robert runtime binding: differing four-tile suit runs. | **eligible-to-migrate** |
| `three-matching-four-tile-suit-runs-with-honour-pair` | Big Robert | Big Robert variants: Second distinct Big Robert runtime binding: matching four-tile suit runs. | **eligible-to-migrate** |
| `seven-pairs-all-from-wall` | Seven Twins | Seven Twins: Seven distinct pairs with a wall-only winning qualification. | **eligible-to-migrate** |
| `four-concealed-chows-one-suit-from-wall` | Chow Chow | Chow Chow: Four concealed one-suit Chows with a wall-only winning qualification. | **eligible-to-migrate** |
| `four-winds-with-one-two-two-fours-three-sixes-four-eights` | Up You Go | Up You Go: Complete loose 14-tile layout; source representation is not a declared Kong. | **eligible-to-migrate** |
| `four-winds-with-four-twos-three-fours-two-sixes-one-eight` | Down You Go | Down You Go: Complete loose 14-tile layout; source representation is not a declared Kong. | **eligible-to-migrate** |

## Cohort boundaries

Excluded the wind-pair/pairs families reserved for Cohort B, including Windy Chow, Chop Suey, Chow Mein, Dragonette, Windfall, All Pair Ruby Jade, Golden Gates and the Windy family. Excluded the dragon/honour and suit-colour families reserved for Cohort C. The three calculated bindings (`purity-one-chow`, `honours-and-one-suit-terminals-pung-kong-hand`, `one-suit-with-honours-mostly-pung-kong-hand`) are semantic-review-deferred and not selected. Unique Wonder is the existing treatment and is unchanged.

The selected irregular run/hybrid entries remain in A where the documented primary structure is a run/Chow or explicitly loose/hybrid form; they do not pull adjacent Cohort B wind-pair or Cohort C dragon/suit-colour source blocks into this batch.

## Implementation outcome

This report records selection before truth authoring. The planned data change is limited to Western-local subjects, `tm-companion` claims with exact Companion locators, and executable treatments targeting the selected IDs. Treatment records contain runtime references only, with no score/exposure values or duplicated runtime qualification. Runtime inventory and scoring behavior remain unchanged.

## Coverage after B4A

The 85-binding Western inventory is accounted for as 1 unchanged existing Unique Wonder treatment, 34 new B4A treatments, 47 remaining eligible B4B/C bindings, and 3 semantic-review-deferred calculated bindings. Western special-hand truth migration is still in progress. No treatment was added for the deferred calculated bindings.

## Verification

- `pnpm test` — passed: 125 files, 1,156 tests.
- Focused B4A truth test — passed as part of the full suite (4 tests). The full run also passed Western catalogue/runtime, truth coverage, truth integrity, and corpus tests.
- `pnpm run typecheck` — passed.
- `PORT=5173 BASE_PATH=/ pnpm run build` — passed. Existing unresolved Riichi tile asset, sourcemap, and large-chunk warnings were emitted.
- `git diff --check` — passed.

This change adds only Western-local truth records, tests, deterministic coverage accounting, and this report. It does not change runtime inventory, detector behavior, or production scoring.
