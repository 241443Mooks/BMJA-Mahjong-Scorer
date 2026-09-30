# Issue #440C2A — BMJA and Outside the Box scoring deltas

Status: implementation complete; PR remains open and unmerged
Baseline: `d8b73e830fdbfa9d853bb876bd0b7120ef578941` (`origin/main`, freshly fetched; includes #463 / 440C1)
Scope: truth-only migration for `bmja@1.0` and `outside-the-box@0.1`

## Frozen 19-family inventory

The preflight inventory reconciles to 19 semantic families, 26 exact-profile claims and treatments, and 38 family × profile cells. Seven source-reviewed propositions are shared; the remaining families are OTB-local. The inventory does not generalize to Buzzard.

| # | Semantic family | Exact profile(s) | Source locator(s) |
|---:|---|---|---|
| 1 | `rule.classical.winner-no-chows-double` | BMJA + OTB | BMJA: Working out the scores, “Doubling for the player who goes Mah-Jong — No chows”; OTB: #88 transcription, §1 Ordinary scoring base > Doubles for winners > no Chows |
| 2 | `rule.classical.one-suit-with-honours-double` | BMJA + OTB | BMJA: Working out the scores, “Doubling for the player who goes Mah-Jong — All tiles are from the same suit with Dragons and/or Winds”; OTB: #88 transcription, §1 Ordinary scoring base > Doubles for winners > one suit with honours |
| 3 | `rule.classical.win-loose-tile-double` | BMJA + OTB | BMJA: Working out the scores, “Doubling for the player who goes Mah-Jong — Going Mah-Jong with a loose tile”; OTB: #88 transcription, §1 Ordinary scoring base > Doubles for winners > winning from the loose tiles / Kong box |
| 4 | `rule.classical.win-last-wall-double` | BMJA + OTB | BMJA: Working out the scores, “Doubling for the player who goes Mah-Jong — Going Mah-Jong with the last available tile from the wall”; OTB: #88 transcription, §1 Ordinary scoring base > Doubles for winners > last tile of the wall |
| 5 | `rule.classical.win-final-discard-double` | BMJA + OTB | BMJA: Working out the scores, “Doubling for the player who goes Mah-Jong — Going Mah-Jong with the final discard”; OTB: #88 transcription, §1 Ordinary scoring base > Doubles for winners > winning on the last discard |
| 6 | `rule.classical.win-robbing-kong-double` | BMJA + OTB | BMJA: Working out the scores, “Doubling for the player who goes Mah-Jong — Going Mah-Jong by robbing the kong”; OTB: #88 transcription, §1 Ordinary scoring base > Doubles for winners > robbing a Kong |
| 7 | `rule.classical.purity-calculated-three-doubles` | BMJA + OTB | BMJA: Special hands, “Purity”; OTB: #88 guide transcription, special hands, “Purity” |
| 8 | `rule.otb.winning-pair-completion-bonus` | OTB | #88 transcription, §1 Ordinary scoring base > Winner bonuses > winning tile completes a pair |
| 9 | `rule.otb.concealed-winner-wall-draw-double` | OTB | #88 transcription, §1 Ordinary scoring base > Doubles for winners > concealed hand; the reviewed crosswalk clarifies the wall-only condition |
| 10 | `rule.otb.little-three-dragons-double` | OTB | #88 transcription, §1 Ordinary scoring base > Doubles for winners > Little Three Dragons |
| 11 | `rule.otb.big-three-dragons-double` | OTB | #88 transcription, §1 Ordinary scoring base > Doubles for winners > Big Three Dragons |
| 12 | `rule.otb.little-four-joys-double` | OTB | #88 transcription, §1 Ordinary scoring base > Doubles for winners > Little Four Joys |
| 13 | `rule.otb.big-four-joys-double` | OTB | #88 transcription, §1 Ordinary scoring base > Doubles for winners > Big Four Joys |
| 14 | `rule.otb.three-concealed-pungs-kongs-double` | OTB | #88 transcription, §1 Ordinary scoring base > Doubles for winners > three concealed Pungs/Kongs |
| 15 | `rule.otb.fixed-special-flower-season-side-subtotal` | OTB | #88 transcription, §1 Ordinary scoring base > fixed special hands and Flowers/Seasons |
| 16 | `rule.otb.only-possible-winning-tile-bonus` | OTB | #88 transcription, §1 Ordinary scoring base > Winner bonuses > only possible tile |
| 17 | `rule.otb.heavenly-hand-limit-event` | OTB | #88 transcription, §1 Ordinary scoring base > Limit hands > Heavenly Hand |
| 18 | `rule.otb.earthly-hand-limit-event` | OTB | #88 transcription, §1 Ordinary scoring base > Limit hands > Earthly Hand |
| 19 | `rule.otb.first-wall-draw-limit-event` | OTB | #88 transcription, §1 Ordinary scoring base > Limit hands > first wall draw |

All BMJA ordinary winner-doubles claims use registered governing source `bmja-scoring`, exact URL `/scoring/working-out-the-scores/`, status `verified`, and profile `{ id: 'bmja', version: '1.0' }`. Purity uses registered governing source `bmja-special-hands`, its `/scoring/special-hands/` URL and “Purity” locator. All OTB claims use `otb-guide-2026-09`, retained #88 transcription/clarification locators, status `verified-club`, and profile `{ id: 'outside-the-box', version: '0.1' }`. The project crosswalk is used to classify the evidence and runtime only; it is not represented as a physical guide heading.

## Semantic sharing and classification

The seven shared subjects have independent BMJA and OTB claims. They record the same source-established proposition for each exact profile. They are not extended to Buzzard. The eight implemented OTB additions (winning pair completion, wall-only concealed winner, four Little/Big alternatives, three concealed Pungs/Kongs, and fixed-special Flower/Season side subtotal) are OTB-local. Little/Big alternatives remain separate mutually exclusive propositions within each family and stack on top of ordinary Wind/Dragon component doubles. The 15 source-ready/currently implemented families have `runtimeState: { kind: 'migration-incomplete' }` for each applicable profile.

Four OTB claims are source-proved but deliberately not executable. Their treatments use `runtimeState: { kind: 'present-not-modelled' }`:

- Only-possible winning tile +2: current hand/evidence does not prove the wait fact; completed shape is not used to infer it.
- Heavenly Hand and Earthly Hand: the reviewed OTB initial-limit set remains together with first-wall-draw; no selective bindings are made from canonical event predicates.
- First-wall-draw limit event: current evidence cannot prove this condition.

No C2A treatment has an executable ref or a score/value field. Values needed to state a proposition appear only in source claims. No new truth registry, runtime ref kind, score behavior, special-hand membership, or Classical runtime edge was introduced.

## Exact accounting

| Measure | Count |
|---|---:|
| Frozen semantic families | 19 |
| Exact-profile claims | 26 |
| Exact-profile treatments | 26 |
| Family × profile coverage cells | 38 |
| Source-ready / migrated cells | 26 |
| `migration-incomplete` treatments | 22 |
| `present-not-modelled` treatments | 4 |
| Not-applicable cells | 12 |
| Source-unresolved cells in this inventory | 0 |

C1 remains an independently asserted 16-family inventory with 39 claims, 39 treatments and 48 coverage cells (39 source-ready, 9 not applicable). Its separate tests remain unchanged.

## #464 and other exclusions

No treatments are added for Buzzard no-Chows/all-Pungs winner double, BMJA concealed-hand winner double, BMJA Original Call, or BMJA/Buzzard all-majors ordinary double. No Buzzard C2 rows, settlement, progression, Goulash, penalties/incidents/liability, validation, Chow-count legality, call procedure, Western T&M, MCR, Riichi, legacy scoring catalogue, runtime-edge redesign, UI/reference copy, or duplicate C1 foundation is included. Existing special-hand membership is unchanged.

## Verification

Baseline was freshly fetched and matched exactly: `d8b73e830fdbfa9d853bb876bd0b7120ef578941`. Verification at final HEAD:

| Check | Result |
|---|---|
| Focused C2A truth/coverage, C1 truth/coverage, integrity/corpus, BMJA special-hand, scoring/fishing/Purity, OTB scoring/readiness/profile tests | PASS — 12 files, 106 tests |
| `pnpm test` | PASS — 130 files, 1,175 tests |
| `pnpm run typecheck` | PASS |
| `PORT=5173 BASE_PATH=/ pnpm run build` | PASS — existing missing Riichi tile asset, sourcemap and chunk-size warnings; exit 0 |
| `git diff --check` | PASS |
