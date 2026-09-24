# Rules platform #251 discovery hardening v1

Status: **normative pre-Codex amendment to #227**\
Target branch: `integration/rules-platform-v1`\
Issue: #267\
Discovery input: #251 / PR #265\
Applies to: implementation slices #229–#236.

## 1. Purpose and precedence

The expanded #251 source-inventory pass now stages **626 source-local scoring concepts across 18 corpora**, including Taiwanese 16-tile, Vietnamese 160-tile and Malaysian 3-player material that post-dates the original eight-profile architecture stress test.

This evidence does **not** require a new scoring grammar. The four V1 grammars remain:

- `classical-points-doubles`;
- `pattern-accumulator`;
- `riichi-han-fu`;
- `target-catalogue`.

The universal-envelope / family-specific semantics model remains approved.

This document narrows and hardens a few representation and audit contracts before #229 begins. Where this document conflicts with an earlier #227 paper contract on the points below, this document wins. `RULES_PLATFORM_SENIOR_REVIEW_HARDENING_V1.md` remains normative on all unaffected matters.

Core objective:

> A resolved profile must be able to score a real hand/round deterministically and preserve enough machine-readable evidence to explain **why** that score, settlement and progression occurred.

---

## 2. Physical tile vocabulary must support profile-defined tile classes

The earlier conceptual `CanonicalTileFace` union covers suit, Wind, Dragon, Flower, Season and Joker faces. #251 now gives direct bounded evidence for additional score-relevant physical classes, notably Malaysian 3P **Faces** and **Animals**.

Do not force these into `flower` merely to satisfy the type.

Add one JSON-safe identity form for profile-defined physical tile faces, conceptually:

```ts
type ProfileDefinedTileFace = {
  family: 'profile-defined';
  kindId: string;
  id: string;
};
```

Exact names may follow implementation conventions.

Rules:

1. keep genuinely shared suit/Wind/Dragon/Flower/Season/Joker faces explicit;
2. profile-defined faces are identity/data only;
3. tile-set/profile registries own legality and semantic meaning;
4. scoring behaviour remains in registered family/profile rules, never inside the tile object;
5. do not universalise the current `MahjongHand`;
6. do not create a generic executable `specialTileRules` bag.

Acceptance pressure:

- Malaysian 3P can represent Faces and Animals distinctly;
- Vietnamese 160-tile can represent its multiple named Joker identities/substitution domains without a new universal hand object.

---

## 3. Evaluation disposition is not a boolean legality flag

The shared runtime must distinguish materially different outcomes instead of collapsing them into `legal: boolean` or a generic error.

At minimum it must be possible to represent:

```text
scored
not-qualifying
invalid
needs-evidence
unsupported
```

Exact names may differ, but semantics must remain distinct:

- **scored** — evaluation is complete and produces the profile's score result;
- **not-qualifying** — the evidence may be structurally lawful but does not satisfy that profile's winning/qualification gate;
- **invalid** — structural/evidential input violates the selected profile;
- **needs-evidence** — a material score-relevant fact remains unresolved and must be supplied/confirmed;
- **unsupported** — required runtime semantics/dependency are unavailable/non-executable.

Unknown material facts must fail closed. They must not be guessed and must not be misreported as ordinary illegality.

`requiredEvidence()` and the evaluation disposition should cooperate: trusted context is not re-requested, unresolved material evidence is explicit, and UI code does not invent family-specific error semantics.

---

## 4. Machine-readable `why` is a rules-core output

The universal result boundary must preserve a deterministic decision/audit trail. Presentation prose is not sufficient.

Every grammar-specific result must be capable of identifying, where applicable:

- candidate rule/pattern/binding matches;
- counted/applied rules;
- suppressed/excluded alternatives;
- stable reason/policy IDs for those decisions;
- chosen interpretation/decomposition where alternatives exist;
- ordered scoring stages applied;
- final value/result;
- exact profile/fingerprint;
- stable executable rule/binding/policy identities;
- source/provenance references where supplied by the underlying registered entry.

Do **not** force one universal scoring vocabulary.

Examples:

- Classical may expose points -> additive bonuses -> doubles -> limit treatment;
- MCR may expose candidate fan -> non-combination decisions -> qualifying subtotal -> post-qualification Flowers -> Basic Points;
- Riichi may expose chosen decomposition -> yaku gate -> dora -> fu -> tier/base value;
- target-catalogue profiles may expose target match -> substitutions/exposure policy -> listed value.

The shared contract is the existence of a machine-readable decision trail with stable identities/reasons. Grammar bodies own the exact fields.

Human wording, translations and help text are non-semantic and fingerprint-neutral.

---

## 5. Provenance remains metadata but must be reachable from scoring decisions

`source.*` remains non-executable metadata.

