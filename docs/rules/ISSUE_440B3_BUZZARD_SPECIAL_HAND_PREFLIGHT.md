# Issue #440B3 — Buzzard special-hand preflight and migration audit

Status: **preflight completed; post-#454 requalification and migration outcome recorded below**
Profile: `buzzard-2000@0.1`
Original preflight baseline: `b81b3b19c647f2716286c26814a8654ebcd024b6` (`origin/main`, fetched 2026-09-29)

## Baseline and inventory

The `source` checkout was clean at the fetched `origin/main` baseline above. `buzzard2000SpecialHandBindings` contains exactly ten configured-limit bindings, confirmed by the source array and `buzzard-2000.test.ts`:

`all-winds-and-dragons`; `three-winds-and-fourth-wind-pair`; `heavens-blessing`; `earths-blessing`; `heads-and-tails`; `buzzard-three-dragons-winner`; `four-concealed-pung-kong-hand`; `thirteen-unique-wonders`; `one-suit-nine-gates-any-completion`; `east-thirteenth-consecutive-mahjong`.

`thirteen-unique-wonders` is already represented by current Buzzard truth treatment `buzzard-2000@0.1:thirteen-unique-wonders`, subject `pattern.thirteen-orphans`, and executable binding `thirteen-unique-wonders`; its Buzzard evidence claim cites retained snapshot p. 11. The remaining nine are assessed below.

## Evidence basis

Buzzard-only authority used: `BUZZARD_2000_RULE_EVIDENCE.md` (especially §D, “Limit hands,” and its 20 September Calling Nine Tile Hand clarification); `BUZZARD_2000_COMPATIBILITY_CROSSWALK.md`; the Buzzard row and snapshot note in `SOURCE_REGISTER.md`; and the current Buzzard bindings, detector implementations, and focused fixtures. The retained source is Jonathan Buzzard, *Mah-Jongg: the Game and How To Play It*, last modified 30 March 2000, 13-page PDF snapshot, SHA-256 `76b7548f8a8708473340a65bfaf810c99188b95a37311ce6127676588f20b0a5`.

For the nine limit propositions, the primary locator is retained PDF p. 11, heading “The following ten hands are Limit Hands,” with the individually named list item shown in the candidate row. For Calling Nine Tile Hand, use the same p. 11 list item together with the later source clarification transcribed in the evidence ledger: base `1112345678999`, and any same-suit rank 1–9 completes it. Runtime references below are `scoring/special-hands.ts` detector IDs, selected by the exact Buzzard profile bindings in `game/buzzard-2000.ts`.

## Candidate matrix

