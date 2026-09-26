# Rules platform — eight normalised architecture manifests v1

Status: **exact architecture input for #227; not eight playable profiles**\
Supersedes the loose field naming in `EIGHT_RULESET_PAPER_MANIFESTS.md` for implementation planning. The earlier document remains the research record.

## 1. Important distinction

These manifests prove that one platform envelope can represent all eight families.

They are wrapped as architecture fixtures:

```ts
type ProfileArchitectureManifest = {
  candidate: ResolvedRulesProfileShape;
  unresolved: Array<{
    path: string;
    reason: string;
  }>;
};
```

`ResolvedRulesProfileShape` means the same structural fields as the V1 envelope, but registry references may point at architecture-only entries marked `executable: false`.

A **playable** `ResolvedRulesProfile` has stricter requirements:

```text
unresolved.length === 0
and every referenced registry entry executable === true
and all strategy params validate
and exact source/version policy satisfied
```

No `research-required` string is valid executable runtime data.

---

# 2. European Classical — external named implementation

```yaml
candidate:
  schemaVersion: 1
  identity:
    id: mt-european-classical-paper
    version: 2026-09-16
    status: provisional
    familyId: family.classical-western
    grammar: classical-points-doubles

  table:
    playerCount: 4
    seatModelId: seats.winds-4
    dealerModelId: dealer.rotate-every-hand

  tileSet:
    presetId: tiles.flowers-144
    options:
      bonusTilesEnabled: true

  handShape:
    presetId: shape.four-sets-pair
    options:
      irregularCatalogueId: catalogue.pattern.mt-european-classical-specials

  validation:
    handShapePolicyId: validation.classical-standard
    policyIds: []

  scoring:
    grammar: classical-points-doubles
    config:
      configVersion: 1
      presetId: classical.standard
      profileBindingsId: classical.bindings.mt-european-classical

  evidence:
    policyIds:
      - evidence-policy.classical-winning-context
      - evidence-policy.mt-european-classical-waits
    alwaysRequired: []

  settlement:
    id: settlement.classical-pairwise
    params:
      eastMultiplier: 2
      loserToLoser: true

  progression:
    id: progression.rotate-every-hand
    params: {}

  gameEnd:
    id: game-end.four-round-always-pass
    params: {}

  provenance:
    sourceIds:
      - source.mahjong-time.european-classical
    authorityStatus: secondary-implementation-source

unresolved:
  - path: tileSet/options/bonusTilesEnabled
    reason: Flower/Season scoring values need the missing/primary scoring source before executable publication.
  - path: scoring/config/profileBindingsId
    reason: This external profile is an architecture stress test, not yet a production authority profile.
```

Architecture result: **Classical grammar, non-BMJA progression; no new grammar.**

---

# 3. Hong Kong / Cantonese — external named implementation

```yaml
candidate:
  schemaVersion: 1
  identity:
    id: mt-hong-kong-paper
    version: 2026-09-16
    status: provisional
    familyId: family.hong-kong
    grammar: pattern-accumulator

  table:
    playerCount: 4
    seatModelId: seats.winds-4
    dealerModelId: dealer.hk-profile

  tileSet:
    presetId: tiles.flowers-144
    options:
      flowersSeasonsEnabled: true

  handShape:
    presetId: shape.four-sets-pair
    options:
      irregularCatalogueId: catalogue.pattern.hk-profile-specials

  validation:
    handShapePolicyId: validation.hk-profile
    policyIds: []

  scoring:
    grammar: pattern-accumulator
    config:
      configVersion: 1
      unit: fan
      patternCatalogueId: catalogue.pattern.hk-profile
      interactionPolicyId: interaction.hk-profile
      qualificationPolicyId: qualification.hk-profile
      interpretationPolicyId: interpretation.max-lawful-profile
      conversionPolicyId: conversion.hk-fan-payment-table
      capPolicyId: value-policy.hk-profile

  evidence:
    policyIds:
      - evidence-policy.hk-profile
    alwaysRequired:
      - evidence.winning-method
      - evidence.seat-wind
      - evidence.round-wind

  settlement:
    id: settlement.hk-profile
    params: {}

  progression:
    id: progression.hk-profile
    params: {}

  gameEnd:
    id: game-end.hk-profile
    params: {}

  provenance:
    sourceIds:
      - source.mahjong-time.hong-kong
    authorityStatus: secondary-implementation-source

unresolved:
  - path: scoring
    reason: Exact named Hong Kong production authority/catalogue/minimum/conversion profile has not yet been pinned.
  - path: progression
    reason: Production dealer-continuation strategy requires source-pinned profile.
  - path: gameEnd
    reason: Production game-end strategy requires source-pinned profile.
```

Architecture result: **pattern accumulator proves qualification and payment conversion are separate policies.**

---

