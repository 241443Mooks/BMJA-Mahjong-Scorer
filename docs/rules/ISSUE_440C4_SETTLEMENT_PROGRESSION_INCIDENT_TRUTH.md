# Issue #440C4 — Classical settlement, progression and incident truth

Status: implementation complete; source inventory was frozen before truth authoring  
Baseline: `c427f1522ea444bf60e7d177462caea6ee408f48` (`origin/main`, freshly fetched; includes #469 / completed 440C3)

## Frozen source inventory

Inventory was completed before authoring truth records. Only `source-ready-runtime-aligned` and `source-ready-present-not-modelled` rows are eligible for claims and treatments. `source-unresolved` rows receive neither. Product policy and reference-only rows are excluded from source truth.

### Ordinary settlement

| Proposition | Exact profile | Disposition | Governing locator |
|---|---|---|---|
| Each loser pays the winner the winner's hand score | `bmja@1.0` | source-ready-runtime-aligned | `bmja-settlement`, *Settling up* > “Paying the winner” |
| Non-winners settle pairwise differences between hand scores | `bmja@1.0` | source-ready-runtime-aligned | `bmja-settlement`, *Settling up* > “Paying the other players” |
| A payment involving East is doubled | `bmja@1.0` | source-ready-runtime-aligned | `bmja-settlement`, *Settling up* > “Paying the winner” / “Paying the other players” |
| Each loser pays the winner the winner's hand score | `outside-the-box@0.1` | source-ready-runtime-aligned | `otb-guide-2026-09`, supplied guide, ordinary settlement |
| Non-winners settle pairwise differences between hand scores | `outside-the-box@0.1` | source-ready-runtime-aligned | `otb-guide-2026-09`, supplied guide, ordinary settlement |
| A payment involving East is doubled | `outside-the-box@0.1` | source-ready-runtime-aligned | `otb-guide-2026-09`, supplied guide, ordinary settlement |
| Each loser pays the winner the winner's hand score | `buzzard-2000@0.1` | source-ready-runtime-aligned | `buzzard-2000-classical`, p. 8, “SETTLEMENT OF SCORES” |
| Non-winners settle pairwise differences between hand scores | `buzzard-2000@0.1` | source-ready-runtime-aligned | `buzzard-2000-classical`, p. 8, “SETTLEMENT OF SCORES” |
| A payment involving East is doubled | `buzzard-2000@0.1` | source-ready-runtime-aligned | `buzzard-2000-classical`, p. 8, “SETTLEMENT OF SCORES” |

The settlement subjects may be shared only with the independent exact-profile claims above. OTB is not treated as inheriting BMJA runtime semantics.

### Draw handling

| Proposition | Exact profile | Disposition | Governing locator |
|---|---|---|---|
| East remains East after a draw | `bmja@1.0` | source-ready-runtime-aligned | `bmja-qa`, *Playing-the-game Q&A* > “Winds” / “Drawn game” |
| East remains East after a draw | `outside-the-box@0.1` | source-ready-runtime-aligned | `otb-guide-2026-09`, supplied guide, draw/round-state section |
| East remains East after a draw | `buzzard-2000@0.1` | source-ready-runtime-aligned | `buzzard-2000-classical`, p. 7, Rules 11–14 |
| A draw has no score/settlement | `outside-the-box@0.1` | source-ready-runtime-aligned | `otb-guide-2026-09`, supplied guide, draw/round-state section |
| A dead hand has no settlement/payments/transfers | `buzzard-2000@0.1` | source-unresolved | The available retained evidence ledger transcribes p. 7 as “dead hand: no scoring”; it does not establish a settlement consequence. The snapshot PDF was not available in this checkout and the canonical page fetch failed TLS hostname verification. No claim or treatment is retained for this proposition. |
| A draw has no settlement transfers | `bmja@1.0` | source-unresolved | Q&A says “No one scores anything”; it does not directly specify transfers. Existing no-transfer behavior is project interpretation, not governing authority. |

### East, seat and prevailing-Wind progression

| Proposition | Exact profile | Disposition | Governing locator |
|---|---|---|---|
| East remains East after East wins | `bmja@1.0` | source-ready-runtime-aligned | `bmja-qa`, *Playing-the-game Q&A* > “Winds” / “And East Wind” |
| After a non-East win, South becomes East and seat Winds rotate | `bmja@1.0` | source-ready-runtime-aligned | `bmja-qa`, *Playing-the-game Q&A* > “And East Wind” |
| After all four players have served/lost East, prevailing Wind advances | `bmja@1.0` | source-ready-runtime-aligned | `bmja-qa`, *Playing-the-game Q&A* > “Winds”; `bmja-approved-site`, *Preparing to play* > “Changing the prevailing Wind” |
| Prevailing Winds progress East → South → West → North | `bmja@1.0` | source-ready-runtime-aligned | `bmja-approved-site`, *Preparing to play* > “Changing the prevailing Wind” |
| A full traditional game comprises the four prevailing-Wind rounds | `bmja@1.0` | source-ready-runtime-aligned | `bmja-approved-site`, *Preparing to play* > “Determine the prevailing Wind” / “Changing the prevailing Wind” |
| East remains East after East wins | `buzzard-2000@0.1` | source-ready-runtime-aligned | `buzzard-2000-classical`, p. 7, Rules 11–14 |
| After a non-East win, South becomes East and seat Winds rotate | `buzzard-2000@0.1` | source-ready-runtime-aligned | `buzzard-2000-classical`, p. 7, Rules 11–14 |
| After all four players have served/lost East, prevailing Wind advances | `buzzard-2000@0.1` | source-ready-runtime-aligned | `buzzard-2000-classical`, p. 7, Rules 11–14 |
| Prevailing Winds progress East → South → West → North | `buzzard-2000@0.1` | source-ready-runtime-aligned | `buzzard-2000-classical`, p. 7, Rules 11–14 |
| A full traditional game comprises the four prevailing-Wind rounds | `buzzard-2000@0.1` | source-ready-runtime-aligned | `buzzard-2000-classical`, p. 7, Rules 11–14 |
| Ordinary East/seat/prevailing-Wind progression propositions | `outside-the-box@0.1` | source-unresolved | The supplied club evidence reviewed for C4 establishes draw retention and Goulash state transitions, not the ordinary full progression cycle. Do not infer it from BMJA engine reuse. |

The application’s one-round mode is `product-policy-not-source-truth`; it receives no evidence claim or treatment. This inventory makes no claim about a shortened traditional game.

### OTB Goulash round transition

| Proposition | Exact profile | Disposition | Governing locator |
|---|---|---|---|
| Normal + winner → Normal | `outside-the-box@0.1` | source-ready-runtime-aligned | `otb-guide-2026-09`, supplied guide, Goulash/round transitions |
| Normal + draw → Goulash | `outside-the-box@0.1` | source-ready-runtime-aligned | `otb-guide-2026-09`, supplied guide, Goulash/round transitions |
| Goulash + winner → Normal | `outside-the-box@0.1` | source-ready-runtime-aligned | `otb-guide-2026-09`, supplied guide, Goulash/round transitions |
| Goulash + draw → Goulash | `outside-the-box@0.1` | source-ready-runtime-aligned | `otb-guide-2026-09`, supplied guide, Goulash/round transitions |
| Goulash draw retains East and has no settlement | `outside-the-box@0.1` | source-ready-runtime-aligned | `otb-guide-2026-09`, supplied guide, draw/round-state section |

These are transition/round-outcome facts. C3A’s Goulash hand legality and blank/Chow rules are not duplicated.

### Outside the Box incidents

| Proposition | Exact profile | Disposition | Governing locator |
|---|---|---|---|
| Incorrect tile count prevents Mahjong; too few may retain a score; too many score zero | `outside-the-box@0.1` | source-ready-runtime-aligned | `otb-guide-2026-09`, supplied guide, incorrect tile count |
| False discard name leading to Mah Jong stops play; discarder covers all three loser shares; no other settlement | `outside-the-box@0.1` | source-ready-runtime-aligned | `otb-guide-2026-09`, supplied guide, false discard name / false Mah Jong |
| Ordinary false discard name with claimed tile: 50-point penalty and its settlement recipient | `outside-the-box@0.1` | source-unresolved | `otb-guide-2026-09`, supplied guide, false discard name; source records 50 points but does not identify a recipient, so no claim or settlement treatment is authored for this candidate |
| False Mahjong with no exposed hand has no penalty | `outside-the-box@0.1` | source-ready-runtime-aligned | `otb-guide-2026-09`, supplied guide, false Mahjong |
| False Mahjong after exposure makes declarer pay each other player half the table limit | `outside-the-box@0.1` | source-ready-runtime-aligned | `otb-guide-2026-09`, supplied guide, false Mahjong |
| Timely wrong-tile-claim correction before next draw has no penalty | `outside-the-box@0.1` | source-ready-runtime-aligned | `otb-guide-2026-09`, supplied guide, wrong tile claim |
| Otherwise wrong-tile claimant cannot Mahjong | `outside-the-box@0.1` | source-ready-runtime-aligned | `otb-guide-2026-09`, supplied guide, wrong tile claim |
| Claimed set remains on table after wrong-tile claim | `outside-the-box@0.1` | reference-only-out-of-product-scope | Physical play state; no play-history simulation |
| Cannon liability: cannoner pays all winner-payment shares; ordinary loser-to-loser settlement is suppressed | `outside-the-box@0.1` | source-ready-runtime-aligned | `otb-guide-2026-09`, supplied guide, Cannon |
| Accepted No choice! evidence cancels Cannon liability | `outside-the-box@0.1` | source-ready-runtime-aligned | `otb-guide-2026-09`, supplied guide, No choice! |
| Automatic reconstruction of liability from discard/claim history | `outside-the-box@0.1` | reference-only-out-of-product-scope | Companion accepts the table-resolved liability fact; no gameplay simulation |

### Buzzard settlement and incidents

| Proposition | Exact profile | Disposition | Governing locator |
|---|---|---|---|
| Qualifying incomplete Four-Wind / Three-Dragon result may score limit against the other losers while still settling normally against the winner | `buzzard-2000@0.1` | source-ready-runtime-aligned | `buzzard-2000-classical`, pp. 11–12, Four-Wind/Three-Dragon limit settlement text |
| Source-defined dangerous discard makes discarder liable for all winner payments and suppresses loser-to-loser settlement | `buzzard-2000@0.1` | source-ready-runtime-aligned | `buzzard-2000-classical`, p. 12, “ERRORS AND PENALTIES” |
| Fully exposed invalid Mahjong makes declarer pay double the limit to each other player | `buzzard-2000@0.1` | source-ready-runtime-aligned | `buzzard-2000-classical`, p. 12, “ERRORS AND PENALTIES” |
| Unexposed false Mahjong call may be withdrawn without that penalty | `buzzard-2000@0.1` | source-ready-runtime-aligned | `buzzard-2000-classical`, p. 12, “ERRORS AND PENALTIES” |
| Wrong-count hand cannot win | `buzzard-2000@0.1` | source-ready-runtime-aligned | `buzzard-2000-classical`, p. 7, Rule 12 |
| Too-many-tile hand’s own score is not deducted before settlement | `buzzard-2000@0.1` | source-ready-runtime-aligned | `buzzard-2000-classical`, p. 7, Rule 12 |
| Too-few-tile hand’s own score is deducted normally | `buzzard-2000@0.1` | source-ready-runtime-aligned | `buzzard-2000-classical`, p. 7, Rule 12 |
| Automatic dangerous-discard detection from play history | `buzzard-2000@0.1` | reference-only-out-of-product-scope | Companion receives the resolved liable player/reason; no gameplay simulation |

### BMJA incidents and exclusions

| Candidate | Exact profile | Disposition | Basis |
|---|---|---|---|
| BMJA incident/penalty propositions outside already-reviewed companion-relevant truth | `bmja@1.0` | source-unresolved | C4 does not open a new BMJA penalty research programme; no readily locatable reviewed governing claim is added |
| Western T&M ordinary settlement, progression, draw and incident truth | `western-tm@0.1` | source-unresolved | Complete ordinary primary source remains unavailable; defer to 440D |
| MCR/Riichi settlement, progression and incident truth | MCR/Riichi profiles | reference-only-out-of-product-scope | Excluded from 440C |
| Runtime strategy identities as executable truth refs | All considered profiles | reference-only-out-of-product-scope | Strategy/registry identities are not `rule`, `binding`, or `policy` truth refs |

## Frozen runtime rule

All source-ready/runtime-aligned rows use `runtimeState: { kind: 'migration-incomplete' }`. A source-ready proposition deliberately outside executable capability may use `present-not-modelled`. Unresolved, product-policy, and reference-only rows receive no treatment. No current runtime/source contradiction was found in the reviewed evidence; if focused regression review reveals one, migration stops for that row.

The frozen one-round product policy, unresolved BMJA draw-settlement and OTB ordinary progression cells are explicit coverage gaps. No Western ordinary rules or duplicate C1/C2/C3 truth are in scope. Buzzard’s non-winner limit settlement concerns the settlement consequence only and does not duplicate special-hand catalogue membership.

## Final accounting

The frozen C4 inventory contains **23 semantic subjects**, **35 exact-profile source claims**, and **35 exact-profile treatments**. Coverage has **69 subject/profile cells**: 35 source-ready/migrated, 8 source-unresolved with neither claim nor treatment, and 26 not applicable. All 35 treatments are `migration-incomplete`; none is `present-not-modelled`, executable, or value-bearing. The source registry adds only the governing `bmja-settlement` record; progression uses the existing `bmja-qa` and `bmja-approved-site` records.

Assembled corpus totals are **229 subjects, 292 claims, and 290 treatments**. The exact special-hand executable treatment counts remain BMJA 18, Western T&M 84, OTB 33, and Buzzard 9. C1, C2A, C2B, and C3A inventories and their frozen claim/treatment totals are unchanged.

## Verification

| Check | Result |
|---|---|
| C4 truth/coverage, BMJA settlement/progression, OTB settlement/incidents/Goulash, Buzzard settlement/incidents/non-winner, C1/C2/C3 truth regressions, truth integrity/corpus | PASS — 15 files, 129 tests |
| `pnpm test` | PASS — 133 files, 1,200 tests |
| `pnpm run typecheck` | PASS |
| `PORT=5173 BASE_PATH=/ pnpm run build` | PASS — existing sourcemap-location and chunk-size warnings; exit 0 |
| `git diff --check` | PASS |

## Source review references

- `bmja-settlement`: *Settling up*, “Paying the winner” and “Paying the other players”.
- `bmja-qa`: *Playing-the-game Q&A*, “Winds”, “Drawn game”, and “And East Wind”.
- `bmja-approved-site`: *Preparing to play*, “Determine the prevailing Wind” and “Changing the prevailing Wind”.
- `otb-guide-2026-09`: supplied club guide evidence retained and transcribed in `OUTSIDE_THE_BOX_PROFILE_CROSSWALK.md`, §§5–7 and #88D round-state evidence.
- `buzzard-2000-classical`: retained 13-page primary snapshot; p. 7 Rules 11–14, p. 8 “SETTLEMENT OF SCORES”, pp. 11–12 non-winner limits, and p. 12 “ERRORS AND PENALTIES”. The p. 7 wording available in the checked-in ledger establishes “no scoring” only; the settlement proposition stays unresolved.

Pull request [#470](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/pull/470) is open against `main` and remains unmerged.

## Exit

440C complete
