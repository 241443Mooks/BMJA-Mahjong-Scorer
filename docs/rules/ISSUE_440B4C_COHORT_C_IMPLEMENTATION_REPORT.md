# Issue #440B4C — Cohort C implementation report

Status: **B4C migration implemented and verified**
Baseline: `43e8054f500c9b66117331f89325386379219a01` (`origin/main`, B4B merged)
Profile: `western-tm@0.1`
Evidence authority: *The Mah Jong Player's Companion* (1997), `TM_COMPANION_CATALOGUE_INDEX.md`, and the merged Issue #440B4 preflight.

## Frozen candidate set

The set below was compared with both the merged B4B coverage partition and the preflight matrix. It contains exactly the 26 eligible bindings reserved for Cohort C: all are not treated by Unique Wonder, B4A, or B4B, and none is one of the three deferred calculated rows. The source-family rationale follows the reviewed proposition, not detector or display-name similarity.

| # | Binding ID | Public name | Source-family rationale |
|---:|---|---|---|
| 1 | `all-winds-and-dragons` | All Winds and Dragons | Four Wind/Dragon Pungs or Kongs with a pair; source honours family. |
| 2 | `east-wind-meld-white-dragon-pair-three-suit-nonterminal-melds` | Sunrise | East Wind meld and White Dragon pair with non-terminal melds across all suits; preserve the source exposure marker. |
| 3 | `green-and-white-dragon-melds-with-green-bamboo` | Lily of the Valley | Green/White Dragon melds with the exact green Bamboo rank family. |
| 4 | `green-dragon-meld-with-green-bamboo-melds-and-pair-one-chow` | Imperial Jade | Green Dragon plus green Bamboo melds and pair; at most one Chow, specifically Bamboo 234. |
| 5 | `green-dragon-pung-white-dragon-pair-three-circle-melds` | Lillypilly | Green Dragon Pung only, White Dragon pair, and Circle melds; preserve exposure qualification. |
| 6 | `green-dragon-pung-with-bamboo-melds` | Green Jade | Green Dragon Pung-only proposition with the Companion's Bamboo family. |
| 7 | `green-dragon-pung-with-blue-circle-melds` | Blue Mountains | Green Dragon Pung-only proposition with the exact blue Circle family. |
| 8 | `heads-and-tails` | Heads and Tails | Four suited-terminal Pungs or Kongs and a pair; terminal family. |
| 9 | `one-suit-odd-melds` | Chinese Odds | Odd-rank meld structure in one suit; preserve its grouped five-set form. |
| 10 | `own-wind-meld-with-dragon-pair-and-three-suit-chows` | Hovering Angel | Player's own Wind meld, Dragon pair, and one Chow in each suit; exposed own-Wind melds are ineligible. |
| 11 | `parallel-suit-rank-melds-with-honours` | Numbers in Parallel | Parallel rank structure across suits with honours; preserve represented meld units. |
| 12 | `red-and-green-dragon-melds-with-bamboo` | Ruby Jade | Red/Green Dragon Pungs or Kongs with Bamboo melds and pair; source states no narrower Bamboo distribution. |
| 13 | `red-and-green-dragon-pungs-with-three-suits` | Red Waratah | Red and Green Dragon Pungs with suited groups; Dragon group remains Pung-only. |
| 14 | `red-and-white-dragon-melds-with-red-bamboo` | Red Lily | Red/White Dragon melds with the exact red Bamboo rank family. |
| 15 | `red-dragon-meld-with-red-bamboo-melds` | Royal Ruby | Red Dragon meld with red Bamboo ranks 1, 5, 7, and 9. |
| 16 | `red-dragon-pung-with-character-melds` | Red Coral | Red Dragon is specifically a Pung; preserve the Character family and exposure marker. |
| 17 | `red-dragon-pung-with-even-character-melds` | Dragon's Scales | Red Dragon is specifically a Pung with even Character ranks. |
| 18 | `red-white-dragon-pungs-with-seven-tile-character-or-circle-run-pair` | Dragon's Teeth | Red/White Dragon Pungs with the duplicated seven-tile Character or Circle run structure; retain source exposure qualification. |
| 19 | `three-dragon-singles-with-one-meld-in-each-suit-and-suited-pair` | Dragonfly | One single of each Dragon, one represented meld per suit, and a suited pair; source constrains exposure. |
| 20 | `three-great-scholars` | Three Great Scholars | All three Dragon sets with the remaining set/pair structure; source honours family. |
| 21 | `two-odd-suits-and-one-even-suit` | Odds & Evens | Complete loose layout with two odd suits and one even suit. |
| 22 | `two-ranks-doubled-across-two-suits-with-honour-pair` | Numbers Doubled | Two non-terminal ranks doubled across two suits with an honour pair; preserve exposure marker. |
| 23 | `white-dragon-meld-red-dragon-pair-three-suit-nonterminal-melds` | Sunset | White Dragon meld and Red Dragon pair with non-terminal melds across all suits; preserve source exposure marker. |
| 24 | `white-dragon-meld-with-even-circle-melds` | White Elephant | White Dragon meld with even Circle ranks 2, 4, 6, and 8. |
| 25 | `white-dragon-pung-with-circle-melds` | White Opal | White Dragon is specifically a Pung with Circle melds; preserve exposure marker. |
| 26 | `white-dragon-pung-with-odd-character-melds` | Driven Snow | White Dragon is specifically a Pung with odd Character ranks. |

The exact ID array is pinned in the focused B4C test. The three calculated bindings (`purity-one-chow`, `honours-and-one-suit-terminals-pung-kong-hand`, and `one-suit-with-honours-mostly-pung-kong-hand`) remain deferred for treatment-boundary review, not catalogue evidence. No BMJA, OTB, or Buzzard evidence authorizes these Western claims.

## Expected post-migration accounting

| Western state | Count |
|---|---:|
| Existing Unique Wonder | 1 |
| B4A | 34 |
| B4B | 21 |
| B4C migrated | 26 |
| Semantic-review-deferred | 3 |
| **Runtime bindings** | **85** |

Western now has **82 current treatments of 85 runtime bindings**: 1 existing Unique Wonder, 34 B4A, 21 B4B, and 26 B4C. There are no eligible untreated bindings, evidence-blocked bindings, or anonymous coverage gaps. The only untreated bindings are the three semantic-review-deferred calculations:

- `purity-one-chow`
- `honours-and-one-suit-terminals-pung-kong-hand`
- `one-suit-with-honours-mostly-pung-kong-hand`

Those rows are deferred for treatment-boundary review around calculated scoring, qualification, overlap, and/or exposure; they are not blocked for missing catalogue evidence. Western special-hand truth migration remains incomplete until that review is resolved.

The migration adds **26 Western-local subjects, 26 `tm-companion` claims, and 26 exact-profile treatments**. Runtime/source mismatch count: **0**. No selected-candidate mismatch was identified in the reviewed audit or focused runtime/catalogue checks.

## Implementation outcome and verification

Truth additions are limited to Western-local subjects, `tm-companion` claims with exact 1997 page locators, and exact-profile executable treatments. No runtime inventory, detector, scorer, or scoring behavior changed.

Verification passed:

- Focused B4C truth, integrity, coverage, corpus, and Western catalogue tests: 5 files, 29 tests.
- Relevant Western catalogue/runtime and parity tests: 11 files, 94 tests.
- `pnpm test`: 127 files, 1,164 tests.
- `pnpm run typecheck`.
- `PORT=5173 BASE_PATH=/ pnpm run build`.
- `git diff --check`.

The build emitted the existing unresolved Riichi tile asset, sourcemap, and large-chunk warnings; it exited successfully.
