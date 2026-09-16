# Rules platform architecture fixtures

Status: **acceptance specification for #227**  
These are architecture fixtures, not full scoring corpora.

## 1. Purpose

Prove that the universal rules envelope is broad enough before expensive family scorers are implemented.

A fixture may prove:

- schema expressiveness;
- registry compatibility;
- fail-closed behavior;
- resolver/fingerprint determinism;
- shared predicate binding boundaries;
- strategy/result envelope expressiveness;
- current-profile parity.

It does **not** turn secondary paper-source values into production rules truth.

> Paper fixtures may explicitly contain unresolved source references. Playable resolved profiles may not.

---

# 2. Fixture classes

Use four fixture classes in implementation:

```text
A — architecture-manifest fixtures
    prove the envelope can represent a profile family

B — resolver/compatibility fixtures
    prove legal/illegal configuration behavior

C — cross-grammar semantic fixtures
    prove shared predicates remain score-neutral

D — current-production parity fixtures
    prove migration does not change BMJA/T&M/OTB behavior
```

---

# 3. Architecture manifest fixtures

## A01 — European Classical / Classical grammar

Must express:

```yaml
players: 4
tiles: 136-or-source-profile-bonus-variant
handShape: four-sets-pair + profile specials
grammar: classical-points-doubles
settlement: classical-pairwise
progression: rotate-every-hand
gameEnd: four-round-source-profile
```

Pressure proved:

- Classical scoring grammar does not imply BMJA dealer retention;
- additive concealed-hand bonus and concealed-hand double can coexist independently;
- broad pure-suit predicate may permit standard melds including Chows.

Architecture-only unresolved source detail remains allowed in paper status.

## A02 — Hong Kong / accumulator grammar

Must express:

```yaml
players: 4
tiles: 136/144-capable by pinned profile
grammar: pattern-accumulator
unit: fan
patternCatalogue: profile-versioned
qualification: configurable/profile minimum
conversion: fan-to-payment table
settlement: profile strategy
```

Pressure proved:

- pattern value and payment conversion are separate;
- a fan minimum is a qualification policy, not hand-shape validation;
- variants can change minimum/catalogue/value table without changing scoring grammar.

## A03 — MCR / accumulator with formal interactions

Must express:

```yaml
players: 4
tiles: flowers-144
handShape: four-sets-pair + permitted specials
grammar: pattern-accumulator
catalogue: mcr-81-fan
interaction: mcr-non-combination
qualification: minimum 8 qualifying points
postQualificationBonus: Flowers
settlement: mcr-2006
progression: always-pass
gameEnd: four-round
```

Pressure proved:

- not every accumulator blindly sums all matches;
- qualification subtotal can differ from final displayed/basic value components;
- Flower value can exist outside the legal threshold.

## A04 — Taiwanese / different hand grammar

Must express:

```yaml
players: 4
tiles: flowers-144
handShape: five-sets-pair
dealtConcealedTiles: 16
winningStructuralTiles: 17
grammar: pattern-accumulator
unit: tai
settlement: winner-only profile
```

Pressure proved:

- four-sets+pair is not universal;
- 13/14 structural-tile assumptions cannot stay in generic validation;
- pattern-accumulator grammar can coexist with a different hand grammar.

## A05 — Riichi / dedicated han+fu grammar

Must express:

```yaml
players: 4
tiles: riichi-136 by exact profile
grammar: riichi-han-fu
yakuCatalogue: source-versioned
fuPolicy: source-versioned
doraPolicy: source-versioned
limitTierPolicy: source-versioned
settlement: riichi-four-player
progression: riichi-renchan
gameEnd: riichi-profile
```

Evidence configuration must be able to request profile-specific context such as riichi declaration, dora indicators, furiten/ippatsu state, honba and riichi sticks only when relevant.

Pressure proved:

- Classical `ScoreBreakdown` cannot be the platform result;
- game outcome/settlement must allow more than one winner and richer draw evidence;
- table strategy state cannot be only prevailing Wind + East-cycle state.

