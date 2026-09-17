# Rules platform — MCR 2006 alignment amendment

Status: **normative narrow amendment for #230 and future #241 implementation**  
Date: 2026-09-17  
Applies to: `RULES_PLATFORM_EIGHT_MANIFESTS_V1.md`, `RULES_PLATFORM_REGISTRY_INVENTORY.md`, #230 and #241.  
Source corpus: merged PR #242 / completed #176.

## Purpose

The original eight-manifest and registry documents were written before the MCR 2006 correctness corpus was completed and before the senior-review dealer/progression hardening was consolidated.

This note does **not** redesign the rules platform. It normalises stale paper labels so Codex can map the finished MCR corpus directly onto the already-approved Lego-block architecture.

Where an older MCR paper manifest or registry example conflicts with this note, **this note wins**.

## Product boundary

For MCR, Mahjong Reference consumes a resolved physical hand plus only score-relevant context:

```text
resolved hand + score-relevant evidence/context
→ lawful MCR score
→ settlement transactions
→ next table state
```

It does not simulate wall construction, turns, claims, Kong procedure, live fouls or referee procedure.

## Canonical MCR Lego mapping

The future executable MCR profile must use the existing V1 platform categories:

```text
family:             family.mcr
grammar:            pattern-accumulator
seat model:         seats.winds-4
dealer model:       dealer.east-seat OR omitted if dealer identity is already represented by family strategy state
tile set:           tiles.flowers-144
standard hand:      shape.four-sets-pair
validation:         validation.mcr-winning-shape
pattern catalogue:  catalogue.pattern.mcr-wmo-2006
interaction:        interaction.mcr-2006-non-combination
qualification:      qualification.mcr-8-before-flowers
interpretation:     interpretation.max-lawful-profile
post-qual bonus:    post-qualification-bonus.mcr-flowers
conversion:         conversion.identity
settlement:         settlement.mcr-2006
progression:        progression.always-pass
game end:           game-end.four-round-always-pass
provenance:         source.mcr-ema-green-book-2006
```

The 81 individual fan retain the stable binding IDs defined by `MCR_FAN_CATALOGUE_2006.md` (`mcr2006.fan.*`). They are profile-owned bindings inside `catalogue.pattern.mcr-wmo-2006`; they are not 81 new universal registry categories.

## Explicit stale-label normalisation

Treat these older paper labels as superseded for executable MCR work:

```text
catalogue.pattern.mcr-wmo-2006-81
→ catalogue.pattern.mcr-wmo-2006

value-policy.mcr-flowers
→ post-qualification-bonus.mcr-flowers

dealer.always-pass
→ dealer.east-seat (or no separate dealer model where strategy state already represents dealer identity)
```

Reason for the dealer correction: dealer/seat models represent identity only. `progression.always-pass` is the sole owner of pass/retain/rotate semantics. The executable model must make contradictory dealer/progression configuration impossible.

The old MCR manifest statement that the 81-fan scorer corpus is still a research gap is also superseded. #176 is complete and PR #242 merged the source-pinned corpus. Runtime implementation remains pending under #241; research does not.

## MCR evidence codec / policy

Use a family-owned MCR evidence policy/codec rather than adding a generic questionnaire for all Mahjong families.

Canonical policy identity:

```text
evidence-policy.mcr-wmo-2006
```

Facts already represented generically and reusable by MCR include:

```text
evidence.winning-method
evidence.seat-wind
evidence.round-wind
```

The MCR family codec must additionally represent the small source-proven facts that cannot always be derived from the submitted hand or trusted game context:

```text
winning tile identity        // part of MCR hand evidence; do not ask twice if already captured
evidence.resolved-win-event  // finite enum, not contradictory booleans
evidence.last-visible-copy   // fan 58 Last Tile
evidence.flower-count        // winner's retained Flowers
```

`evidence.resolved-win-event` must be able to represent at least:

```text
none
last-wall-draw
last-discard
kong-replacement
flower-replacement
rob-kong
```

This distinction is score-relevant: a Flower-replacement win may count ordinary Self-Drawn but is not `Out with Replacement Tile`.

`requiredEvidence()` must ask only for facts that are both unknown and capable of changing the current score. Trusted tracked-game context supplies seat/round/discarder information where available.

## Scoring sequence

The pattern-accumulator configuration must preserve this exact ordering:

```text
detect candidate fan
→ apply MCR interaction/counting policy
→ choose highest lawful interpretation/decomposition
→ calculate non-Flower qualifying subtotal
→ require subtotal >= 8
→ apply post-qualification-bonus.mcr-flowers
→ Basic Points
```

Flowers must never pass through `value-policy.*`, a Classical bonus registry, or a universal bonus drawer.

## Settlement and progression seams

Scoring, settlement and progression remain separate:

```text
HandScoreResult
→ accepted RoundResolution
→ settlement.mcr-2006
→ progression.always-pass
→ game-end.four-round-always-pass
```

Settlement consumes accepted Basic Points; it does not recalculate fan.

Progression consumes the resolved round; it does not infer pass/retain semantics from the dealer model.

## Implementation ownership

### #229 — containers

Must provide the neutral shapes MCR needs:

- pattern-accumulator scoring config shell;
- family-owned hand evidence + trusted context boundary;
- grammar-discriminated score result;
- generic RoundResolution;
- settlement transaction envelope;
- progression/game-end strategy references.

No MCR scoring code belongs in #229.

### #230 — labelled pieces / registries

Must provide typed categories/labels for the canonical mapping above, including:

- `post-qualification-bonus.*` as its own category;
- neutral dealer representation rather than transition-flavoured dealer IDs;
- the MCR evidence-policy identity and the three MCR-specific evidence facts above;
- architecture-only vs executable markers;
- semantic revisions for executable entries;
- fail-closed category/family/grammar validation.

No 81-fan scorer belongs in #230.

### #241 — later MCR construction

After the platform prerequisites exist, #241 mechanically fills these containers using the completed source corpus:

- 81 `mcr2006.fan.*` bindings;
- detectors;
- interaction/counting evaluator;
- qualification + Flowers ordering;
- executable golden tests;
- settlement/progression wiring;
- MCR-specific presentation.

Codex must not invent Mahjong semantics while doing this work.

## Acceptance for the Lego handoff

The platform/MCR contract is aligned when:

1. no executable MCR manifest uses `catalogue.pattern.mcr-wmo-2006-81`;
2. no executable MCR manifest routes Flowers through `value-policy.*`;
3. no executable profile uses `dealer.always-pass` or another transition-flavoured dealer model;
4. the MCR evidence codec can represent resolved win event, last-visible-copy and Flower count without live-game simulation;
5. #241 can be implemented entirely by selecting/filling registered containers plus source-bound `mcr2006.fan.*` bindings;
6. no new scoring grammar or generic `houseRules` bag is introduced for MCR.
