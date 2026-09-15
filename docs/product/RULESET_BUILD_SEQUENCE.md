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

1. **Buzzard 2000** — first adjacent classical-family architecture proof.
2. **MCR / WMO 2006** — first materially different scoring grammar.
3. **EMA Riichi 2025** — scoring + richer game-state architecture after the shared seams have been exercised.

This order is provisional only in the sense that implementation effort may change after source transcription. The architecture intent is firm: use the least-different profile first to expose bad abstractions cheaply, then test a different scoring grammar, then tackle Riichi's larger state model.

## What can progress in parallel before coding

Buzzard:

- finish exact point/double/special-hand source transcription;
- source-bind settlement/liability/progression;
- prepare golden fixtures.

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
- richer round outcomes than single winner/draw.

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

The source-bound profile proves the classical engine can be reused without application fork and identifies only the genuine new state: Standing Hand, dead-wall/Loose Tile lifecycle, liability/procedure.

### Checkpoint D — MCR

The platform can present/store a non-classical score result, settle it and progress a game without pretending it has British points/doubles.

### Checkpoint E — Riichi

The platform supports multi-winner/draw evidence, profile strategy state and neutral transactions before the full Riichi engine is layered on top.

## Rule

> **Build up, discover, then generalise only what the next real profile proves we need.**
