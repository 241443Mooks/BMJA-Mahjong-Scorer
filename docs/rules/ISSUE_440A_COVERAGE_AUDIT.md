# Issue 440A — current-corpus coverage and runtime-edge audit

Status: inventory and reconciliation baseline established 29 September 2026, updated with the 440B3 Buzzard migration. This is a non-authoritative migration ledger. Executable facts remain owned by the exact resolved profile/runtime; source facts remain owned by cited source material and reviewed evidence. No scoring values are copied here.

## Scope and accounting rule

The inventory covers exactly `bmja@1.0`, `western-tm@0.1`, `outside-the-box@0.1`, `buzzard-2000@0.1`, and `mcr-wmo-2006@0.1`. For Classical special hands, the current scorer bindings are the runtime inventory. For MCR, `MCR_2006_FAN_BINDINGS` is the fan inventory. Existing truth records are the migrated inventory. A runtime item with no truth treatment is not automatically verified or migration-eligible: evidence review determines whether it is eligible or blocked. This distinction prevents the ledger from laundering runtime behavior into source truth.

`truth-coverage-440a.test.ts` is the deterministic count/join proof. It reads these inventories and truth records directly, checks profile and runtime identity joins, and contains no scoring values. The Atlas v0.2 final manifest remains the broader Classical catalogue coverage oracle (71 entries / 146 treatment references); it is a coverage/reference inventory, not source authority.

## Current coverage by profile

| Profile | Domain/item inventory | Classification now | Governing source/evidence chain for next batch |
|---|---|---|---|
| `bmja@1.0` | Classical special-hand bindings | **440B1 result:** all 18 current bindings are `migrated-current`: Thirteen Unique Wonders (pre-existing) plus 17 individually reviewed and migrated candidates. No BMJA special-hand binding remains evidence-blocked or semantic-review-deferred. | Registered source `bmja-special-hands`; each claim uses the exact named section of the BMJA-approved Special Hands source. |
| `bmja@1.0` | Ordinary score rules, fishing, bonuses, validation/procedure | `eligible-to-migrate` from current BMJA governing material; exact executable treatment is `deferred-runtime-edge` because the truth adapter only resolves special-hand bindings. | BMJA source register and latest BMJA/Western/OTB crosswalk; then exact profile runtime/scorer traces and stable runtime identities. |
| `bmja@1.0` | Settlement, progression, game-end, hand-mode | `deferred-runtime-edge`; strategy identities are profile-owned. | Resolved profile plus current Classical strategy implementations; do not encode strategy IDs as `policy`. |
| `western-tm@0.1` | Classical special-hand bindings | `migrated-current`: Unique Wonder. Other items are individually `blocked-evidence` where only Companion/catalogue/secondary evidence exists; only exact primary-supported rows may become `eligible-to-migrate`. | `TM_COMPANION_CATALOGUE_INDEX.md`, Atlas v0.2 batches 1–4 validation, `SOURCE_REGISTER.md`; *The Game of Mah Jong Illustrated* is the missing primary check for ordinary rules. |
| `western-tm@0.1` | Ordinary scoring, bonuses, validation/procedure | `blocked-evidence` pending direct check of *The Game of Mah Jong Illustrated*. Current compatible runtime reuse is not evidence of equivalence. | `WESTERN_AUSTRALIAN_EVIDENCE_NOTES.md` and the current `SOURCE_REGISTER.md` warning, followed by exact primary pages/locators. |
| `western-tm@0.1` | Settlement, progression, game-end | `deferred-runtime-edge`; no strategy treatment kind exists. | Resolved profile/strategy implementation; source claims may migrate without executable treatment. |
| `outside-the-box@0.1` | Club special-hand bindings | **440B2 result:** all 33 current bindings are `migrated-current`: the pre-existing 13 Unique Wonders chain plus 32 individually reviewed candidates. No current OTB fixed-special binding remains evidence-blocked or semantic-review-deferred. | Registered source `otb-guide-2026-09`; each new claim uses the exact page and hand/table row from the September 2026 OTB guide. |
| `outside-the-box@0.1` | Ordinary rules, Goulash, procedure | Source-supported guide facts are `eligible-to-migrate`; unresolved interpretation and unreviewed cross-profile claims are `blocked-evidence`. Executable hand-mode/incident/settlement treatment is `deferred-runtime-edge`. | OTB guide + current `OUTSIDE_THE_BOX_PROFILE_CROSSWALK.md` and `BMJA_WESTERN_OTB_CROSSWALK.md`; preserve OTB-only decisions. |
| `outside-the-box@0.1` | Settlement, progression, game-end, Goulash hand-mode, round preparation | `deferred-runtime-edge`; includes incident and strategy identities. | Exact OTB profile and `outside-the-box-strategies.ts`; source facts may migrate without binding these IDs into truth. |
| `buzzard-2000@0.1` | Classical special-hand bindings | **440B3 result:** 9 of 10 current bindings are `migrated-current` (the unchanged Thirteen Odd Majors chain plus 8 new profile-local treatments). `four-concealed-pung-kong-hand` remains `semantic-review-deferred`; no binding is evidence-blocked. | Retained Buzzard PDF snapshot, `BUZZARD_2000_RULE_EVIDENCE.md`, `BUZZARD_2000_COMPATIBILITY_CROSSWALK.md`, and the B3 preflight/requalification record. |
| `buzzard-2000@0.1` | Ordinary scoring, bonuses, validation/procedure | `eligible-to-migrate` when directly supported by the retained primary snapshot; executable ordinary rule/policy treatment remains `deferred-runtime-edge`. | Same retained snapshot and `BUZZARD_2000_COMPATIBILITY_CROSSWALK.md`, checked against the current profile/runtime. |
| `buzzard-2000@0.1` | Settlement, progression, game-end, preparation incidents | `deferred-runtime-edge`; preparation and settlement are strategy/incident seams. | Exact Buzzard resolved profile and `buzzard-strategies.ts`; source claims remain independently migratable. |
| `mcr-wmo-2006@0.1` | Fan bindings | 1 of 81 fan identities is `migrated-current` (Thirteen Orphans); the remaining source-addressable fan inventory is `eligible-to-migrate` in cohesive Green Book batches after per-fan evidence/locator checks. | Canonical source `source.mcr-ema-green-book-2006`; `MCR_FAN_CATALOGUE_2006.md`, corpus completeness audit, detector predicates, exact §3.8.1 / Appendix 1 locators. |
| `mcr-wmo-2006@0.1` | Non-combination and 8-point qualification policies | `migrated-current` (2 treatments); remaining configured scoring stages are `deferred-runtime-edge` unless the existing truth edge already resolves that exact ref. | Green Book §§3.9 and 3.7, `MCR_INTERACTION_POLICY_2006.md`, `MCR_SCORE_EVIDENCE_CONTRACT.md`; use existing policy adapter. |
| `mcr-wmo-2006@0.1` | Settlement, progression, game-end | `deferred-runtime-edge`; strategy identities are not treatment refs. | Exact resolved MCR profile and strategy implementation; do not force into `policy`. |

