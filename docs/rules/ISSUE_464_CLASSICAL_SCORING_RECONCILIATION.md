# Issue #464 — Classical scoring reconciliation

Baseline: `42a546e3477eb05cd3e5f3cf946bd1f21e69e294` (#465 / 440C2A).

This report covers only the four seams in #464. The governing BMJA scoring page is “Working out the scores” (sections “Doubling for all players” and “Doubling for the player who goes Mah-Jong”); the Buzzard proposition is in the retained 2000 source, p. 10, transcribed in `BUZZARD_2000_RULE_EVIDENCE.md`. Project crosswalks describe source interpretation but are not authorities.

## 1. Buzzard no-Chows / all-Pungs winner double

- **Governing proposition:** Buzzard p. 10 separately lists ×2 for a winner with Pungs/Kongs plus a pair and no Chows, and +10 for no Chows. The double predicate is a completed winning hand with one pair, four Pung/Kong sets, and no Chow.
- **Previous runtime:** +10 `classical-no-chows` was present; inherited `no-chows` double was disabled.
- **Decision:** Restore the inherited no-Chows winner double. Keep the independent +10 additive award.
- **Result:** Buzzard all-Pung winners receive both +10 points and one double. A hand containing a Chow receives neither no-Chows treatment.
- **Boundary tests:** `game/buzzard-2000.test.ts`, “keeps the no-Chows additive points and the independent winner double”; the existing Buzzard scoring/profile suite also checks additive points and winner-only policy.
- **Classification:** `runtime-corrected-source-equivalent`.

## 2. BMJA concealed-hand winner double

- **Governing proposition:** The BMJA winner double requires all tiles concealed, at least one suited set, and at least one Wind/Dragon set. A pair claimed to complete Mah-Jong is exposed and spoils the double. Special hands do not receive ordinary doubles, except Purity's stated treatment.
- **Previous runtime:** Any non-Purity winning hand whose groups were all marked concealed qualified; no suited-set or honour-set condition was checked.
- **Decision:** Require a concealed non-Purity hand with a non-pair suited set and a non-pair honour set. Existing `!purity` special-hand precedence remains intact.
- **Result:** Concealed mixed suited/honour hand qualifies; no-honour hand and exposed winning pair do not.
- **Boundary tests:** `scoring/rules.test.ts` checks valid mixed composition, concealed no-honour exclusion, exposed-pair exclusion, and retains the existing Purity winner test.
- **Classification:** `runtime-corrected-source-equivalent`.

## 3. BMJA Original Call

- **Governing proposition:** The source lists “Original call” under “Doubling for all players”, then lists “Going Mah-Jong with the original call” among additional doubles the winner may claim. The site glossary says an original call earns an extra double. Read together, these are two layers: an all-player double while fishing, plus an additional winner double on going Mah-Jong. The scoring Q&A link does not provide a more specific exception to this distinction.
- **Previous runtime:** A single `original-call` winner double existed; non-winners received none, and fishing intrinsic-hand construction cleared `originalCall`.
- **Decision:** Represent the all-player and winner-only awards independently. Preserve `originalCall` in the intrinsic fishing hand. Buzzard continues to disable the inherited BMJA rule.
- **Result:** A fishing player receives one all-player `original-call` double. A winner with Original Call receives that double and an additional `win-original-call` double. This interpretation is explicitly grounded in the two source headings, not inferred from the existing runtime.
- **Boundary tests:** `scoring/rules.test.ts` checks non-winner and winner layers; `game/buzzard-2000.test.ts` separately asserts Buzzard emits neither `original-call` nor `win-original-call` while retaining the concealed-hand and final-discard exclusions; `scoring/fishing.test.ts` directly verifies `fishingIntrinsicHand` preserves `originalCall: true`.
- **Classification:** `runtime-corrected-source-equivalent`.

## 4. BMJA/Buzzard all-majors ordinary double

- **Governing proposition:** The BMJA source says all tiles are suited 1s/9s “with some Dragons and/or Winds”. Buzzard's retained evidence describes the same terminal/honour ordinary family. Western T&M and OTB are outside this correction.
- **Previous runtime:** Shared predicate checked only that every tile was a major, admitting pure suited-terminal shapes.
- **Decision:** The ordinary predicate remains “every tile is major.” For the all-suited-terminal shape, higher-level special-hand precedence is sufficient: the complete four Pung/Kong + pair shape is intercepted as fixed `Heads and Tails` in both BMJA and Buzzard before ordinary winner doubles are emitted. Leave the shared predicate unchanged so this issue does not alter Western or OTB behavior without separate source review.
- **Result:** An ordinary hand containing suited terminals plus honours receives the all-majors double. A pure-terminal `Heads and Tails` hand is scored through its fixed special treatment and receives no ordinary all-majors double.
- **Boundary tests:** `scoring/rules.test.ts` checks BMJA runtime interception and absence of the ordinary double; `game/buzzard-2000.test.ts` independently checks Buzzard interception and absence of the ordinary double. Existing special-hand tests retain fixed-shape coverage.
- **Classification:** `runtime-proved-source-equivalent`.

## C2B authoring boundary

The four ordinary treatments above can be authored against their respective profile source propositions after this runtime change: Buzzard no-Chows, BMJA concealed winner, BMJA Original Call layers, and BMJA/Buzzard all-majors. This report does not author any C2B truth records. No Western T&M, OTB, MCR/Riichi, settlement/progression/incidents, registry, C1/C2A record, or unrelated scoring change is included.