# 4. MCR / WMO 2006

```yaml
candidate:
  schemaVersion: 1
  identity:
    id: mcr-wmo-2006
    version: architecture-0.x
    status: provisional
    familyId: family.mcr
    grammar: pattern-accumulator

  table:
    playerCount: 4
    seatModelId: seats.winds-4
    dealerModelId: dealer.always-pass

  tileSet:
    presetId: tiles.flowers-144
    options: {}

  handShape:
    presetId: shape.four-sets-pair
    options:
      irregularCatalogueId: catalogue.pattern.mcr-special-shapes

  validation:
    handShapePolicyId: validation.mcr-winning-shape
    policyIds:
      - validation.mcr-minimum-win-context

  scoring:
    grammar: pattern-accumulator
    config:
      configVersion: 1
      unit: points
      patternCatalogueId: catalogue.pattern.mcr-wmo-2006-81
      interactionPolicyId: interaction.mcr-2006-non-combination
      qualificationPolicyId: qualification.mcr-8-before-flowers
      interpretationPolicyId: interpretation.max-lawful-profile
      postQualificationBonusPolicyId: value-policy.mcr-flowers
      conversionPolicyId: conversion.identity

  evidence:
    policyIds:
      - evidence-policy.mcr-wmo-2006
    alwaysRequired:
      - evidence.winning-method
      - evidence.winning-tile-provenance
      - evidence.seat-wind
      - evidence.round-wind

  settlement:
    id: settlement.mcr-2006
    params: {}

  progression:
    id: progression.always-pass
    params: {}

  gameEnd:
    id: game-end.four-round-always-pass
    params: {}

  provenance:
    sourceIds:
      - source.mcr-ema-green-book-2006
    authorityStatus: source-pinned

unresolved:
  - path: scoring/config/patternCatalogueId
    reason: All 81 fan definitions/interactions need source-linked executable fixtures before scorer implementation.
```

Architecture result: **source-pinned family boundary; scorer corpus remains a data/correctness task, not an architecture question.**

---

# 5. Taiwanese 16-tile — external named implementation

```yaml
candidate:
  schemaVersion: 1
  identity:
    id: mt-taiwanese-paper
    version: 2026-09-16
    status: provisional
    familyId: family.taiwanese-16-tile
    grammar: pattern-accumulator

  table:
    playerCount: 4
    seatModelId: seats.winds-4
    dealerModelId: dealer.taiwanese-profile

  tileSet:
    presetId: tiles.flowers-144
    options:
      bonusTilesEnabled: true

  handShape:
    presetId: shape.five-sets-pair
    options:
      dealtConcealedTiles: 16
      winningStructuralTiles: 17
      irregularCatalogueId: catalogue.pattern.taiwanese-profile-specials

  validation:
    handShapePolicyId: validation.taiwanese-five-sets-pair
    policyIds: []

  scoring:
    grammar: pattern-accumulator
    config:
      configVersion: 1
      unit: tai
      patternCatalogueId: catalogue.pattern.taiwanese-profile
      interactionPolicyId: interaction.taiwanese-profile
      qualificationPolicyId: qualification.taiwanese-profile
      interpretationPolicyId: interpretation.max-lawful-profile
      capPolicyId: value-policy.optional-table-cap
      conversionPolicyId: conversion.identity

  evidence:
    policyIds:
      - evidence-policy.taiwanese-profile
    alwaysRequired:
      - evidence.winning-method
      - evidence.winning-tile-provenance

  settlement:
    id: settlement.taiwanese-winner-only
    params: {}

  progression:
    id: progression.taiwanese-profile
    params: {}

  gameEnd:
    id: game-end.taiwanese-profile
    params: {}

  provenance:
    sourceIds:
      - source.mahjong-time.taiwanese
    authorityStatus: secondary-implementation-source

unresolved:
  - path: scoring
    reason: Exact production tai catalogue/values/interaction policy need a pinned authority/profile.
  - path: progression
    reason: Source-pinned dealer progression still required.
  - path: gameEnd
    reason: Source-pinned game-end strategy still required.
```

Architecture result: **decisive proof that hand shape is profile-owned.**

---

# 6. Riichi / EMA 2025 target