## Runtime-edge capability matrix

| Identity area | Current owner and exact seam | Truth treatment capability | 440A result |
|---|---|---|---|
| Classical special-hand bindings | Profile-specific arrays in BMJA, Western, OTB, Buzzard scorer/catalogue modules; joined by `specialHandBindingsForCurrentClassicalProfile`. | `binding` refs resolve by exact profile and pattern ID. | Supported; preserve exact profile identity and evidence per treatment. |
| Ordinary Classical rule/policy identities | `classical.scorer.current`, profile-specific `classical.bindings.*` and `classical.policy.*`; ordinary rules also appear in runtime traces/config. | Not resolved by `currentTruthValidationEnvironment` for Classical `rule`/`policy`; those fall through to MCR adapter. | `deferred-runtime-edge`. Source claims/subjects can be staged; do not add a parallel registry. |
| MCR fan bindings | `MCR_2006_FAN_BINDINGS`, exact Green Book fan locator, MCR detector. | `binding` refs resolve for exact MCR profile. | Supported; no fan values enter truth records. |
| MCR scoring policies | Existing configured interaction and qualification policies, checked against exact scorer config and registry revision. | `policy` refs resolve only for configured interaction and qualification IDs. Other accumulator stages are not currently truth-addressable. | Two policy treatments supported; other stage identities deferred unless directly supported by existing edge. |
| Strategy-only seams | Settlement, progression, game-end, hand-mode, preparation/incidents live in exact resolved profile and family strategy implementations. | `RuntimeTreatmentRef` has no strategy/incident kind. | `deferred-runtime-edge`; retain ownership in profile/runtime. |

