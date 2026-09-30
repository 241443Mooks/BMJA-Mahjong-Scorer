# Issue #440C1 — Classical ordinary scoring foundations

Status: implementation complete; PR remains open and unmerged
Baseline: `abc6754523584f54b069b804a970dc406d299af0` (`origin/main`, freshly fetched)
Scope: `bmja@1.0`, `outside-the-box@0.1`, `buzzard-2000@0.1`

## Frozen semantic inventory

This 15-subject inventory is frozen before authoring C1 truth records. Subjects describe durable scoring concepts, not numeric table cells or runtime function names.

| Subject | Granularity and initial exact-profile scope |
|---|---|
| `rule.classical.chow-base-scoring` | One ordinary Chow proposition; all three profiles |
| `rule.classical.pung-base-scoring` | One family with minor/major and exposed/concealed distinctions in each claim; all three |
| `rule.classical.kong-base-scoring` | One family with minor/major and exposed/concealed distinctions in each claim; all three |
| `rule.classical.qualifying-honour-pair-scoring` | Dragon, own-Wind and prevailing-Wind qualifying pairs; all three |
| `rule.classical.flower-season-base-scoring` | One basic bonus-tile family; all three |
| `rule.classical.mahjong-winner-bonus` | Ordinary winner bonus for making Mah Jong; all three |
| `rule.classical.live-wall-self-draw-winner-bonus` | Bonus for a winner drawing from the live wall; BMJA and OTB only (Buzzard distinguishes its last-wall event treatment) |
| `rule.classical.dragon-set-double` | Dragon Pung/Kong double; all three |
| `rule.classical.own-wind-set-double` | Own-Wind Pung/Kong double; all three |
| `rule.classical.prevailing-wind-set-double` | Prevailing-Wind Pung/Kong double; all three |
| `rule.classical.own-flower-season-double` | Own Flower or own Season double; all three |
| `rule.classical.complete-flower-season-set-double` | BMJA and OTB complete-set treatment (including own-tile double); two profiles |
| `rule.buzzard-2000.complete-flower-season-set-double` | Buzzard’s independently stated complete-set multiplier; exact interaction with the own-tile double remains unresolved for C2 |
| `rule.classical.ordinary-table-cap` | Normal ordinary scoring cap; BMJA and OTB |
| `rule.buzzard-2000.ordinary-table-limit` | Configured Buzzard table limit; 600 is an example/default, not a universal required value |

The ordinary Pung/Kong/pair basics, Flower/Season basics and ordinary winner basics are shared with OTB because the reviewed #88 conclusions explicitly confirm equivalence. Buzzard claims share a subject only where the source ledger independently confirms the same proposition. Its ordinary Chow, base set/pair/bonus scoring, Mahjong bonus and component set doubles meet that bar. The BMJA/OTB live-wall bonus is kept separate from Buzzard’s last-wall double and additive bonus. The complete-set and limit concepts are profile-local where their proposition or exact relationship differs.

## Source chain and locators

- **BMJA**: registered authorities `bmja-scoring` (principal) and `bmja-approved-site` as appropriate. Exact locators are sections on the approved “Working out the scores” page: “Chows”, “Pungs”, “Kongs”, “Pairs of honour tiles”, “Flowers and Seasons”, “For going Mah-Jong”, “Doubling for all players”, and “The limit”. Claims will be `verified`, scoped to `{ id: 'bmja', version: '1.0' }`.
- **Outside the Box**: `otb-guide-2026-09`, with ordinary treatment cross-checked against the latest reviewed `OUTSIDE_THE_BOX_PROFILE_CROSSWALK.md` / #88 conclusions. Locators identify the exact reviewed ordinary-scoring crosswalk section; page locators are omitted where the reviewed material does not establish a page. Claims will be `verified-club`, scoped to `{ id: 'outside-the-box', version: '0.1' }`.
- **Buzzard 2000**: `buzzard-2000-classical`, retained 13-page source snapshot, corroborated by `BUZZARD_2000_RULE_EVIDENCE.md`. Ordinary base values are pages 9–10; doubles and notes are pages 10–11; the agreed table limit is page 8. Claims will be `verified`, scoped to `{ id: 'buzzard-2000', version: '0.1' }`.

`BMJA_RULES_REFERENCE.md` and `scoring-rules.catalog.json` are implementation/completeness aids only; neither is a source authority. `bmja-settlement` and `bmja-qa` are not needed for this inventory. The scoring catalogue remains unchanged.

## Treatment and coverage contract

Every source-ready subject/profile pair receives a treatment. Since ordinary Classical rules are not safely addressable through the current exact truth edge, treatments use `runtimeState: { kind: 'migration-incomplete' }`; no guessed executable refs are introduced. Treatments carry no score/value payload. A source claim establishes the treatment while the resolved runtime remains scoring authority.

Coverage will be derived at semantic-family × exact-profile treatment grain and visibly distinguish source-ready/migrated, source-unresolved, not applicable, runtime-edge migration-incomplete, and present-not-modelled. The frozen inventory must be asserted by focused tests so a family cannot disappear silently.

## Exclusions and unresolved facts

- Excluded profiles: Western T&M, MCR and Riichi. No C1 records will be attached to `western-tm@0.1`.
- Excluded areas: special hands; OTB Little/Big Dragons, Four Joys, winning-pair completion, three-concealed Pung/Kong, Goulash and incidents; Buzzard Standing Hand, +10 bonuses, all-Chows/pure-suit deltas, liability and penalties; settlement, progression, draw handling, general procedure, fishing, validation/Chow-count policy, runtime-edge support and reference/UI copy.
- Buzzard says its own Flower/Season double and its complete four-Flower/four-Season treatment are separate and says doubles are cumulative. Whether a complete set containing the player's own tile compounds both treatments remains an interpretation fixture for C2. C1 records each source-proved proposition separately and does not resolve that relationship.
- Source-proved rules remain runtime-implemented; `migration-incomplete` is a truth-edge classification, not a claim that scoring behavior is unknown or missing. No `present-not-modelled` classification is expected for this inventory.

## Implementation counts and verification

Implemented counts: 15 subjects, 38 claims and 38 treatments (BMJA 13, OTB 13, Buzzard 12). Coverage accounts for 45 family/profile cells: 38 source-ready and migrated into the corpus with `migration-incomplete` runtime status, and 7 not applicable. No source-unresolved or present-not-modelled cells are in the frozen inventory.

Verification at final implementation tree: focused C1/truth/corpus and existing profile scoring checks passed (140 tests); `pnpm test` passed (129 files, 1,170 tests); `pnpm run typecheck` passed; `PORT=5173 BASE_PATH=/ pnpm run build` passed; `git diff --check` passed. Build emitted the existing missing Riichi asset and large-chunk warnings, with successful exit.