| Candidate / source proposition and locator | Runtime binding and predicate | Equivalence / profile qualification | Proposed subject | Classification |
|---|---|---|---|---|
| **All Winds and Dragons** — four Pungs/Kongs and a pair, all tiles Winds/Dragons; p. 11, item 1. | `all-winds-and-dragons`; winner, five groups, one pair, four Pungs/Kongs, all playing tiles non-suited. | Requalified after #454: `groupedShape(hand, 4, 1)` enforces complete physical count including Kongs, no loose/remaining residue, and copy limits; the detector then requires all playing tiles to be honours. | `pattern.buzzard-2000.all-winds-and-dragons` | **eligible-to-migrate** |
| **Three Winds and a Pair** — Pungs/Kongs of three distinct Winds, pair of fourth Wind, plus any final set; p. 11, item 2. | `three-winds-and-fourth-wind-pair`; `groupedShape` requires a winner, four melds plus one pair, complete tile accounting, and three distinct Wind melds with the fourth Wind pair. The remaining meld may be Chow/Pung/Kong. | Equivalent to the stated winning limit structure. Winner-only condition matches this configured limit. Kept separate from the incomplete Four-Wind non-winner result (see boundary below). | `pattern.buzzard-2000.three-winds-and-fourth-wind-pair` | **eligible-to-migrate** |
| **Original Hand** — limit hand named “Original Hand”; p. 11, item 3. | `heavens-blessing`; event-based: winner, `winningMethod === 'initial-deal'`, exactly 14 dealt tiles, no bonus tiles, player is East. | Runtime expresses a specific original-deal East win, rather than generic Heaven’s Blessing. The current Buzzard fixture covers an initial-deal winner. Record claim wording must preserve this Buzzard-specific event qualification; no generic tradition semantics are imported. | `pattern.buzzard-2000.original-hand` | **eligible-to-migrate** |
| **East’s First Discard** — winning with East Wind’s first discard; p. 11, item 4. | `earths-blessing`; event-based: winner by discard, player is not East, winning event identifies East as discarder and hand discard ordinal 1. | Exact source event and seat qualification are present. This is not a general “Earth’s Blessing” proposition. | `pattern.buzzard-2000.easts-first-discard` | **eligible-to-migrate** |
| **All Ones and Nines** — four Pungs/Kongs and a pair of suited 1s/9s only; p. 11, item 5. | `heads-and-tails`; complete winning grouped shape, and every playing tile passes `isTerminal` (suited rank 1 or 9). | Requalified after #454: `groupedShape(hand, 4, 1)` enforces complete physical count including Kongs, no loose/remaining residue, and copy limits; `isTerminal` excludes Winds, Dragons, and non-terminal suited tiles. | `pattern.buzzard-2000.all-ones-and-nines` | **eligible-to-migrate** |
| **Three Dragons** — Pungs/Kongs of at least three Dragons; p. 11, item 6. | `buzzard-three-dragons-winner`; complete winner shape, four melds/one pair; three distinct Dragon Pung/Kong identities. The remaining meld may be a Chow, Pung, or Kong. | Equivalent to the winning configured-limit proposition. The separate non-winner Three-Dragon limit result is not this binding and is not authorized by this treatment. | `pattern.buzzard-2000.three-dragons-winner` | **eligible-to-migrate** |
| **Concealed Pungs/Kongs** — p. 11, item 7. | `four-concealed-pung-kong-hand`; winner, five sets, four Pungs/Kongs, and every set has `visibility === 'concealed'`. | Count and set-kind align, but the source evidence collected for this preflight does not resolve whether concealment is required of the pair representation, nor whether a winning discard completing a Pung/Kong changes its concealed status. The detector does not inspect winning-tile provenance. Do not assert equivalence until the exact source wording/operational meaning is reconciled. | `pattern.buzzard-2000.four-concealed-pungs-kongs` | **semantic-review-deferred** |
| **Calling Nine Tile Hand** — p. 11, item 9, with later clarification: base `1112345678999`; any added same-suit rank 1–9 completes. | `one-suit-nine-gates-any-completion`; winner, 14 suited tiles from one suit; at least three 1s and 9s, at least one each of 2–8, exactly 14 physical tiles. | Equivalent to the clarified broader Buzzard form, including extra 1 and 9. This is not the narrower rank-2–8 Gates-of-Heaven predicate. | `pattern.buzzard-2000.calling-nine-tile-hand` | **eligible-to-migrate** |
| **East’s Thirteenth Consecutive Mahjong** — p. 11, item 10. | `east-thirteenth-consecutive-mahjong`; event-based winner, player Wind East, and explicit `context.eastThirteenthConsecutiveMahjong === true`. | The executable binding is honest as a context/history-driven result: it requires an externally resolved sequence fact, not a structural shape inference. Truth claim must state that the streak qualification comes from table history/context. `SemanticSubject.kind: 'pattern'` can identify the named limit outcome, although the claim must not describe it as purely structural. | `pattern.buzzard-2000.easts-thirteenth-consecutive-mahjong` | **eligible-to-migrate** |

### Original preflight mismatch and #454 disposition

The initial preflight found that the shared All Winds and Dragons detector accepted five-set honour-only evidence with only `all.length >= 14`, without proving exact physical tile accounting or excluding loose/remaining residue. It found that Heads and Tails checked its five-set terminal-only pattern but did not validate complete physical count, residue, or tile-copy limits.

