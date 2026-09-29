# Issue 440B3 — Buzzard special-hand truth migration preflight

Status: **preflight only; no truth/runtime migration performed**
Profile: `buzzard-2000@0.1`
Baseline: `b81b3b19c647f2716286c26814a8654ebcd024b6` (`origin/main`, fetched 2026-09-29)

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
| **All Winds and Dragons** — four Pungs/Kongs and a pair, all tiles Winds/Dragons; p. 11, item 1. | `all-winds-and-dragons`; winner, five sets, one pair, four Pungs/Kongs, all represented tiles non-suited. | Tile-family and group-kind conditions agree. Predicate only requires `all.length >= 14`, rather than a complete physical hand count of 14 plus one per Kong and no residual tiles. That leaves an executable structural gap for malformed/excess evidence. No Buzzard-specific shape qualification beyond configured limit. | `pattern.buzzard-2000.all-winds-and-dragons` | **runtime-mismatch** |
| **Three Winds and a Pair** — Pungs/Kongs of three distinct Winds, pair of fourth Wind, plus any final set; p. 11, item 2. | `three-winds-and-fourth-wind-pair`; `groupedShape` requires a winner, four melds plus one pair, complete tile accounting, and three distinct Wind melds with the fourth Wind pair. The remaining meld may be Chow/Pung/Kong. | Equivalent to the stated winning limit structure. Winner-only condition matches this configured limit. Kept separate from the incomplete Four-Wind non-winner result (see boundary below). | `pattern.buzzard-2000.three-winds-and-fourth-wind-pair` | **eligible-to-migrate** |
| **Original Hand** — limit hand named “Original Hand”; p. 11, item 3. | `heavens-blessing`; event-based: winner, `winningMethod === 'initial-deal'`, exactly 14 dealt tiles, no bonus tiles, player is East. | Runtime expresses a specific original-deal East win, rather than generic Heaven’s Blessing. The current Buzzard fixture covers an initial-deal winner. Record claim wording must preserve this Buzzard-specific event qualification; no generic tradition semantics are imported. | `pattern.buzzard-2000.original-hand` | **eligible-to-migrate** |
| **East’s First Discard** — winning with East Wind’s first discard; p. 11, item 4. | `earths-blessing`; event-based: winner by discard, player is not East, winning event identifies East as discarder and hand discard ordinal 1. | Exact source event and seat qualification are present. This is not a general “Earth’s Blessing” proposition. | `pattern.buzzard-2000.easts-first-discard` | **eligible-to-migrate** |
| **All Ones and Nines** — p. 11, item 5. | `heads-and-tails`; winner, five sets, one pair/four Pungs or Kongs, and every represented tile passes `isTerminal`, which is suited rank 1 or 9 only. | The detector means **suited terminals only**, excluding Winds/Dragons, as the Buzzard proposition requires. Like All Winds/Dragons, it does not enforce exact completed physical-tile count/no residue. | `pattern.buzzard-2000.all-ones-and-nines` | **runtime-mismatch** |
| **Three Dragons** — Pungs/Kongs of at least three Dragons; p. 11, item 6. | `buzzard-three-dragons-winner`; complete winner shape, four melds/one pair; three distinct Dragon Pung/Kong identities. The remaining meld may be a Chow, Pung, or Kong. | Equivalent to the winning configured-limit proposition. The separate non-winner Three-Dragon limit result is not this binding and is not authorized by this treatment. | `pattern.buzzard-2000.three-dragons-winner` | **eligible-to-migrate** |
| **Concealed Pungs/Kongs** — p. 11, item 7. | `four-concealed-pung-kong-hand`; winner, five sets, four Pungs/Kongs, and every set has `visibility === 'concealed'`. | Count and set-kind align, but the source evidence collected for this preflight does not resolve whether concealment is required of the pair representation, nor whether a winning discard completing a Pung/Kong changes its concealed status. The detector does not inspect winning-tile provenance. Do not assert equivalence until the exact source wording/operational meaning is reconciled. | `pattern.buzzard-2000.four-concealed-pungs-kongs` | **semantic-review-deferred** |
| **Calling Nine Tile Hand** — p. 11, item 9, with later clarification: base `1112345678999`; any added same-suit rank 1–9 completes. | `one-suit-nine-gates-any-completion`; winner, 14 suited tiles from one suit; at least three 1s and 9s, at least one each of 2–8, exactly 14 physical tiles. | Equivalent to the clarified broader Buzzard form, including extra 1 and 9. This is not the narrower rank-2–8 Gates-of-Heaven predicate. | `pattern.buzzard-2000.calling-nine-tile-hand` | **eligible-to-migrate** |
| **East’s Thirteenth Consecutive Mahjong** — p. 11, item 10. | `east-thirteenth-consecutive-mahjong`; event-based winner, player Wind East, and explicit `context.eastThirteenthConsecutiveMahjong === true`. | The executable binding is honest as a context/history-driven result: it requires an externally resolved sequence fact, not a structural shape inference. Truth claim must state that the streak qualification comes from table history/context. `SemanticSubject.kind: 'pattern'` can identify the named limit outcome, although the claim must not describe it as purely structural. | `pattern.buzzard-2000.easts-thirteenth-consecutive-mahjong` | **eligible-to-migrate** |

