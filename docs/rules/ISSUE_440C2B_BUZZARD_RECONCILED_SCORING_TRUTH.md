# Issue #440C2B — Buzzard deltas and reconciled Classical scoring truth

Status: implementation complete; PR target `main`, not merged
Baseline: `e3aa8e3c31a92350c44dd5c593db5ce76541ef92` (`origin/main`, freshly fetched; includes merged #466 / completed #464 reconciliation)
Scope: source-ready scoring truth for `bmja@1.0` and `buzzard-2000@0.1`; no production scoring changes

## Frozen inventory

The migration contains 19 exact-profile treatment rows across 18 semantic families. All treatments are `migration-incomplete`: runtime behavior is present/proved, but the ordinary Classical truth edge does not yet expose stable executable rule refs.

| # | Semantic family | Exact profile | Source locator |
|---:|---|---|---|
| 1 | `rule.classical.winner-no-chows-double` | BMJA + Buzzard | BMJA: *Working out the scores*, “Doubling for the player who goes Mah-Jong — No chows”; Buzzard: retained source p.10, “DOUBLES — Winning by Pairs” |
| 2 | `rule.classical.one-suit-with-honours-double` | BMJA + Buzzard | BMJA: *Working out the scores*, “...same suit with Dragons and/or Winds”; Buzzard: p.10, “DOUBLES — One suit and Winds/Dragons” |
| 3 | `rule.classical.win-loose-tile-double` | BMJA + Buzzard | BMJA: *Working out the scores*, “Going Mah-Jong with a loose tile”; Buzzard: p.10, “DOUBLES — Loose Tile” |
| 4 | `rule.classical.win-last-wall-double` | BMJA + Buzzard | BMJA: *Working out the scores*, “last available tile from the wall”; Buzzard: p.10, “DOUBLES — Last drawable wall tile” |
| 5 | `rule.classical.win-robbing-kong-double` | BMJA + Buzzard | BMJA: *Working out the scores*, “robbing the kong”; Buzzard: p.10, “DOUBLES — Snatching a Kong” |
| 6 | `rule.classical.all-majors-with-honours-double` | BMJA + Buzzard | BMJA: *Working out the scores*, “all Ones and Nines with some Dragons and/or Winds”; Buzzard: p.10, “DOUBLES — Ones/Nines with Winds/Dragons” |
| 7 | `rule.classical.concealed-mixed-winner-double` | BMJA | *Working out the scores*, “concealed hand”; Glossary, “concealed hand” |
| 8 | `rule.classical.original-call-fishing-all-player-double` | BMJA | *Working out the scores*, “Doubling for all players — Original call”; Glossary, “original call” |
| 9 | `rule.classical.original-call-winner-double` | BMJA | *Working out the scores*, “Going Mah-Jong with the original call” |
| 10 | `rule.buzzard-2000.pure-one-suit-winner-three-doubles` | Buzzard | p.10, “DOUBLES — Entirely one suit” |
| 11 | `rule.buzzard-2000.all-chows-nonscoring-pair-double` | Buzzard | p.10, “DOUBLES — All Chows and a non-scoring pair” |
| 12 | `rule.buzzard-2000.standing-hand-winner-bonus` | Buzzard | p.10, “BONUS SCORES — Standing Hand” |
| 13 | `rule.buzzard-2000.only-possible-winning-tile-bonus` | Buzzard | p.10, “BONUS SCORES — Only possible winning tile” |
| 14 | `rule.buzzard-2000.no-chows-additive-bonus` | Buzzard | p.10, “BONUS SCORES — No Chows” |
| 15 | `rule.buzzard-2000.scoreless-hand-bonus` | Buzzard | p.10, “BONUS SCORES — Scoreless hand” |
| 16 | `rule.buzzard-2000.last-wall-additive-bonus` | Buzzard | p.10, “BONUS SCORES — Last drawable wall tile” |
| 17 | `rule.buzzard-2000.loose-tile-additive-bonus` | Buzzard | p.10, “BONUS SCORES — Loose Tile” |
| 18 | `rule.buzzard-2000.flower-season-set-own-tile-cumulative-doubles` | Buzzard | pp.10–11, “DOUBLES — Four Flowers/Four Seasons and own Flower/Season”; “NOTES ON SCORING — cumulative doubles” |

The five subjects in rows 1–5 already existed in C2A. Their BMJA and OTB claims/treatments remain, and C2B adds source-independent Buzzard claims/treatments. The other 13 families are new: the all-majors shared subject, three BMJA-local subjects, and nine Buzzard-local subjects.

## #464 reconciliation decisions recorded

- **No Chows (row 1):** #464 restored Buzzard's no-Chows winner double while retaining the independent +10 bonus. The records describe these as separate propositions.
- **Concealed winner (row 7):** the BMJA treatment requires a non-pair suited set and a non-pair Wind/Dragon set in a concealed hand; an exposed winning pair prevents the double. This is BMJA-local.
- **Original Call (rows 8–9):** #464 separated the all-player double while fishing after the first discard with an unaltered hand from the additional double awarded to a winner with Original Call. They remain separate subjects and treatments.
- **All majors (row 6):** the source proposition is suited terminals together with one or more Winds/Dragons. #464 found effective runtime equivalence because pure-terminal completed winners are intercepted as fixed Heads and Tails before ordinary doubles are emitted. The ordinary code predicate remains broader internally; it is not the truth proposition. Only BMJA and Buzzard are recorded.

## Buzzard-specific interpretation closure

The source's cumulative-doubles note and focused runtime proof resolve the remaining C1 interpretation fixture: the complete Flower/Season set contributes three doubles (×8), and a matching own Flower/Season contributes one more; together they yield four doubles (×16). C2B models this cumulative interaction in a new subject. The C1 own-tile and complete-set component subjects are unchanged and not duplicated.

The three independent additive awards (+10 for no Chows, last-wall win, and Loose-Tile win) remain distinct from similarly conditioned doubles. Fixed limit-hand catalogue entries already covered by 440B receive no ordinary treatments.

## Exclusions and verification

No source claims are added for Western T&M, OTB, MCR, or Riichi. No score/value payloads, executable ordinary-rule refs, settlement/progression/liability/penalty/procedure records, runtime changes, legacy catalogue rewrites, or UI/reference copy are included. Buzzard fixed limit hands including All Winds and Dragons, Original Hand, Heads and Tails / All Ones and Nines, and other fixed bindings remain under 440B.

Verification at final HEAD:

| Check | Result |
|---|---|
| Focused C2B, C2A, C1, truth integrity/corpus, Buzzard ordinary/scoring, #464 seams, BMJA ordinary, fishing/Original Call, special-hand precedence | PASS — 10 files, 142 tests |
| `pnpm test` | PASS — 131 files, 1,186 tests |
| `pnpm run typecheck` | PASS |
| `PORT=5173 BASE_PATH=/ pnpm run build` | PASS — existing missing Riichi tile asset and chunk-size warnings; exit 0 |
| `git diff --check` | PASS |

**440C2 is complete: source-ready C2B inventory migrated, requested verification passed, and a pull request is opened against `main`; it remains unmerged.**
