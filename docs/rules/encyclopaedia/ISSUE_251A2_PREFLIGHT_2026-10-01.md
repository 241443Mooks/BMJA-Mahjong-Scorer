# #251A2 current-main preflight

Status: **PASS — bounded crosswalk started**  
Parent: #251  
Base: `main` at `0ddbb740110c7b9803ce48d5560b42960e7db655` (1 October 2026)

## Decision and authority

The live #251 issue is the execution authority. It marks A2 ready against current executable/source-backed Classical + MCR truth and explicitly removes Riichi as a start prerequisite. This preflight found older contrary hold language in `docs/rules/encyclopaedia/README.md`, `A2_STRESS_TEST_SEED.md`, and `docs/product/REFERENCE_KNOWLEDGE_ARCHITECTURE.md`; those passages are superseded and are being aligned to the current issue decision.

This is a sparse reviewed crosswalk, not a universal canonicalisation pass. It consumes existing truth and runtime identities. It does not create new treatment facts, infer equivalence from names, or use the 626-row inventory as a page target.

## Start-gate evidence

- `artifacts/mahjong-scorer/src/rules-platform/truth-mcr-e4-profile-closeout.test.ts` accounts for all 81 MCR fan bindings and preserves the exact `mcr-wmo-2006@0.1` identity. MCR remains a provisional, non-public profile; its exact resolver/runtime is available for this rules audit.
- `artifacts/mahjong-scorer/src/rules-platform/truth-bmja-special-hands.test.ts` accounts for all 18 BMJA special-hand bindings and their source-backed treatments.
- `pattern.thirteen-orphans` already has separate BMJA and MCR claims/treatments. The BMJA treatment is `bmja@1.0:thirteen-unique-wonders`; the MCR treatment is `mcr-wmo-2006@0.1:thirteen-orphans`, bound to `mcr2006.fan.thirteen-orphans`.
- Stable comparator dimension `scoring.grammar` exists in `artifacts/mahjong-scorer/src/rules-platform/profile-dimensions.ts` for a broader rules concept projection.

No runtime or rules implementation change is required to begin A2.

## Bounded proof set

| Proof case | Exact current candidates and identities | Preflight disposition |
|---|---|---|
| Multi-profile named scoring concept | `pattern.thirteen-orphans`; `bmja@1.0:thirteen-unique-wonders` → `thirteen-unique-wonders`; `mcr-wmo-2006@0.1:thirteen-orphans` → `mcr2006.fan.thirteen-orphans` | **Genuine structural equivalent candidate.** Both existing detectors require all thirteen terminal/honor kinds plus one duplicate. Source claims: `evidence.pattern.thirteen-orphans.bmja` (BMJA approved special-hands source, “The thirteen unique wonders”) and `evidence.pattern.thirteen-orphans.mcr-wmo-2006` (Green Book §3.8.1 #7; Appendix 1 #7). Keep names, score treatment, profile identity, and MCR interaction/qualification facts local. |
| Narrower/broader treatment | `pattern.bmja.imperial-jade`, `bmja@1.0:imperial-jade` → `imperial-jade`; `pattern.mcr-wmo-2006.all-green`, `mcr-wmo-2006@0.1:all-green` → `mcr2006.fan.all-green` | **Narrower-than candidate:** BMJA requires four Pung/Kong groups plus a pair and the green tile restriction; MCR claim `evidence.pattern.mcr-wmo-2006.all-green` (Green Book §3.8.1 #3; Appendix 1 #3) specifies the green tile restriction over an otherwise lawful hand. Keep source qualification and fan/value treatment profile-local. |
| Profile-specific concept | `pattern.bmja.wriggling-snake`, `bmja@1.0:wriggling-snake` → `wriggling-snake`; MCR exact catalogue `MCR_2006_FAN_BINDINGS` (81 entries) | **BMJA-only in this comparison.** The complete MCR catalogue has no corresponding executable fan identity. Preserve the BMJA concept without manufacturing an MCR treatment or treating absence as an unrelated lookalike. |
| Broader rules concept | Classical profile refs (`bmja@1.0`, `western-tm@0.1`, `outside-the-box@0.1`, `buzzard-2000@0.1`) and provisional MCR ref `mcr-wmo-2006@0.1` | Project through existing dimension `scoring.grammar`; compare the runtime grammar values (`classical-points-doubles` and `pattern-accumulator`) via the profile dimension contract. Do not add a second scoring-grammar fact store. |
| Explicit unresolved case | `pattern.bmja.gates-of-heaven`, `bmja@1.0:gates-of-heaven` → `gates-of-heaven`; `pattern.mcr-wmo-2006.nine-gates`, `mcr-wmo-2006@0.1:nine-gates` → `mcr2006.fan.nine-gates` | **Unresolved pending full qualification comparison.** The visible one-suit structure overlaps, but BMJA's 14-tile predicate and completion/provenance rule differ from MCR's exact pre-win multiset plus any same-suit 1–9 winning tile. Source claims are profile-local; no equivalence is asserted in this preflight. |

These are the smallest useful candidates found that exercise all five #251 proof cases. The five rows are not a complete relationship matrix.

## Review sequence

1. Freeze the exact treatment IDs, runtime binding IDs, claims, source locators, and relevant detector predicates for these candidates.
2. Compare qualification, open/concealed state, winning event, score/fan, and interaction/suppression semantics where relevant.
3. Record only supported relationships; leave the Gates of Heaven/Nine Gates row unresolved if the source/runtime comparison does not settle it.
4. Audit the A2 result against issue #251 before using it to select the 251B vertical proof.

The crosswalk must not change scorer behavior, profile-local truth, or source claims. New canonical IDs are not needed for the first equivalent case because `pattern.thirteen-orphans` already exists and is shared by the two exact treatments.
