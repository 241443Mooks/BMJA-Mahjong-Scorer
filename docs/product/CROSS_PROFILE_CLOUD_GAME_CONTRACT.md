# Cross-profile cloud game / versioning contract

Status: **architecture decision**  
Parent: #206 / #208  
Rules programmes: BMJA/current profiles, #175 Buzzard 2000, #176 MCR, #202 EMA Riichi 2025

## Purpose

Define a cloud/save boundary that can persist and replay materially different Mahjong rules profiles without making the database schema British-specific or Riichi-specific.

This contract must support at minimum:

1. current BMJA/classical-family games;
2. Buzzard 2000 British/Western Classical;
3. MCR / WMO 2006;
4. Riichi / EMA 2025.

It must also remain compatible with the already-supported Thompson & Maloney provisional and Outside the Box profiles.

## Key decision

Do **not** store the current in-memory `GameState` as the permanent cloud schema.

Current `GameState` contains classical/BMJA-shaped top-level concepts such as:

- `prevailingWind`;
- `eastCycleStartPlayerId`;
- `currentHandMode: normal | goulash`;
- single-winner `HandOutcome`;
- classical score records;
- fixed British/club incident and settlement-reason unions.

Those are valid current runtime concepts, but not a durable universal schema for MCR/Riichi.

Cloud storage should instead use a **versioned neutral envelope + profile-owned replay payload**.

## Cloud record envelope

Conceptual record:

```ts
type CloudGameRecord = {
  id: string;
  ownerUserId: string;

  gameSchemaVersion: number;
  rulesProfile: {
    id: string;
    version: string;
  };

  createdAt: string;
  updatedAt: string;
  revision: number;
  status: 'in-progress' | 'complete' | 'archived';

  players: Array<{
    id: string;
    name: string;
  }>;

  setup: unknown;          // validated by schemaVersion + profile codec
  confirmedEvents: unknown[];
  currentDraft?: unknown;
  finalisation?: unknown;
};
```

`unknown` above means **profile-codec-owned typed JSON**, not unchecked arbitrary JSON at runtime.

Every read passes through:

```text
gameSchemaVersion
+ exact rulesProfile id/version
→ registered codec/validator
→ replay/migration policy
```

## Three independent versions

Do not collapse these into one number.

### 1. `gameSchemaVersion`

Version of the generic cloud envelope/storage contract.

Changes when the generic persisted representation changes.

### 2. `rulesProfile.id + rulesProfile.version`

Exact executable rules contract.

Examples conceptually:

```text
bmja@1.0
buzzard-2000-classical@1.0
mcr-wmo-2006@1.0
riichi-ema-2025@1.0
```

A later rules edition or corrected executable rule that changes replay/scoring cannot silently replace an existing saved game's profile.

### 3. profile payload schema version, if needed

A profile codec may carry an internal payload version when its persisted strategy-state representation evolves without changing the rules mathematics.

Example:

```text
strategyStateSchemaVersion: 2
```

Only add this when actually needed; do not create speculative version numbers everywhere.

## Stable IDs, never localized labels

Persist:

```text
rulesProfile.id = "riichi-ema-2025"
```

Never persist a display string such as:

```text
"Riichi Mahjong"
"Mahjong japonais"
```

Language/localisation is a presentation/account preference and has no effect on game mathematics.

Likewise use stable IDs for:

- rules/fan/yaku/pattern IDs;
- transaction reason IDs;
- procedure/event IDs;
- player IDs.

Localized names are resolved at display time.

## Generic event/history principles

A confirmed history entry must preserve **accepted facts**, not only derived totals.

The minimum replay rule is:

> The stored setup + confirmed accepted evidence/events must be sufficient for the pinned rules profile to reconstruct balances, progression and final results without trusting stale derived arithmetic as a second source of truth.

Derived results may also be stored for display/audit/cache, but must be identifiable as derived and reproducible.

Do not force every profile into one giant universal event union. Use a small generic header plus a profile-owned validated body.

Conceptually:

```ts
type ConfirmedGameEvent = {
  id: string;
  sequence: number;
  kind: string;          // stable namespaced event id
  profilePayload: unknown;
  acceptedAt: string;
};
```

Examples:

```text
classical.hand-confirmed
buzzard.standing-declared       // only if actively tracked
mcr.hand-confirmed
riichi.riichi-declared
riichi.hand-settled
riichi.exhaustive-draw
```

We do **not** need an event for every physical draw/discard unless a product feature explicitly tracks it.

## Profile codec contract

Each playable profile/family should eventually register persistence/replay functions conceptually equivalent to:

```ts
interface GameProfileCodec<TSetup, TEvent, TDraft, TState> {
  profile: RulesProfileRef;
  validateSetup(value: unknown): TSetup;
  validateEvent(value: unknown): TEvent;
  validateDraft(value: unknown): TDraft;
  replay(setup: TSetup, events: TEvent[]): TState;
  migratePayload?(...): ...;
}
```

This is an architecture boundary, not a demand to build a generic framework immediately.

For current profiles, the first cloud implementation may adapt the existing local snapshot/replay model behind this boundary.

## What each target profile needs

### BMJA / current classical family

Persist/replay facts broadly equivalent to the current model:

- four players and starting seats;
- prevailing-wind/dealer progression inputs;
- exact profile/version;
- each hand's winner/draw;
- accepted hand scores/evidence;
- profile incidents where implemented;
- settlement/progression derived from profile strategy;
- current unconfirmed draft.