The original nine-candidate disposition was 6 eligible, 2 runtime-mismatch, 1 semantic-review-deferred, and 0 evidence-blocked. Merged PR #454 corrected both mismatches at the shared canonical seam by routing each detector through `groupedShape(hand, 4, 1)`, retaining the detector-specific tile-family constraint. On post-merge baseline `3811a195de04fb8546cadf581af2e340d2e5c93b`, focused shared-pattern and Buzzard runtime tests requalified both candidates. Valid Pung and Kong hands match; residue, malformed groups, and over-four-copy evidence do not. No Buzzard-only workaround or truth-layer mismatch was introduced.

Concealed Pungs/Kongs remains deferred. Runtime checks visibility for all stored sets and does not inspect winning-tile provenance; the cited evidence still does not settle pair representation or claimed winning-tile effects. This migration does not change or authorize that predicate.

No source/runtime mismatch invalidates the ten-binding inventory assumption. Runtime corrections are not made in this preflight.

## Structural and event/context binding honesty

The structural candidates in this set are All Winds and Dragons, Three Winds and a Pair, All Ones and Nines, Concealed Pungs/Kongs, and Calling Nine Tile Hand. Their source claims describe hand composition. The original All Winds and Dragons and All Ones and Nines count/residue gaps were corrected at the shared grouped-hand seam in #454. Concealed Pungs/Kongs still needs the deferred exposure review.

Original Hand, East’s First Discard, and East’s Thirteenth Consecutive Mahjong depend on deal/discard/history facts. Their runtime detectors are explicitly event-based and the treatment’s executable `binding` reference is a true pointer to those predicates. A migrated claim must name the relevant Buzzard event/context qualification. For the thirteenth consecutive win, table history is supplied as the explicit context flag; a truth record must not imply the detector derives the streak from tiles.

## Non-winner boundary

The source ledger’s incomplete Four-Wind and Three-Dragon limit outcomes remain outside these nine configured bindings. They already have separate runtime identities as profile score results: `buzzard.incomplete-four-wind-limit` and `buzzard.incomplete-three-dragon-limit`, applied through Buzzard table scoring/settlement strategy. They belong in a later truth slice for non-winner/table-result semantics. The winner binding `buzzard-three-dragons-winner` is explicitly complete-hand and cannot authorize that non-winner outcome. The incomplete Four-Wind result likewise does not broaden `three-winds-and-fourth-wind-pair`, whose predicate requires the completed four-meld-plus-pair winning shape.

## Result and recommended B3 scope

| Classification | Count |
|---|---:|
| eligible-to-migrate after requalification | 8 |
| evidence-blocked | 0 |
| runtime-mismatch remaining | 0 |
| semantic-review-deferred | 1 |

Final B3 result: eight new Buzzard-local subjects/claims/treatments migrated; together with the unchanged Thirteen Odd Majors chain, Buzzard has 10 configured-limit bindings and 9 current truth treatments. The one untreated binding, Concealed Pungs/Kongs, remains semantic-review-deferred. Original Hand, East’s First Discard, and East’s Thirteenth Consecutive Mahjong claims name their event/history qualifications. The incomplete Four-Wind and Three-Dragon non-winner results remain separate scoring/settlement semantics outside this slice. Buzzard special-hand truth coverage is not complete.

## Verification

- Original preflight gates: four files, 57 tests passed; `git diff --check` passed.
- Post-#454 requalification: `special-hands.test.ts` and `buzzard-2000.test.ts` — **2 files, 89 tests passed**.
- Post-migration focused Buzzard truth, integrity, coverage, corpus, runtime, and shared-pattern tests — **9 files, 127 tests passed**.
- `pnpm test` — **124 files, 1,151 tests passed**.
- `pnpm run typecheck` — **passed**.
- `PORT=5173 BASE_PATH=/ pnpm run build` — **passed**; Vite reported existing sourcemap and large-chunk warnings.
- `git diff --check` — **passed**.
- Current deterministic accounting expects 10 Buzzard bindings, 9 treatments, and only Concealed Pungs/Kongs untreated.