## A06 — Sanma / Riichi-family variant

Must resolve as a **Riichi-family variant**, not a fifth scoring grammar:

```yaml
players: 3
seats: east/south/west
tiles: sanma-108
handShape: four-sets-pair + Riichi specials
calls.chii: false
grammar: riichi-han-fu
doraModules: includes nuki North where profile specifies
settlement: riichi-sanma
progression: riichi-sanma-renchan
gameEnd: riichi-sanma
```

Pressure proved:

- same grammar can support major table/tile/settlement variation;
- player count cannot be globally fixed to four;
- Sanma does not require a scorer copy.

## A07 — Zung Jung / accumulator with series interaction

Must express:

```yaml
players: 4
tiles: standard-136
grammar: pattern-accumulator
catalogue: zung-jung-44
interaction: same-series-highest-only
qualification: none
floor: 1 point for zero-pattern winning hand
compoundCap: 320
listedLimitPolicy: profile-defined
settlement: zung-jung-formal
progression: always-pass
```

Pressure proved:

- floor and cap are independent policies;
- accumulator interaction can be series-based rather than MCR-style;
- same grammar can host MCR and Zung Jung without pretending their interactions are identical.

## A08 — American / versioned target catalogue

Must express:

```yaml
players: 4
tileSet: American/Joker-capable preset
grammar: target-catalogue
handShape: target-catalogue
catalogueRef: exact annual/versioned identity
substitutionPolicy: source/versioned
exposurePolicy: source/versioned
```

Pressure proved:

- annual catalogue content is data/version identity, not scorer code;
- engine capability can exist without shipping a commercial current card;
- a saved game/profile cannot silently move from one annual catalogue to another.

---

# 4. Table/tile/hand-shape fixtures

## B01 — four-player 136

A resolved Classical/Riichi-capable table may declare four players and a 136-tile set without Flowers.

## B02 — four-player 144

A resolved MCR/Taiwanese-capable table may declare a 144-tile set with bonus tiles.

## B03 — three-player Sanma

A resolved Sanma profile accepts three players and the registered Sanma tile set. A generic “exactly four players” check must not reject it.

## B04 — Taiwanese 5+pair

A valid design manifest with five sets + pair must not be rejected by a universal four-set assumption.

## B05 — cross-tile incompatibility

A profile selecting `tiles.sanma-108` with a family/capability that requires four-player standard ranks must fail unless the chosen family explicitly declares that combination compatible.

## B06 — red tile identity

A Riichi-family tile set may distinguish configured red fives while canonical base-rank identity remains available to structural predicates.

## B07 — Joker capability isolation

A Joker-capable target-catalogue tile set must not make Joker a legal ordinary tile in Classical/MCR/Riichi profiles.

---

# 5. Resolver and fingerprint fixtures

## R01 — deterministic key order

Two authoring definitions that resolve to semantically identical rules but supply object keys in different insertion order produce the same canonical semantic JSON and fingerprint.

## R02 — semantic change changes fingerprint

Changing a score value, enabled rule, tile set, hand-shape policy, settlement strategy parameter or progression strategy parameter changes the rules fingerprint.

## R03 — display change does not change fingerprint

Changing profile display name, translated label or help copy does not change the executable rules fingerprint.

## R04 — base immutability

Resolving a custom profile must not mutate the published base profile object.

## R05 — exact base version

`buzzard-2000-classical@1.0` and a later `@1.1` are different base identities. Resolver never substitutes “latest”.

## R06 — frozen snapshot

After resolution, attempted mutation of a resolved profile fails in development/test convention or cannot alter the stored runtime object.

## R07 — same authoring intent round-trip

Serialise authoring definition → JSON round-trip → resolve must yield the same semantic snapshot/fingerprint.

---

# 6. Fail-closed compatibility fixtures

## N01 — unknown profile

Unknown base `id@version` → error.

## N02 — unknown capability

Custom override with `made.up.rule` → error.

## N03 — cross-grammar override

Riichi base + `classical.double.no-chows` → error.

