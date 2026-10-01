# Issue #440E — MCR 2006 truth migration

Status: **E1 and E2 complete; later cohorts remain unmigrated**
E1 baseline: `a8eb04ed76522984f27b63dc7720db343796dc5f`
E2 baseline: `674378397a6a432c759ca2827058a95a6c105e14`
Profile: `mcr-wmo-2006@0.1`
Governing source: `source.mcr-ema-green-book-2006` — World Mahjong Organization, *Mahjong Competition Rules*, first edition / first printing July 2006, English edition distributed by EMA.

## Production plan

440E is divided into four review and migration batches:

- [x] **E1:** fan 1–27.
- [x] **E2:** fan 28–54.
- [ ] **E3:** fan 55–81.
- [ ] **E4:** non-catalogue/profile semantic closeout.

The batching is a review and migration device only. It does not alter Green Book scoring or interaction semantics.

The E4 boundary remains settlement, draw settlement, dealer progression, prevailing-Wind progression, game completion, winning-shape validation, input evidence policy, general MCR scoring grammar, and tournament penalties/procedure. Those topics are not fan treatments in E1/E2. No settlement, progression, game-end, validation, or evidence-registry IDs are forced into the existing `rule | binding | policy` runtime refs.

## Starting state and runtime inventory

At the baseline, the MCR runtime exposes exactly 81 fan bindings in formal Green Book order. Truth coverage was **1/81 fan bindings**, the already-migrated Thirteen Orphans treatment, plus the two existing scoring policy treatments for non-combination and eight-point qualification.

E1 takes formal positions 1–27 directly from `MCR_2006_FAN_BINDINGS`; it does not maintain a second binding inventory. Fan #7 keeps its existing semantic subject, verified Green Book claim, and executable treatment `mcr-wmo-2006@0.1:thirteen-orphans`. The remaining 26 fans use MCR-local semantic subjects and exact existing binding refs.

## E1 source/runtime review

Review covered `MCR_FAN_CATALOGUE_2006.md`, `MCR_DETECTOR_PREDICATES_2006.md`, `MCR_DETECTOR_CROSS_BINDING_SEMANTICS_2006.md`, `MCR_CORPUS_COMPLETENESS_AUDIT_2006.md`, the ordered runtime binding inventory, and focused detector fixtures.

For each of fan 1–27, the reviewed catalogue and predicate row agree on formal fan number, stable binding ID, §3.8.1 locator, Appendix 1 locator, detector proposition, and material evidence requirements. The detector fixtures cover the relevant ordinary and irregular routes. Source-defined structure/context notes are recorded in the evidence claims; interaction outcomes remain under `interaction.mcr-2006-non-combination`.

Material qualification reviewed:

- Fans 1–3, 6–7, 8, 10–11, 13–16, 18–27 are identified from tile composition or a lawful hand interpretation as specified by the predicate contract.
- Fan 4 requires concealed pre-win reconstruction and a same-suit winning tile.
- Fan 5 depends on four declared Kongs and their exposure state.
- Fan 9 is a Wind-set and fourth-Wind-pair structure; seat/prevalent Wind scoring remains separate interaction/context behavior.
- Fan 12 depends on whether four Pung/Kong sets were achieved without melding; a declared concealed Kong counts.
- Fans 14–17 and 23–24 produce candidates whose combination/counting remains owned by the existing interaction policy.
- Fan 20 is the irregular all-seven-Honors plus seven distinct knitted suited tiles structure.

**Source/runtime mismatches:** none identified in the reviewed E1 proposition set. No detector, interaction, qualification, or scoring behavior was changed.

## E1 result

- Added: **26** MCR-local semantic subjects, verified Green Book claims, and executable binding treatments.
- Preserved: the existing Thirteen Orphans records and the two existing policy treatments, without duplication or supersession.
- Current cohort coverage: **27/27** exact-profile fan bindings migrated.
- Runtime catalogue: **81** fan bindings.
- Exact-profile MCR treatments: **29** total — 27 fan bindings plus the two existing policies.
- Current corpus after E1: **255 subjects, 318 claims, 316 treatments**.
- No fan point values are stored in truth subjects, claims, or treatments.
- No MCR binding treatment is assigned to a Classical profile.
- 440A–D inventories and profile boundaries remain covered by their existing deterministic coverage tests.