## Source reconciliation and batch order

1. **Classical special hands (440B):** Atlas final manifest for completeness and exact treatment refs; profile-specific governing source/reviewed primary evidence for claims; the Classical concept audit only helps group candidate concepts. The Buzzard reconciliation supersedes its earlier provisional Atlas warnings. Western rows without a checked governing/primary source remain blocked.
2. **BMJA / OTB / Buzzard ordinary material (440C):** current primary/club source artefacts and the latest crosswalks govern. `BMJA_WESTERN_OTB_CROSSWALK.md` contains old provisional rows alongside later resolutions; use its latest per-row status and linked evidence. OTB decisions are not generalized to Western. Buzzard uses the retained snapshot plus 2026 reconciliation.
3. **Western provisional material (440D):** Companion catalogue supports catalogue facts only. Ordinary rules stay `needs-primary-source` until the exact pages in *The Game of Mah Jong Illustrated* are reviewed. Runtime reuse does not upgrade evidence.
4. **MCR expansion (440E):** use canonical source ID `source.mcr-ema-green-book-2006`, despite historical `mcr-ema` shorthand in research notes. Green Book 2006 remains exact profile authority; run fan cohorts by cohesive source sections and retain direct locators. No values copied.
5. **Historical/out-of-scope:** Riichi and future families are not current-corpus rows. EMA 2025 Riichi work remains under #262. Older WRC future-Riichi direction, obsolete source shorthand, pre-#88 gaps, and superseded provisional conflict notes remain historical research context, not current batch authority.

Canonical correction policy: if a current canonical record later proves semantically wrong, retain it as superseded and add a new current version with `supersedes`; never edit its recorded history in place.

## 440B1 BMJA special-hand accounting

The BMJA inventory is explicitly accounted for as follows. “Previously current” identifies the unchanged Thirteen Unique Wonders truth chain. “Newly migrated” records were created in this slice. Every other listed binding has a current exact-profile executable treatment; the individual source claims and treatment joins are covered by `truth-bmja-special-hands.test.ts` and the derived coverage test.

| Outcome | BMJA binding IDs |
|---|---|
| Previously current (1) | `thirteen-unique-wonders` |
| Newly migrated (17) | `knitting`, `triple-knitting`, `all-pair-honours`, `imperial-jade`, `gates-of-heaven`, `wriggling-snake`, `all-winds-and-dragons`, `heads-and-tails`, `fourfold-plenty`, `three-great-scholars`, `four-blessings`, `buried-treasure`, `heavens-blessing`, `earths-blessing`, `gathering-plum-blossom`, `plucking-moon`, `twofold-fortune` |
| Evidence-blocked (0) | None |
| Semantic-review-deferred (0) | None |

The 17 new subjects use BMJA-scoped identities. The existing shared Thirteen Unique Wonders subject is reused only by its previously reviewed chain. No cross-profile relationship is asserted. Claims contain concise project-authored fact summaries, exact source-section locators, and no score values or copied source prose. Treatments contain only the exact profile, subject/evidence IDs, and existing runtime binding references.

## 440B2 Outside the Box special-hand accounting

The OTB fixed-special inventory is explicitly accounted for below. Candidate disposition followed the current reviewed crosswalk and the page 12–14 table transcription in issue #88; runtime identity was checked independently for every row. The 13 Unique Wonders records remain unchanged. All 32 new subjects are OTB-scoped, including both distinct Big Robert structural forms. The repeated Hachi Ban presentation forms and duplicated All Pair Ruby Jade row each produce one membership.

