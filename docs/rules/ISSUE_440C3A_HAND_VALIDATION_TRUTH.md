# Issue #440C3A — Classical hand structure, validation and evidence truth

Status: source inventory frozen before authoring; implementation in progress  
Baseline: `3787df7441a5dc6af450748f386701a5c85fde49` (`origin/main`, freshly fetched; includes merged #468 / C3R Original Call reconciliation)  
Profiles considered: `bmja@1.0`, `outside-the-box@0.1`, `buzzard-2000@0.1`

## Frozen source inventory

The following dispositions were frozen before C3A truth records were authored. Only `source-ready-runtime-aligned` and `source-ready-present-not-modelled` rows are eligible for claims and treatments. `source-unresolved` rows remain explicit coverage gaps; the other categories are excluded from this slice.

| Candidate proposition | Exact profile | Frozen disposition | Source basis / locator |
|---|---|---|---|
| Flowers and Seasons are bonus tiles outside normal structural tile counts | `bmja@1.0` | source-ready-runtime-aligned | BMJA glossary, “Bonus tiles”; Q&A “Numbers of tiles” and “Select out any Flower or Season” |
| Flowers and Seasons are bonus tiles outside normal structural tile counts | `outside-the-box@0.1` | source-ready-runtime-aligned | Supplied OTB guide evidence as transcribed in #88 §1 ordinary scoring and #88D Goulash facts; ordinary hand is British-style and bonus tiles are scored separately |
| Flowers and Seasons are bonus tiles outside normal structural tile counts | `buzzard-2000@0.1` | source-unresolved | Retained source ledger does not record a direct structural locator for this proposition; no BMJA transfer |
| Non-winning ordinary hand has 13 structural playing tiles | `bmja@1.0` | source-ready-runtime-aligned | BMJA approved Q&A, “Numbers of tiles”; glossary “Fishing / Calling” |
| Non-winning ordinary hand has 13 structural playing tiles | `outside-the-box@0.1` | source-ready-runtime-aligned | #88 reviewed OTB ordinary structure crosswalk and #88D supplied guide evidence; exact-profile club source |
| Non-winning ordinary hand has 13 structural playing tiles | `buzzard-2000@0.1` | source-ready-runtime-aligned | Retained Buzzard source snapshot, p. 11, thirteen-tile calling shape / fourteen-tile completion evidence, as captured in the #440B3 reconciliation |
| Winning ordinary hand has 14 structural playing tiles | `bmja@1.0` | source-ready-runtime-aligned | BMJA approved Q&A, “Numbers of tiles”; “Going Mah-Jong” tile-count clarification |
| Winning ordinary hand has 14 structural playing tiles | `outside-the-box@0.1` | source-ready-runtime-aligned | #88 reviewed OTB ordinary structure crosswalk and #88D supplied guide evidence |
| Winning ordinary hand has 14 structural playing tiles | `buzzard-2000@0.1` | source-ready-runtime-aligned | Retained Buzzard source snapshot, p. 11, fourteen-tile limit-hand completion evidence |
| Kong is four physical tiles occupying one of four normal set positions | `bmja@1.0` | source-ready-runtime-aligned | BMJA approved Q&A, “Kongs” and “Numbers of tiles”; playing-game page, “Types of sets” / “Sets and Mah-Jong” |
| Kong is four physical tiles occupying one of four normal set positions | `outside-the-box@0.1` | source-ready-runtime-aligned | #88 reviewed OTB ordinary structure crosswalk; guide's ordinary set model and Kong treatment |
| Kong is four physical tiles occupying one of four normal set positions | `buzzard-2000@0.1` | source-ready-runtime-aligned | Retained Buzzard source snapshot, ordinary hand structure and Kong scoring sections, recorded in #440C1 source ledger |
| Ordinary winning hand is four sets plus one pair | `bmja@1.0` | source-ready-runtime-aligned | BMJA approved Q&A, “Numbers of tiles”; playing-game page, “Sets and Mah-Jong” |
| Ordinary winning hand is four sets plus one pair | `outside-the-box@0.1` | source-ready-runtime-aligned | #88 reviewed OTB ordinary structure crosswalk; exact-profile guide evidence |
| Ordinary winning hand is four sets plus one pair | `buzzard-2000@0.1` | source-ready-runtime-aligned | Retained Buzzard source snapshot, p. 11, ordinary hand structure and fourteen-tile completion |
| Ordinary grouped hands permit at most one Chow | `bmja@1.0` | source-ready-runtime-aligned | BMJA approved Q&A, “Chows”; only one in the normal game |
| Ordinary grouped hands permit multiple Chows, including an all-Chow hand | `buzzard-2000@0.1` | source-ready-runtime-aligned | Retained Buzzard source snapshot, p. 10, “All Chows + a non-scoring pair”; #175/#217 provenance confirms the retained primary snapshot governs Buzzard |
| Normal-mode ordinary Chow limit | `outside-the-box@0.1` | source-unresolved | Reviewed #88 evidence establishes no Chows in Goulash only; it does not establish normal-mode Chow limit. Do not infer from BMJA validator reuse |
| Goulash permits no Chows | `outside-the-box@0.1` | source-ready-runtime-aligned | Supplied OTB guide evidence, #88A guide transcription and #88D accepted Goulash contract |
| Exposed means a meld uses a claimed discard; concealed means formed without claiming a discard | `bmja@1.0` | source-ready-runtime-aligned | BMJA approved Q&A, “Concealed and exposed sets” |
| Exposed/concealed Pung, Kong and Chow meanings relevant to validation | `outside-the-box@0.1` | source-unresolved | #88 special-hand exposure cells do not establish the general ordinary-set evidence definition independently |
| Exposed/concealed Pung, Kong and Chow meanings relevant to validation | `buzzard-2000@0.1` | source-ready-runtime-aligned | Retained Buzzard source snapshot, exposed/concealed set definitions and ordinary scoring sections (captured as source-backed representation in #175/#217 evidence chain) |
| Fishing is a non-winning hand awaiting one legal Mahjong completion | `bmja@1.0` | source-ready-runtime-aligned | BMJA glossary “Fishing / Calling”; approved Q&A, “Fishing” |
| Fishing is distinct from Original Call | `bmja@1.0` | source-ready-runtime-aligned | BMJA glossary entries “Fishing” and “Original call”; approved Q&A / scoring clarification |
| Dead wanted tile does not by itself remove fishing-score eligibility | `bmja@1.0` | source-ready-present-not-modelled | BMJA approved Q&A, “Fishing” dead-tile answer. Companion accepts final hand/table evidence and does not model wall availability |
| Fishing state can precede Mahjong and is table-supplied evidence | `bmja@1.0` | source-ready-runtime-aligned | BMJA approved Q&A / scoring rule; C3R report confirms accepted non-winning Original Call evidence without declaration-history reconstruction |
| Original Call declaration: fishing after first discard, hand unchanged, may exist before Mahjong | `bmja@1.0` | source-ready-runtime-aligned | BMJA glossary “Original call”; approved scoring page; #440C3 preflight distinguishes declaration evidence from C2B scoring subjects |
| OTB Goulash blank substitution legality (four blanks; no Flowers/Seasons; Pung/Kong/pair limits) | `outside-the-box@0.1` | source-ready-runtime-aligned | Supplied guide/#88D. One cohesive profile-local legality claim; no storage representation |
| Normal/draw→Goulash; Goulash/draw→Goulash; Goulash/winner→Normal; draw settlement and East retention | `outside-the-box@0.1` | belongs-to-C4 | #88D transition and round-state evidence; hand off without C3 treatments |
| Physical wall construction; wall breach; dead-wall/Loose Tile mechanics beyond final scoring evidence; draw/discard simulation; claim timing and priority; Kong physical procedure | All considered profiles | reference-only-out-of-product-scope | Valid rules-reference facts; outside scorer's final-evidence product boundary |
| Buzzard Standing-Hand lock enforcement | `buzzard-2000@0.1` | reference-only-out-of-product-scope | Buzzard primary procedure; final Standing Hand fact is table-supplied; no lock-state simulator |
| Western T&M ordinary hand/validation semantics | `western-tm@0.1` | source-unresolved / excluded by 440D | Complete ordinary primary source (*The Game of Mah Jong Illustrated*) is not available; current runtime reuse proves no equivalence |
| MCR and Riichi hand/validation semantics | `mcr-wmo-2006@0.1`, Riichi profiles | reference-only-out-of-product-scope | Outside this Classical C3A profile inventory |

No proposition was inferred from a shared validator, hand-mode strategy, runtime ID, or evidence codec. Profile-specific claims are retained even when their wording shares a semantic subject. Exact profile/version remains mandatory.

Shared subject decisions are limited to independently supported ordinary structure (13/14 structural counts, Kong physical/structural relationship, four sets plus a pair) and BMJA/Buzzard exposed/concealed terminology. Chow policies are profile-local: BMJA one-Chow, Buzzard multiple-Chow, and OTB Goulash no-Chow. Fishing and Original Call remain BMJA-local; blank substitution remains OTB-local. The Original Call claim cites the BMJA glossary definition; the C3R preflight is the implementation/evidence-boundary reconciliation that keeps this declaration concept distinct from the two C2B scoring subjects.

## Runtime classification and treatment boundary

The truth edge does not resolve Classical ordinary-rule or validation implementations. Eligible claims therefore use `runtimeState: { kind: 'migration-incomplete' }`. The BMJA dead-tile availability proposition uses `present-not-modelled`: the source fact is established, while wall availability is not an input to this companion. No validation IDs, hand-mode IDs, or codec details are executable refs. Goulash mode transitions are C4; physical procedure is reference-only.

## C4 handoff

OTB transition rows (Normal + draw → Goulash; Goulash + draw → Goulash; Goulash + winner → Normal) and draw settlement/East retention belong to C4. C3A migrates only hand legality and evidence semantics; it does not author round-progression treatments.

## Source gaps and exclusions

- OTB normal-mode Chow policy is unresolved; the one-Chow BMJA validator reuse is not authority.
- Buzzard Flowers/Seasons structural exclusion lacks a checked direct locator in the retained evidence ledger and remains unresolved.
- OTB's general exposed/concealed evidence definition remains unresolved; special-hand exposure columns do not prove it.
- Buzzard broader Chow policy is established from the all-Chows primary-source hand, not from the validator's deliberate removal of BMJA's one-Chow error.
- Western T&M ordinary hand structure and validation remain 440D pending its complete primary source.
- Excluded procedural rules: see the frozen inventory. No physical-play state machine, settlement, progression, game-end, liability, false Mahjong, or UI/reference work is included.

## Implementation counts and verification

C3A adds **14 semantic subjects, 24 source claims, and 24 exact-profile treatments**: BMJA 11, OTB 7, Buzzard 6. All 24 claims are source-ready; the 3 frozen source-unresolved cells (Buzzard Flowers/Seasons structural exclusion, OTB normal Chow limit, and OTB general exposed/concealed meaning) receive no claim or treatment. Of the 24 treatments, 23 are `migration-incomplete` and one (BMJA dead-wanted-tile fishing eligibility) is `present-not-modelled`. The source register gains one governing BMJA Q&A record, `bmja-qa`.

Assembled corpus totals are **206 subjects, 257 claims, and 255 treatments**. The pre-existing C1/C2A/C2B cohort counts and the executable special-hand coverage remain unchanged: 39 C1 claims/treatments; 26 C2A claims/treatments; 19 C2B claims/treatments; Classical binding treatments remain BMJA 18, Western T&M 84, OTB 33, Buzzard 9.

| Verification | Result |
|---|---|
| Focused C3A, Classical validation/runtime, Buzzard runtime, fishing, OTB Goulash/profile, C1/C2A/C2B, truth integrity/corpus, 440A coverage | PASS — 13 files, 168 tests |
| `pnpm test` | PASS — 132 files, 1,193 tests |
| `pnpm run typecheck` | PASS |
| `PORT=5173 BASE_PATH=/ pnpm run build` | PASS — existing missing Riichi tile asset, sourcemap and chunk-size warnings; exit 0 |
| `git diff --check` | PASS |

PR is opened against `main`, remains open and unmerged. Baseline is `3787df7441a5dc6af450748f386701a5c85fde49`; final implementation head and PR URL are recorded in the handoff.

## Exit

440C3 complete; proceed to C4