The existing `rule.mcr-8-before-flowers` and `qualification.mcr-8-before-flowers` treatment remain authoritative. Flower handling stays at catalogue fan #81 / E3. The MCR profile remains provisional and non-public; E1/E2 completeness does not promote profile stability or resolver status.

## E2 source/runtime review

E2 started from clean `origin/main` at `674378397a6a432c759ca2827058a95a6c105e14`, containing merged #473. Review covered catalogue and predicate positions 28–54, cross-binding event semantics, the exact ordered runtime inventory, detector fixtures for rows 21–60, Chicken Hand fallback coverage, and interaction regressions.

The 27 candidates were derived from `MCR_2006_FAN_BINDINGS.slice(27, 54)`. Each reviewed name, formal position, binding, §3.8.1 locator, Appendix 1 locator, detector proposition, and required qualification agrees with the current source/runtime contract.

Material semantic qualifications preserved in claims:

- Fan 33 depends on at least three non-melded Pung/Kong sets; fan 48 requires two concealed declared Kongs. Occurrence identity and counting remain runtime-owned.
- Fan 38 identifies three distinct Wind Pung/Kong sets. Seat/prevalent Wind combinations remain in the existing interaction policy.
- Fan 43 remains Chicken Hand as a fan identity for a legal hand with no other non-Flower fan counted. The runtime fallback is not duplicated as a policy or interaction matrix.
- Fans 44–47 identify their source-defined resolved event and matching win method. The migration does not invent event-history reconstruction. For fan 46, the source cross-binding contract resolves the English table's stray last-discard wording to Kong-replacement self-draw and excludes Flower replacement; runtime and reviewed source contract align.
- Fan 53 retains all four exposed sets, a sole pre-win concealed tile of the eventual pair, discard completion by that same face, and sole legal winning-face requirements.
- Fan 34 preserves the five/six-Honor knitted boundary; fan 35 preserves the complete nine-tile knitted assignment without requiring the remainder to be an ordinary Chow grouping.
- Fans with repeated relational matches remain one fan identity per truth chain; runtime occurrence identities and interaction counting stay separate.

**Source/runtime mismatches:** none identified for fans 28–54. No detector, interaction, scoring, qualification, settlement, progression, validation, evidence-policy, or publication-state code changed.

## E2 result

- Added: **27** MCR-local semantic subjects, verified Green Book claims, and executable binding treatments for positions 28–54.
- E2 coverage: **27/27** exact-profile fan bindings, each with exact §3.8.1 and Appendix 1 locators.
- Cumulative fan coverage: **54/81**. Positions 1–54 are complete.
- Preserved E1: positions 1–27 remain 27/27; Thirteen Orphans retains its pre-E1 chain; the 26 E1-local chains remain present.
- Preserved policy treatments: the same two MCR policies remain present and unchanged.
- Exact-profile MCR treatments: **56** total — 54 fan bindings plus the two existing policies.
- Current corpus after E2: **282 subjects, 345 claims, 343 treatments**.
- No fan point values are stored in truth subjects, claims, or treatments; no Classical or Western profile receives an MCR binding treatment.

## Verification

Pre-authoring focused checks on the clean baseline passed: 76 tests across `mcr-detectors.test.ts`, `mcr-interaction.test.ts`, `truth-corpus.test.ts`, `truth-integrity.test.ts`, and `truth-coverage-440a.test.ts`.

Final E1 verification:

- Focused E1 truth/coverage, MCR detector/interaction, existing MCR truth, 440A coverage, truth integrity/corpus: **passed, 78 tests across 6 files**; the final focused E1 assertion rerun also passed (2 tests).
- `pnpm test`: **passed, 1,205 tests across 135 files**.
- `pnpm run typecheck`: **passed**.
- `PORT=5173 BASE_PATH=/ pnpm run build`: **passed**. Vite reported a tooltip sourcemap warning and a large-chunk advisory; the build exited successfully.
- `git diff --check`: **passed**.

E2 verification:

- Focused E2/E1 coverage, MCR detector and interaction, existing MCR truth, 440A coverage, truth integrity/corpus: **passed, 80 tests across 7 files**.
- `pnpm test`: **passed, 1,207 tests across 136 files**.
- `pnpm run typecheck`: **passed**.
- `PORT=5173 BASE_PATH=/ pnpm run build`: **passed**. Vite reported the existing tooltip sourcemap warning and large-chunk advisory; the build exited successfully.
- `git diff --check`: **passed**.