## N04 — Classical base + Riichi fu

Classical base + `fu.*` capability → error.

## N05 — target catalogue + MCR threshold

Target-catalogue profile + MCR qualification policy → error unless a future explicit compatible grammar contract says otherwise.

## N06 — grammar mutation

Custom profile attempts to change `riichi-han-fu` to `pattern-accumulator` through override → error.

## N07 — unresolved playable profile

Any `research-required` / unresolved architecture marker in a profile being compiled for play → error.

## N08 — unavailable strategy implementation

Resolved manifest references a known architecture ID whose executable registry entry is not included in the build → compile error, never silent fallback.

## N09 — malformed strategy params

Strategy ID exists but params fail its registered schema → error.

## N10 — arbitrary executable payload

Override attempts to provide callback/function/expression string instead of declared data value → schema error.

---

# 7. Canonical predicate / profile-binding fixtures

## C01 — Big Three Dragons across grammars

One structural hand fixture is supplied to a proven canonical detector:

```text
pattern.big-three-dragons
```

Architecture bindings exist independently for at least:

```text
Classical
Hong Kong
MCR
Taiwanese
Zung Jung
Riichi
```

Fixture passes only if:

- structural result can be shared where equivalence is source-proved;
- local name/value/unit/interaction remain different profile data;
- changing one profile binding does not change another.

No fixture may use a single universal `score` field on the canonical pattern.

## C02 — same name, different value

Current Three Great Scholars evidence provides a concrete Classical-family test:

- BMJA binding value differs from T&M binding value;
- both may point at the same proved structural pattern;
- detector has no value field.

## C03 — same family theme, unresolved structure

`All Green`/green-family or honours-family mappings marked `needs-pattern-check` must remain separate/unbound until source equivalence is proved.

## C04 — concealed points vs concealed double

A Classical profile may enable additive concealed-hand points and a separate concealed-hand double simultaneously. Disabling one must not disable the other.

## C05 — wait semantic hazard

Architecture may contain both:

```text
wait.only-possible-winning-tile
wait.edge-chow / wait.closed-chow
```

until source work proves a safe common abstraction. Resolver must not alias them by label.

---

# 8. Pattern-accumulator policy fixtures

These are policy-interface fixtures; full fan/pattern corpora are not required for #227.

## P01 — simple additive

Three non-conflicting matched bindings sum through `interaction.simple-additive`.

## P02 — qualification threshold

Matched subtotal below a configured legal minimum yields `legal = false` even though patterns were detected.

## P03 — bonus excluded from threshold

A post-qualification bonus increases displayed/final value but does not rescue an otherwise sub-threshold result.

This is the interface shape needed by MCR Flowers.

## P04 — exclusion/implication hook

Interaction policy can remove/suppress a matched binding from the lawful subtotal while retaining an explanation entry describing why.

## P05 — same-series highest only

Two matched patterns in one series resolve to the permitted higher/selected pattern according to Zung Jung-style policy contract.

## P06 — cap/floor independence

A zero-pattern floor and a high-score cap can both be configured without changing pattern detection.

## P07 — conversion after score

A fan subtotal can be passed to a separate conversion policy for settlement/value mapping without changing matched-pattern facts.

---

# 9. Riichi-family interface fixtures

These prove architecture only; full EMA yaku/fu values require the source-linked scorer corpus before implementation.

## J01 — decomposition policy slot

Riichi scoring config must select a decomposition/evaluate/max policy; Classical and accumulator configs must not expose this field.

## J02 — explicit evidence

`requiredEvidence()` for a Riichi context may request riichi/dora/furiten/ippatsu facts while a BMJA context does not.

## J03 — multi-winner outcome envelope

A profile-owned round outcome can represent two ron winners without changing current legacy `HandOutcome`.

## J04 — exhaustive draw payload

A profile-owned draw outcome can retain tenpai-player facts required for settlement/progression.

## J05 — Sanma inherits grammar

Riichi and Sanma manifests both discriminate as `riichi-han-fu`; Sanma changes table/tile/dora/settlement/progression configuration rather than registering `sanma-scoring` as another grammar.

