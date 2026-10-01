# Issue #440F — final truth-corpus closeout

**Baseline:** `df9d5375f0cdffbe58093732fb1664ace55bebb0` (`origin/main`, freshly fetched after PR #476 merged on 2026-10-01).  
**Scope:** deterministic accounting and disposition of the reviewed #440 current corpus. This closeout adds no rule truth and does not change runtime behavior.

## Purpose and completion definition

#440 closes when reviewed implementation-relevant truth is migrated, corpus integrity is green, no competing rule/score database exists, and every remaining item in the bounded corpus has an explicit disposition. Completeness is bounded to the current profiles and does not claim to model every Mahjong rule.

## Current profiles

The frozen profiles are `bmja@1.0`, `western-tm@0.1`, `outside-the-box@0.1`, `buzzard-2000@0.1`, and `mcr-wmo-2006@0.1`. MCR remains provisional and is not included in the public/current playable profiles.

## Final assembled corpus

All values below are derived from `currentTruthCorpus` by `truth-440f-final-corpus-closeout.test.ts`.

| Measure | Final count |
| --- | ---: |
| Registered source records | 10 |
| Current subjects | 317 |
| Current claims | 380 |
| Current treatments | 378 |

### Runtime state histogram

| Runtime state | Count |
| --- | ---: |
| `executable` | 227 |
| `absent-by-rule` | 0 |
| `present-not-modelled` | 5 |
| `unknown` | 0 |
| `not-applicable` | 0 |
| `migration-incomplete` | 146 |

The five `present-not-modelled` treatments are `bmja@1.0:rule.bmja.dead-wanted-tile-does-not-remove-fishing-eligibility`, plus OTB `rule.otb.earthly-hand-limit-event`, `rule.otb.first-wall-draw-limit-event`, `rule.otb.heavenly-hand-limit-event`, and `rule.otb.only-possible-winning-tile-bonus` (each under `outside-the-box@0.1`). There are no unknown treatments. `migration-incomplete` records known source/profile treatments whose executable ownership belongs to runtime strategy seams outside the truth-ref model; they are not unknown or unresolved.

### Treatments by exact profile

| Exact profile | Treatments |
| --- | ---: |
| `bmja@1.0` | 62 |
| `western-tm@0.1` | 84 |
| `outside-the-box@0.1` | 85 |
| `buzzard-2000@0.1` | 56 |
| `mcr-wmo-2006@0.1` | 91 |

Executable truth refs by kind: `binding` 225; `policy` 2; `rule` 0. The current `RuntimeTreatmentRef` kinds remain exactly `rule`, `binding`, and `policy`.

## Classical special-hand catalogue

The closeout joins executable treatment refs to each exact runtime inventory:

| Profile | Runtime bindings | Executable truth treatments |
| --- | ---: | ---: |
| BMJA | 18 | 18 |
| Western T&M | 85 | 84 |
| Outside the Box | 33 | 33 |
| Buzzard 2000 | 10 | 9 |
| **Total** | **146** | **144** |

The two intentional treatment gaps remain semantic-review-deferred:

- Western T&M Purity, runtime binding `purity-one-chow` — #461, resolve exposed-Chow runtime equivalence.
- Buzzard Concealed Pungs/Kongs, runtime binding `four-concealed-pung-kong-hand` — #462, resolve concealment and winning-tile semantics.

440F does not resolve these reviews or force catalogue coverage to 146/146.

## MCR catalogue and profile semantics

- Fan runtime bindings: 81; executable fan treatments: **81/81**.
- Executable MCR policy treatments: 2 — non-combination and eight-before-Flowers.
- E4 profile-semantic treatments: 8, all `migration-incomplete`.
- Exact-profile MCR treatment count: **91**.

The eight E4 semantics do not represent missing fan coverage. MCR remains `mcr-wmo-2006@0.1`, provisional and non-public/playable. Details remain in [440E](./ISSUE_440E_MCR_TRUTH_MIGRATION.md).

## Unresolved and source-blocked ledger

The deterministic 66-row total is computed from the frozen 440D, C3A, C4 and E4 inventories; their semantic definitions remain in those batch records.

| Frozen inventory | Classification | Rows |
| --- | --- | ---: |
| 440D Western ordinary baseline | `needs-primary-source` | 54 |
| C3A exact profile cells | `source-unresolved` | 3 |
| C4 exact profile cells | `source-unresolved` | 8 |
| MCR E4 draw settlement | `source-unresolved` | 1 |
| **Total source-blocked/source-unresolved rows** |  | **66** |

The 440D 54 ordinary candidates remain without Western ordinary claims or treatments, grouped as:

| Domain | Rows |
| --- | ---: |
| Setup and hand model | 7 |
| Calling and hand legality | 6 |
| Ordinary point scoring | 9 |
| Ordinary doubles and calculated scoring | 15 |
| Settlement and progression | 8 |
| Goulash, incidents and procedure | 9 |

The three C3A unresolved cells are Buzzard Flowers/Seasons outside ordinary structure; OTB normal-hand one-Chow limit; and OTB exposed/concealed set meaning. Each remains without an authorizing claim or treatment for that exact cell.

The eight C4 unresolved cells are BMJA draw has no settlement; Buzzard dead/drawn hand has no settlement; OTB East retained after East wins; OTB non-East win rotates seats; OTB all players serve/lose East before prevailing Wind advances; OTB prevailing Winds East → South → West → North; OTB full traditional game has four prevailing-Wind rounds; and OTB ordinary false-discard-name 50-point penalty recipient. No item is inferred from runtime reuse.

The MCR E4 unresolved cell is draw has no settlement. §3.4.2 establishes Draw Game terminology but does not establish a no-transfer proposition strongly enough for machine truth. It has no claim or treatment.

### Western source-upgrade owner

Issue #121 owns verification of ordinary Thompson & Maloney rules and the `western-tm@1.0` promotion gate. `tm-game-illustrated` is not registered as a machine source until #121 has an inspected pinned edition and exact locators. 440F does not create a duplicate issue or promote Western.

## Product/runtime and scope boundaries

These are classifications, not missing source truth, and do not receive umbrella truth records merely for accounting:

- Application one-round mode is product policy.
- MCR `interpretation.max-lawful-profile` is product/runtime policy, not a separate governing-source treatment.
- MCR minimum input/evidence shape is a product contract.
- MCR tournament penalties and referee administration are outside the deterministic scorer scope.
- Automatic reconstruction of OTB/Buzzard liability from full play history is outside current companion scope.
- Runtime strategy identities remain implementation seams owned by resolved profiles. They are not fabricated `rule`, `binding`, or `policy` truth refs.

Riichi, NMJL/American, Hong Kong, Taiwanese, Zung Jung, and future club/custom profiles are not omissions from the current #440 corpus. Their existing future programmes/issues remain their owners. 440F does not begin Riichi migration.

## Integrity and competing-truth result

The final audit reuses `validateTruthCorpus`, `assertTruthCorpusIntegrity`, `currentTruthIndex`, and the existing exact-profile runtime validation edge. It proves unique current subject/claim/treatment IDs; registered claim sources; resolvable same-subject evidence for every treatment; exact known profile/version targets; and successful runtime resolution for every executable treatment. The assembled corpus validates with no diagnostics and the integrity assertion passes.

The same audit confirms unresolved C3A/C4/MCR cells have no authorizing treatment, Western ordinary coverage has no claim/treatment, and no `tm-game-illustrated` source/claim exists. Secondary-only evidence cannot authorize executable treatment under the shared integrity validator. Special-hand runtime joins have only the two named deferrals; all 81 MCR fans have executable treatments. Treatment records contain no score/value payload. No truth-ref category was added, and current record schema/version/history checks remain green.

Runtime remains authoritative for executable behavior. Truth is a provenance and profile-treatment layer, not a competing score or rule database.

## Final verification

Verified in the clean 440F worktree based on `df9d5375f0cdffbe58093732fb1664ace55bebb0`; PR head SHA will be recorded after commit:

- Focused requested coverage: **22 files passed, 127 tests passed** (440F, 440A, Western 440D, MCR E1/E2/E3/E4, C1/C2A/C2B/C3A/C4, Classical special suites, corpus, integrity and resolver).
- `pnpm test`: **139 files passed, 1,221 tests passed**.
- `pnpm run typecheck`: passed.
- `PORT=5173 BASE_PATH=/ pnpm run build`: passed; Vite reported existing missing Riichi tile asset URL and large-chunk warnings.
- `git diff --check`: passed.

Issues #121, #461 and #462 were checked and remain open for their named follow-up work.

## Completion decision

#440 complete — reviewed implementation-relevant current rules knowledge is migrated or explicitly classified; remaining source and semantic gaps are intentionally deferred to their named owners.