### Mismatch details and likely correction seams

1. **All Winds and Dragons — structural predicate.** Source: a complete four-set-and-pair limit hand. Runtime: fixed five-set group kinds and honour-only tiles, but only `all.length >= 14`; it does not enforce `14 + kong count` or exclude loose/remaining residue. Smallest likely seam: tighten this detector’s complete physical-hand accounting, using the pattern already embodied by `groupedShape`.
2. **All Ones and Nines — structural predicate.** Source: a complete limit hand of suited ones/nines. Runtime: correct terminal-family restriction, but no exact physical count or residue rejection. Smallest likely seam: add complete physical-hand accounting/no-residue validation to this detector.
3. **Concealed Pungs/Kongs — exposure/concealment / source ambiguity.** Runtime checks concealment on every stored set and ignores winning-tile provenance. The evidence ledger confirms the name and configured limit but does not give enough detail here to decide the pair/winning-discard semantics. This remains deferred, not a proven contradiction. Smallest next seam is source clarification and a fixture-level comparison; only if that establishes a contradiction should the set visibility predicate be changed.

No source/runtime mismatch invalidates the ten-binding inventory assumption. Runtime corrections are not made in this preflight.

## Structural and event/context binding honesty

The structural candidates in this set are All Winds and Dragons, Three Winds and a Pair, All Ones and Nines, Concealed Pungs/Kongs, and Calling Nine Tile Hand. Their source claims describe hand composition; the first and fifth expose the count/residue gaps above, and Concealed Pungs/Kongs needs the deferred exposure review.

Original Hand, East’s First Discard, and East’s Thirteenth Consecutive Mahjong depend on deal/discard/history facts. Their runtime detectors are explicitly event-based and the treatment’s executable `binding` reference is a true pointer to those predicates. A migrated claim must name the relevant Buzzard event/context qualification. For the thirteenth consecutive win, table history is supplied as the explicit context flag; a truth record must not imply the detector derives the streak from tiles.

## Non-winner boundary

The source ledger’s incomplete Four-Wind and Three-Dragon limit outcomes remain outside these nine configured bindings. They already have separate runtime identities as profile score results: `buzzard.incomplete-four-wind-limit` and `buzzard.incomplete-three-dragon-limit`, applied through Buzzard table scoring/settlement strategy. They belong in a later truth slice for non-winner/table-result semantics. The winner binding `buzzard-three-dragons-winner` is explicitly complete-hand and cannot authorize that non-winner outcome. The incomplete Four-Wind result likewise does not broaden `three-winds-and-fourth-wind-pair`, whose predicate requires the completed four-meld-plus-pair winning shape.

## Result and recommended B3 scope

| Classification | Count |
|---|---:|
| eligible-to-migrate | 6 |
| evidence-blocked | 0 |
| runtime-mismatch | 2 |
| semantic-review-deferred | 1 |

Recommended B3 implementation slice: migrate only the six eligible Buzzard-local subjects/claims/treatments, with exact profile-qualified binding refs and p. 11 Buzzard locators; state event/context qualifications in claims. Exclude All Winds and Dragons and All Ones and Nines until their exact completed-hand predicates are corrected and re-preflighted. Exclude Concealed Pungs/Kongs until Buzzard source semantics and winning-tile/exposure handling are resolved. Keep both incomplete non-winner outcomes out of B3.

## Verification

- `pnpm --filter @workspace/mahjong-scorer exec vitest run --config vitest.config.ts src/game/buzzard-2000.test.ts src/rules-platform/truth-coverage-440a.test.ts src/rules-platform/truth-integrity.test.ts src/rules-platform/truth-corpus.test.ts` — **4 files, 57 tests passed**.
- `git diff --check` — **passed** after adding this report.
- Final repository scope: this preflight report only; no truth records, runtime behaviour, or migration PR changes.