---

# 10. Evidence-driven UI fixtures

## E01 — BMJA minimal evidence

`requiredEvidence()` must not return Riichi-only fields.

## E02 — Buzzard Standing Hand

When a Buzzard rule requiring Standing Hand is enabled, the requirement appears with a reason ID. When disabled in an allowed custom profile, the field disappears if no other rule needs it.

## E03 — MCR threshold evidence

MCR-specific score interaction does not cause irrelevant Classical `originalCall`/Goulash fields to appear.

## E04 — Riichi conditional ura

Ura-dora evidence is requested only under the applicable Riichi condition/policy, not universally.

## E05 — Sanma nuki

Nuki-dora evidence appears only for a Sanma profile that enables that dora module.

---

# 11. Settlement transaction fixtures

The generic transaction envelope must represent without schema redesign:

## S01 — Classical pairwise

Winner payments + loser-to-loser score differences, including East effect encoded by Classical strategy logic rather than a mandatory universal transaction field.

## S02 — MCR discard route

Multiple losers may pay the winner with discarder-specific amount logic.

## S03 — MCR self-draw route

Each loser may pay the winner according to MCR strategy.

## S04 — Taiwanese winner-only

Discard route can have only discarder payment; self-draw route can have each loser payment.

## S05 — Riichi ron/tsumo

Neutral transactions can express ron and split tsumo amounts plus separate pot/counter transactions.

## S06 — Sanma

Three-player settlement uses the same transaction envelope.

## S07 — non-player pot

Ledger party IDs can represent a profile-owned pot such as riichi sticks without pretending every party is a player.

---

# 12. Progression/game-end fixtures

## G01 — Classical East retention

Current BMJA progression outputs remain representable exactly.

## G02 — rotate every hand

A profile can rotate seats/dealer after each completed hand independently of winner.

## G03 — always pass four-round

MCR-style profile can always pass dealer and independently determine four-round completion.

## G04 — Riichi renchan

Progression may consume richer outcome/strategy state than winner ID alone.

## G05 — Sanma completion

Three-player strategy state/game-end does not require a North player seat.

## G06 — completion separate from progression

A progression transition may occur without the universal orchestrator inferring completion from prevailing-Wind advancement.

---

# 13. Current-production parity fixtures

The new adapter path must run against the existing regression corpus rather than inventing a small substitute suite.

Minimum parity sources already in repo include:

```text
scoring/golden-fixtures.test.ts
scoring/rules.test.ts
scoring/score.test.ts
scoring/special-hands.test.ts
game/rules-profile-parity.test.ts
game/western-tm-*.test.ts
game/outside-the-box-scoring.test.ts
game/outside-the-box-goulash.test.ts
game/outside-the-box-incidents.test.ts
game/progression.test.ts
game/settlement.test.ts
game/game.test.ts
game/persistence.test.ts
game/hand-scorer-handoff.test.ts
```

## D01 — BMJA direct vs adapter

Every selected BMJA golden fixture produces identical:

```text
validity/errors
point rules
double rules
special matches
base/doubles/uncapped/final
limit/scoring mode
```

## D02 — T&M direct vs adapter

Catalogue membership, values, fishing and current provisional ordinary behavior remain identical.

## D03 — OTB direct vs adapter

Ordinary scoring, special bindings, Goulash, incidents and settlement remain identical.

## D04 — replay identity

Existing saved/replayed current games retain exact `rulesProfile.id + version` and reconstruct the same balances/progression.

## D05 — public caller guard

No public UI caller is switched to new compiled runtime until D01–D04 are green on the integration branch.

---

# 14. Architecture pass/fail rule

#227 is implementation-ready when all of these statements can be turned into deterministic tests without asking Codex to decide Mahjong semantics.

The platform is **not** required at this gate to know every MCR fan, Riichi yaku or annual American target.

It **is** required to know exactly where those source-bound catalogues plug in and how they are prevented from contaminating incompatible families.