```yaml
candidate:
  schemaVersion: 1
  identity:
    id: riichi-ema-2025
    version: architecture-0.x
    status: provisional
    familyId: family.riichi
    grammar: riichi-han-fu

  table:
    playerCount: 4
    seatModelId: seats.riichi-winds-4
    dealerModelId: dealer.riichi-renchan

  tileSet:
    presetId: tiles.riichi-136
    options:
      redFives: 0

  handShape:
    presetId: shape.four-sets-pair
    options:
      irregularCatalogueId: catalogue.pattern.riichi-ema-2025-special-shapes

  validation:
    handShapePolicyId: validation.riichi-winning-shape
    policyIds:
      - validation.riichi-yaku-required

  scoring:
    grammar: riichi-han-fu
    config:
      configVersion: 1
      yakuCatalogueId: catalogue.yaku.riichi-ema-2025
      yakumanCatalogueId: catalogue.yakuman.riichi-ema-2025
      decompositionPolicyId: riichi-decomposition.ema-2025-enumerate-max
      doraPolicyId: dora.riichi-ema-2025
      fuPolicyId: fu.riichi-ema-2025
      limitTierPolicyId: riichi-limit-tier.ema-2025
      handValuePolicyId: riichi-hand-value.ema-2025

  evidence:
    policyIds:
      - evidence-policy.riichi-ema-2025
    alwaysRequired:
      - evidence.winning-method
      - evidence.winning-tile-provenance
      - evidence.seat-wind
      - evidence.round-wind

  settlement:
    id: settlement.riichi-ema-2025-four-player
    params: {}

  progression:
    id: progression.riichi-ema-2025-renchan
    params: {}

  gameEnd:
    id: game-end.riichi-ema-2025
    params: {}

  procedure:
    id: procedure.riichi-ema-2025-social
    params: {}

  provenance:
    sourceIds:
      - source.ema-riichi-2025
    authorityStatus: source-pinned

unresolved:
  - path: scoring
    reason: Source-linked yaku/fu/dora/payment golden corpus is still required before broad scorer implementation.
```

Architecture result: **source authority and architecture are pinned; remaining work is executable scorer data/fixtures.**

---

# 7. Sanma — external Riichi-family variant proof

```yaml
candidate:
  schemaVersion: 1
  identity:
    id: mt-sanma-paper
    version: 2026-09-16
    status: provisional
    familyId: family.riichi-sanma
    grammar: riichi-han-fu
    baseProfile:
      id: riichi-ema-2025
      version: architecture-0.x

  table:
    playerCount: 3
    seatModelId: seats.riichi-sanma-east-south-west
    dealerModelId: dealer.riichi-sanma-renchan

  tileSet:
    presetId: tiles.sanma-108
    options:
      redFives: 3
      nukiDoraTile: north

  handShape:
    presetId: shape.four-sets-pair
    options:
      irregularCatalogueId: catalogue.pattern.sanma-profile-special-shapes

  validation:
    handShapePolicyId: validation.riichi-winning-shape
    policyIds:
      - validation.sanma-no-chii
      - validation.riichi-yaku-required

  scoring:
    grammar: riichi-han-fu
    config:
      configVersion: 1
      yakuCatalogueId: catalogue.yaku.sanma-profile
      yakumanCatalogueId: catalogue.yakuman.sanma-profile
      decompositionPolicyId: riichi-decomposition.compatible-enumerate-max
      doraPolicyId: dora.sanma-profile-with-nuki
      fuPolicyId: fu.sanma-profile
      limitTierPolicyId: riichi-limit-tier.sanma-profile
      handValuePolicyId: riichi-hand-value.sanma-profile

  evidence:
    policyIds:
      - evidence-policy.riichi-sanma
    alwaysRequired:
      - evidence.winning-method
      - evidence.winning-tile-provenance
      - evidence.seat-wind

  settlement:
    id: settlement.riichi-sanma
    params: {}

  progression:
    id: progression.riichi-sanma-renchan
    params: {}

  gameEnd:
    id: game-end.riichi-sanma
    params: {}

  provenance:
    sourceIds:
      - source.mahjong-time.sanma
    authorityStatus: secondary-implementation-source

unresolved:
  - path: identity/baseProfile
    reason: The paper fixture proves family reuse; a production Sanma profile needs its own coherent authority/version rather than inheriting EMA rules by assumption.
  - path: scoring
    reason: Exact Sanma yaku/dora/fu/payment variations require source-pinned profile evidence.
```

Architecture result: **same `riichi-han-fu` grammar, major configuration changes, no scorer fork.**

---

# 8. Zung Jung v1.03 — architecture profile

