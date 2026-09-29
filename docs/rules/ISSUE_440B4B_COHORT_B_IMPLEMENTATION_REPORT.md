# Issue #440B4B — Cohort B selection and implementation report

Status: **B4B migration implemented and verified**  
Baseline: `1225e8b3a9179a795ce6fe64aef668f50c78ed30` (`origin/main`, B4A merged)  
Authority: `docs/rules/ISSUE_440B4_WESTERN_SPECIAL_HAND_PREFLIGHT.md` and its linked Companion catalogue evidence  
Profile: `western-tm@0.1`

## Candidate derivation

The merged preflight records 81 eligible rows and three semantic-review-deferred rows. Removing the 34 exact B4A IDs and those three deferred IDs leaves 47 eligible B4B/C candidates. Cohort B follows the audit's Pairs and Winds boundary, its listed Windy Chow/Windfall/All Pair Ruby Jade/Golden Gates/Wind-family material, and the Companion index's source-cohesive distinct pair entries. All chosen candidates remain `eligible-to-migrate`; none is a B4A treatment or deferred calculation. The audit's Cohort C Dragon/honour and suit-colour families remain excluded.

**Selected count: 21.**

| Binding ID | Current public name | Cohort B reason | Preflight classification |
|---|---|---|---|
| `all-pair-honours` | All Pair Honours | Seven-pair proposition explicitly in the Companion Pairs/Winds source grouping. | **eligible-to-migrate** |
| `four-blessings` | Four Blessings | Four Wind melds plus a pair; direct Wind-family proposition. | **eligible-to-migrate** |
| `wind-pair-with-three-suit-chows` | Windy Chow | Broad Wind-pair plus one Chow in each suit family. | **eligible-to-migrate** |
| `wind-pair-with-three-suit-one-two-three-chows` | Chop Suey | Distinct 123-in-each-suit subset of Windy Chow; keep a separate subject. | **eligible-to-migrate** |
| `wind-pair-with-three-suit-seven-eight-nine-chows` | Chow Mein | Distinct 789-in-each-suit subset of Windy Chow; keep a separate subject. | **eligible-to-migrate** |
| `dragonette` | Dragonette | Four Winds, Dragon singles, and suited pairs; indexed in the Pairs/Winds block. | **eligible-to-migrate** |
| `windfall` | Windfall | Four Winds plus five pairs from one suit; named in the audit's Cohort B definition. | **eligible-to-migrate** |
| `all-pair-ruby-jade` | All Pair Ruby Jade | Distinct coloured Bamboo pair structure; explicitly named in Cohort B. | **eligible-to-migrate** |
| `four-bamboo-one-and-five-green-bamboo-pairs` | Sparrow's Sanctuary | Pair identity is constrained to the source's specific Bamboo arrangement; Companion Pairs/Winds entry. | **eligible-to-migrate** |
| `seven-pairs-one-suit` | Heavenly Twins | Seven pairs in exactly one suit, with honours excluded. | **eligible-to-migrate** |
| `seven-pairs-one-suit-with-honours` | All Pair | Seven pairs with at most one suited family; distinct from Heavenly Twins and All Pair Honours. | **eligible-to-migrate** |
| `dragon-pair-with-five-suited-pairs` | Dragon's Breath | Exact Dragon-pair plus five same-suit pair structure; indexed in Pairs/Winds. | **eligible-to-migrate** |
| `golden-gates` | Golden Gates | Four specified suited pairs plus the corresponding terminal and Dragon melds; explicitly named in Cohort B. | **eligible-to-migrate** |
| `all-pair-green-dragon-and-bamboo` | All Pair Jade | Seven-pair structure with the source's Green Dragon pair allowance; Companion Pairs/Winds entry. | **eligible-to-migrate** |
| `four-wind-pairs-with-two-dragon-melds` | Windy Dragons | Four Wind pairs and two Dragon melds; Wind-family proposition. | **eligible-to-migrate** |
| `wind-pair-with-three-suit-rank-one-melds` | Windy Ones | Wind pair plus three rank-one melds across the suits; preserve one-pair/three-distinct-Wind form. | **eligible-to-migrate** |
| `wind-pair-with-three-suit-rank-nine-melds` | Windy Nines | Wind pair plus three rank-nine melds across the suits; preserve one-pair/three-distinct-Wind form. | **eligible-to-migrate** |
| `wind-pair-with-one-meld-in-each-suit` | Windvane | Wind pair/singles plus one meld in each suit; source has no exposure marker. | **eligible-to-migrate** |
| `wind-pair-with-three-suit-rank-three-melds` | Three Sisters | Wind pair plus three rank-three melds across the suits; preserve exact Wind structure. | **eligible-to-migrate** |
| `wind-pair-with-three-suit-rank-seven-melds` | Seven Brothers | Wind pair plus three rank-seven melds across the suits; preserve exact Wind structure. | **eligible-to-migrate** |
| `four-chows-three-suits-with-own-wind-pair` | Little Brother | Four-Chow form with the player's own Wind as the pair; primary distinction is Wind context in the audit's pair/wind boundary. | **eligible-to-migrate** |

No candidate is selected by filename or detector proximity. Similar-looking Ruby Jade, Dragon/honour, and broader suit-colour propositions remain for Cohort C. The source-certified player-Wind claims will state player/seat Wind context where required; prevailing Wind will not be substituted. Runtime matching and truth treatments will not encode overlap precedence or anti-stacking.

The exact B4A set and deferred IDs are taken from the merged B4A implementation report and current truth shard. This candidate list is frozen before authoring subjects, claims, or treatments.

## Coverage partition expected after B4B

| State | Count |
|---|---:|
| Existing Unique Wonder | 1 |
| B4A | 34 |
| B4B selected above | 21 |
| Eligible rows reserved for B4C | 26 |
| Semantic-review-deferred | 3 |
| **Western runtime bindings** | **85** |

The 26 untreated eligible bindings are the remaining eligible rows in the merged preflight matrix after excluding the exact B4A set and this B4B set. They remain reserved for the audit's Cohort C Dragons/honours/suit-colour families. Western special-hand truth migration remains incomplete.

The migration adds **21 Western-local subjects, 21 `tm-companion` claims, and 21 exact-profile treatments**. Western currently has **56 treatments of 85 runtime bindings**: 1 existing Unique Wonder, 34 B4A, and 21 B4B. The three calculated rows remain deferred and untreated. No selected-candidate runtime mismatch was identified in the reviewed audit or focused runtime/catalogue checks.

## Implementation and verification

Implemented only B4B Western-local truth subjects, Companion evidence claims, exact-profile executable treatments, deterministic coverage accounting, focused tests, and this report. No runtime inventory, detector, scorer, or scoring behavior changed.

Verification passed:

- Focused truth, integrity, coverage, corpus, and Western catalogue tests: 5 files, 29 tests.
- Relevant Western catalogue/runtime tests: 6 files, 36 tests.
- `pnpm test`: 126 files, 1,160 tests.
- `pnpm run typecheck`.
- `PORT=5173 BASE_PATH=/ pnpm run build`.
- `git diff --check`.

The production build emitted the existing unresolved Riichi tile asset, sourcemap, and large-chunk warnings; it exited successfully.