Current local persistence is a useful adapter source, but its `GAME_SNAPSHOT_VERSION=1` JSON is not automatically the permanent cloud schema.

### Buzzard 2000

In addition to classical scoring evidence, the profile may require persisted facts for:

- Standing Hand declaration/state where actively tracked;
- source-specific dead-hand outcome;
- dangerous-discard liability trigger/evidence;
- procedure/penalty events if full playable support includes them;
- profile-specific dealer/progression state.

Loose/dead-wall physical state only needs persistence when the Table Companion actively tracks it. A hand-end calculator can persist accepted derived event evidence instead.

### MCR / WMO 2006

Persist facts needed for:

- exact MCR profile/version;
- winning hand evidence and matched fan result;
- discard vs self-draw route;
- single resolved winner/draw under the pinned rules;
- Flower bonus evidence where relevant;
- MCR settlement;
- dealer/round progression independent of BMJA repeat rules;
- penalties/procedure only if actively supported.

Do not store British loser scores or doubles merely because current `RoundInput` has them.

### Riichi / EMA 2025

Persist facts needed for:

- procedure mode when it changes executable treatment;
- current seats/round/dealer;
- balances;
- honba/counters;
- carried riichi-stick pot;
- riichi declarations/deposits;
- ron/tsumo/exhaustive-draw result;
- one or multiple winners;
- tenpai players on exhaustive draw;
- accepted yaku/han/fu/dora/payment evidence per winner;
- liability evidence where applicable;
- game finalisation/uma.

Scoring-time evidence such as dora indicators/furiten/ippatsu may be stored in the accepted winning-hand record even if not continuously tracked during play.

## Outcome model implication

The universal cloud contract must **not** depend on current:

```ts
{ type: 'win'; winnerId: string } | { type: 'draw' }
```

because Riichi requires multiple winners and richer draw evidence.

Likewise do not create a universal `winnerIds` shape and assume every profile's hand lifecycle is now solved forever.

Persist profile-owned validated outcome/event evidence under the pinned profile codec.

## Settlement/ledger persistence

Store accepted settlement transactions as audit/display data if useful, but replay must be able to regenerate them from source evidence and pinned rules.

Generic transaction storage should allow:

```text
from account/player/pot
→ to account/player/pot
amount
currency/unit = game points
stable reason/rule id
profile-specific metadata
```

Do not make `eastMultiplier` mandatory in the generic persisted transaction shape.

Do not make the fixed current British transaction-reason union the cloud schema.

## Drafts

`currentDraft` is intentionally profile-owned and **non-authoritative** until confirmed.

Rules:

- cloud sync may save drafts for recovery;
- confirmed history is never mutated merely because a draft changes;
- a profile update cannot silently reinterpret an old draft under a different rules version;
- conflict UI preserves both sides when two devices diverge.

## Optimistic concurrency

Every cloud game has integer `revision`.

Mutation contract:

```text
client sends expectedRevision = N
server writes only if current revision == N
success -> revision N+1
stale -> conflict with current server revision
```

This is sufficient for single-owner save/continue.

Do not add CRDT/automatic history merge machinery unless a demonstrated collaborative-editing requirement appears.

## Migration policy

### Generic schema migration

Allowed when it preserves the same accepted game facts and rules mathematics.

Migration must be explicit/tested and retain the old schema reader until safely migrated where needed.

### Rules migration

Never silent when executable behaviour changes.

Options for an old saved game:

- continue under its pinned rules profile/version;
- explicit user/admin migration with a documented semantic change;
- read-only/export if the old engine is no longer executable.

Do not simply resolve `bmja@1.0` to whatever `bmja` means today.

## Cloud game API surface

The first API can remain small:

```text
POST   /api/games
GET    /api/games
GET    /api/games/:id
PUT    /api/games/:id       expected revision required
POST   /api/games/:id/archive
```

The API treats `rulesProfile` + validated payload as game truth. It does not need a different database table for each rules family.

## Database shape

A practical initial D1 table can remain compact:

```text
cloud_game
- id
- owner_user_id
- rules_profile_id
- rules_profile_version
- game_schema_version
- revision
- status
- payload_json
- created_at
- updated_at
```

Index/query stable metadata as real columns; keep profile-specific replay payload in validated JSON unless/query needs demonstrate a reason to normalize it.

This is a deliberate use of JSON, not an unrestricted `user_json` dump: the payload has a registered versioned codec.

## Cross-profile golden contract tests

Before cloud games are considered safe, every supported profile should have fixtures proving:

1. create canonical game state;
2. encode cloud payload;
3. JSON round-trip;
4. validate/decode;
5. replay;
6. reproduce balances/progression/results;
7. preserve exact profile/version;
8. reject unknown profile/version;
9. reject incompatible/malformed payload;
10. conflict revision never silently overwrites a newer record.

At first this applies to current supported profiles. Buzzard/MCR/Riichi add their fixtures before becoming cloud-playable.

## Immediate consequence for #208

The first cloud-game implementation should **not** wait for Buzzard/MCR/Riichi to be built.

It should:

- introduce the neutral envelope now;
- adapt existing BMJA/current profile replay into it;
- keep profile payload codec/validation explicit;
- avoid persisting current `GameState` wholesale;
- prove that adding a future codec does not require a database redesign.

## Architecture gate result

**Passed for the four target profiles.**

Nothing in the cloud schema now requires Buzzard, MCR or Riichi to imitate BMJA scoring/progression. The remaining work is implementation of each profile codec and domain engine, not another cloud database redesign.