Where an executable scoring catalogue/binding/predicate/value policy is source-backed, its registered representation must be able to retain immutable provenance references, for example:

```text
sourceId
sourceLocator / reference metadata
```

The runtime result need not duplicate source prose. It must retain stable rule/binding identities so the provenance layer can resolve the supporting source.

This supports an audit chain of the form:

```text
counted binding X
because policy Y
under profile P@V / fingerprint F
supported by source S / locator L
```

without creating a second Encyclopaedia scoring database.

---

## 6. Explain the whole round transition

Keep the existing separation:

```text
hand value
  -> settlement
  -> progression
  -> game end/finalisation
```

Strengthen auditability at each phase:

### Settlement

Neutral transactions retain stable `reasonId` plus optional JSON-safe audit metadata.

### Progression

Progression must produce/retain a stable transition reason, not only opaque changed strategy state.

Conceptually:

```ts
type ProgressionResult<TState> = {
  nextState: TState;
  reasonId: string;
  metadata?: JsonObject;
};
```

Exact naming may differ.

This must allow confirmed history to explain outcomes such as:

- East retained because East won;
- East passed because another seat won;
- Wind advanced because the dealer cycle completed;
- profile-specific progression retained/rotated for another registered reason.

### Game end

Existing `GameEndResult` reason/finalisation semantics remain suitable.

UI code must not need to reverse-engineer progression or settlement reasons from before/after state.

---

## 7. Post-design discovery pressure fixtures

Keep A01–A08 as the canonical eight-profile architecture fixture set and retain the existing `8/8` acceptance measure.

Add two **non-executable discovery-pressure fixtures** to #232. They are not production profiles and do not expand the eight-profile acceptance count.

### D01 — Vietnamese Classic 160-tile

Prove the envelope can represent:

- 160-tile set;
- multiple domain-specific Joker identities/substitution domains;
- profile-specific bonus/special-tile evidence;
- declaration/evidence state;
- accumulator scoring plus profile-specific conversion;
- legal zero-qualification Mosquito-Hand route;
- liability/settlement strategy references;
- no arbitrary callback/expression config.

### D02 — Malaysian 3P

Prove the envelope can represent:

- three players;
- 84-tile active set;
- one numbered suit plus honours;
- Flowers/Seasons plus distinct Faces/Animals;
- Fly wild tiles;
- minimum-Fan qualification;
- Max-Fan/listed-limit treatment;
- non-standard dealer progression;
- strategy state with no mandatory North/fourth player.

If either fixture cannot be represented without adding a fifth grammar or generic executable rules bag, stop and report the exact pressure point.

---

## 8. Slice-specific impact

### #229 — universal types/schema

Add:

- profile-defined physical tile-face identity;
- shared evaluation-disposition vocabulary sufficient for later runtime use;
- machine-readable score-decision/audit vocabulary with stable rule/reason identities.

Do not implement scorer semantics.

### #230 — typed registries/capabilities

Ensure source-backed executable scoring entries can retain stable provenance references while `source.*` remains non-executable.

### #231 — resolver/fingerprint

No new redesign required. Existing immutable profile / semantic-revision / fingerprint rules remain suitable unless actual #229/#230 implementation exposes a contradiction.

### #232 — architecture fixtures

Add D01/D02 as pressure fixtures in addition to A01–A08.

### #233 — compiled runtime

Preserve explicit evaluation disposition and grammar-specific machine-readable decision trace through current/future runtime adapters.

### #234 — neutral round/table seams

Add stable progression-transition reason/audit semantics while retaining transaction reasons and `GameEndResult` reasons.

### #235 — profile-selected validation

Keep legacy validation parity. Do not collapse missing score evidence into structural/profile invalidity. If evidence disposition is owned outside validation by the actual #229/#233 contracts, preserve that ownership.

### #236 — parity/cutover gate

In addition to existing parity requirements, prove the platform path preserves/exposes:

- explicit `needs-evidence` vs invalid/not-qualifying distinction;
- deterministic machine-readable score decision trace;
- exact profile/fingerprint/source-binding/executable semantic-revision identity required for replay/audit;
- settlement/progression/game-end reason identities;
- enough confirmed round data that UI code does not reverse-engineer why a score, transfer or transition occurred.

---

## 9. Codex stop rule

These amendments should make implementation more mechanical, not less.

If Codex discovers that one of these requirements cannot fit the approved envelope/family/four-grammar model, stop the affected slice and return the exact contradiction.

Do not invent:

- a fifth grammar;
- arbitrary executable profile expressions;
- a universal mega-hand;
- generic `houseRules` bags;
- unsourced cross-family pattern equivalence.

## 10. Ready-to-start gate

#229 may start once this amendment is merged to `integration/rules-platform-v1` and is treated as normative alongside `RULES_PLATFORM_SENIOR_REVIEW_HARDENING_V1.md`.