```yaml
candidate:
  schemaVersion: 1
  identity:
    id: zung-jung-1.03-paper
    version: architecture-0.x
    status: provisional
    familyId: family.zung-jung
    grammar: pattern-accumulator

  table:
    playerCount: 4
    seatModelId: seats.winds-4
    dealerModelId: dealer.always-pass

  tileSet:
    presetId: tiles.standard-136
    options: {}

  handShape:
    presetId: shape.four-sets-pair
    options:
      irregularCatalogueId: catalogue.pattern.zung-jung-special-shapes

  validation:
    handShapePolicyId: validation.zung-jung-winning-shape
    policyIds: []

  scoring:
    grammar: pattern-accumulator
    config:
      configVersion: 1
      unit: points
      patternCatalogueId: catalogue.pattern.zung-jung-1.03-44
      interactionPolicyId: interaction.zung-jung-same-series-highest-only
      qualificationPolicyId: qualification.none
      interpretationPolicyId: interpretation.max-lawful-profile
      floorPolicyId: value-policy.zung-jung-zero-pattern-one
      capPolicyId: value-policy.zung-jung-320-listed-limit
      conversionPolicyId: conversion.identity

  evidence:
    policyIds:
      - evidence-policy.zung-jung-1.03
    alwaysRequired:
      - evidence.winning-method
      - evidence.winning-tile-provenance

  settlement:
    id: settlement.zung-jung-formal
    params: {}

  progression:
    id: progression.always-pass
    params: {}

  gameEnd:
    id: game-end.zung-jung-profile
    params: {}

  provenance:
    sourceIds:
      - source.zung-jung-1.03
    authorityStatus: primary-authority-to-pin

unresolved:
  - path: provenance/sourceIds
    reason: Pin exact primary source/version locators in project source register before executable profile release.
  - path: scoring/config/patternCatalogueId
    reason: Full 44-pattern executable corpus/source fixtures are not part of #227.
```

Architecture result: **same accumulator grammar as MCR, distinct interaction/floor/cap semantics.**

---

# 9. American / NMJL-style annual target catalogue

```yaml
candidate:
  schemaVersion: 1
  identity:
    id: american-nmjl-style-paper
    version: 2026-architecture
    status: provisional
    familyId: family.american-nmjl-style
    grammar: target-catalogue

  table:
    playerCount: 4
    seatModelId: seats.american-four-player
    dealerModelId: dealer.american-profile

  tileSet:
    presetId: tiles.american-joker-capable
    options: {}

  handShape:
    presetId: shape.target-catalogue
    options: {}

  validation:
    handShapePolicyId: validation.target-catalogue-match
    policyIds: []

  scoring:
    grammar: target-catalogue
    config:
      configVersion: 1
      catalogueRef:
        id: catalogue.target.nmjl-2026-external-placeholder
        version: 2026
      matchPolicyId: target-match.nmjl-style
      substitutionPolicyId: substitution.nmjl-style-joker
      exposurePolicyId: target-exposure.nmjl-style
      valuePolicyId: target-value.catalogue-defined

  evidence:
    policyIds:
      - evidence-policy.american-nmjl-style
    alwaysRequired: []

  settlement:
    id: settlement.american-profile
    params: {}

  progression:
    id: progression.american-profile
    params: {}

  gameEnd:
    id: game-end.american-profile
    params: {}

  provenance:
    sourceIds:
      - source.nmjl-annual-card-ecosystem
    authorityStatus: engine-only-no-card-content

unresolved:
  - path: scoring/config/catalogueRef
    reason: No current commercial card contents may be assumed/distributed; executable catalogue needs a lawful approved source path.
  - path: settlement
    reason: Source-pinned executable settlement profile remains to be researched.
  - path: progression
    reason: Source-pinned executable table progression remains to be researched.
  - path: gameEnd
    reason: Source-pinned executable game-end profile remains to be researched.
```

Architecture result: **engine and annual catalogue are cleanly separable; annual change does not imply scorer rewrite.**

---

# 10. Cross-manifest proof table

| Profile | Players | Hand grammar | Scoring grammar | Key non-score strategy pressure | Source readiness |
|---|---:|---|---|---|---|
| European Classical | 4 | 4+pair + specials | Classical | rotate-every-hand vs BMJA | architecture-only external |
| Hong Kong | 4 | 4+pair + specials | accumulator | fan conversion/minimum variants | production authority needed |
| MCR 2006 | 4 | 4+pair + specials | accumulator | 8-point qualification, always-pass | authority pinned; fan corpus needed |
| Taiwanese | 4 | **5+pair** | accumulator | winner-only payment / local variants | production authority needed |
| EMA Riichi 2025 | 4 | 4+pair + specials | **han+fu** | multi-winner/draw/renchan/pots | authority pinned; scorer corpus needed |
| Sanma | **3** | 4+pair + Riichi specials | **same han+fu** | tile/call/dora/payment variant | production authority needed |
| Zung Jung | 4 | 4+pair + irregulars | accumulator | series exclusion/floor/cap | exact primary locators/corpus needed |
| American | 4 | **target catalogue** | **target catalogue** | annual version + Jokers | lawful catalogue path needed |

The V1 envelope passes this design set without a fifth scoring grammar and without arbitrary executable profile code.

---

# 11. Codex instruction derived from these manifests

Codex must treat every ID above as either:

- an executable registry entry already supplied by the implementation slice; or
- an architecture-only reference explicitly marked non-executable.

It must not fill an unresolved reference by searching the web, guessing a value or borrowing semantics from another family.
