# Platform + ruleset build sequence

Status: **readiness plan**  
Programme: #105

## Goal

Coordinate the shared platform work (i18n, account foundation, cloud saves) with the next three rules programmes without turning them into one monolithic build.

## Sequence

### Foundation wave

1. English-only i18n foundation.
2. Local language preference.
3. Cloudflare/Hono + D1/Drizzle foundation.
4. Better Auth Email OTP.
5. Sync `preferredLocale` across sessions/devices.
6. Stop and inspect the actual platform before game-data sync.
7. Neutral cross-profile cloud-game envelope + current-profile codec.

### Rules wave

1. **Buzzard 2000** — first adjacent classical-family composition proof.
2. **MCR / WMO 2006** — first materially different scoring grammar.
3. **EMA Riichi 2025** — scoring + richer game-state architecture after the shared seams have been exercised.

The architecture intent is: use the least-different profile first to prove that our rules are genuinely composable, then test a different scoring grammar, then tackle Riichi's larger state model.

## What can progress in parallel before coding

Buzzard:

- source PDF recovered and hashed;
- exact point table, winner bonuses, doubles, limit list, settlement, progression, liability and penalties are now page-bound in `docs/rules/BUZZARD_2000_RULE_EVIDENCE.md`;
- architecture crosswalk has been corrected to the actual product scope: score the physical game and run the table, do not simulate play;
- prepare source-linked golden fixtures for #217;
- explicitly resolve/pin the cumulative complete-Flower/Season + own-tile double fixture rather than silently inheriting BMJA bouquet behaviour.

MCR:

- transcribe all 81 fan from the pinned Green Book;
- bind exclusions/non-combination rules;
- prepare official/source scorer fixtures.

Riichi:

- build source-linked yaku/fu/payment fixtures;
- retain the now-resolved architecture decisions;
- recruit experienced EMA players for later terminology/table-flow validation.

## Shared architecture changes should be evidence-led

Do not build a universal rules framework speculatively.

Only generalise a seam when at least two profiles demonstrate the need.

Examples already justified by current + future profiles:

- stable profile id/version separate from display language;
- profile-discriminated scoring result;
- neutral cloud envelope + profile codec;
- generic payer→payee settlement transactions;
- profile-owned game/progression/completion state;
- richer round outcomes than single winner/draw where a future profile proves that need.

Examples **not** justified yet:

- CRDT game history;
- universal wall simulator;
- one generic rule-expression language for every Mahjong discipline;
- one giant event log requiring every tile draw/discard;
- generic entitlement framework beyond current Plus need.

## Readiness checkpoints

### Checkpoint A — platform spine

A user can choose a locale locally, sign in by OTP, persist the preference to their account and recover it in another browser while all free play still works offline/backend-down.

### Checkpoint B — cloud contract

A current supported game can round-trip through the neutral cloud envelope and replay exactly, with revision conflict protection.

### Checkpoint C — Buzzard

Buzzard proves the existing classical engine can be composed rather than copied.

1. **C1 evidence** — COMPLETE: primary PDF snapshot recovered; executable score/double/limit/settlement/progression/penalty facts are page-bound.
2. **C2 profile composition** — #217: KEEP existing classical rules, ADD Buzzard-only rules, AMEND the few divergent predicates/values, REMOVE BMJA-only behaviour, and prove profile isolation.
3. **C3 table-companion seams** — support Buzzard's non-winner Wind/Dragon limit result and profile-specific incident/liability settlement using the existing transaction infrastructure.
4. **C4 public profile** — profile-picker/reference/help exposure after source fixtures and cross-profile regression pass.

There is **no Buzzard wall/claim gameplay simulator checkpoint** in the current product scope. Physical-play procedure belongs in reference/help unless a later product decision changes that scope.

### Checkpoint D — MCR

The platform can present/store a non-classical score result, settle it and progress a game without pretending it has British points/doubles.

### Checkpoint E — Riichi

The platform supports the Riichi scoring/settlement/progression evidence actually needed by a physical-table companion; do not default to simulating play unless the product requires it.

## Rule

> **Build up, discover, then generalise only what the next real profile proves we need.**