| Outcome | OTB binding IDs |
|---|---|
| Previously current (1) | `thirteen-unique-wonders` |
| Newly migrated (32) | `buried-treasure`, `imperial-jade`, `heads-and-tails`, `all-winds-and-dragons`, `club-three-great-scholars`, `four-blessings`, `fourfold-plenty`, `knitting`, `triple-knitting`, `all-pair-honours`, `wriggling-snake`, `seven-pairs-exactly-one-suit-with-optional-honours`, `seven-pairs-one-suit`, `all-pair-ruby-jade`, `four-bamboo-one-and-five-green-bamboo-pairs`, `own-wind-meld-with-dragon-pair-and-three-suit-chows`, `three-four-tile-suit-runs-with-honour-pair`, `three-matching-four-tile-suit-runs-with-honour-pair`, `wriggling-snake-any-pair`, `windfall`, `wind-pair-with-three-suit-rank-one-melds`, `wind-pair-with-three-suit-rank-nine-melds`, `wind-pair-with-three-suit-chows`, `hachi-ban`, `three-dragon-singles-with-one-meld-in-each-suit-and-suited-pair`, `dragon-pair-with-five-suited-pairs`, `wriggly-dragon`, `green-dragon-pung-with-bamboo-melds`, `red-dragon-pung-with-character-melds`, `white-dragon-pung-with-circle-melds`, `run-one-to-nine-with-same-suit-pung-and-pair`, `run-one-to-nine-with-honour-pung-and-suited-pair` |
| Evidence-blocked (0) | None |
| Semantic-review-deferred (0) | None |

The 32 new subjects use OTB-scoped identities; no Western, BMJA or Atlas equivalence is asserted. Each new claim uses registered source `otb-guide-2026-09`, a page 12, 13 or 14 row locator, `verified-club` status, and exact support for `outside-the-box@0.1`. Treatments point only to the current exact OTB binding. No score, fishing, exposure, qualification or calculation value is copied into truth.

## 440B3 Buzzard 2000 special-hand accounting

The two structural candidates initially marked runtime-mismatch by the B3 preflight were requalified after merged PR #454. At baseline `3811a195de04fb8546cadf581af2e340d2e5c93b`, both use `groupedShape(hand, 4, 1)`, with the Buzzard-specific honours-only or suited-terminals-only condition retained. The shared regression fixtures verify valid Pung/Kong hands and rejection of residue, malformed grouping, and impossible copy counts across BMJA, Western T&M, OTB, and Buzzard.

| Outcome | Buzzard binding IDs |
|---|---|
| Previously current (1) | `thirteen-unique-wonders` |
| Newly migrated (8) | `all-winds-and-dragons`, `three-winds-and-fourth-wind-pair`, `heavens-blessing` (Buzzard Original Hand qualification), `earths-blessing` (Buzzard East’s-first-discard qualification), `heads-and-tails` (Buzzard All Ones and Nines), `buzzard-three-dragons-winner`, `one-suit-nine-gates-any-completion`, `east-thirteenth-consecutive-mahjong` |
| Semantic-review-deferred (1) | `four-concealed-pung-kong-hand` |
| Evidence-blocked (0) | None |

The eight new subjects use `pattern.buzzard-2000.*` identities, each claim cites the retained Buzzard snapshot’s precise p. 11 list item (Calling Nine Tile Hand also cites the retained-source clarification), and each treatment targets the exact `buzzard-2000@0.1` binding. The three event/history claims describe Buzzard’s original-deal East win, winning on East’s first discard, and East’s thirteenth consecutive Mahjong from table/history context. The existing Thirteen Odd Majors truth chain is unchanged. Incomplete Four-Wind and Three-Dragon non-winner results remain separate scoring/settlement semantics outside B3. Buzzard has 10 runtime bindings and 9 current truth treatments; its special-hand truth coverage is not complete.

## Current totals and limits

The current Classical runtime inventory contains **146 special-hand bindings** across the four profiles: BMJA 18, Western T&M 85, OTB 33, Buzzard 10. **61 exact-profile Classical special-hand treatments** are current: BMJA 18, OTB 33, Buzzard 9, and one Western Unique Wonder. The MCR runtime inventory contains **81 fan bindings**, of which one is migrated. Two MCR policy treatments are also migrated. Thus the current truth corpus has **64 profile treatments across 60 semantic subjects**, **6 registered sources**, **63 claims for Classical special-hand subjects**, and 2 MCR policy subjects. Tests derive these totals from runtime arrays and authored records, without importing scoring values. These are inventory counts, not a percentage-complete migration estimate; runtime presence alone never upgrades a row.

## 440B readiness

**The reviewed 440B2/440B3 processes are safe to reuse only as candidate-by-candidate source review.** Each profile’s own evidence governs its claims; shared runtime predicates do not imply shared semantic identity. The B3 pass preserved the deferred Concealed Pungs/Kongs boundary and kept non-winner score results outside special-hand binding coverage. No schema redesign or production behavior change was needed for truth migration.
